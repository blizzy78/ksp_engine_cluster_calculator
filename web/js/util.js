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


function getRocketConfigSort(calculateFor, payloadMass, payloadFraction) {
	var valueFunc;
	var lowerIsBetter;
	switch (calculateFor) {
		case 'twr':
			{
				var mass = payloadMass * 100 / payloadFraction;
				valueFunc = function(rocketConfig) {
					return rocketConfig.thrust / mass
				};
				lowerIsBetter = false;
			}
			break;

		case 'engineTWR':
			valueFunc = function(rocketConfig) {
				return rocketConfig.thrust / rocketConfig.mass;
			};
			lowerIsBetter = false;
			break;
			
		case 'engineMass':
			valueFunc = function(rocketConfig) {
				return rocketConfig.mass;
			};
			lowerIsBetter = true;
			break;
		
		case 'numParts':
			valueFunc = function(rocketConfig) {
				return rocketConfig.numParts;
			};
			lowerIsBetter = true;
			break;
	}
	return {
		valueFunc: valueFunc,
		lowerIsBetter: lowerIsBetter
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
