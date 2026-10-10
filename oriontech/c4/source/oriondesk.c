#include <arpa/inet.h>
#include <errno.h>
#include <netinet/ip.h>
#include <netinet/ip_icmp.h>
#include <openssl/evp.h>
#include <openssl/sha.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/select.h>
#include <sys/socket.h>
#include <time.h>
#include <unistd.h>

#define SERVER_IP "10.77.20.10"
#define MAX_PACKET_SIZE 2048
#define SESSION_SECONDS 120
#define HEARTBEAT_SECONDS 5
#define ICMP_ID_MASK 0xffff

static const unsigned char transport_secret[] =
    "ORIONDESK-C4-TRANSPORT-2026";

static char session_token[64];

static unsigned short calculate_checksum(
    const unsigned char *data,
    size_t length
)
{
    unsigned long sum = 0;

    while (length > 1) {
        sum += ((unsigned long)data[0] << 8) | data[1];
        data += 2;
        length -= 2;
    }

    if (length == 1) {
        sum += (unsigned long)data[0] << 8;
    }

    while (sum >> 16) {
        sum = (sum & 0xffff) + (sum >> 16);
    }

    return (unsigned short)(~sum);
}

static int send_icmp(
    int sock,
    const struct sockaddr_in *server,
    const char *payload,
    unsigned short sequence
)
{
    unsigned char packet[MAX_PACKET_SIZE];

    memset(packet, 0, sizeof(packet));

    size_t payload_len = strlen(payload);
    size_t packet_len = sizeof(struct icmphdr) + payload_len;

    if (packet_len >= MAX_PACKET_SIZE) {
        fprintf(stderr, "[-] ICMP payload too large.\n");
        return -1;
    }

    struct icmphdr *icmp = (struct icmphdr *)packet;

    icmp->type = ICMP_ECHO;
    icmp->code = 0;

    unsigned short identifier =
        (unsigned short)(getpid() & ICMP_ID_MASK);

    icmp->un.echo.id = htons(identifier);
    icmp->un.echo.sequence = htons(sequence);

    memcpy(
        packet + sizeof(struct icmphdr),
        payload,
        payload_len
    );

    icmp->checksum = 0;
    icmp->checksum = calculate_checksum(packet, packet_len);

    ssize_t result = sendto(
        sock,
        packet,
        packet_len,
        0,
        (const struct sockaddr *)server,
        sizeof(*server)
    );

    if (result < 0) {
        perror("[-] sendto");
        return -1;
    }

    return 0;
}

static int receive_icmp_reply(
    int sock,
    const struct sockaddr_in *server,
    unsigned short expected_sequence,
    char *payload,
    size_t payload_size
)
{
    unsigned char buffer[MAX_PACKET_SIZE];

    unsigned short expected_identifier =
        (unsigned short)(getpid() & ICMP_ID_MASK);

    while (1) {
        fd_set readfds;

        FD_ZERO(&readfds);
        FD_SET(sock, &readfds);

        struct timeval timeout;
        timeout.tv_sec = 3;
        timeout.tv_usec = 0;

        int ready = select(
            sock + 1,
            &readfds,
            NULL,
            NULL,
            &timeout
        );

        if (ready < 0) {
            if (errno == EINTR) {
                continue;
            }

            perror("[-] select");
            return -1;
        }

        if (ready == 0) {
            return -1;
        }

        struct sockaddr_in sender;
        socklen_t sender_len = sizeof(sender);

        ssize_t received = recvfrom(
            sock,
            buffer,
            sizeof(buffer),
            0,
            (struct sockaddr *)&sender,
            &sender_len
        );

        if (received < 0) {
            if (
                errno == EAGAIN ||
                errno == EWOULDBLOCK ||
                errno == EINTR
            ) {
                continue;
            }

            perror("[-] recvfrom");
            return -1;
        }

        if ((size_t)received < sizeof(struct iphdr)) {
            continue;
        }

        struct iphdr *ip = (struct iphdr *)buffer;

        size_t ip_header_len = (size_t)ip->ihl * 4;

        if (ip_header_len < sizeof(struct iphdr)) {
            continue;
        }

        if (
            (size_t)received <
            ip_header_len + sizeof(struct icmphdr)
        ) {
            continue;
        }

        if (ip->protocol != IPPROTO_ICMP) {
            continue;
        }

        if (ip->saddr != server->sin_addr.s_addr) {
            continue;
        }

        struct icmphdr *icmp =
            (struct icmphdr *)(buffer + ip_header_len);

        if (icmp->type != ICMP_ECHOREPLY) {
            continue;
        }

        if (
            ntohs(icmp->un.echo.id) !=
            expected_identifier
        ) {
            continue;
        }

        if (
            ntohs(icmp->un.echo.sequence) !=
            expected_sequence
        ) {
            continue;
        }

        size_t data_offset =
            ip_header_len + sizeof(struct icmphdr);

        if ((size_t)received <= data_offset) {
            continue;
        }

        size_t data_length =
            (size_t)received - data_offset;

        if (data_length >= payload_size) {
            data_length = payload_size - 1;
        }

        memcpy(
            payload,
            buffer + data_offset,
            data_length
        );

        payload[data_length] = '\0';

        return 0;
    }
}

