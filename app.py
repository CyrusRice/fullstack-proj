from flask import Flask, render_template
import chess

app = Flask(__name__)


@app.route('/')
def home():
    app.route('/')
    return render_template("home.html")


@app.route('/about')
def about():
    board = chess.Board()
    print(board.legal_moves)
    return render_template("about.html")

@app.route('/forgotPassword')
def forgotPassword():
    return render_template("forgotPassword.html")

if __name__ == "__main__":
    app.run(debug=True)
