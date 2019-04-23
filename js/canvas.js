var Path = {
	canvas: null,
	dimens: null,

	init: function(){
		var canvas = document.getElementById("canvas");
		Path.canvas = canvas.getContext("2d");
		Path.dimens = {
			width: canvas.width,
			height: canvas.height
		};
	},
	animateCustom: function(vertices, q, duration){
		Path.canvas.moveTo(vertices[0].x, vertices[0].y);
		Path.canvas.strokeStyle = "blue";
		var stepSize = duration / q;
		var curTime = 0;
		var prevX = vertices[0].x;
		var prevY = vertices[0].y;
		var p, t;
		for(var i = 0; i <= q; i++){
			t = i / q;
			p = getBezierPoint(t, vertices);
			Path.lineTo(p.x, p.y, curTime += stepSize, prevX, prevY);
			prevX = p.x;
			prevY = p.y;
		}
	},
	lineTo: function(x, y, timeout, prevX, prevY, color){
		setTimeout(() => {
			Path.canvas.beginPath();
			Path.canvas.strokeStyle = color || "black";
			Path.canvas.moveTo(prevX, prevY);
			Path.canvas.lineTo(x, y);
			Path.canvas.stroke();
		}, timeout);
	},
};

class Point {
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
}
document.addEventListener("DOMContentLoaded", e => {
	Path.init();
	// Path.animateCustom([
	// 	{x: 0, y: 0},
	// 	{x: 500, y: 0},
	// 	{x: 500, y: 500},
	// 	{x: 0, y: 500},
	// 	{x: 0, y: 0},
	// 	{x: 500, y: 0},
	// 	{x: 500, y: 500},
	// 	{x: 0, y: 500},
	// 	{x: 0, y: 0},
	// 	{x: 500, y: 0},
	// ], 1000, 10000);
	CanvasTest.start();
});

function getBezierPoint(t, vertices){
	var n = vertices.length - 1;
	var x = 0, y = 0;
	var b;
	for(var k = 0; k <= n; k++){
		b = C(n, k) * Math.pow(t, k) * Math.pow(1 - t, n - k);
		x += vertices[k].x * b;
		y += vertices[k].y * b;
	}
	return new Point(x, y);

}

function fac(n){
	let result = 1;
	while(n > 0)
		result *= n--;
	return result;
}

function C(n, k){
	return fac(n) / (fac(n - k) * fac(k));
}

class Canvas {
	constructor(canv){
		let c;
		if(typeof canv === "string"){
			c = document.getElementById(canv);
			if(!c)
				throw new Error("There is no canvas element with given ID");
		} else if(canv instanceof HTMLCanvasElement) {
			c = canv;
		} else if(canv instanceof CanvasRenderingContext2D) {
			c = canv.canvas;
		} else {
			throw new Error("First argument must be a string or instance of canvas element or instance of context class");
		}
		this.ctx = c.getContext("2d");
		this.width = c.width;
		this.height = c.height;
		this.shapes = [];
		this.maxZ = -Infinity;
	}

	addShape(shape){
		if(shape instanceof Canvas.Shape){
			this.shapes.push(shape);
			if(shape.z === undefined)
				if(this.maxZ === -Infinity)
					shape.z = this.maxZ = 0;
				else
					shape.z = this.maxZ = this.maxZ + 1;
			else
				if(shape.z > this.maxZ)
					this.maxZ = shape.z;
		}
	}

	removeShape(shape){
		for(let i in this.shapes)
			if(shape === this.shapes[i])
				return delete this.shapes[i];
	}

	renderShape(shape){
		this.begin(shape);
		shape.render(this);
		this.end();
	}

	render(){
		this.clear();
		for(var i in this.shapes)
			this.renderShape(this.shapes[i]);
	}

	reorder(){
		this.shapes = this.shapes.sort((a, b) => {
			return a.z > b.z ? 1 : -1;
		});
		this.maxZ = this.shapes[this.shapes.length - 1].z;
	}

	begin(shape){
		this.ctx.beginPath();
		this.ctx.strokeStyle = shape.style.stroke.toString();
		this.ctx.lineWidth = shape.style.lineWidth;
		this.ctx.fillStyle = shape.style.fill.toString();
		this.ctx.lineCap = shape.style.lineCap;
		this.ctx.lineJoin = shape.style.lineJoin;
		this.ctx.setLineDash(shape.style.lineDash);
	}

	end(){
		this.ctx.fill();
		this.ctx.stroke();
	}