static int hex_value(char c)
{
    if (c >= '0' && c <= '9') {
        return c - '0';
    }

    if (c >= 'a' && c <= 'f') {
        return c - 'a' + 10;
    }

    if (c >= 'A' && c <= 'F') {
        return c - 'A' + 10;
    }

    return -1;
}

static int hex_decode(
    const char *hex,
    unsigned char *output,
    size_t output_size,
    size_t *output_length
)
{
    size_t length = strlen(hex);

    if (length == 0 || (length % 2) != 0) {
        return -1;
    }

    size_t decoded_length = length / 2;

    if (decoded_length > output_size) {
        return -1;
    }

    for (size_t i = 0; i < decoded_length; i++) {
        int high = hex_value(hex[i * 2]);
        int low = hex_value(hex[i * 2 + 1]);

        if (high < 0 || low < 0) {
            return -1;
        }

        output[i] =
            (unsigned char)((high << 4) | low);
    }

    *output_length = decoded_length;

    return 0;
}

static int derive_transport_key(
    unsigned char key[32]
)
{
    unsigned char material[256];

    int written = snprintf(
        (char *)material,
        sizeof(material),
        "%s:%s",
        transport_secret,
        session_token
    );

    if (
        written < 0 ||
        (size_t)written >= sizeof(material)
    ) {
        return -1;
    }

    SHA256(
        material,
        (size_t)written,
        key
    );

    return 0;
}

