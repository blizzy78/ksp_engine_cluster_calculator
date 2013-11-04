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


self.importScripts('util.js', 'compare.js');


var BOOSTER_STACK_SIZES = [0.625, 1.25, 2.5, 3.75, 5];
var RADIAL_MAX_SIZE = 1.25;

var NO_ENGINE = {
	thrust: 0,
	size: 0,
	clippingSize: 0,
	mass: 0
};


function solve(data) {
	var rocketConfigComparator = createRocketConfigComparator(data.calculateFor, data.payloadMass, data.payloadFraction);

	var allEngines = [];
	for (var enginePackIdx in data.enginePacks) {
		var enginePack = data.enginePacks[enginePackIdx];
		for (var engineIdx in enginePack.engines) {
			var engine = enginePack.engines[engineIdx];
			if ((typeof(engine.disabled) === 'undefined') || !engine.disabled) {
				allEngines.push(engine);
			}
		}
	}
	
	return solveRocket(data.payloadMass, data.payloadFraction, data.minTWR, data.maxTWR,
		data.minCentralThrustFraction, data.maxCentralThrustFraction, data.numBoosters,
		data.numCentralOuterEngines, data.minCentralRadialEngines, data.maxCentralRadialEngines,
		data.maxBoosterOuterEngines, data.minBoosterRadialEngines, data.maxBoosterRadialEngines,
		data.centralStackSize, data.gravity, data.allowPartClipping, rocketConfigComparator, allEngines);
}

function solveRocket(payloadMass, payloadFraction, minTWR, maxTWR, minCentralThrustFraction, maxCentralThrustFraction,
	numBoosters, numCentralOuterEngines, minCentralRadialEngines, maxCentralRadialEngines, maxBoosterOuterEngines,
	minBoosterRadialEngines, maxBoosterRadialEngines, centralStackSize, gravity, allowPartClipping, rocketConfigComparator,
	allEngines) {
	
	var lastProgressRocketConfigSent = 0;
	
	var rocketMass = payloadMass * 100 / payloadFraction;
	var minThrust = rocketMass * minTWR * gravity;
	var maxThrust = rocketMass * maxTWR * gravity;

	var rocketConfig = null;

	var minCentralThrust = minThrust * minCentralThrustFraction / 100;
	var maxCentralThrust = maxThrust * maxCentralThrustFraction / 100;
	
	var suitableCentralConfigs;
	if (numBoosters > 0) {
		suitableCentralConfigs = solveStack(minCentralThrust, maxCentralThrust, numCentralOuterEngines,
			numCentralOuterEngines, minCentralRadialEngines, maxCentralRadialEngines, true, true,
			centralStackSize, allowPartClipping, allEngines);
	} else {
		suitableCentralConfigs = solveStack(minThrust, maxThrust, numCentralOuterEngines, numCentralOuterEngines,
			minCentralRadialEngines, maxCentralRadialEngines, true, true,
			centralStackSize, allowPartClipping, allEngines);
	}
	
	for (var suitableCentralConfigIdx in suitableCentralConfigs) {
		var centralConfig = suitableCentralConfigs[suitableCentralConfigIdx];
		
		if (numBoosters > 0) {
			var remainingMinThrust = minThrust - centralConfig.thrust;
			var remainingMaxThrust = maxThrust - centralConfig.thrust;
			var remainingMinThrustSingle = remainingMinThrust / numBoosters;
			var remainingMaxThrustSingle = remainingMaxThrust / numBoosters;
			for (var boosterStackSizeIdx in BOOSTER_STACK_SIZES) {
				var boosterStackSize = BOOSTER_STACK_SIZES[boosterStackSizeIdx];
				if (boosterStackSize <= centralStackSize) {
					var suitableBoosterConfigs = solveStack(remainingMinThrustSingle, remainingMaxThrustSingle,
							0, maxBoosterOuterEngines, minBoosterRadialEngines, maxBoosterRadialEngines, false, false,
							boosterStackSize, allowPartClipping, allEngines);
					for (var boosterConfigIdx in suitableBoosterConfigs) {
						var boosterConfig = suitableBoosterConfigs[boosterConfigIdx];
						var totalThrust = centralConfig.thrust + boosterConfig.thrust * numBoosters;
						if (totalThrust >= minThrust) {
							var centralThrustFraction = centralConfig.thrust * 100 / totalThrust;
							if ((centralThrustFraction >= minCentralThrustFraction) &&
								(centralThrustFraction <= maxCentralThrustFraction)) {
								
								var newRocketConfig = {
									central: centralConfig,
									booster: boosterConfig,
									numBoosters: numBoosters,
									thrust: totalThrust,
									mass: centralConfig.mass + boosterConfig.mass * numBoosters,
									numParts: centralConfig.numParts + boosterConfig.numParts * numBoosters,
									centralSize: centralStackSize,
									boosterSize: boosterStackSize
								};
								rocketConfig = getBetterRocketConfig(rocketConfig, newRocketConfig, rocketConfigComparator);
								
								var now = new Date().getTime();
								if ((now - lastProgressRocketConfigSent) > 2000) {
									sendProgressRocketConfig(rocketConfig);
									lastProgressRocketConfigSent = now;
								}
							}
						}
					}
				}
			}
		} else {
			var newRocketConfig = {
				central: centralConfig,
				booster: null,
				numBoosters: 0,
				thrust: centralConfig.thrust,
				mass: centralConfig.mass,
				numParts: centralConfig.numParts,
				centralSize: centralStackSize,
				boosterSize: -1
			};
			rocketConfig = getBetterRocketConfig(rocketConfig, newRocketConfig, rocketConfigComparator);

			var now = new Date().getTime();
			if ((now - lastProgressRocketConfigSent) > 2000) {
				sendProgressRocketConfig(rocketConfig);
				lastProgressRocketConfigSent = now;
			}
		}
	}
	
	return rocketConfig;
}