	clear(){
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	static Color = class Color {

		static COMPONENT_R = 16
		static COMPONENT_G = 8
		static COMPONENT_B = 0
		static COMPONENT_A = -1

		constructor(r, g, b, a = 0xFF){
			this.color = (r << 16) | (g << 8) | b;
			this.alpha = a;
		}

		getComponent(component){
			if(component === Canvas.Color.COMPONENT_A)
				return this.alpha;
			return (this.color >> component) & 0xFF;
		}

		getComponentAsString(component){
			let c = this.getComponent(component);
			if(c <= 0xF)
				return "0" + c.toString(16).toUpperCase();
			else
				return c.toString(16).toUpperCase();
		}

		toString(){
			return "#"
				+ this.getComponentAsString(Canvas.Color.COMPONENT_R)
				+ this.getComponentAsString(Canvas.Color.COMPONENT_G)
				+ this.getComponentAsString(Canvas.Color.COMPONENT_B)
				+ this.getComponentAsString(Canvas.Color.COMPONENT_A);
		}
		
		static fromString(color){
			color = color.slice(1);
			let r = +("0x" + color.slice(0, 2));
			let g = +("0x" + color.slice(2, 4));
			let b = +("0x" + color.slice(4, 6));
			let a = +("0x" + color.slice(6, 8));
			return new Canvas.Color(r, g, b, a);
		}
	}

	static Style = class Style {
		constructor(stroke = new Canvas.Color(0, 0, 0), fill = new Canvas.Color(0, 0, 0, 0), lineWidth = 1, lineCap = "butt", lineJoin = "miter", lineDash = []){
			this.stroke = stroke;
			this.fill = fill;
			this.lineWidth = lineWidth;
			this.lineCap = lineCap;
			this.lineJoin = lineJoin;
			this.lineDash = lineDash;
		}
	}

	static Point = class Point {
		constructor(x, y){
			this.x = x;
			this.y = y;
		}
	}

	static Shape = class Shape {
		render(canvas){throw new Error}
		// clone(){throw new Error}
		// getPoints(){throw new Error}

		static Line = class Line extends Shape {
			constructor(p1, p2, style = new Canvas.Style){
				super();
				this.p1 = p1;
				this.p2 = p2;
				this.style = style;
			}

			render(canvas){
				canvas.ctx.moveTo(this.p1.x, this.p1.y);
				canvas.ctx.lineTo(this.p2.x, this.p2.y);
			}
		}

		static Polyline = class Polyline extends Shape {
			constructor(points = [], style = new Canvas.Style){
				super();
				this.points = points;
				this.style = style;
			}

			render(canvas){
				canvas.ctx.moveTo(this.points[0].x, this.points[0].y);
				for(var i = 1; i < this.points.length; i++)
					canvas.ctx.lineTo(this.points[i].x, this.points[i].y);
			}
		}

		static Rect = class Rect extends Shape {
			constructor(p, width, height, style = new Canvas.Style){
				super();
				this.p = p;
				this.width = width;
				this.height = height;
				this.style = style;
			}

			render(canvas){
				canvas.ctx.moveTo(this.p.x, this.p.y);
				canvas.ctx.lineTo(this.p.x + this.width, this.p.y);
				canvas.ctx.lineTo(this.p.x + this.width, this.p.y + this.height);
				canvas.ctx.lineTo(this.p.x, this.p.y + this.height);
				canvas.ctx.closePath();
			}
		}

		static BezierCurve = class BezierCurve extends Shape {
			constructor(points, q, style = new Canvas.Style){
				super();
				this.points = points;
				this.q = q;
				this.style = style;
			}

			render(canvas){
				canvas.ctx.moveTo(this.points[0].x, this.points[0].y);
				var p;
				for(let i = 0; i <= this.q; i++){
					p = this.getPoint(i / this.q);
					canvas.ctx.lineTo(p.x, p.y);
				}
			}

			// Common bezier curve equation formula
			getPoint(t){
				var n = this.points.length - 1;
				var x = 0, y = 0;
				var b;
				var diff = 1 - t;
				for(var k = 0; k <= n; k++){
					b = C(n, k) * Math.pow(t, k) * Math.pow(diff, n - k);
					x += this.points[k].x * b;
					y += this.points[k].y * b;
				}
				return new Canvas.Point(x, y);
			}
		}

		static Circle = class Circle extends Shape {
			constructor(center, r, q, style = new Canvas.Style){
				super();
				this.center = center;
				this.r = r;
				this.q = q;
				this.style = style;
			}

			render(canvas){
				var p, angle;
				var full = Math.PI * 2;
				canvas.ctx.moveTo(this.center.x + this.r, this.center.y);
				for(let i = 0; i < this.q; i++){
					angle = full * (i / this.q);
					p = new Canvas.Point(this.center.x + this.r * Math.cos(angle), this.center.y + this.r * Math.sin(angle));
					canvas.ctx.lineTo(p.x, p.y);
				}
				canvas.ctx.closePath();
			}
		}

		// Elipsis, BSpline, Path, NURBS
	}

	// static Animation = class Animation {}
	// static Layer = class Layer {}
}

function printHierarchy(obj, depth, tab = 1){
	if(depth < 1)
		return;
	for(let prop in obj){
		console.log("\t".repeat(tab) + prop);
		printHierarchy(obj[prop], depth - 1, tab + 1);
	}
}

var CanvasTest = {
	start: function(){
		c = new Canvas("canvas");
		with(Canvas){
			let points = [
				new Point(10, 690),
				new Point(10, 10),
				new Point(300, 500),
				new Point(800, 100),
			];
			let curve = new Shape.BezierCurve(points, 1500);
			let poly = new Shape.Polyline(points);
			poly.style.stroke = new Color(0, 0, 0, 0x80);
			poly.style.lineWidth = 2;
			poly.style.lineDash = [10, 10];
			c.addShape(curve);
			c.addShape(poly);
			curve.style.lineWidth = 3;
			curve.style.lineCap = "round";
			for(let i in points){
				let circle = new Shape.Circle(points[i], 5, 12);
				circle.style.fill = new Color(255, 0, 0);
				circle.style.lineWidth = 2;
				c.addShape(circle);
			}
			curve.style.fill = new Color(0,0,0,127);
			c.render();
		}
	},
};