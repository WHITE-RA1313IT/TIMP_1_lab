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
				src={getImage(this.props.points[i])}
				onClick={() => this.props.onClick(i)}
				style={{display: this.props.pointsDisplay[i], transform: "rotate(-45deg)", marginLeft: 30}}
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

class ThrowButton extends React.Component {
	render () {
		return(
			<button className="throw" onClick={() => {this.props.onClick()}} disabled={this.props.disabled}>Бросить кости</button>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pointsArray: Array(6).fill(null),
			pointsDisplay: Array(6).fill("inline-block"),
			diceOnHand: Array(6).fill({ value: null, board_index: null }),
			score: 0,
			re_cast: false,
		};
	}
	
	throw() {
		const points = new Array(6);
		for (let i = 0; i < this.state.pointsArray.length; i++) {
			points[i] = getRandomInt(1, 6);
		}
		this.setState({ pointsArray: points, re_cast: true });
	}
		
	takeDice(i) {
		const tempDiceOnHand = this.state.diceOnHand;
		tempDiceOnHand[5] = { value: this.state.pointsArray[i], board_index: i };
		tempDiceOnHand.sort((a, b) => a.value - b.value);
		tempDiceOnHand.sort((a, b) => {
			if (a.value == null) return 1;
			if (a.value == b.value) return 0;
			if (b.value == null) return -1;
		});
		
		const tempDisplay = this.state.pointsDisplay;
		tempDisplay[i] = "none";		
		
		this.setState({ 
			pointsArray: this.state.pointsArray,
			display: tempDisplay,
			diceOnHand: tempDiceOnHand,
			score: this.checkScore(tempDiceOnHand),
			re_cast: this.checkScore(tempDiceOnHand) > 0 ? false : true,
		});
		
		console.log(this.state.score);
	}
	
	returnDice(i) {
		//console.log('returnDice ' + i);
		
		const tempDisplay = this.state.pointsDisplay;
		tempDisplay[this.state.diceOnHand[i].board_index] = "inline-block";
		
		const tempDiceOnHand = this.state.diceOnHand;
		tempDiceOnHand[i] = { value: null, board_index: null };
		tempDiceOnHand.sort((a, b) => a.value - b.value);
		tempDiceOnHand.sort((a, b) => {
			if (a.value == null) return 1;
			if (a.value == b.value) return 0;
			if (b.value == null) return -1;
		});
		
		this.setState({ 
			display: tempDisplay,
			diceOnHand: tempDiceOnHand,
			score: this.checkScore(tempDiceOnHand),
			re_cast: this.checkScore(tempDiceOnHand) > 0 ? false : true,
		});
	}
	
	checkScore(points) {
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
		
		console.log(summator.toString())

		if (summator.toString() == "1,1,1,1,1,1") return 1500;
		
		res += summator[0] < 3 ? summator[0] * 100 : (summator[0] - 2) * 1000;
		
		res += summator[4] < 3 ? summator[4] * 50 : (summator[4] - 2) * 500;

		for (let i = 0; i < summator.length; i++) {
			if (i == 0 || i == 4) continue;
			if (summator[i] > 0 && summator[i] < 3) return 0;
			if (summator[i] >= 3) res += (summator[i] - 2) * (i+1) * 100;
		}
		
		return res;
	}
	
	render() {
		return(
			<div className="game" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
				<Board points={this.state.pointsArray} pointsDisplay={this.state.pointsDisplay} onClick={i => this.takeDice(i)}/>
				<ThrowButton onClick={() => this.throw()} disabled={this.state.re_cast}/>
				<div className="player-1" style={{ width: "max-content" }}>
					<h3 style={{color: "White"}}>Ваши кости:</h3>
					<Hand points={this.state.diceOnHand} onClick={i => this.returnDice(i)}/>
					<h5 className="score" style={{ fontSize: "25px", color: "White", float: "right" }}>{this.state.score}</h5>	
				</div>
			</div>	
		);
	}
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);