function solveStack(minThrust, maxThrust, minOuterEngines, maxOuterEngines, minRadialEngines, maxRadialEngines,
	outerAndRadialEnginesBalanceRequired, vectoringRequired, stackSize, allowPartClipping, allEngines) {
	
	var engineConfigs = [];
	
	var suitableCentralEngines = solveEngine(maxThrust, false, vectoringRequired, stackSize,
		false, true, allEngines);
	for (var centralEngineIdx in suitableCentralEngines) {
		var centralEngine = suitableCentralEngines[centralEngineIdx];

		var remainingMaxThrust = maxThrust - centralEngine.thrust;
		var remainingSize = allowPartClipping ?
			((stackSize - centralEngine.clippingSize) / 2) :
			((stackSize - centralEngine.size) / 2);

		var allowNoOuterEngine = true;
		for (var numOuterEngines = minOuterEngines; numOuterEngines <= maxOuterEngines; numOuterEngines++) {
			if (outerAndRadialEnginesBalanceRequired && (numOuterEngines === 1)) {
				continue;
			}
			
			var suitableOuterEngines;
			if (numOuterEngines > 0) {
				var remainingMaxThrustSingle = remainingMaxThrust / numOuterEngines;
				suitableOuterEngines = solveEngine(remainingMaxThrustSingle, false, vectoringRequired,
					remainingSize, allowPartClipping, allowNoOuterEngine, allEngines);
			} else {
				if (allowNoOuterEngine) {
					suitableOuterEngines = [ NO_ENGINE ];
				} else {
					continue;
				}
			}

			if (allowNoOuterEngine) {
				for (var outerEngineIdx in suitableOuterEngines) {
					if (suitableOuterEngines[outerEngineIdx].thrust === 0) {
						allowNoOuterEngine = false;
						break;
					}
				}
			}

			var allowNoRadialEngine = true;
			for (var outerEngineIdx in suitableOuterEngines) {
				var outerEngine = suitableOuterEngines[outerEngineIdx];
				
				var outerEnginesThrust = outerEngine.thrust * numOuterEngines;
				var remainingMaxThrustRadial = remainingMaxThrust - outerEnginesThrust;
				
				for (var numRadialEngines = minRadialEngines; numRadialEngines <= maxRadialEngines; numRadialEngines++) {
					if (outerAndRadialEnginesBalanceRequired && (numRadialEngines === 1)) {
						continue;
					}
					
					var suitableRadialEngines;
					if (numRadialEngines > 0) {
						var remainingMaxThrustRadialSingle = remainingMaxThrustRadial / numRadialEngines;
						suitableRadialEngines = solveEngine(remainingMaxThrustRadialSingle, true, false,
							RADIAL_MAX_SIZE, allowPartClipping, allowNoRadialEngine, allEngines);
					} else {
						if (allowNoRadialEngine) {
							suitableRadialEngines = [ NO_ENGINE ];
						} else {
							continue;
						}
					}

					if (allowNoRadialEngine) {
						for (var radialEngineIdx in suitableRadialEngines) {
							if (suitableRadialEngines[radialEngineIdx].thrust === 0) {
								allowNoRadialEngine = false;
								break;
							}
						}
					}
					
					for (var radialEngineIdx in suitableRadialEngines) {
						var radialEngine = suitableRadialEngines[radialEngineIdx];
						
						var radialEnginesThrust = radialEngine.thrust * numRadialEngines;
						
						var totalThrust = centralEngine.thrust + outerEnginesThrust + radialEnginesThrust;
						if (totalThrust >= minThrust) {
							var engineConfig = {
								central: (centralEngine.thrust > 0) ? centralEngine : null,
								outer: (outerEngine.thrust > 0) ? outerEngine : null,
								numOuter: (outerEngine.thrust > 0) ? numOuterEngines : 0,
								radial: (radialEngine.thrust > 0) ? radialEngine : null,
								numRadial: (radialEngine.thrust > 0) ? numRadialEngines : 0,
								thrust: totalThrust,
								mass: centralEngine.mass + outerEngine.mass * numOuterEngines +
									radialEngine.mass * numRadialEngines,
								numParts: ((centralEngine.thrust > 0) ? 1 : 0) +
									((outerEngine.thrust > 0) ? numOuterEngines : 0) +
									((radialEngine.thrust > 0) ? numRadialEngines : 0)
							};
							engineConfigs.push(engineConfig);
						}
					}
				}
			}
		}
	}
	
	return engineConfigs;
}

