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

function getBetterRocketConfig(rocketConfig1, rocketConfig2, rocketConfigSort) {
	var lowerIsBetter = rocketConfigSort.lowerIsBetter;
	if (rocketConfig1 === null) {
		return rocketConfig2;
	} else if (rocketConfig2 === null) {
		return rocketConfig1;
	} else {
		var value1 = rocketConfigSort.valueFunc(rocketConfig1);
		var value2 = rocketConfigSort.valueFunc(rocketConfig2);
		if (value1 == value2) {
			value1 = getNumberOfShellsUsed(rocketConfig1);
			value2 = getNumberOfShellsUsed(rocketConfig2);
			lowerIsBetter = true;
		}
		if (lowerIsBetter) {
			return (value1 < value2) ? rocketConfig1 : rocketConfig2;
		} else {
			return (value1 < value2) ? rocketConfig2 : rocketConfig1;
		}
	}
}

function getNumberOfShellsUsed(rocketConfig) {
	var shells = 0;
	var centralConfig = rocketConfig.central;
	if ((centralConfig.central != null) && (centralConfig.central.thrust > 0)) {
		shells++;
	}
	if (centralConfig.numOuter > 0) {
		shells++;
	}
	if (centralConfig.numRadial > 0) {
		shells++;
	}
	var boosterConfig = rocketConfig.booster;
	if (boosterConfig != null) {
		if ((boosterConfig.central != null) && (boosterConfig.central.thrust > 0)) {
			shells++;
		}
		if (boosterConfig.numOuter > 0) {
			shells++;
		}
		if (boosterConfig.numRadial > 0) {
			shells++;
		}
	}
	return shells;
}
