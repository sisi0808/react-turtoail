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
type SquaresType = SquareState[];
type SquareProps = {
  value: SquareState;
  onClick: () => void;
  isHilight: boolean;
};
type BoardProps = {
  squares: SquaresType;
  onClick: (i: number) => void;
  winLines: number[];
};
type History = {
  squares: SquaresType;
  position: Position;
};

/* --------------Type-------------- */

const calculateWinner = (squares: SquaresType): [WinnerState, number[]] => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let winner: WinnerState = null;
  let winLines: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      winner = squares[a];
      winLines = winLines.concat(lines[i]);
    }
  }
  if (!squares.includes(null) && winner === null) return ["Draw", winLines];
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
  const renderSquare = (i: number) => {
    return (
      <Square
        value={props.squares[i]}
        onClick={() => props.onClick(i)}
        isHilight={props.winLines.includes(i)}
      />
    );
  };

  const createSquares = () => {
    let squares = [];
    const col = 3;
    const row = 3;
    for (let i = 0; i < col; i++) {
      let rows = [];
      for (let j = 0; j < row; j++) {
        rows.push(renderSquare(i * 3 + j));
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
      squares: Array(9).fill(null),
      position: {
        col: null,
        row: null,
      },
    },
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXisNext] = useState(true);
  const [asending, setAscending] = useState(true);

  const handleClick = (i: number) => {
    const historyCurrent = history.slice(0, stepNumber + 1);
    const current = history[historyCurrent.length - 1];
    const squares = [...current.squares];
    if (calculateWinner(squares)[0] || squares[i]) {
      return;
    }
    squares[i] = xIsNext ? "X" : "O";

    setHistory([
      ...historyCurrent,
      { squares: squares, position: { col: i % 3, row: Math.ceil(i / 3) } },
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
          onClick={(i) => handleClick(i)}
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
