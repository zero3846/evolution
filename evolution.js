// File: evolution.js

const Stats = {
	avg: function (values, get, len) {
		if (typeof get === 'undefined') { get = (xs, i) => xs[i]; };
		if (typeof len === 'undefined') { len = (xs) => xs.length; };

		let n = len(values);
		let sum = 0.0;
		for (let i = 0; i < n; ++i) {
			sum += get(values, i);
		}
		return sum / n;
	},

	stddev2: function (values, get, len) {
		if (typeof get === 'undefined') { get = (xs, i) => xs[i]; };
		if (typeof len === 'undefined') { len = (xs) => xs.length; };

		let midpoint = Stats.avg(values, get, len);
		let n = len(values);
		let sum = 0.0;
		for (let i = 0; i < n; ++i) {
			let delta = get(values, i) - midpoint;
			sum += delta * delta;
		}
		return sum / n;
	},

	stddev: function (values, get, len) {
		if (typeof get === 'undefined') { get = (xs, i) => xs[i]; };
		if (typeof len === 'undefined') { len = (xs) => xs.length; };

		return Math.sqrt(Stats.stddev2(values, get, len));
	},

	testOutcome: function (probability) {
		return Math.random() <= probability;
	},
};

function createWorld() {
	let world = {};
	world.population = 100;
	world.birthRate = 0.01;
	world.deathRate = 0.01;
	return world;
}

function updateWorld(world) {
	let delta = 0;

	for (let i = 0; i < world.population; ++i) {
		if (Stats.testOutcome(world.deathRate)) {
			--world.population;
		}
	}
	world.population += delta;
	if (world.population < 0) {
		world.population = 0;
	}

	delta = 0;
	for (let i = 0; i < world.population; ++i) {
		if (Stats.testOutcome(world.birthRate)) {
			++delta;
		}
	}
	world.population += delta;
}

function runSimulation(numSteps, numSimulations) {
	let simulations = [];

	for (let i = 0; i < numSimulations; ++i) {
		let world = createWorld();

		let population = [];
		population.push(world.population);

		for (let step = 0; step < numSteps; ++step) {
			updateWorld(world);
			population.push(world.population);
		}

		let simulation = {};
		simulation.population = population;
		simulation.popAvg = Stats.avg(population);
		simulation.popStdDev = Stats.stddev(population);
		simulations.push(simulation);
	}

	let statsPerStep = [];
	for (let step = 0; step < numSteps; ++step) {
		let stats = {};
		stats.avg = Stats.avg(simulations, (sims, j) => sims[j].population[step], (sims) => sims.length);
		stats.stddev = Stats.stddev(simulations, (sims, j) => sims[j].population[step], (sims) => sims.length);
		statsPerStep.push(stats);
	}

	for (let step = 0; step < numSteps; ++step) {
		console.log(step + '\t' + statsPerStep[step].avg + '\t' + statsPerStep[step].stddev);
	}
}

let chart = {
	margin: {
		left: 10,
		top: 10,
		right: 10,
		bottom: 10,
	},

	xAxis: { min: 0, max: 10 },
	yAxis: { min: 0, max: 10 },

	chartArea: { x: 0, y: 0, width: 0, height: 0 },

	toCanvasX: function (x) {
		return (x - this.xAxis.min) * this.chartArea.width / (this.xAxis.max - this.xAxis.min) + this.chartArea.x;
	},

	toCanvasY: function (y) {
		return (this.yAxis.min - y) * this.chartArea.height / (this.yAxis.max - this.yAxis.min) + this.chartArea.y + this.chartArea.height;
	},

	getNiceSpacings: function (min, max, expectedCount) {
		console.assert(min < max, "Min must be less than max.");
		console.assert(expectedCount > 0, "Expected count must be greater than zero.");

		// Compute an exact unit size based on the expected count.
		let unit0 = (max - min) / expectedCount;

		// Round the unit based on the most significant digit and precision.
		let precision = Math.round(Math.log10(unit0));
		let msd = Math.ceil(unit0 * Math.pow(10, -precision))
		let unit = msd * Math.pow(10, precision);

		// Compute the start and end indices.
		let start = Math.floor(min / unit) + 1;
		let end = Math.ceil(max / unit) - 1;

		// Generate all the nice spacings.
		let spacings = [];
		for (let i = start; i <= end; ++i) {
			spacings.push(i * unit);
		}
		return spacings;
	},

	drawLineChart: function (canvas) {
		const ctx = canvas.getContext('2d');

		this.chartArea.x = this.margin.left;
		this.chartArea.y = this.margin.right;
		this.chartArea.width = canvas.width - this.margin.left - this.margin.right;
		this.chartArea.height = canvas.height - this.margin.top - this.margin.bottom;

		let chartXMin = this.chartArea.x;
		let chartXMax = this.chartArea.x + this.chartArea.width;
		let chartYMin = this.chartArea.y;
		let chartYMax = this.chartArea.y + this.chartArea.height;

		// Draw the x-axis markers
		let numXUnits = 10;
		let xSpacings = this.getNiceSpacings(this.xAxis.min, this.xAxis.max, numXUnits);
		for (let i = 0; i < xSpacings.length; ++i) {
			let x = xSpacings[i];
			let chartX = this.toCanvasX(x);

			ctx.beginPath();
			ctx.moveTo(chartX, chartYMin);
			ctx.lineTo(chartX, chartYMax);
			ctx.stroke();
		}

		// Draw the y-axis markers
		let numYUnits = 10;
		let ySpacings = this.getNiceSpacings(this.yAxis.min, this.yAxis.max, numYUnits);
		for (let i = 0; i < ySpacings.length; ++i) {
			let y = ySpacings[i];
			let chartY = this.toCanvasY(y);

			ctx.beginPath();
			ctx.moveTo(chartXMin, chartY);
			ctx.lineTo(chartXMax, chartY);
			ctx.stroke();
		}

		// Draw the chart area border
		ctx.strokeRect(
			this.chartArea.x,
			this.chartArea.y,
			this.chartArea.width,
			this.chartArea.height
		);
	},
};

function onBodyLoad() {
	const canvas = document.getElementById('chart');

	//runSimulation(1000, 100);
	chart.drawLineChart(canvas);
};
