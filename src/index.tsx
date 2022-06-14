import { useState } from "react";
import * as ReactDOMClient from "react-dom/client";
import "./index.css";

/* --------------Type-------------- */
type SquareState = "O" | "X" | null;
type WinnerState = "O" | "X" | "Draw" | null;
type OrderState = "Asc" | "Dsc";
type Position = {
  col: number | null;
  row: number | null;
};
type SquaresType = SquareState[][];
type SquareProps = {
  value: SquareState;
  onClick: () => void;
  isHilight: boolean;
};
type BoardProps = {
  squares: SquaresType;
  onClick: (i: number, j: number) => void;
  winLines: number[][];
};
type History = {
  squares: SquaresType;
  position: Position;
};

/* --------------Type-------------- */

const calculateWinner = (squares: SquaresType): [WinnerState, number[][]] => {
  const col = 19;
  const row = 19;

  const winLinesNum = 5;

  let winner: WinnerState = null;
  let winLines: number[][] = [];

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
    return ["Draw", winLines];
  return [winner, winLines];
};

const Square: React.VFC<SquareProps> = (props) => {
  return (
    <button
      className={props.isHilight ? "square highlight-color" : "square"}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
};

const Board: React.VFC<BoardProps> = (props) => {
  // class Board extends React.Component {
  const renderSquare = (i: number, j: number) => {
    return (
      <Square
        value={props.squares[i][j]}
        onClick={() => props.onClick(i, j)}
        key={`Square-(${i}, ${j})`}
        isHilight={props.winLines.some((wl) => {
          return i === wl[0] && j === wl[1];
        })}
      />
    );
  };

  const createSquares = () => {
    let squares = [];
    const col = 19;
    const row = 19;
    for (let i = 0; i < col; i++) {
      let rows = [];
      for (let j = 0; j < row; j++) {
        rows.push(renderSquare(i, j));
      }
      squares.push(
        <div className="board-row" key={"rows" + i.toString()}>
          {rows}
        </div>
      );
    }
    return squares;
  };

  return <div>{createSquares()}</div>;
};

const Game: React.VFC = () => {
  const [history, setHistory] = useState<History[]>([
    {
      squares: Array(19)
        .fill(null)
        .map(() => Array(19).fill(null)),
      position: {
        col: null,
        row: null,
      },
    },
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXisNext] = useState(true);
  const [asending, setAscending] = useState(true);

  const handleClick = (i: number, j: number) => {
    const historyCurrent = history.slice(0, stepNumber + 1);
    const current = history[historyCurrent.length - 1];
    const squares = current.squares.map((squares2) => squares2.slice()).slice();

    if (calculateWinner(squares)[0] || squares[i][j]) {
      return;
    }
    squares[i][j] = xIsNext ? "X" : "O";

    setHistory([
      ...historyCurrent,
      { squares: squares, position: { col: i, row: j } },
    ]);
    setStepNumber(historyCurrent.length);
    setXisNext(!xIsNext);
  };

  const jumpTo = (step: number) => {
    step = Math.min(history.length - 1, Math.max(0, step));
    setStepNumber(step);
    setXisNext(step % 2 === 0);
  };

  const historyCurrent = [...history];
  const current = historyCurrent[stepNumber];
  const [winner, winLines] = calculateWinner(current.squares);

  const moves = history.map((step, move) => {
    const desc = move
      ? `Go to move (${step.position.col}, ${step.position.row})`
      : "Go to game start";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>
          {move === stepNumber ? <b>{desc}</b> : desc}
        </button>
      </li>
    );
  });
  // console.log(winner[0]);
  const status = winner
    ? winner === "Draw"
      ? winner
      : `Winner: ${winner}`
    : `Next player: ${xIsNext ? "X" : "O"}`;

  let order: OrderState = "Asc";
  if (!asending) {
    order = "Dsc";
    moves.reverse();
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={current.squares}
          onClick={(i, j) => handleClick(i, j)}
          winLines={winLines}
        />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <div>
          <button onClick={() => setAscending(!asending)}>{order}</button>
        </div>
        <div>
          <button onClick={() => jumpTo(stepNumber - 1)}>Undo</button>
          <button onClick={() => jumpTo(stepNumber + 1)}>Redo</button>
        </div>
        <ol>{moves}</ol>
      </div>
    </div>
  );
};

// ========================================

const root = ReactDOMClient.createRoot(document.getElementById("root")!);
root.render(<Game />);
