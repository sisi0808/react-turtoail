import React from "react";
import ReactDOM from 'react-dom'
import './index.css'

class Square extends React.Component {
    render() {
        return (
            <button className="square" onClick={() => this.props.onClick()}>
            {this.props.value}
            </button>
        );
    }
}

class Board extends React.Component {

    renderSquare(i) {
        return (<Square
            value={this.props.squares[i]}
            onClick={() => this.props.handleClick(i)}
            key={"square-" + i.toString()}
            />
        );
    }

    createSquares() {
        let squares = [];
        const row = 3;
        const col = 3;
        for(let i = 0; i < col; i++){
            let rows = [];
            for(let j = 0; j < row; j++){
                rows.push(this.renderSquare(i*3+j));
            }
            squares.push(<div className="board-row" key={"rows" + i.toString()}>{rows}</div>);
        }
        return squares;
    }

    render(){

        return(
            <div>
                {this.createSquares()}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                col: null,
                row: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            ascending: true,
        };
    }

    handleClick(i){
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const col = Math.floor(i / 3) + 1;
        const row = (i % 3) + 1;

        if(calculateWinner(squares)[0] || squares[i]){
            return;
        }
        squares[i] = this.state.xIsNext ? 'X':'O';

        this.setState({
            history: history.concat([{
                squares,
                col,
                row,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step){
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        /* ここでトグルボタンに応じたソートを行う */
        const moves = history.map((step, move) => {
            const desc = move ?
                `(${step.col}, ${step.row})`:
                /*'Go to move #' + move : */
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                    {
                        move === this.state.stepNumber ?
                            <b>{desc}</b> :
                            desc
                    }
                </button>
                </li>
            );
        });
        let status;
        if (winner[0]) {
            status = 'Winner: ' + winner[0];
            console.log(winner[1]);

            /* マス目の色を変更する */
            for(let i in winner[1]) {
                current.squares[winner[1][i]] = <font color="#F00">{current.squares[winner[1][i]]}</font>;
            }
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        /* returnで返すDOMをまるごと反転させれば良い */
        if(!this.state.ascending) moves.reverse();


        return (
            <div className="game">
                <div className="game-board">
                    <Board
                    squares={current.squares}
                    handleClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={()=>this.setState({ascending: true})}>Asc</button>
                    <button onClick={()=>this.setState({ascending: false})}>Dsc</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================
//
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
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
    let winner = null;
    let winLines = [];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            winner = squares[a];
            winLines = winLines.concat(lines[i]);
        }
    }
    return [winner, winLines];
}
