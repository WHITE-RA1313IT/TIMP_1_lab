import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import onePoint from './Zonk/1.png';
import twoPoints from './Zonk/2.png';
import threePoints from './Zonk/3.png';
import fourPoints from './Zonk/4.png';
import fivePoints from './Zonk/5.png';
import sixPoints from './Zonk/6.png';

function Dice(props) {
	return (
		<img 
			className="dice" 
			src={props.src}
			onClick={props.onClick}
			style={props.style}
		/>
	);
}

function getImage(points) {
	switch(points) {
	case 1:
		return onePoint;
	case 2:
		return twoPoints;
	case 3:
		return threePoints;
	case 4:
		return fourPoints;
	case 5:
		return fivePoints;
	case 6:
		return sixPoints;
	default:
		return;
	}
}

class Board extends React.Component {	
	renderDice(i) {
		return(
			<Dice
				src={getImage(this.props.points[i].value)}
				onClick={() => this.props.onClick(i)}
				style={{
					display: this.props.points[i].display ? "inline-block" : "none", 
					transform: "rotate(" + this.props.points[i].deg + "deg)",
					transition: "transform 0.7s",
					position: "absolute", 
					left: this.props.points[i].x, 
					top: this.props.points[i].y,
					width: this.props.points[i].width,
					height: this.props.points[i].height
				}}
			/>
		);
	}
	
	render () {
		return(
			<div className="board" style={{backgroundColor: "#ED002F", border: "10px ridge #9A001E", borderRadius: "10%", width: 500, height: 500}}>
				{this.renderDice(0)}
				{this.renderDice(1)}
				{this.renderDice(2)}
				{this.renderDice(3)}
				{this.renderDice(4)}
				{this.renderDice(5)}
			</div>
		);
	}
}

class Hand extends React.Component {	
	renderDice(i) {
		return(
			<Dice
				src={getImage(this.props.points[i].value)}
				onClick={() => this.props.onClick(i)}
				style={{ width: "50px", height: "50px", left: "50%", top: "50%", alignSelf: "center" }}
			/>
		);
	}

	renderCell(i) {
		const res = this.props.points[i].value != null ? this.renderDice(i) : null;
		return(
			<div id={"cell-" + i} style={{ 
				display: "flex", 
				justifyContent: "center", 
				float: "left", 
				width: 60, 
				height: 60, 
				backgroundColor: "#552781", 
				border: "5px ridge #3B0470" }}
			>{res}</div>
		);
	}
	
	render () {
		return(
			<div className="hand" style={{ display: "inline-block", width: "max-content", height: "max-content" }}>
				{this.renderCell(0)}
				{this.renderCell(1)}
				{this.renderCell(2)}
				{this.renderCell(3)}
				{this.renderCell(4)}
				{this.renderCell(5)}
			</div>
		);
	}
}

class Button extends React.Component {
	render () {
		return(
			<button className={this.props.className} onClick={() => {this.props.onClick()}} style={{ 
				backgroundColor: "#DC63C2", 
				color: "White", 
				border: "5px solid #DC37B8", 
				width: 180, 
				height: 60,
				fontSize: "20px",
				fontWeight: "bold",
				display: this.props.disabled ? "none" : null
			}}>{this.props.value}</button>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			diceOnBoard: Array(6).fill({ 
				value: null,
				display: true, 
				x: null, 
				y: null, 
				width: null, 
				height: null, 
				deg: null 
			}),
			diceOnHand: Array(6).fill({ value: null, board_index: null }),
			score: 0,
			re_cast: false,
			savely: true
		};
	}
	
	throw() {
		const points = this.state.diceOnBoard;

		const distribution = function(obj, obj_index, array) {
			for (let i = 0; i < array.length; i++) {
				if (obj_index == i) continue;

				if (MacroCollision(obj, array[i])) return true;
			}
			return false;
		}

		for (let i = 0; i < points.length; i++) {
			let gen_x = getRandomInt(30, 400), gen_y = getRandomInt(30, 400);

			const temp = {
				x: gen_x,
				y: gen_y,
				width: 76,
				height: 76
			};

			if (i != 0) {
				while (distribution(temp, i, points)) {
					temp.x = getRandomInt(30, 400);
					temp.y = getRandomInt(30, 400);
				}
			}

			points[i] = {
				value: getRandomInt(1, 6), 
				display: points[i].display, 
				x: temp.x, 
				y: temp.y,
				width: temp.width,
				height: temp.height,
				deg: getRandomInt(0, 360),
			};
		}

		//console.log(this.checkScore(points, 'ZONK'));

		this.setState({ 
			diceOnBoard: points, 
			re_cast: true,  
			diceOnHand: Array(6).fill({ value: null, board_index: null }),
			score: this.state.score + this.checkScore(this.state.diceOnHand, 'CHECK_SCORE')
		});
	}
		
