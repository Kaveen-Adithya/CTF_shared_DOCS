from flask import Flask, render_template, Response, abort

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/people")
def people():
    return render_template("people.html")

@app.route("/people/maya")
def maya():
    return render_template("maya.html")

@app.route("/people/daniel")
def daniel():
    return render_template("daniel.html")

@app.route("/people/ravi")
def ravi():
    return render_template("ravi.html")

@app.route("/projects/eclipse-review")
def eclipse_review():
    return render_template("eclipse_review.html")

# These routes are intentionally not linked from the main navigation.
# Players are expected to discover them through reconnaissance.

@app.route("/projects")
def projects():
    return render_template("projects.html")

@app.route("/projects/eclipse")
def eclipse():
    return render_template("eclipse.html")

@app.route("/archive")
def archive():
    return render_template("archive.html")

@app.route("/archive/index")
def archive_index():
    return render_template("archive_index.html")

@app.route("/repository")
def repository():
    return render_template("repository.html")

@app.route("/repository/legacy")
def legacy():
    return render_template("legacy.html")

@app.route("/robots.txt")
def robots():
    content = """User-agent: *
Disallow: /archive/index
Disallow: /repository/legacy

# Historical development archive
# Reference: ECL-01-LEGACY
"""
    return Response(content, mimetype="text/plain")

@app.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