function solveEngine(maxThrust, allowRadial, vectoringRequired, maxSize, allowPartClipping,
	allowNoEngine, allEngines) {
	
	var suitableEngines = [];
	for (var engineIdx in allEngines) {
		var engine = allEngines[engineIdx];
		if ((engine.thrust <= maxThrust) &&
			(allowRadial || !engine.radial) &&
			(!vectoringRequired || engine.vectoring)) {
			
			var engineSize = allowPartClipping ? engine.clippingSize : engine.size;
			if (engineSize <= maxSize) {
				suitableEngines.push(engine);
			}
		}
	}

	// allow for "no engine here"
	if (allowNoEngine) {
		suitableEngines.push(NO_ENGINE);
	}

	return suitableEngines;
}

function sendProgress(percent, elapsedTime) {
	self.postMessage({
		type: 'progress',
		progressPercent: percent,
		elapsedTime: elapsedTime
	});
}

function sendProgressRocketConfig(rocketConfig) {
	self.postMessage({
		type: 'progress.rocketConfig',
		rocketConfig: rocketConfig
	});
}

function sendLog(message) {
	self.postMessage({
		type: 'log',
		message: message
	});
}

function sendRocketConfig(rocketConfig) {
	self.postMessage({
		type: 'rocketConfig',
		rocketConfig: rocketConfig
	});
}


self.addEventListener('message', function(e) {
	var rocketConfig = solve(e.data);
	sendRocketConfig(rocketConfig);
}, false);
