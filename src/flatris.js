import { createStore } from 'redux';
import { draw } from './draw.js';
import { GRID, COLORS, POINT_VALUES } from './globals.js';

function Space(x, y, color = COLORS.BLUE) {
    return {
        x: x,
        y: y,
        color: color
    };
}

const SHAPES = {
    O: {
        orientations: [
            [Space(0,0), Space(0,1), Space(1,0), Space(1,1)],
            [Space(0,0), Space(0,1), Space(1,0), Space(1,1)],
            [Space(0,0), Space(0,1), Space(1,0), Space(1,1)],
            [Space(0,0), Space(0,1), Space(1,0), Space(1,1)]
        ],
        color: COLORS.RED
    },
    J: {
        orientations: [
            [Space(0,0), Space(1,0), Space(2,0), Space(2,1)],
            [Space(1,0), Space(1,1), Space(1,2), Space(0,2)],
            [Space(0,0), Space(0,1), Space(1,1), Space(2,1)],
            [Space(0,0), Space(1,0), Space(0,1), Space(0,2)]
        ],
        color: COLORS.ORANGE
    },
    L: {
        orientations: [
            [Space(0,0), Space(1,0), Space(2,0), Space(0,1)],
            [Space(0,0), Space(1,0), Space(1,1), Space(1,2)],
            [Space(2,0), Space(0,1), Space(1,1), Space(2,1)],
            [Space(0,0), Space(0,1), Space(0,2), Space(1,2)]
        ],
        color: COLORS.GREEN
    },
    T: {
        orientations: [
            [Space(0,0), Space(0,1), Space(0,2), Space(1,1)],
            [Space(0,0), Space(1,0), Space(2,0), Space(1,1)],
            [Space(1,0), Space(1,1), Space(1,2), Space(0,1)],
            [Space(1,0), Space(0,1), Space(1,1), Space(2,1)]
        ],
        color: COLORS.YELLOW
    },
    Z: {
        orientations: [
            [Space(0,0), Space(1,0), Space(1,1), Space(2,1)],
            [Space(1,0), Space(0,1), Space(1,1), Space(0,2)],
            [Space(0,0), Space(1,0), Space(1,1), Space(2,1)],
            [Space(1,0), Space(0,1), Space(1,1), Space(0,2)]
        ],
        color: COLORS.PURPLE
    },
    S: {
        orientations: [
            [Space(0,0), Space(0,1), Space(1,1), Space(1,2)],
            [Space(1,0), Space(2,0), Space(0,1), Space(1,1)],
            [Space(0,0), Space(0,1), Space(1,1), Space(1,2)],
            [Space(1,0), Space(2,0), Space(0,1), Space(1,1)]
        ],
        color: COLORS.TURQUOISE
    },
    I: {
        orientations: [
            [Space(0,0), Space(1,0), Space(2,0), Space(3,0)],
            [Space(1,0), Space(1,1), Space(1,2), Space(1,3)],
            [Space(0,0), Space(1,0), Space(2,0), Space(3,0)],
            [Space(1,0), Space(1,1), Space(1,2), Space(1,3)],
        ],
        color: COLORS.BLUE
    },
};

class Piece {
    constructor (shape, orientation, layout, color, x = 0, y = 0) {
        this.shape = shape;
        this.orientation = orientation;
        this.x = x;
        this.y = y;
        this.layout = layout;
        this.color = color;
    }

    get spaces() {
        return this.layout.map(
            space => Space(space.x + this.x, space.y + this.y, this.color)
        );
    }

    shifted(dx, dy) {
        return new Piece(this.shape, this.orientation, this.layout, this.color, this.x + dx, this.y + dy);
    }

    rotated(dx, dy) {
        let newOrientation = (this.orientation + 1) % 4;
        let newLayout = SHAPES[this.shape].orientations[newOrientation];
        return new Piece(this.shape, newOrientation, newLayout, this.color, this.x, this.y);
    }
}

function makeInitialState() {
    return {
        started: false,
        gameOver: false,
        board: [],
        current: randomPiece(),
        next: randomPiece(),
        score: 0
    };
}

function inXBounds(piece, gridwidth) {
    let bools = piece.spaces.map(square => 0 <= square.x && square.x < gridwidth);
    return bools.indexOf(false) == -1;
}

function colliding(piece, board) {
    let colliding = space => boardsquare => boardsquare.x == space.x && boardsquare.y == space.y;
    for (let i in piece.spaces) {
        let space = piece.spaces[i];
        // check for square collision
        let collision = board.find(colliding(space));
        if (collision) return true;
        // check for floor collision
        if (space.y >= GRID.HEIGHT) return true;
    }
    return false;
}

