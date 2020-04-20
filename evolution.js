// File: evolution.js

let contentDiv = document.getElementById('content');

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

runSimulation(1000, 100);
