import { GRID } from './globals.js';

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

function drawRunningScore(context, score) {
    context.font = "30px Arial";
    context.fillStyle = "#777";
    context.fillText(score, 10, 30);
}

function drawStartMessage(context, score) {
    context.font = "20px Arial";
    context.fillStyle = "#777";
    context.fillText("Press Space to Start", 60, 275);
}

function drawGameOver(context, score) {
    context.font = "30px Arial";
    context.fillStyle = "#777";
    context.fillText("GAME OVER", 60, 275);
}

function drawState(context, state) {
    state.board.map(space => drawSpace(context, space));
    drawPiece(context, state.current);

    if (!state.started) {
        drawStartMessage(context, state);
    }
    else if (state.gameOver) {
        drawGameOver(context, state);
    }
    else {
        drawRunningScore(context, state.score);
    }
}

export function draw(canvas, context, store) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawState(context, store.getState());
}
