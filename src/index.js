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
    const col = 5;
    const row = 5;
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
          squares: Array(5)
            .fill()
            .map(() => Array(5).fill(null)),
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
  const row = 5;
  const col = 5;

  let winner = null;
  let winLines = [];
  // const lines = [
  //   [0, 1, 2],
  //   [3, 4, 5],
  //   [6, 7, 8],
  //   [0, 3, 6],
  //   [1, 4, 7],
  //   [2, 5, 8],
  //   [0, 4, 8],
  //   [2, 4, 6],
  // ];
  // for (let i = 0; i < lines.length; i++) {
  //   const [a, b, c] = lines[i];
  //   if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
  //     winner = squares[a];
  //     winLines = winLines.concat(lines[i]);
  //   }
  // }

  /* 縦横揃った場合を調べる */
  let isAlignHorizontal = Array(col).fill(true);
  let isAlignVertical = Array(row).fill(true);
  for (let i = 0; i < col; i++) {
    for (let j = 0; j < row; j++) {
      /* 横のラインが揃った場合 */
      if (squares[i][j] == null || squares[i][j] !== squares[i][0])
        isAlignHorizontal[i] = false;
      /* 縦のラインが揃った場合 */
      if (squares[i][j] == null || squares[i][j] !== squares[0][j])
        isAlignVertical[j] = false;
    }
  }

  /* 斜めに揃った場合 */
  let isAlignDiagonal = Array(2).fill(true);
  for (let i = 0; i < col; i++) {
    /* 左下-右上のラインがに揃った場合 */
    if (squares[i][i] == null || squares[i][i] !== squares[0][0])
      isAlignDiagonal[0] = false;
    /* 右下-左上のラインがに揃った場合 */
    if (
      squares[i][row - i - 1] == null ||
      squares[i][row - i - 1] !== squares[0][row - 1]
    )
      isAlignDiagonal[1] = false;
  }

  /* 横に揃った場合 */
  for (let i = 0; i < col; i++) {
    if (isAlignHorizontal[i]) {
      winner = squares[i][0];
      winLines = winLines.concat(
        Array(row)
          .fill(null)
          .map((_, idx) => [i, idx])
      );
    }
  }

  /* 縦に揃った場合 */
  for (let j = 0; j < row; j++) {
    if (isAlignVertical[j]) {
      winner = squares[0][j];
      winLines = winLines.concat(
        Array(col)
          .fill(null)
          .map((_, idx) => [idx, j])
      );
    }
  }

  /* 斜めに揃った場合 */
  if (isAlignDiagonal[0]) {
    winner = squares[0][0];
    winLines = winLines.concat(
      Array(col)
        .fill(null)
        .map((_, idx) => [idx, idx])
    );
  }
  if (isAlignDiagonal[1]) {
    winner = squares[0][row - 1];
    winLines = winLines.concat(
      Array(col)
        .fill(null)
        .map((_, idx) => [idx, row - idx - 1])
    );
  }

  if (!squares.some((squares2) => squares2.includes(null)) && winner === null)
    return ["Draw", null];
  return [winner, winLines];
}