	takeDice(i) {
		const tempDiceOnHand = this.state.diceOnHand;
		tempDiceOnHand[5] = { value: this.state.diceOnBoard[i].value, board_index: i };

		tempDiceOnHand.sort((a, b) => a.value - b.value);
		tempDiceOnHand.sort((a, b) => {
			if (a.value == null) return 1;
			if (a.value == b.value) return 0;
			if (b.value == null) return -1;
		});
		
		const tempDiceOnBoard = this.state.diceOnBoard;
		tempDiceOnBoard[i].display = false;		
		
		this.setState({ 
			diceOnBoard: tempDiceOnBoard,
			diceOnHand: tempDiceOnHand,
			re_cast: this.checkScore(tempDiceOnHand, 'CHECK_SCORE') > 0 ? false : true,
			savely: this.state.score + this.checkScore(tempDiceOnHand, 'CHECK_SCORE') >= 300 ? false : true
		});
		
		//console.log(this.state.score);
	}
	
	returnDice(i) {
		const tempDiceOnBoard = this.state.diceOnBoard;
		tempDiceOnBoard[this.state.diceOnHand[i].board_index].display = true;
		
		const tempDiceOnHand = this.state.diceOnHand;
		tempDiceOnHand[i] = { value: null, board_index: null };
		tempDiceOnHand.sort((a, b) => a.value - b.value);
		tempDiceOnHand.sort((a, b) => {
			if (a.value == null) return 1;
			if (a.value == b.value) return 0;
			if (b.value == null) return -1;
		});

		console.log(tempDiceOnHand);
		
		this.setState({ 
			diceOnBoard: tempDiceOnBoard,
			diceOnHand: tempDiceOnHand,
			score: this.state.score + this.checkScore(tempDiceOnHand, 'CHECK_SCORE'),
			re_cast: this.checkScore(tempDiceOnHand, 'CHECK_SCORE') > 0 ? false : true,
			savely: this.state.score + this.checkScore(tempDiceOnHand, 'CHECK_SCORE') >= 300 ? false : true
		});
	}
	
	checkScore(points, type) {
		let res = 0;
		let summator = Array(6).fill(0)

		if (points[0].value == points[1].value &&
			points[2].value == points[3].value &&
			points[4].value == points[5].value &&
			points[0].value != points[2].value &&
			points[2].value != points[4].value &&
		    points[0].value != null &&
		    points[2].value != null &&
		    points[4].value != null) return 750;
			

		for (let i = 0; i < points.length; i++) {
			summator[points[i].value - 1] += 1;
		}
		
		//console.log(summator.toString())

		if (summator.toString() == "1,1,1,1,1,1") return 1500;
		
		res += summator[0] < 3 ? summator[0] * 100 : (summator[0] - 2) * 1000;
		
		res += summator[4] < 3 ? summator[4] * 50 : (summator[4] - 2) * 500;

		for (let i = 0; i < summator.length; i++) {
			if (i == 0 || i == 4) continue;
			if (type == 'CHECK_SCORE' && summator[i] > 0 && summator[i] < 3) return 0;
			if (summator[i] >= 3) res += (summator[i] - 2) * (i+1) * 100;
		}
		
		return res;
	}
	
	render() {
		return(
			<div className="game" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
				
				<Board points={this.state.diceOnBoard} onClick={i => this.takeDice(i)}/>

				<Button className="throw" value="Бросить кости" onClick={() => this.throw()} disabled={this.state.re_cast}/>
				<Button className="save" value="Сохранить" disabled={this.state.savely}/>

				<div className="player-1" style={{ width: "max-content" }}>

					<h3 style={{color: "White"}}>Ваши кости:</h3>

					<Hand points={this.state.diceOnHand} onClick={i => this.returnDice(i)}/>

					<h5 className="score" style={{ fontSize: "25px", color: "White", float: "right" }}>{this.checkScore(this.state.diceOnHand, 'CHECK_SCORE')}</h5>
					
					<h3>Общий счёт: {this.state.score + this.checkScore(this.state.diceOnHand, 'CHECK_SCORE')}</h3>
					
				</div>

			</div>	
		);
	}
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function MacroCollision(obj1, obj2){
	let XColl = false;
	let YColl = false;
  
	if ((obj1.x + obj1.width + 40 >= obj2.x) && (obj1.x <= obj2.x + obj2.width + 40)) XColl = true;
	if ((obj1.y + obj1.height + 40 >= obj2.y) && (obj1.y <= obj2.y + obj2.height + 40)) YColl = true;
  
	if (XColl&YColl){return true;}
	return false;
  }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);