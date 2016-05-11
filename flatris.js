/*
 * TODO: colors
 * TODO: rotation
 * TODO: line clearing
 * TODO: end state
 *
 */

const GRID = {
    DIMENSION: 30,
    WIDTH:     10,
    HEIGHT:    20
};

const COLORS = {
    RED:       "#e74c3c",
    ORANGE:    "#e67e22",
    GREEN:     "#2ecc71",
    BLUE:      "#3498db",
    PURPLE:    "#9b59b6",
    TURQUOISE: "#1abc9c",
    YELLOW:    "#f1c40f",
};

function Space(x, y, color = COLORS.BLUE) {
    return {
        x: x,
        y: y,
        color: color
    };
}

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

function makeInitialState() {
    return {
        board: [],
        current: randomPiece(),
        next: randomPiece()
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
    for (let row in rowcounts) {
        if (rowcounts[row] >= GRID.WIDTH) {
            board = board.filter(notInRow(row));
            board = board.map(bumpSpaceDown(row));
        }
    }

    return board;
}

function validRotation(piece, board) {
    let rotated = piece.rotated();
    if (!validPiece(rotated, board)) {
        rotated = rotated.shifted(1, 0);
        if (!validPiece(rotated, board)) {
            rotated = rotated.shifted(-2, 0);
            if (!validPiece(rotated, board)) {
                rotated = state.current;
            }
        }
    }
    return rotated;
}

function mainState(state = makeInitialState(), action) {
    switch (action.type) {
        case 'TICK':
            let current = state.current;
            let newCurrent = new Piece(current.shape, current.orientation, current.layout, current.color, current.x, current.y + 1);
            if (colliding(newCurrent, state.board)) {
                let newboard = state.current.spaces.concat(state.board);
                newboard = clearRows(newboard);
                return Object.assign({}, state, {current: state.next, next: randomPiece(), board: newboard});
            }
            return Object.assign({}, state, {current: newCurrent});
        case 'MOVE_RIGHT':
            return Object.assign({}, state, {
                current: shiftPiece(state.current, state.board, 1, 0)
            });
        case 'MOVE_LEFT':
            return Object.assign({}, state, {
                current: shiftPiece(state.current, state.board, -1, 0)
            });
        case 'MOVE_DOWN':
            return Object.assign({}, state, {
                current: shiftPiece(state.current, state.board, 0, 1)
            });
        case 'ROTATE':
            return Object.assign({}, state, {
                current: validRotation(state.current, state.board)
            });
        default:
            return state;
    }
}

let store = Redux.createStore(mainState);

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
}

function drawSpace(context, space) {
    let dim = GRID.DIMENSION;
    context.beginPath();
    context.rect(space.x*dim, space.y*dim, dim, dim);
    context.fillStyle = space.color;
    context.fill();
    context.closePath();
}
function drawPiece(context, shape) {
     let spaces = shape.spaces.map(space => drawSpace(context, space));
}
function drawState(context, state) {
    state.board.map(space => drawSpace(context, space));
    drawPiece(context, state.current);
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawState(ctx, store.getState());
}
store.subscribe(draw);
setInterval(() => store.dispatch({type: 'TICK'}), 1000);