static int decrypt_flag_response(
    const char *response
)
{
    const char prefix[] = "ORION_FLAG_V1:";

    if (
        strncmp(
            response,
            prefix,
            strlen(prefix)
        ) != 0
    ) {
        fprintf(
            stderr,
            "[-] Unexpected server response.\n"
        );

        return -1;
    }

    char working[MAX_PACKET_SIZE];

    strncpy(
        working,
        response + strlen(prefix),
        sizeof(working) - 1
    );

    working[sizeof(working) - 1] = '\0';

    char *nonce_hex = strtok(working, ":");
    char *ciphertext_hex = strtok(NULL, ":");
    char *tag_hex = strtok(NULL, ":");
    char *extra = strtok(NULL, ":");

    if (
        nonce_hex == NULL ||
        ciphertext_hex == NULL ||
        tag_hex == NULL ||
        extra != NULL
    ) {
        fprintf(
            stderr,
            "[-] Invalid encrypted response format.\n"
        );

        return -1;
    }

    unsigned char nonce[12];
    unsigned char ciphertext[512];
    unsigned char tag[16];

    size_t nonce_length = 0;
    size_t ciphertext_length = 0;
    size_t tag_length = 0;

    if (
        hex_decode(
            nonce_hex,
            nonce,
            sizeof(nonce),
            &nonce_length
        ) < 0
    ) {
        fprintf(stderr, "[-] Invalid nonce.\n");
        return -1;
    }

    if (
        hex_decode(
            ciphertext_hex,
            ciphertext,
            sizeof(ciphertext),
            &ciphertext_length
        ) < 0
    ) {
        fprintf(stderr, "[-] Invalid ciphertext.\n");
        return -1;
    }

    if (
        hex_decode(
            tag_hex,
            tag,
            sizeof(tag),
            &tag_length
        ) < 0
    ) {
        fprintf(
            stderr,
            "[-] Invalid authentication tag.\n"
        );

        return -1;
    }

    if (
        nonce_length != 12 ||
        tag_length != 16 ||
        ciphertext_length == 0
    ) {
        fprintf(
            stderr,
            "[-] Invalid encrypted response sizes.\n"
        );

        return -1;
    }

    unsigned char key[32];

    if (derive_transport_key(key) < 0) {
        fprintf(
            stderr,
            "[-] Failed to derive transport key.\n"
        );

        return -1;
    }

    EVP_CIPHER_CTX *ctx =
        EVP_CIPHER_CTX_new();

    if (ctx == NULL) {
        fprintf(
            stderr,
            "[-] Failed to initialize crypto context.\n"
        );

        return -1;
    }

    unsigned char plaintext[512];

    int plaintext_length = 0;
    int final_length = 0;
    int success = 0;

    do {
        if (
            EVP_DecryptInit_ex(
                ctx,
                EVP_aes_256_gcm(),
                NULL,
                NULL,
                NULL
            ) != 1
        ) {
            break;
        }

        if (
            EVP_CIPHER_CTX_ctrl(
                ctx,
                EVP_CTRL_GCM_SET_IVLEN,
                12,
                NULL
            ) != 1
        ) {
            break;
        }

        if (
            EVP_DecryptInit_ex(
                ctx,
                NULL,
                NULL,
                key,
                nonce
            ) != 1
        ) {
            break;
        }

        if (
            EVP_DecryptUpdate(
                ctx,
                plaintext,
                &plaintext_length,
                ciphertext,
                (int)ciphertext_length
            ) != 1
        ) {
            break;
        }

        if (
            EVP_CIPHER_CTX_ctrl(
                ctx,
                EVP_CTRL_GCM_SET_TAG,
                16,
                tag
            ) != 1
        ) {
            break;
        }

        if (
            EVP_DecryptFinal_ex(
                ctx,
                plaintext + plaintext_length,
                &final_length
            ) != 1
        ) {
            fprintf(
                stderr,
                "[-] Server response authentication failed.\n"
            );

            break;
        }

        plaintext_length += final_length;
        plaintext[plaintext_length] = '\0';

        printf(
            "\n[+] C4 FLAG: %s\n",
            plaintext
        );

        success = 1;

    } while (0);

    EVP_CIPHER_CTX_free(ctx);

    return success ? 0 : -1;
}

static int establish_session(
    int sock,
    const struct sockaddr_in *server
)
{
    const unsigned short sequence = 1;

    printf(
        "[+] Sending ORION_HELLO...\n"
    );

    if (
        send_icmp(
            sock,
            server,
            "ORION_HELLO",
            sequence
        ) < 0
    ) {
        return -1;
    }

    char response[MAX_PACKET_SIZE];

    if (
        receive_icmp_reply(
            sock,
            server,
            sequence,
            response,
            sizeof(response)
        ) < 0
    ) {
        fprintf(
            stderr,
            "[-] No valid SESSION response received.\n"
        );

        return -1;
    }

    if (
        strncmp(
            response,
            "SESSION:",
            8
        ) != 0
    ) {
        fprintf(
            stderr,
            "[-] Unexpected server response.\n"
        );

        return -1;
    }

    const char *token = response + 8;

    if (
        strlen(token) == 0 ||
        strlen(token) >= sizeof(session_token)
    ) {
        fprintf(
            stderr,
            "[-] Invalid session token.\n"
        );

        return -1;
    }

    //create session token

    strncpy(
        session_token,
        token,
        sizeof(session_token) - 1
    );

    session_token[
        sizeof(session_token) - 1
    ] = '\0';

    printf(
        "[+] Session established: %s\n",
        session_token
    );

    return 0;
}

