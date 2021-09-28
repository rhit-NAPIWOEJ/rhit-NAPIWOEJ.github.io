/**
*	CLASSES
*/
//plz don't dock off too much if this has bad js practices, i wrote it 3 years ago uwu
class Actor {	
	//anything which can be represented on the screen
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	update() { this.render(); }
	render() {}
}

class Game {
	//controls when the game starts, ends, and what to do while the game is in progress
	constructor() {

	}
	update() {
		//runs certain aspects of the game
		if (randInRange(1, 15) == 15)
			psyShapeArray.push(new PsyShape(null, null, 10, 15, null, randInRange(0, 5)));
		this.render();
	}
	render() {
		//displays everything which needs to be displayed
		for (let x = 0; x < psyShapeArray.length; x++)
			psyShapeArray[x].update();
	}
}

class Shape extends Actor {
	//a regular polygon that can be displayed on the screen
	constructor(x, y, t, r, n, c) {
		super(x, y);
		this.theta = t;	//in degrees
		this.circumRad = r;
		this.vertexNum = n;
		this.color = c;
	}
	render() {
		drawShape(this, this.color);
	}
}

/**
*	GENERAL FUNCTIONS FOR DEALING WITH SHAPES
*/
function listPoints(s) {
	//returns an array of the coordinates of every point of a Shape
	var coordList = [];
	for (var c = 0; c < s.vertexNum; c++) {
		coordList.push([s.x + s.circumRad * Math.sin(degToRad(s.theta + 360/s.vertexNum*c)),
						s.y + s.circumRad * Math.cos(degToRad(s.theta + 360/s.vertexNum*c))]);
	}
	return coordList; //in the form [[x1, y1],[x2, y2],...]
}
function drawShape(s, col) {
	//displays a Shape on the screen
	var sList = listPoints(s);
	ctx.fillStyle = col;
	ctx.moveTo(sList[0][0], sList[0][1]);
	ctx.beginPath();
	for (var c = 1; c < sList.length; c++) {
		ctx.lineTo(sList[c][0], sList[c][1]);
	}
	ctx.lineTo(sList[0][0], sList[0][1]);
	ctx.fill();
}

class PsyShape extends Shape {
	//Shape that makes up the playable aspect of the game
	constructor(x, y, t, r, n, cN) {
		super(x, y, t, r, n);
		this.color = COLORS[cN];
		this.colorNum = cN;
		this.swapContr = 0;
		this.swapContrMax = randInRange(50, 200);
		this.defineMovement();
	}
	defineMovement() {
		//creates a Bézier curve to use as its path randomly
		this.bezier = [[randInRange(0, canvas.width), randFromList([0,canvas.height])]];
		var points = randInRange(0, 3);
		for (var f = 0; f < points; f++) {
			this.bezier.push([randInRange(0, canvas.width), randInRange(0, canvas.height)]);
		}
		if (this.bezier[0][1] == canvas.height) {
			this.bezier.push([randInRange(0, canvas.width), 0]);
		} else {
			this.bezier.push([randInRange(0, canvas.width), canvas.height]);
		}
		this.vertexNum = points + 3; //how complex the Bézier curve is determines the side number
		this.t = 0;
	}
	update() {
		//handles changes to the PsyShape
		var prevx = this.x;
		var prevy = this.y;
		var coord = bezierCurveCoordinates(this.bezier, this.t);
		this.x = coord[0];
		this.y = coord[1];
		//a rough approximation for rotation (General Bézier curve arc lengths cannot be computed)
		this.theta += distance(prevx, this.x, prevy, this.y);
		this.t += 1/250;
		this.handleColor();
		super.update();
	}
	 handleColor() {
		//handles if and when the PsyShape changes color
		this.swapContr++;
		if (this.swapContr == this.swapContrMax) {
			//color should be changed
			switch (this.colorNum) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				// case 5:
				// case 6:
					this.colorNum += 1;
					break;
				default:
					this.colorNum = 0;
			}
			this.color = COLORS[this.colorNum];
			this.swapContr = 0;
			this.swapContrMax = randInRange(50, 200);
		}	
	}
	render() {
		super.render();
		//this is included here (instead of update()) to avoid an
		//an exception after the object is removed from the psyShapeArray
		if (this.x - this.circumRad > canvas.width || this.x + this.circumRad < 0 ||
			this.y - this.circumRad > canvas.height || this.y + this.circumRad < 0) {
			psyShapeArray.splice(psyShapeArray.indexOf(this), 1);
		}
	}
}
var psyShapeArray = []; //an array for PsyShapes

/**
*	GENERAL MATH FUNCTIONS
*/
function distance(x1, x2, y1, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
function degToRad(x) {
	return x * Math.PI / 180; 
}
function randInRange(min, max) {
	if (min > max) {
		var temp = min;
		min = max;
		max = temp;
	}
	return Math.round(Math.random() * (max - min)) + min;
}
function randFromList(a) { 
	return a[randInRange(0, a.length - 1)];
}
function bezierCurveCoordinates(a, t) {
	//Wikipedia was a helpful source for understanding Bézier curves,
	//though it provided me with no actual code or pseudo-code.
	var coord = [0,0];
	for (var x1 = 0; x1 < a.length; x1++) {
		coord[0] += nChooseK(a.length - 1, x1) * Math.pow(1-t, a.length - 1 - x1) * Math.pow(t, x1) * a[x1][0];
		coord[1] += nChooseK(a.length - 1, x1) * Math.pow(1-t, a.length - 1 - x1) * Math.pow(t, x1) * a[x1][1];
	}
	return coord;
}
function nChooseK(n, k) {
	return factorial(n) / (factorial(k) * factorial(n - k));
}
function factorial(n) {
	//a recursive method for handling factorials (ex. 3! = 3*2! = 3*2*1! = 3*2*1 = 6)
	if (n == 0 || n == 1) {
		return 1;
	} else {
		return n * factorial(n-1);
	}
}

/**
*	MISCELLANEOUS CODE
*/
//const COLORS = ["#ff0000", "#ffaa11", "#eeff00", "#00ff00", "#00dddd", "#0000ff", "#8f00ff", "#ff00ee"];
//const COLORS = ["#AD351F", "#E06D12", "#E6BB58", "#12E014", "#4BE4D1", "#1E29E3", "#9042AD", "#E03F8E"];
const COLORS = ["#ee2828", /*"",*/ "#c49f01", "#418906", "#729fcb", "#3363a4", "#664f7b" /*, ""*/];
game = new Game();
window.onload = function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	setInterval(main, 100/6); //runs main 60 times/sec
}

function main() {
	let body = document.getElementById("body");
	if (body) {
		canvas.width = Math.max(body.clientWidth, innerWidth)-15; //i need this at -15, don't ask why
		canvas.height = Math.max(body.clientHeight, innerHeight);

		let btn = document.getElementById("up-btn");
		if (scrollY != 0) {
			btn.style.display = "block";
			btn.style.opacity = 100;
		}
		else { 
			btn.style.display = "none";
		}
	}
	game.update();
}