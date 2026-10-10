#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# OrionTech Solutions - C1 Builder
# Challenge: Shadow Profile
#
# This script creates ONLY the C1 Git repository and bundle.
#
# Player repository:
#   legacy/orionhub-payment-gateway
#
# Player bundle:
#   public/artifacts/orionhub-payment-gateway.bundle
#
# C1 flag reconstruction:
#
#   EC
#   LIP
#   SE{shadow_profile}
#
# Combined:
#
#   ECLIPSE{shadow_profile}
#
# The complete flag NEVER exists in a normal repository file
# and NEVER exists as a complete string inside a commit message.
# ============================================================

ORIONTECH_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

REPO="$ORIONTECH_ROOT/legacy/orionhub-payment-gateway"
BUNDLE="$ORIONTECH_ROOT/public/artifacts/orionhub-payment-gateway.bundle"

AUTHOR_NAME="Daniel Perera"
AUTHOR_EMAIL="dperera@oriontech.local"

TOTAL_COMMITS=230

echo "============================================================"
echo " OrionTech C1 - Shadow Profile Builder"
echo "============================================================"
echo
echo "[+] OrionTech root:"
echo "    $ORIONTECH_ROOT"
echo
echo "[+] Repository:"
echo "    $REPO"
echo
echo "[+] Bundle:"
echo "    $BUNDLE"
echo

# ============================================================
# CLEAN OLD BUILD
# ============================================================

echo "[+] Removing previous C1 build..."

rm -rf "$REPO"
rm -f "$BUNDLE"

mkdir -p "$REPO"
mkdir -p "$(dirname "$BUNDLE")"

cd "$REPO"

# ============================================================
# INITIALIZE GIT
# ============================================================

echo "[+] Initializing Git repository..."

git init -b main

git config user.name "$AUTHOR_NAME"
git config user.email "$AUTHOR_EMAIL"


mkdir -p \
    src \
    config \
    docs \
    tests \
    scripts \
    assets \
    lib

cat > README.md <<'EOF'
# OrionHub Payment Gateway

Legacy payment gateway integration used by the OrionHub platform.

## Status

This repository has been archived following the retirement of the
legacy OrionHub payment processing architecture.

## Components

- Payment request handling
- Transaction validation
- Gateway communication
- Internal API integration
- Logging and diagnostics

This project is no longer under active development.
EOF

cat > src/payment.js <<'EOF'
const crypto = require("crypto");

function createTransaction(amount, currency) {
    return {
        id: crypto.randomUUID(),
        amount,
        currency,
        status: "pending"
    };
}

module.exports = {
    createTransaction
};
EOF

cat > config/payment.conf <<'EOF'
[payments]
provider=orionpay
currency=LKR
timeout=5000
retry_count=3

[logging]
level=info
EOF

cat > docs/architecture.md <<'EOF'
# OrionHub Payment Gateway Architecture

The legacy payment gateway sits between OrionHub and the external
payment provider.

OrionHub
    |
    v
Payment Gateway
    |
    v
OrionPay
    |
    v
Transaction Provider
EOF

cat > tests/payment.test.js <<'EOF'
const assert = require("assert");

function validateAmount(amount) {
    return Number.isFinite(amount) && amount > 0;
}

assert.strictEqual(validateAmount(100), true);
assert.strictEqual(validateAmount(-1), false);
EOF

cat > assets/README.txt <<'EOF'
Legacy OrionHub project assets.

Some historical assets were retained during archival.
EOF

cat > lib/validator.js <<'EOF'
function validateTransaction(transaction) {
    if (!transaction) return false;
    if (!transaction.amount) return false;
    if (!transaction.currency) return false;

    return true;
}

module.exports = {
    validateTransaction
};
EOF

git add .

git commit -m "Initialize OrionHub payment gateway" >/dev/null

# ============================================================
# REALISTIC COMMIT HISTORY
# ============================================================

