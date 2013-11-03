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


var SORT_PRIORITIES = [ 'engineTWR', 'twr', 'engineMass', 'numParts', 'numShells' ];


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
	}
	
	return {
		compare: func
	};
}