static int send_heartbeat(
    int sock,
    const struct sockaddr_in *server,
    unsigned short sequence
)
{
    char packet[128];

    int written = snprintf(
        packet,
        sizeof(packet),
        "HEARTBEAT:%s",
        session_token
    );

    if (
        written < 0 ||
        (size_t)written >= sizeof(packet)
    ) {
        return -1;
    }

    printf(
        "[+] HEARTBEAT:%s\n",
        session_token
    );

    return send_icmp(
        sock,
        server,
        packet,
        sequence
    );
}

static void notify_expiration(
    int sock,
    const struct sockaddr_in *server,
    unsigned short sequence
)
{
    char packet[128];

    // define packet

    int written = snprintf(
        packet,
        sizeof(packet),
        "TOKEN_EXPIRED:%s",
        session_token
    );

    if (
        written < 0 ||
        (size_t)written >= sizeof(packet)
    ) {
        return;
    }

    printf(
        "[-] TOKEN_EXPIRED\n"
    );

    send_icmp(
        sock,
        server,
        packet,
        sequence
    );
}

int main(void)
{
    printf(
        "[+] OrionDesk Enterprise 4.2 Trial\n"
    );

    printf(
        "[+] Connection established successfully.\n"
    );

    int sock = socket(
        AF_INET,
        SOCK_RAW,
        IPPROTO_ICMP
    );

    if (sock < 0) {
        perror(
            "[-] socket (run as root)"
        );

        return 1;
    }

    struct sockaddr_in server;

    memset(
        &server,
        0,
        sizeof(server)
    );

    server.sin_family = AF_INET;

    if (
        inet_pton(
            AF_INET,
            SERVER_IP,
            &server.sin_addr
        ) != 1
    ) {
        fprintf(
            stderr,
            "[-] Invalid C4 server address.\n"
        );

        close(sock);

        return 1;
    }

    if (
        establish_session(
            sock,
            &server
        ) < 0
    ) {
        close(sock);
        return 1;
    }

    time_t session_start = time(NULL);
    time_t last_heartbeat = session_start;

    unsigned short sequence = 2;

    while (1) {
        time_t now = time(NULL);

        if (
            (now - session_start)
            >= SESSION_SECONDS
        ) {
            printf(
                "[+] Session lifetime reached.\n"
            );

            printf(
                "[+] Waiting for encrypted flag response...\n"
            );

            char response[MAX_PACKET_SIZE];

            if (
                receive_icmp_reply(
                    sock,
                    &server,
                    sequence - 1,
                    response,
                    sizeof(response)
                ) == 0
            ) {
                if (
                    strncmp(
                        response,
                        "ORION_FLAG_V1:",
                        strlen("ORION_FLAG_V1:")
                    ) == 0
                ) {
                    if (
                        decrypt_flag_response(
                            response
                        ) == 0
                    ) {
                        close(sock);
                        return 0;
                    }
                }
            }

            notify_expiration(
                sock,
                &server,
                sequence++
            );

            printf(
                "[-] Session expired.\n"
            );

            printf(
                "[-] Application terminating.\n"
            );

            break;
        }

        if (
            (now - last_heartbeat)
            >= HEARTBEAT_SECONDS
        ) {
            unsigned short heartbeat_sequence =
                sequence++;

            if (
                send_heartbeat(
                    sock,
                    &server,
                    heartbeat_sequence
                ) < 0
            ) {
                fprintf(
                    stderr,
                    "[-] Failed to send heartbeat.\n"
                );
            } else {
                char response[MAX_PACKET_SIZE];

                if (
                    receive_icmp_reply(
                        sock,
                        &server,
                        heartbeat_sequence,
                        response,
                        sizeof(response)
                    ) == 0
                ) {
                    if (
                        strncmp(
                            response,
                            "ORION_FLAG_V1:",
                            strlen("ORION_FLAG_V1:")
                        ) == 0
                    ) {
                        if (
                            decrypt_flag_response(
                                response
                            ) == 0
                        ) {
                            close(sock);
                            return 0;
                        }
                    }
                }
            }

            last_heartbeat = now;
        }

        sleep(1);
    }

    close(sock);

    return 0;
}
