"use strict";

var canvas  = null,
    context = null;

var GAME_AREA_WIDTH  = 210 + 1,
    GAME_AREA_HEIGHT = 210 + 1;

var currentChip = null,
    targetCell     = null;

/*
 * 0 - doomed
 * 1 - black
 * 2 - white
 * 3 - gray
 * 4 - free
 */
var CELL_DOOMED = 0,
    CELL_BLACK  = 1,
    CELL_WHITE  = 2,
    CELL_GRAY   = 3,
    CELL_FREE   = 4;
    

var currentBoard = [],
    defaultBoard = [
	[0, 0, 0, 2, 0, 0, 0],
	[0, 0, 4, 2, 4, 0, 0],
	[0, 0, 0, 2, 0, 0, 0],
	[3, 3, 3, 1, 3, 3, 3],
	[0, 0, 0, 2, 0, 0, 0],
	[0, 0, 4, 2, 4, 0, 0],
	[0, 0, 0, 2, 0, 0, 0]
];

var chipDiameter = ~~(GAME_AREA_WIDTH / defaultBoard.length);
var chipRadius   = chipDiameter / 2;

function startGame() {
	// @{
	// Правильно клонируем массив
	var i, j, ilen, jlen;
	for (i = 0, ilen = defaultBoard.length; i < ilen; i += 1) {
		currentBoard[i] = defaultBoard[i].slice(0);
	}
	// @}
	
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
			
			if (CELL_DOOMED == cell) {
				continue;
			}
			
			// x, y, fill
			drawCell(j, i, cell);
		}
	}
}

function drawCell(x, y, fill) {
	var fillStyle;
	
	x = x * 2 * chipRadius + chipRadius;
	y = y * 2 * chipRadius + chipRadius;
	
	// @{
	// Стиль заливки фишки
	switch (fill) {
	case 1 :
		fillStyle = 'black';
		break;
	case 2 :
		fillStyle = 'yellow';
		break;
	case 3 :
		fillStyle = 'green';
		break;
	case 4 :
		fillStyle = 'white';
		break;
	}
	// @}
	
	// @{
	// Квадратик
	context.rect(x - chipRadius, y - chipRadius, chipRadius * 2, chipRadius * 2);
	context.lineWidth = 1;
	context.strokeStyle = "black";
	context.stroke();
	// @}
	
	// @{
	// Фишка
	context.beginPath();
	context.arc(x, y, chipRadius - 3, 0, 2 * Math.PI, false);
	context.fillStyle = fillStyle;
	context.fill();
	context.strokeStyle = 'black';
	context.stroke();
	// @}
}

function getCursorPosition(e) {
	var x, y;
	
	if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
	} else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
	
	return {x: x, y: y};
}

function canBeMoved(from, to) {
	console.log(from);
	
	// Ходить можно
	if (
		CELL_FREE == to.type    // на пустую ячейку
		&& (                    // И
			from.x == to.x      // не по диагонали
			|| from.y == to.y
		)
	) {
		return true;
	}
	
	// Если попытка переместить  оказалась неудачной, то надо сбросить ячейки
	currentChip = targetCell = null;
	
	return false;
}

function onClick(e) {
	var coords = getCursorPosition(e),
	    clickedCell,
	    i,
	    j;

	i = Math.floor(coords.x / chipDiameter);
	j = Math.floor(coords.y / chipDiameter);
	
	clickedCell = currentBoard[j][i];
	
	if (
		CELL_DOOMED != clickedCell
		&& CELL_FREE != clickedCell
	) {
		currentChip      = {};
		currentChip.type = currentBoard[j][i];
		currentChip.x    = i;
		currentChip.y    = j;
	}

	if (
		currentChip
		&& (CELL_FREE == clickedCell)
	) {
		targetCell      = {};
		targetCell.type = currentBoard[j][i];
		targetCell.x    = i;
		targetCell.y    = j;
	}

	if (
		currentChip
		&& targetCell
		&& canBeMoved(currentChip, targetCell)
	) {
		currentBoard[targetCell.y][targetCell.x]   = currentChip.type;
		currentBoard[currentChip.y][currentChip.x] = targetCell.type;

		currentChip = targetCell = null;
		
		drawBoard();
	}
}
