player = false;

//Функция выстрела, вызываемая при нажатии на шашку
function Shot(checker, i){
    if ((checker.id.indexOf('black') >= 0 && !player) || (checker.id.indexOf('white') >= 0 && player)) return;
	else {
		move(checker, getRandomInt(checker.x - 90, checker.x + 90), !player ? -300 : 780, i);
		setTimeout(() => {
			Repulsion(checker);
			ChangePlayer();
		}, 300);
	}
}

//Функция смены игрока, вызываемая в конце функции Shot(checker)
function ChangePlayer() {
	console.log(CheckWinner());
	//Вывод победителя, если он выявлен
	if (CheckWinner() >= 0) {
		console.log(CheckWinner());
		if (CheckWinner()) {
			alert('БЕЛЫЕ ПОБЕДИЛИ');
		}
		else if (!CheckWinner()) {
			alert('ЧЁРНЫЕ ПОБЕДИЛИ');
		}
	}
	//Смена игрока и статуса игры
	if (player) {
		player = false;
		document.getElementById('status').innerHTML = "ХОДЯТ БЕЛЫЕ";
	}
	else {
		player = true;
		document.getElementById('status').innerHTML = "ХОДЯТ ЧЁРНЫЕ";
	}
}

//Функция выявления победителя, вызываемая в конце функции ChangePlayer()
function CheckWinner() {
	let count = 0;
	for (let i = 0; i < 8; i++) {
		if (whiteArray[i].knocked_out) count++;
	}
	if (count == 8) return 0;
	
	count = 0;
	for (let i = 0; i < 8; i++) {
		if (blackArray[i].knocked_out) count++;
	}
	if (count == 8) return 1;
	
	return -1;
}

//Функция, выявляющая пересечение двух объектов
function MacroCollision(obj1, obj2){
  let XColl = false;
  let YColl = false;

  if ((obj1.x + obj1.width - 5 >= obj2.x) && (obj1.x <= obj2.x + obj2.width - 5)) XColl = true;
  if ((obj1.y + obj1.height - 5 >= obj2.y) && (obj1.y <= obj2.y + obj2.height - 5)) YColl = true;

  if (XColl&YColl){return true;}
  return false;
}

blackArray = new Array(8);
whiteArray = new Array(8);

// Функция шаблонизации
function render(templateString, data) {
  // Заменяем в шаблоне все вхождения {{...}} на значения свойств объекта data
  return templateString.replace(/{{(.*?)}}/g, (match, prop) => data[prop.trim()]);
}

// Шаблон для шашек
const template1 = `<div class="{{class}}" onclick="{{onclick}}" style="left: {{left}}px; top: {{top}}px; background-color: {{background_color}}"></div>`;

// Функция, инициализзирующая шашки в качестве объектов
function SetCheckers() {
	for (let i = 0; i < 8; i++) {
		let checker = document.createElement('div');
		checker.id = `black-${7-i}`;
		document.getElementById('block').prepend(checker);
	}
	
	for (let i = 0; i < 8; i++) {
		let checker = document.createElement('div');
		checker.id = `white-${7-i}`;
		document.getElementById('block').prepend(checker);
	}
	
	for (let i = 0; i < 8; i++) {
		blackArray[i] = {
			moving: false,
			knocked_out: false,
			color: 'black',
			id: `black-${i}`,
			x: 30 + 60 * i,
			y: 30,
			width: 50,
			height: 50,
			onclick: `Shot(blackArray[${i}])`
		}

		whiteArray[i] = {
			moving: false,
			knocked_out: false,
			color: 'white',
			id: `white-${i}`,
			x: 30 + 60 * i,
			y: 60 * 8 - 30,
			width: 50,
			height: 50,
			onclick: `Shot(whiteArray[${i}])`
		}
	}
}

// Функция перерисовки шашки
function draw(checker, i) {
	// Объект, используемый для заполнения шаблона
	document.getElementById(checker.id).innerHTML = "";
	document.getElementById(checker.id).appendChild(checkerRender(checker));
}