commit_messages=(
    "Add payment transaction model"
    "Add transaction validation"
    "Improve payment request parsing"
    "Add gateway response handler"
    "Add transaction status constants"
    "Add payment provider configuration"
    "Update payment timeout"
    "Improve request logging"
    "Add payment error handling"
    "Add transaction identifier generation"
    "Improve validation error messages"
    "Add gateway health check"
    "Add payment provider client"
    "Refactor transaction creation"
    "Add transaction retry handling"
    "Update provider timeout"
    "Improve gateway logging"
    "Add failed transaction handling"
    "Add transaction status endpoint"
    "Improve API request validation"
    "Add currency validation"
    "Update payment configuration"
    "Add payment service tests"
    "Improve transaction test coverage"
    "Refactor provider client"
    "Add provider diagnostics"
    "Improve gateway error responses"
    "Add request correlation identifier"
    "Update transaction logging"
    "Improve API error handling"
    "Add transaction response formatter"
    "Refactor validation helpers"
    "Add gateway configuration loader"
    "Improve configuration validation"
    "Add development environment settings"
    "Update architecture notes"
    "Improve payment service structure"
    "Add transaction repository"
    "Refactor transaction service"
    "Add transaction lookup"
    "Improve lookup validation"
    "Add gateway request logging"
    "Update logging configuration"
    "Improve provider response parsing"
    "Add provider status mapping"
    "Refactor payment controller"
    "Improve controller validation"
    "Add transaction audit logging"
    "Update audit log format"
    "Improve transaction error reporting"
    "Add provider timeout handling"
    "Refactor gateway client"
    "Improve provider connection handling"
    "Add transaction cancellation support"
    "Update transaction status handling"
    "Improve cancellation validation"
    "Add payment gateway metrics"
    "Update gateway metrics"
    "Improve diagnostic logging"
    "Add service health diagnostics"
    "Refactor diagnostic helpers"
    "Update architecture documentation"
    "Improve deployment documentation"
    "Add local development instructions"
    "Update configuration examples"
    "Improve environment variable handling"
    "Add configuration defaults"
    "Refactor configuration loader"
    "Improve configuration errors"
    "Add request validation middleware"
    "Update API middleware"
    "Improve middleware logging"
    "Add request timing metrics"
    "Update request metrics"
    "Improve transaction performance"
    "Refactor transaction validation"
    "Add transaction schema checks"
    "Improve schema validation"
    "Add provider request formatter"
    "Update provider request format"
    "Improve provider compatibility"
    "Add provider error mapping"
    "Update provider error handling"
    "Improve retry behaviour"
    "Add retry backoff handling"
    "Update retry configuration"
    "Improve transaction recovery"
    "Add transaction recovery logging"
    "Refactor recovery service"
    "Improve recovery diagnostics"
    "Add payment gateway integration tests"
    "Update integration test fixtures"
    "Improve integration test coverage"
    "Add provider mock service"
    "Update provider mock responses"
    "Improve test utilities"
    "Refactor test helpers"
    "Add transaction edge case tests"
    "Improve validation test coverage"
    "Update payment service documentation"
    "Add API endpoint documentation"
    "Improve API examples"
    "Update deployment notes"
    "Add staging configuration"
    "Improve staging configuration"
    "Update production configuration template"
    "Add operational troubleshooting notes"
    "Improve troubleshooting documentation"
    "Add gateway maintenance script"
    "Update maintenance script"
    "Improve maintenance logging"
    "Add transaction cleanup utility"
    "Update cleanup utility"
    "Improve cleanup safety checks"
    "Add archive preparation notes"
    "Update archive documentation"
    "Review legacy dependencies"
    "Update dependency notes"
    "Improve package documentation"
    "Add release metadata"
    "Update release metadata"
    "Prepare version release"
    "Finalize release changes"
    "Update version information"
    "Improve release notes"
    "Add migration notes"
    "Update migration documentation"
    "Review payment provider integration"
    "Improve provider integration diagnostics"
    "Update gateway monitoring notes"
    "Add monitoring configuration"
    "Improve monitoring documentation"
    "Update operational runbook"
    "Review transaction logging"
    "Improve transaction audit records"
    "Update audit documentation"
    "Add legacy compatibility notes"
    "Improve compatibility handling"
    "Update compatibility documentation"
    "Review archived configuration"
    "Clean obsolete configuration entries"
    "Update archived project notes"
    "Prepare gateway archive"
    "Review legacy gateway structure"
    "Document remaining legacy components"
    "Update legacy component notes"
    "Prepare final archive review"
    "Review final repository contents"
    "Update final archive documentation"
    "Mark payment gateway for archival"
    "Archive OrionHub payment gateway"
)

echo "[+] Generating $TOTAL_COMMITS commits..."

for ((i=1; i<=TOTAL_COMMITS; i++)); do

    index=$(( (i - 1) % ${#commit_messages[@]} ))
    message="${commit_messages[$index]}"

    # Make realistic repository changes.
    case $((i % 6)) in

        0)
            echo "// Maintenance revision $i" >> src/payment.js
            ;;

        1)
            echo "# Configuration revision $i" >> config/payment.conf
            ;;

        2)
            echo "- Documentation revision $i" >> docs/architecture.md
            ;;

        3)
            echo "// Test revision $i" >> tests/payment.test.js
            ;;

        4)
            echo "Legacy maintenance note $i" >> assets/README.txt
            ;;

        5)
            echo "// Validation revision $i" >> lib/validator.js
            ;;

    esac

    git add .

    # --------------------------------------------------------
    # FLAG FRAGMENT 1
    # --------------------------------------------------------

    if [ "$i" -eq 157 ]; then

        git commit \
            -m "Review archived deployment identifier" \
            -m "Historical reference fragment:

EC

Continue investigating related archive records." \
            >/dev/null

        continue
    fi

    # --------------------------------------------------------
    # FLAG FRAGMENT 2
    # --------------------------------------------------------

    if [ "$i" -eq 173 ]; then

        git commit \
            -m "Inspect legacy deployment record" \
            -m "Recovered reference fragment:

