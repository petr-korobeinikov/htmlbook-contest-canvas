"use strict";

var canvas  = null,
    context = null;

var currentChip = null,
    targetCell     = null;

var motionCounter = 0;

var isWin = false;

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

// @{
// Размеры
var chipDiameter = 67;
var chipRadius   = chipDiameter / 2;

var GAME_AREA_WIDTH  = chipDiameter * defaultBoard.length + 1,
    GAME_AREA_HEIGHT = chipDiameter * defaultBoard.length + 1;
// @}

function startGame() {
	motionCounter = 0;
	
	// @{
	// Правильно клонируем массив
	var i, j, ilen, jlen;
	for (i = 0, ilen = defaultBoard.length; i < ilen; i += 1) {
		currentBoard[i] = defaultBoard[i].slice(0);
	}
	// @}
	
	drawBoard();
}

function checkWin() {
	return (
		   1 == currentBoard[3][3]

		&& 3 == currentBoard[0][3]
		&& 3 == currentBoard[1][3]
		&& 3 == currentBoard[2][3]

		&& 3 == currentBoard[4][3]
		&& 3 == currentBoard[5][3]
		&& 3 == currentBoard[6][3]

		&& 2 == currentBoard[3][0]
		&& 2 == currentBoard[3][1]
		&& 2 == currentBoard[3][2]

		&& 2 == currentBoard[3][4]
		&& 2 == currentBoard[3][5]
		&& 2 == currentBoard[3][6]
	);
}

function increaseMotionCounter() {
	++motionCounter;
}

function drawBoard() {
	var i,
	    j,
	    ilen,
	    jlen,
	    row,
	    cell;
	
	context.clearRect(0, 0, GAME_AREA_WIDTH, GAME_AREA_HEIGHT);
	
	// @{
	// Отрисовка счётчика ходов
	context.fillStyle = 'white';
	context.fillText('Ходов: ' + motionCounter, 3, 15, GAME_AREA_WIDTH);
	// @}
	
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
	case CELL_BLACK :
		fillStyle = 'black';
		break;
	case CELL_WHITE :
		fillStyle = 'yellow';
		break;
	case CELL_GRAY :
		fillStyle = 'green';
		break;
	}
	// @}
	
	// @{
	// Квадратик
	context.rect(x - chipRadius + .5, y - chipRadius + .5, chipRadius * 2, chipRadius * 2);
	context.lineWidth = 1;
	context.strokeStyle = "white";
	context.closePath();
	context.stroke();
	// @}
	
	// @{
	// Фишка рисуется на непустых ячейках
	if (fill != CELL_FREE) {
		context.beginPath();
		context.arc(x + .5, y + .5, chipRadius - 3, 0, 2 * Math.PI, false);
		context.lineWidth = 1;
		context.fillStyle = fillStyle;
		context.fill();
		context.closePath();
		context.stroke();
	}
	// @}
}

function highlightCurrentChip() {
	var x, y;

	x = currentChip.x * 2 * chipRadius + chipRadius;
	y = currentChip.y * 2 * chipRadius + chipRadius;

	context.beginPath();
	context.arc(x, y, chipRadius - 3, 0, 2 * Math.PI, false);
	context.lineWidth = 3;
	context.strokeStyle = 'red';
	context.closePath();
	context.stroke();
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
	var notJumpingMove = function(from, to) {
		var i,
		    start,
		    end;
		
		// В каком направлении движемся?
		// Есть ли мертвые или занятые клетки на дороге?
		if (from.x == to.x) { // Вверх\вниз
			start = Math.min(from.y, to.y);
			end   = Math.max(from.y, to.y);
			
			for (i = start + 1; i < end; i += 1) {
				if (CELL_FREE != currentBoard[i][from.x]) {
					return false;
				}
			}
		} else if (from.y == to.y) { // Для наглядности. Влево\вправо
			start = Math.min(from.x, to.x);
			end   = Math.max(from.x, to.x);
			
			for (i = start + 1; i < end; i += 1) {
				if (CELL_FREE != currentBoard[from.y][i]) {
					return false;
				}
			}
		}
		
		return true;
	};
	
	// Ходить можно
	if (
		CELL_FREE == to.type           // на пустую ячейку
		&& (                           // И
			from.x == to.x             // НЕ по диагонали
			|| from.y == to.y
		)
		&& notJumpingMove(from, to)    // И НЕ перепрыгивая через другие фишки
	) {
		return true;
	}
	
	// Если попытка переместить  оказалась неудачной,
	// то надо выбирать ячейки заново.
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
	
	if (checkWin()) {
		alert('Победа!');
	}
	
	drawBoard();
	
	if (
		CELL_DOOMED != clickedCell
		&& CELL_FREE != clickedCell
	) {
		currentChip = {
			type : currentBoard[j][i],
			x    : i,
			y    : j
		};
		
		highlightCurrentChip();
	}

	if (
		currentChip
		&& (CELL_FREE == clickedCell)
	) {
		targetCell = {
			type : currentBoard[j][i],
			x    : i,
			y    : j
		};
	}

	if (
		currentChip
		&& targetCell
		&& canBeMoved(currentChip, targetCell)
	) {
		currentBoard[targetCell.y][targetCell.x]   = currentChip.type;
		currentBoard[currentChip.y][currentChip.x] = targetCell.type;

		currentChip = targetCell = null;
		
		increaseMotionCounter();
		
		drawBoard();
	}
}
