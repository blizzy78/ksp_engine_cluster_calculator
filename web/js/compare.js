/*
Engine cluster calculator for Kerbal Space Program
Copyright (C) 2012-2013 Maik Schreiber

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";


var SORT_PRIORITIES = [ 'engineTWR', 'twr', 'isp', 'engineMass', 'numParts', 'numShells' ];


function createCompoundComparator(initialComparator) {
	var comparators = [ initialComparator ];
	
	return {
		compare: function(a, b) {
			for (var comparatorIdx in comparators) {
				var result = comparators[comparatorIdx].compare(a, b);
				if (result !== 0) {
					return result;
				}
			}
			return 0;
		},
		
		thenCompare: function(nextComparator) {
			comparators.push(nextComparator);
			return this;
		},
		
		dump: function() {
			var result = '';
			for (var comparatorIdx in comparators) {
				if (result.length > 0) {
					result += ', ';
				}
				result += comparators[comparatorIdx].name;
			}
			return result;
		}
	};
}

function createRocketConfigComparator(calculateFor, payloadMass, payloadFraction) {
	var comparator = createCompoundComparator(createSingleRocketConfigComparator('nulls', payloadMass, payloadFraction))
		.thenCompare(createSingleRocketConfigComparator(calculateFor, payloadMass, payloadFraction));
	for (var priorityIdx in SORT_PRIORITIES) {
		var priority = SORT_PRIORITIES[priorityIdx];
		if (priority !== calculateFor) {
			comparator.thenCompare(createSingleRocketConfigComparator(priority, payloadMass, payloadFraction));
		}
	}
	if (typeof(log) !== 'undefined') {
		log('comparator: ' + comparator.dump());
	}
	return comparator;
}

function createSingleRocketConfigComparator(calculateFor, payloadMass, payloadFraction) {
	var func;
	switch (calculateFor) {
		case 'nulls':
			func = function(rocketConfig1, rocketConfig2) {
				if (rocketConfig1 === null) {
					return 1;
				} else if (rocketConfig2 === null) {
					return -1;
				} else {
					return 0;
				}
			};
			break;
		
		case 'engineTWR':
			func = function(rocketConfig1, rocketConfig2) {
				var twr1 = rocketConfig1.thrust / rocketConfig1.mass;
				var twr2 = rocketConfig2.thrust / rocketConfig2.mass;
				return twr2 - twr1;
			};
			break;
	
		case 'engineMass':
			func = function(rocketConfig1, rocketConfig2) {
				return rocketConfig1.mass - rocketConfig2.mass;
			};
			break;

		case 'twr':
			var mass = payloadMass * 100 / payloadFraction;
			func = function(rocketConfig1, rocketConfig2) {
				var twr1 = rocketConfig1.thrust / mass;
				var twr2 = rocketConfig2.thrust / mass;
				return twr2 - twr1;
			};
			break;
		
		case 'numParts':
			func = function(rocketConfig1, rocketConfig2) {
				return rocketConfig1.numParts - rocketConfig2.numParts;
			};
			break;

		case 'numShells':
			func = function(rocketConfig1, rocketConfig2) {
				var shells1 = getNumberOfShellsUsed(rocketConfig1);
				var shells2 = getNumberOfShellsUsed(rocketConfig2);
				return shells1 - shells2;
			};
			break;
		
		case 'isp':
			func = function(rocketConfig1, rocketConfig2) {
				return rocketConfig2.isp - rocketConfig1.isp;
			};
			break;
	}
	
	return {
		name: calculateFor,
		compare: func
	};
}

function getBetterRocketConfig(rocketConfig1, rocketConfig2, rocketConfigComparator) {
	return (rocketConfigComparator.compare(rocketConfig1, rocketConfig2) <= 0) ? rocketConfig1 : rocketConfig2;
}

function getNumberOfShellsUsed(rocketConfig) {
	var centralShells = 0;
	var centralConfig = rocketConfig.central;
	if (centralConfig.numRadial > 0) {
		centralShells = 3;
	} else if (centralConfig.numOuter > 0) {
		centralShells = 2;
	} else if (centralConfig.central !== null) {
		centralShells = 1;
	}
	var boosterShells = 0;
	var boosterConfig = rocketConfig.booster;
	if (boosterConfig !== null) {
		if (boosterConfig.numRadial > 0) {
			boosterShells = 3;
		} else if (boosterConfig.numOuter > 0) {
			boosterShells = 2;
		} else if (boosterConfig.central !== null) {
			boosterShells = 1;
		}
	}
	return centralShells + boosterShells;
}

function getSpecificImpulse(rocketConfig) {
	var totalThrust = rocketConfig.thrust;
	var divisor = rocketConfig.central.thrust / rocketConfig.central.isp;
	if (rocketConfig.numBoosters > 0) {
		divisor += rocketConfig.booster.thrust * rocketConfig.numBoosters / rocketConfig.booster.isp;
	}
	return totalThrust / divisor;
}

function getSpecificImpulseOfEngineConfig(engineConfig) {
	var totalThrust = 0;
	var divisor = 0;
	if (engineConfig.central !== null) {
		totalThrust += engineConfig.central.thrust;
		divisor += engineConfig.central.thrust / engineConfig.central.isp;
	}
	if (engineConfig.numOuter > 0) {
		var outerThrust = engineConfig.outer.thrust * engineConfig.numOuter;
		totalThrust += outerThrust;
		divisor += outerThrust / engineConfig.outer.isp;
	}
	if (engineConfig.numRadial > 0) {
		var radialThrust = engineConfig.radial.thrust * engineConfig.numRadial;
		totalThrust += radialThrust;
		divisor += radialThrust / engineConfig.radial.isp;
	}
	return totalThrust / divisor;
}