LIP

The remaining archive material should be reviewed." \
            >/dev/null

        continue
    fi

    # --------------------------------------------------------
    # FLAG FRAGMENT 3
    # --------------------------------------------------------

    if [ "$i" -eq 191 ]; then

        git commit \
            -m "Review final archived reference" \
            -m "Recovered reference fragment:

SE{shadow_profile}

Combine the fragments recovered from the related archive records." \
            >/dev/null

        continue
    fi

    # --------------------------------------------------------
    # NORMAL COMMIT
    # --------------------------------------------------------

    git commit -m "$message" >/dev/null

done

# ============================================================
# HISTORICAL C1 ARTIFACT
# ============================================================

echo
echo "[+] Adding historical project artifact..."

mkdir -p assets/legacy

cat > assets/legacy/README.txt <<'EOF'
Historical OrionHub deployment artifact.

Recovered from an archived development state.

This artifact is retained as part of the legacy investigation
and leads into the next challenge.
EOF

git add assets/legacy/README.txt

git commit \
    -m "Recover archived OrionHub deployment artifact" \
    >/dev/null

# ============================================================
# FINAL ARCHIVE COMMITS
# ============================================================

cat > docs/archive-status.md <<'EOF'
# Archive Status

Project: OrionHub Payment Gateway

Status: Discontinued

The OrionHub payment gateway was retained for historical and
migration purposes after the legacy payment architecture was retired.
EOF

git add docs/archive-status.md

git commit \
    -m "Document legacy project archive status" \
    >/dev/null

git commit \
    --allow-empty \
    -m "Remove internal development tooling" \
    >/dev/null

# ============================================================
# VERIFICATION
# ============================================================

echo
echo "============================================================"
echo " VERIFICATION"
echo "============================================================"

COMMIT_COUNT=$(git rev-list --all --count)

echo
echo "[+] Commit count:"
echo "    $COMMIT_COUNT"

if [ "$COMMIT_COUNT" -lt 200 ]; then
    echo "[ERROR] Repository has fewer than 200 commits."
    exit 1
fi

# ------------------------------------------------------------
# Make absolutely sure the complete flag does not exist in
# normal repository files.
# ------------------------------------------------------------

echo
echo "[+] Checking working tree for complete flag..."

if grep -R \
    "ECLIPSE{shadow_profile}" \
    . \
    --exclude-dir=.git \
    >/dev/null 2>&1
then
    echo
    echo "[ERROR] COMPLETE FLAG FOUND OUTSIDE .git"
    echo "[ERROR] Build rejected."
    exit 1
else
    echo "[OK] Complete flag does not exist in repository files."
fi

# ------------------------------------------------------------
# Make sure no individual commit message contains the complete
# flag or the complete ECLIPSE keyword.
# ------------------------------------------------------------

echo
echo "[+] Checking commit messages..."

if git log --all --format='%B' | grep -F "ECLIPSE" >/dev/null 2>&1
then
    echo
    echo "[ERROR] ECLIPSE keyword found in commit history."
    echo "[ERROR] Build rejected."
    exit 1
else
    echo "[OK] No complete ECLIPSE keyword exists in commit messages."
fi

if git log --all --format='%B' | grep -F "ECLIPSE{shadow_profile}" >/dev/null 2>&1
then
    echo
    echo "[ERROR] Complete flag found in commit history."
    exit 1
else
    echo "[OK] Complete flag is not stored in a single commit message."
fi

# ------------------------------------------------------------
# Verify the three fragments exist in Git history.
# ------------------------------------------------------------

echo
echo "[+] Checking flag fragments..."

for fragment in "EC" "LIP" "SE{shadow_profile}"
do
    if git log --all --format='%B' | grep -F "$fragment" >/dev/null 2>&1
    then
        echo "[OK] Fragment found: $fragment"
    else
        echo "[ERROR] Missing fragment: $fragment"
        exit 1
    fi
done

# ============================================================
# CREATE PLAYER BUNDLE
# ============================================================

echo
echo "[+] Creating player Git bundle..."

git bundle create "$BUNDLE" --all

echo
echo "[+] Verifying player bundle..."

git bundle verify "$BUNDLE"

# ============================================================
# FINAL INFORMATION
# ============================================================

echo
echo "============================================================"
echo " C1 BUILD COMPLETE"
echo "============================================================"
echo
echo "Repository:"
echo "  $REPO"
echo
echo "Commit count:"
echo "  $COMMIT_COUNT"
echo
echo "Bundle:"
echo "  $BUNDLE"
echo
echo "C1 flag reconstruction:"
echo
echo "  EC"
echo "  + LIP"
echo "  + SE{shadow_profile}"
echo "  --------------------"
echo "  ECLIPSE{shadow_profile}"
echo
echo "The complete flag is NOT present:"
echo "  - in normal repository files"
echo "  - in a single commit message"
echo "  - as the ECLIPSE keyword in Git history"
echo
echo "============================================================"
