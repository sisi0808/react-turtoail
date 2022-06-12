import React from "react";
// import ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import "./index.css";

class Square extends React.Component {
  render() {
    return (
      <button
        className={this.props.isHilight ? "square highlight-color" : "square"}
        onClick={() => this.props.onClick()}
      >
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i, j) {
    // console.log(this.props.winLines);
    return (
      <Square
        value={this.props.squares[i][j]}
        onClick={() => this.props.handleClick(i, j)}
        key={`Square-(${i}, ${j})`}
        isHilight={this.props.winLines.some((wl) => {
          return i === wl[0] && j === wl[1];
        })}
      />
    );
  }

  createSquares() {
    let squares = [];
    const col = 19;
    const row = 19;
    for (let i = 0; i < col; i++) {
      let rows = [];
      for (let j = 0; j < row; j++) {
        rows.push(this.renderSquare(i, j));
      }
      squares.push(
        <div className="board-row" key={"rows" + i.toString()}>
          {rows}
        </div>
      );
    }
    return squares;
  }

  render() {
    return <div>{this.createSquares()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(19)
            .fill()
            .map(() => Array(19).fill(null)),
          // squares: [
          //   [null, null, null],
          //   [null, null, null],
          //   [null, null, null],
          // ],
          col: null,
          row: null,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      ascending: true,
    };
  }

  handleClick(i, j) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.map((squares2) => squares2.slice()).slice();

    if (calculateWinner(squares)[0] || squares[i][j]) {
      return;
    }
    // console.log(history[0]);
    squares[i][j] = this.state.xIsNext ? "X" : "O";
    // console.log(
    //   history[this.state.stepNumber - 1].col,
    //   history[this.state.stepNumber - 1].row
    // );
    // console.log(history.length);
    // console.log(history[0]);

    this.setState({
      history: history.concat([
        {
          squares: squares,
          col: i,
          row: j,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    step = Math.min(this.state.history.length - 1, Math.max(0, step));
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    // console.log(this.state.history);
    // console.log("fd");
    const winner = calculateWinner(current.squares);

    /* ここでトグルボタンに応じたソートを行う */
    const moves = history.map((step, move) => {
      const desc = move
        ? `(${step.col}, ${step.row})`
        : /*'Go to move #' + move : */
          "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <b>{desc}</b> : desc}
          </button>
        </li>
      );
    });
    let status;
    let winLines = [];
    // console.log(winner[0]);
    if (winner[0]) {
      if (winner[0] === "Draw") {
        status = winner[0];
      } else {
        status = "Winner: " + winner[0];
        winLines = winner[1];
      }
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    /* returnで返すDOMをまるごと反転させれば良い */
    let order = "Dsc";
    if (!this.state.ascending) {
      order = "Asc";
      moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            handleClick={(i, j) => this.handleClick(i, j)}
            winLines={winLines}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button
              onClick={() =>
                this.setState({ ascending: !this.state.ascending })
              }
            >
              {order}
            </button>
          </div>
          <div>
            <button onClick={() => this.jumpTo(this.state.stepNumber - 1)}>
              Undo
            </button>
            <button onClick={() => this.jumpTo(this.state.stepNumber + 1)}>
              Redo
            </button>
          </div>

          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================
//
const root = ReactDOMClient.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const row = 19;
  const col = 19;

  const winLinesNum = 5;

  let winner = null;
  let winLines = [];

  /* 縦横斜めを一度に判定 */
  for (let i = 0; i < col; i++) {
    for (let j = 0; j < row; j++) {
      if (squares[i][j] === null) continue;
      /* 右判定　*/
      if (j <= row - winLinesNum) {
        let isAlignHorizontal = true;
        for (let jj = 0; jj < winLinesNum; jj++) {
          if (
            squares[i][j + jj] === null ||
            squares[i][j + jj] !== squares[i][j]
          ) {
            isAlignHorizontal = false;
          }
        }
        if (isAlignHorizontal) {
          winner = squares[i][j];
          winLines = winLines.concat(
            Array(winLinesNum)
              .fill(null)
              .map((_, idx) => [i, j + idx])
          );
        }
      }

      /* 下判定　*/
      if (i <= col - winLinesNum) {
        let isAlignVertical = true;
        for (let ii = 0; ii < winLinesNum; ii++) {
          if (
            squares[i + ii][j] === null ||
            squares[i + ii][j] !== squares[i][j]
          ) {
            isAlignVertical = false;
          }
        }
        if (isAlignVertical) {
          winner = squares[i][j];
          winLines = winLines.concat(
            Array(winLinesNum)
              .fill(null)
              .map((_, idx) => [i + idx, j])
          );
        }
      }

      /* 右下判定　*/
      if (i <= col - winLinesNum && j <= row - winLinesNum) {
        let isAlignDiagonal = true;
        for (let ii = 0; ii < winLinesNum; ii++) {
          if (
            squares[i + ii][j + ii] === null ||
            squares[i + ii][j + ii] !== squares[i][j]
          ) {
            isAlignDiagonal = false;
          }
        }
        if (isAlignDiagonal) {
          winner = squares[i][j];
          winLines = winLines.concat(
            Array(winLinesNum)
              .fill(null)
              .map((_, idx) => [i + idx, j + idx])
          );
        }
      }

      /* 左下判定　*/
      if (i <= col - winLinesNum && j > winLinesNum) {
        let isAlignDiagonal = true;
        for (let ii = 0; ii < winLinesNum; ii++) {
          if (
            squares[i + ii][j - ii] === null ||
            squares[i + ii][j - ii] !== squares[i][j]
          ) {
            isAlignDiagonal = false;
          }
        }
        if (isAlignDiagonal) {
          winner = squares[i][j];
          winLines = winLines.concat(
            Array(winLinesNum)
              .fill(null)
              .map((_, idx) => [i + idx, j - idx])
          );
        }
      }
    }
  }

  if (!squares.some((squares2) => squares2.includes(null)) && winner === null)
    return ["Draw", null];
  return [winner, winLines];
}
