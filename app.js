"use strict";

var canvas  = null,
    context = null;

var currentChip    = null,
    targetCell     = null;

// @{
// Счётчик ходов
var motionCounter = {
		value: 0,
		inc:   function() {
			this.value++;
			this.updateUndoCount();
		},
		dec:   function() {
			this.value--;
			this.updateUndoCount();
		},
		updateUndoCount: function() {
			var undoButton    = document.getElementById('undo'),
		        historyLength = movementHistory.length;

			document.getElementById('undo_count').innerHTML = historyLength;
			
			if (historyLength > 0) {
				undoButton.removeAttribute('disabled');
			} else {
				undoButton.setAttribute('disabled', 'disabled');
			}
		}
		};
// @}

var isWin = false;

var CELL_DOOMED = 0,
    CELL_BLACK  = 1,
    CELL_WHITE  = 2,
    CELL_GRAY   = 3,
    CELL_FREE   = 4;
    

// @{
// Если задавать поле константами - будет "ну ооочень" жирный массив.
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
// @}

// @{
// Чтобы посмотреть, как отображается победа,
// выполните в консоли этот код и передвиньте оставшуюся фишку ;)
/*
currentBoard = [
[0, 0, 0, 3, 0, 0, 0],
[0, 0, 3, 4, 4, 0, 0],
[0, 0, 0, 3, 0, 0, 0],
[2, 2, 2, 1, 2, 2, 2],
[0, 0, 0, 3, 0, 0, 0],
[0, 0, 4, 3, 4, 0, 0],
[0, 0, 0, 3, 0, 0, 0]
];
drawBoard();
*/
// @}


// @{
/* История ходов.
 * Памяти, конечно, будет жрать...
 * Формат записи:
 * {
 *   chipType : N,
 *   from     : {x: x, y: y},
 *   to       : {x: x, y: y}
 * }
 */
var movementHistory     = [],
    HISTORY_MAX_LENGTH  = 3;
// @}

// @{
// Размеры
var chipDiameter = 67;
var chipRadius   = chipDiameter / 2;

var GAME_AREA_WIDTH  = chipDiameter * defaultBoard.length + 1,
    GAME_AREA_HEIGHT = chipDiameter * defaultBoard.length + 1;
// @}


// @{
// Картинки
var spriteImg = new Image();
    spriteImg.src = 'img/game_sprites.png';
// @}



function startGame() {
	// Начинаем обрабатывать клики по полю.
	canvas.addEventListener("click", onClick, false);
	
	document.getElementById('undo').setAttribute('disabled', 'disabled');
	
	// @{
	// Сбрасываем счётчик и историю ходов.
	motionCounter.value = 0;
	movementHistory     = [];
	// @}
	
	// @{
	/* Правильно клонируем массив, содержащий игровое поле
	 * Проверьте, что будет:
	 * a = [1, 2, 3];
	 * b = a;
	 * b[0] = 777;
	 */
	var i, j, ilen, jlen;
	for (i = 0, ilen = defaultBoard.length; i < ilen; i += 1) {
		currentBoard[i] = defaultBoard[i].slice(0);
	}
	// @}
	
	// Отрисовываем игровое поле.
	drawBoard();
}

// Более элегантный способ проверки на победу придумать сложно =)
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

function drawBoard() {
	var i,
	    j,
	    ilen,
	    jlen,
	    row,
	    cell;
	
	// После каждой итерации перерисовываем поле заново.
	context.clearRect(0, 0, GAME_AREA_WIDTH, GAME_AREA_HEIGHT);
	
	// @{
	// Отрисовка счётчика ходов
	//context.fillStyle = 'white';
	//context.fillText('Ходов: ' + motionCounter.value, 3, 15, GAME_AREA_WIDTH);
	document.getElementById('motion_counter_value').innerHTML = motionCounter.value;
	// @}
	
	// @{
	// Отрисовка игрового поля
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
	// @}
}

function getSpriteCoord(chipType) {
	// Методом подбора устанавливаем координаты спрайтов.
	// Можно было бы подумать о карте изображения...
	switch (chipType) {
	case CELL_BLACK :
		return {x: chipDiameter + 2, y: 3};
	case CELL_WHITE :
		return {x: chipDiameter * 3 + 3, y: 3};
	case CELL_GRAY :
		return {x: chipDiameter * 5 + 5, y: 3};
	}
}