function randomPiece() {
    let keys = Object.keys(SHAPES);
    let idx = Math.floor(Math.random() * keys.length);
    let shape = SHAPES[keys[idx]];
    return new Piece(keys[idx], 0, shape.orientations[0], shape.color, 3, 0);
}

function validPiece(piece, board) {
    return inXBounds(piece, GRID.WIDTH) && !colliding(piece, board);
}

function shiftPiece(piece, board, dx, dy) {
    let newPiece = piece.shifted(dx, dy);
    if (!validPiece(newPiece, board)) {
        return piece;
    }
    return newPiece;
}

function clearRows(board) {
    let rowcounts = {};
    for (let i in board) {
        let space = board[i];
        rowcounts[space.y] = rowcounts[space.y] + 1 || 1;
    }
    let notInRow = row => space => space.y != row;
    let bumpSpaceDown = row => space => space.y < row ? new Space(space.x, space.y + 1, space.color) : space;

    let rowscleared = 0;
    for (let row in rowcounts) {
        if (rowcounts[row] >= GRID.WIDTH) {
            board = board.filter(notInRow(row));
            board = board.map(bumpSpaceDown(row));
            rowscleared += 1;
        }
    }

    let points = rowscleared <= 4 ? POINT_VALUES[rowscleared] : POINT_VALUES[4];

    return {
        board: board,
        points: points
    };
}

function validRotation(piece, board) {
    let rotated = piece.rotated();
    if (!validPiece(rotated, board)) {
        rotated = rotated.shifted(1, 0);
        if (!validPiece(rotated, board)) {
            rotated = rotated.shifted(-2, 0);
            if (!validPiece(rotated, board)) {
                rotated = piece;
            }
        }
    }
    return rotated;
}

function mainState(state = makeInitialState(), action) {
    switch (action.type) {
        case 'NEW_GAME':
            return Object.assign({}, state,
                {
                    started: true,
                    gameOver: false,
                    board: [],
                    score: 0
                }
            );
        case 'TICK':
            if (state.gameOver || !state.started) return state;

            let shifted_down = state.current.shifted(0, 1);
            if (colliding(shifted_down, state.board)) {
                let {board: new_board, points: points_awarded} = clearRows(state.current.spaces.concat(state.board));
                return Object.assign({}, state,
                     {
                         current: state.next,
                         next: randomPiece(),
                         board: new_board,
                         score: state.score + points_awarded,
                         gameOver: colliding(state.next, state.board)
                     }
                );
            }
            return Object.assign({}, state, {current: shifted_down});
        case 'MOVE_RIGHT':
            if (state.gameOver || !state.started) return state;
            return Object.assign({}, state, {
                current: shiftPiece(state.current, state.board, 1, 0)
            });
        case 'MOVE_LEFT':
            if (state.gameOver || !state.started) return state;
            return Object.assign({}, state, {
                current: shiftPiece(state.current, state.board, -1, 0)
            });
        case 'MOVE_DOWN':
            if (state.gameOver || !state.started) return state;
            return Object.assign({}, state, {
                current: shiftPiece(state.current, state.board, 0, 1)
            });
        case 'ROTATE':
            if (state.gameOver || !state.started) return state;
            return Object.assign({}, state, {
                current: validRotation(state.current, state.board)
            });
        default:
            return state;
    }
}

let store = createStore(mainState);

let canvas = document.getElementById("myCanvas");
canvas.width = GRID.DIMENSION * GRID.WIDTH;
canvas.height = GRID.DIMENSION * GRID.HEIGHT;
let ctx = canvas.getContext("2d");

document.addEventListener("keydown", keyDownHandler, false);

function keyDownHandler(event) {
    if (event.keyCode == 39) {
        store.dispatch({type: 'MOVE_RIGHT'});
    }
    else if (event.keyCode == 37) {
        store.dispatch({type: 'MOVE_LEFT'});
    }
    else if (event.keyCode == 40) {
        store.dispatch({type: 'MOVE_DOWN'});
    }
    else if (event.keyCode == 38) {
        store.dispatch({type: 'ROTATE'});
    }
    else if (event.keyCode == 32) {
        store.dispatch({type: 'NEW_GAME'});
    }
}

store.subscribe(
    draw.bind(null, canvas, ctx, store)
);
setInterval(() => store.dispatch({type: 'TICK'}), 1000);