function checkerRender(props) {
	checker = document.createElement('div')
	
	checker.className = 'checker';
	checker.style = `left: ${props.x}px; top: ${props.y}px; background-color: ${props.color};`;
	checker.setAttribute('onclick', `${props.onclick}`);
	
    return checker;
}

// Функция перемещения шашки
function move(checker, x, y, i) {
    moving = true;
    let k = (y - checker.y) / (x - checker.x);
    let b = (x * checker.y - checker.x * y) / (x - checker.x); 

    while(moving) {
        if (checker.x < x) {
            checker.x += 1;
        }
        else if (checker.x > x) {
            checker.x -= 1;
        }

        if (moving) {
            checker.y = k * checker.x + b;
        }

		console.log(checker.x, checker.y)

        if (Conflict(checker) || checker.x == x && checker.y == y || checker.y > 480 || checker.y < 0) {
            moving = false;
            draw(checker, i);
        }
    }

    setTimeout(() => {
        if (checker.x < 0 || checker.x > 480 || checker.y < 0 || checker.y > 480) {
            document.getElementById(`${checker.id}`).remove();
            checker.knocked_out = true;
        }
    }, 300);            
}

//Функция, выявляющая, перескается ли заданная шашка с другими шашками противника
function Conflict(checker) {
    if (!player) {
		for (let i = 0; i < 8; i++) {
			if (MacroCollision(checker, blackArray[i])) {
				return true;
			}
		}
		return false;
	}
	
	if (player) {
		for (let i = 0; i < 8; i++) {
			if (MacroCollision(checker, whiteArray[i])) {
				return true;
			}
		}
		return false;
	}
}

//Функция, отвечающая за отталкивание шашек противника при столкновении
function Repulsion(checker) {	
	if (!player) {		
		for (let i = 0; i < 8; i++) {
			if (MacroCollision(checker, blackArray[i]) && !blackArray[i].knocked_out) {
				blackArray[i].y = -300;
				draw(blackArray[i], i);
				setTimeout(() => {
					document.getElementById(`${blackArray[i].id}`).remove();
					blackArray[i].knocked_out = true;
				}, 250);
			}
		}
	}
	
	if (player) {
		for (let i = 0; i < 8; i++) {
			if (MacroCollision(checker, whiteArray[i]) && !whiteArray[i].knocked_out) {
				whiteArray[i].y = 780;
				draw(whiteArray[i], i);
				setTimeout(() => {
					document.getElementById(`${whiteArray[i].id}`).remove();
					whiteArray[i].knocked_out = true;
				}, 250);
			}
		}
	}
}

//Функция, возвращающая рандомное число в диапазоне от min до max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция шаблонизации клеток
function cellRender(props) {
	cell = document.createElement('div')
	
	cell.setAttribute('padding', '0');
	cell.style = `width: ${props.width}px; height: ${props.height}px; background-color: ${props.color};`;
	
    return cell;
}

//Функция отрисовки доски
function CreateBoard() {
    let table = document.createElement('table');
	table.setAttribute('id', 'table');
	table.style.width = "480px";
	table.style.height = "480px";
    let table_style = document.createElement('style');
    table_style.innerHTML = `
        table {
            position: relative;
            border-collapse: collapse;
            right: auto;
            left: auto;
        }
        td {
            padding: 0px;
        }
    `;
    document.head.appendChild(table_style);
    
    let k = 0;

	const black = {width: 60, height: 60, color: 'saddlebrown'}
	const white = {width: 60, height: 60, color: 'white'}

    for (let i = 0; i < 8; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < 8; j++) {
            let td = document.createElement('td');

            if (i % 2 == 0) {
                if (k % 2 == 0) td.appendChild(cellRender(white));
                else td.appendChild(cellRender(black));
            }
            else {
                if (k % 2 == 0) td.appendChild(cellRender(black));
                else td.appendChild(cellRender(white));
            }
			
            tr.appendChild(td);
            k++;
        }
        table.appendChild(tr);
    }
    
    document.getElementById('block').appendChild(table);
}

//Функция запонения доски
function FillBoard() {
	SetCheckers();
	for (let i = 0; i < whiteArray.length; i++) {
		draw(blackArray[i], i);
		draw(whiteArray[i], i);
	}
}