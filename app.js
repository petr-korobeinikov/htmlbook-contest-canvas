/**
 * 
 */

var canvas  = null,
    context = null;

var GAME_AREA_WIDTH  = 210 + 1,
    GAME_AREA_HEIGHT = 210 + 1;

/*
 * 0 - doomed
 * 1 - black
 * 2 - white
 * 3 - gray
 * 4 - free
 */
var currentBoard = null,
    defaultBoard = [
	[0, 0, 0, 2, 0, 0, 0],
	[0, 0, 4, 2, 4, 0, 0],
	[0, 0, 0, 2, 0, 0, 0],
	[3, 3, 3, 1, 3, 3, 3],
	[0, 0, 0, 2, 0, 0, 0],
	[0, 0, 4, 2, 4, 0, 0],
	[0, 0, 0, 2, 0, 0, 0]
];

function Cell(x, y) {
	this.x = x;
	this.y = y;
}

function startGame() {
	currentBoard = defaultBoard;
	drawBoard();
}

function drawBoard() {
	var i,
	    j,
	    ilen,
	    jlen,
	    row,
	    cell;
	
	for (i = 0, ilen = currentBoard.length; i < ilen; i += 1) {
		row = currentBoard[i];
		for (j = 0, jlen = row.length; j < jlen; j += 1) {
			cell = currentBoard[i][j];
			
			if (0 == cell) {
				continue;
			}
			
			// x, y, fill
			drawCell(j, i, cell);
		}
	}
}

function drawCell(x, y, fill) {
	var fillStyle,
	    radius = ~~(GAME_AREA_WIDTH / currentBoard.length  / 2);
	
	x = x * 2 * radius + radius;
	y = y * 2 * radius + radius;
	
	switch (fill) {
	case 1 :
		fillStyle = 'black';
		break;
	case 2 :
		fillStyle = 'white';
		break;
	case 3 :
		fillStyle = '#777';
		break;
	case 4 :
		fillStyle = '#ccc';
		break;
	}
	
	context.beginPath();
	context.arc(x, y, radius - 3, 0, 2 * Math.PI, false);
	context.fillStyle = fillStyle;
	context.fill();
	context.strokeStyle = 'black';
	context.stroke();
}