function drawCell(x, y, chipType) {
	var spriteCoord = getSpriteCoord(chipType);
	
	x = x * 2 * chipRadius + chipRadius;
	y = y * 2 * chipRadius + chipRadius;
	
	// @{
	// Квадратик
	context.drawImage(
		spriteImg,
		1,
		3,
		chipDiameter,
		chipDiameter,
		x - chipRadius,
		y - chipRadius,
		chipDiameter,
		chipDiameter
	);
	// @}
	
	// @{
	// Фишка рисуется на непустых ячейках
	if (chipType != CELL_FREE) {
		context.drawImage(
			spriteImg,
			spriteCoord.x,
			spriteCoord.y,
			chipDiameter,
			chipDiameter,
			x - chipRadius,
			y - chipRadius,
			chipDiameter,
			chipDiameter
		);
	}
	// @}
}

function highlightCurrentChip(chipType) {
	var x, y,
	    spriteCoord = getSpriteCoord(chipType);
	
	x = currentChip.x * 2 * chipRadius + chipRadius;
	y = currentChip.y * 2 * chipRadius + chipRadius;

	context.drawImage(
		spriteImg,
		spriteCoord.x + chipDiameter + 3,
		spriteCoord.y,
		chipDiameter,
		chipDiameter,
		x - chipRadius,
		y - chipRadius,
		chipDiameter,
		chipDiameter
	);
}

// @{
// Эту функцию используют "ваще фсе", как её опубликовали в diveintohtml5...
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
// @}

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
		
		highlightCurrentChip(currentChip.type);
	}

	// @{
	// Указали цель, куда будет перемещена выбранная фишка
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
	// @}

	// @{
	/* Переносим выбранную фишку.
	 * Обнуляем выбранную фишку и цель.
	 * Записываем ход в историю.
	 * Перерисовываем поле.
	 * Проверяем, а не победил ли игрок?
	 */
	if (
		currentChip
		&& targetCell
		&& canBeMoved(currentChip, targetCell)
	) {
		// @{
		// Записываем ход в историю.
		movementHistory.push(
			(new MoveCommand({
				chipType : currentChip.type,
				from     : {x: currentChip.x, y: currentChip.y},
				to       : {x: targetCell.x,  y: targetCell.y}
			})).run()
		);
		// @}
		
		// @{
		// Удаляем из истории очень старые операции, чтобы не занимали память.
		if (movementHistory.length > HISTORY_MAX_LENGTH) {
			movementHistory.splice(0, 1);
		}
		// @}
		
		currentChip = targetCell = null;
		
		motionCounter.inc();
		
		drawBoard();
		
		// @{
		// Игрок победил.
		if (checkWin()) {
			// Нажимать на поле больше нельзя.
			canvas.removeEventListener("click", onClick, false);
			
			// Очищаем историю ходов.
			movementHistory  = [];
			motionCounter.updateUndoCount();
			
			// Запрещаем отменять ходы.
			
			
			context.font      = '46px Georgia';
			context.fillStyle = 'white';
			context.textAlign = 'center';
			
			// a little bit of magic =)
			context.globalAlpha = 0.3;
			drawBoard();
			context.globalAlpha = 1;
			
			context.fillText('Победа!', GAME_AREA_WIDTH / 2, GAME_AREA_HEIGHT / 2);
		}
		// @}
	}
	// @}
}

// @{
// Представим "перемещение" фишки в виде паттерна Command
function MoveCommand(options) {
	this.options = options;
}

MoveCommand.prototype.run = function() {
	var chipType = this.options.chipType;
	
	currentBoard[this.options.to.y][this.options.to.x]     = chipType;
	currentBoard[this.options.from.y][this.options.from.x] = CELL_FREE;
	
	return this;
};
// @}

function undo() {
	var movement;

	if (movementHistory.length > 0) {
		movement = movementHistory.pop();
		
		(new MoveCommand({
			chipType : movement.options.chipType,
			from     : {x: movement.options.to.x,   y: movement.options.to.y},
			to       : {x: movement.options.from.x, y: movement.options.from.y}
		})).run();
		
		motionCounter.dec();
		
		drawBoard();
	}
}
