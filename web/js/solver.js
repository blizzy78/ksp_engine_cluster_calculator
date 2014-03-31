/*
Engine cluster calculator for Kerbal Space Program
Copyright (C) 2013-2014 Maik Schreiber

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


self.importScripts('compare.js');


var BOOSTER_STACK_SIZES = [1.25, 2.5, 3.75];
var RADIAL_MAX_SIZE = 1.25;
var THRUST_LIMIT_PERCENTAGE_STEPS = 5;
var THRUST_LIMIT_MIN_PERCENTAGE = 80;
var ENGINE_PARTITION_BUCKET_THRUST = 50;

var NO_ENGINE = {
	thrust: 0,
	size: 0,
	clippingSize: 0,
	mass: 0
};

var startTime = new Date();
var numCallsToSolveEngine = 0;
var timeSpentInSolveEngine = 0;

var allEngines;


function solve(data) {
	var rocketConfigComparator = createRocketConfigComparator(data.calculateFor, data.payloadMass, data.payloadFraction);

	return solveRocket(data.payloadMass, data.payloadFraction, data.minTWR, data.maxTWR,
		data.minCentralThrustFraction, data.maxCentralThrustFraction, data.numBoosters,
		data.numCentralOuterEngines, data.minCentralRadialEngines, data.maxCentralRadialEngines,
		data.maxBoosterOuterEngines, data.minBoosterRadialEngines, data.maxBoosterRadialEngines,
		data.centralStackSize, data.gravity, data.trueRadial, data.allowPartClipping, data.allowThrustLimiting,
		rocketConfigComparator);
}

function solveRocket(payloadMass, payloadFraction, minTWR, maxTWR, minCentralThrustFraction, maxCentralThrustFraction,
	numBoosters, numCentralOuterEngines, minCentralRadialEngines, maxCentralRadialEngines, maxBoosterOuterEngines,
	minBoosterRadialEngines, maxBoosterRadialEngines, centralStackSize, gravity, trueRadial, allowPartClipping,
	allowThrustLimiting, rocketConfigComparator) {
	
	var lastProgressRocketConfigSent = 0;
	var numRocketConfigsFound = 0;
	
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
			centralStackSize, trueRadial, allowPartClipping, allowThrustLimiting);
	} else {
		suitableCentralConfigs = solveStack(minThrust, maxThrust, numCentralOuterEngines, numCentralOuterEngines,
			minCentralRadialEngines, maxCentralRadialEngines, true, true,
			centralStackSize, trueRadial, allowPartClipping, allowThrustLimiting);
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
							boosterStackSize, trueRadial, allowPartClipping, allowThrustLimiting);
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
								newRocketConfig.isp = getSpecificImpulse(newRocketConfig);
								rocketConfig = getBetterRocketConfig(rocketConfig, newRocketConfig, rocketConfigComparator);
								numRocketConfigsFound++;
								
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
			newRocketConfig.isp = getSpecificImpulse(newRocketConfig);
			rocketConfig = getBetterRocketConfig(rocketConfig, newRocketConfig, rocketConfigComparator);
			numRocketConfigsFound++;

			var now = new Date().getTime();
			if ((now - lastProgressRocketConfigSent) > 2000) {
				sendProgressRocketConfig(rocketConfig);
				lastProgressRocketConfigSent = now;
			}
		}
	}
	
	return {
		rocketConfig: rocketConfig,
		numRocketConfigsFound: numRocketConfigsFound
	};
}

function solveStack(minThrust, maxThrust, minOuterEngines, maxOuterEngines, minRadialEngines, maxRadialEngines,
	outerAndRadialEnginesBalanceRequired, vectoringRequired, stackSize, trueRadial, allowPartClipping,
	allowThrustLimiting) {
	
	var engineConfigs = [];
	
	var suitableCentralEngines = solveEngine(maxThrust, false, vectoringRequired, stackSize,
		false, false, true, allowThrustLimiting);
	for (var centralEngineIdx in suitableCentralEngines) {
		var centralEngineConfig = suitableCentralEngines[centralEngineIdx];
		var centralEngine = centralEngineConfig.engine;
		var centralEngineThrust = centralEngine.thrust * centralEngineConfig.limit / 100;

		var remainingMaxThrust = maxThrust - centralEngineThrust;
		var remainingSize = allowPartClipping ?
			((stackSize - centralEngine.clippingSize) / 2) :
			((stackSize - centralEngine.size) / 2);

		var allowNoOuterEngine = minOuterEngines === 0;
		for (var numOuterEngines = minOuterEngines; numOuterEngines <= maxOuterEngines; numOuterEngines++) {
			if (outerAndRadialEnginesBalanceRequired && (numOuterEngines === 1)) {
				continue;
			}
			
			var suitableOuterEngines;
			if (numOuterEngines > 0) {
				var remainingMaxThrustSingle = remainingMaxThrust / numOuterEngines;
				suitableOuterEngines = solveEngine(remainingMaxThrustSingle, false, vectoringRequired,
					remainingSize, false, allowPartClipping, allowNoOuterEngine, allowThrustLimiting);
			} else {
				if (allowNoOuterEngine) {
					suitableOuterEngines = [{
						engine: NO_ENGINE,
						limit: 100
					}];
				} else {
					continue;
				}
			}

			if (allowNoOuterEngine) {
				for (var outerEngineIdx in suitableOuterEngines) {
					if (suitableOuterEngines[outerEngineIdx].engine.thrust === 0) {
						allowNoOuterEngine = false;
						break;
					}
				}
			}

			for (var outerEngineIdx in suitableOuterEngines) {
				var outerEngineConfig = suitableOuterEngines[outerEngineIdx];
				var outerEngine = outerEngineConfig.engine;
				var outerEngineThrust = outerEngine.thrust * outerEngineConfig.limit / 100;
				
				var outerEnginesThrust = outerEngineThrust * numOuterEngines;
				var remainingMaxThrustRadial = remainingMaxThrust - outerEnginesThrust;
				
				var allowNoRadialEngine = minRadialEngines === 0;
				for (var numRadialEngines = minRadialEngines; numRadialEngines <= maxRadialEngines; numRadialEngines++) {
					if (outerAndRadialEnginesBalanceRequired && (numRadialEngines === 1)) {
						continue;
					}
					
					var suitableRadialEngines;
					if (numRadialEngines > 0) {
						var remainingMaxThrustRadialSingle = remainingMaxThrustRadial / numRadialEngines;
						suitableRadialEngines = solveEngine(remainingMaxThrustRadialSingle, true, false,
							RADIAL_MAX_SIZE, trueRadial, allowPartClipping, allowNoRadialEngine,
							allowThrustLimiting);
					} else {
						if (allowNoRadialEngine) {
							suitableRadialEngines = [{
								engine: NO_ENGINE,
								limit: 100
							}];
						} else {
							continue;
						}
					}

					if (allowNoRadialEngine) {
						for (var radialEngineIdx in suitableRadialEngines) {
							if (suitableRadialEngines[radialEngineIdx].engine.thrust === 0) {
								allowNoRadialEngine = false;
								break;
							}
						}
					}
					
					for (var radialEngineIdx in suitableRadialEngines) {
						var radialEngineConfig = suitableRadialEngines[radialEngineIdx];
						var radialEngine = radialEngineConfig.engine;
						var radialEngineThrust = radialEngine.thrust * radialEngineConfig.limit / 100;
						
						var radialEnginesThrust = radialEngineThrust * numRadialEngines;
						
						var totalThrust = centralEngineThrust + outerEnginesThrust + radialEnginesThrust;
						if (totalThrust >= minThrust) {
							var engineConfig = {
								central: (centralEngineThrust > 0) ? centralEngine : null,
								centralLimit: (centralEngineThrust > 0) ? centralEngineConfig.limit : 100,
								outer: (outerEngineThrust > 0) ? outerEngine : null,
								outerLimit: (outerEngineThrust > 0) ? outerEngineConfig.limit : 100,
								numOuter: (outerEngineThrust > 0) ? numOuterEngines : 0,
								radial: (radialEngineThrust > 0) ? radialEngine : null,
								radialLimit: (radialEngineThrust > 0) ? radialEngineConfig.limit : 100,
								numRadial: (radialEngineThrust > 0) ? numRadialEngines : 0,
								thrust: totalThrust,
								mass: centralEngine.mass + outerEngine.mass * numOuterEngines +
									radialEngine.mass * numRadialEngines,
								numParts: ((centralEngineThrust > 0) ? 1 : 0) +
									((outerEngineThrust > 0) ? numOuterEngines : 0) +
									((radialEngineThrust > 0) ? numRadialEngines : 0)
							};
							engineConfig.isp = getSpecificImpulseOfEngineConfig(engineConfig);
							engineConfigs.push(engineConfig);
						}
					}
				}
			}
		}
	}
	
	return engineConfigs;
}

function solveEngine(maxThrust, allowRadial, vectoringRequired, maxSize, trueRadial, allowPartClipping,
	allowNoEngine, allowThrustLimiting) {
	
	numCallsToSolveEngine++;
	var solveEngineStartTime = new Date();

	var maxPartitioningThrust = allowThrustLimiting ? maxThrust * 100 / THRUST_LIMIT_MIN_PERCENTAGE : maxThrust;
	var bucket = Math.min(getPartitionBucket(maxPartitioningThrust), allEngines.length - 1);
	var engines = allEngines[bucket];
	var suitableEngines = [];

	for (var engineIdx in engines) {
		var engine = engines[engineIdx];
		var thrustLimits = [];
		if (allowThrustLimiting) {
			for (var limit = 100; limit >= THRUST_LIMIT_MIN_PERCENTAGE; limit -= THRUST_LIMIT_PERCENTAGE_STEPS) {
				if ((engine.thrust * limit / 100) <= maxThrust) {
					thrustLimits.push(limit);
				}
			}
		} else {
			if (engine.thrust <= maxThrust) {
				thrustLimits.push(100);
			}
		}
		if ((thrustLimits.length > 0) &&
			(allowRadial || !engine.radial) &&
			(!vectoringRequired || engine.vectoring) &&
			(!trueRadial || engine.radial) &&
			((allowPartClipping ? engine.clippingSize : engine.size) <= maxSize)) {

			for (var limitIdx in thrustLimits) {
				suitableEngines.push({
					engine: engine,
					limit: thrustLimits[limitIdx]
				});
			}
		}
	}

	// allow for "no engine here"
	if (allowNoEngine) {
		suitableEngines.push({
			engine: NO_ENGINE,
			limit: 100
		});
	}

	var solveEngineEndTime = new Date();
	
	timeSpentInSolveEngine += (solveEngineEndTime.getTime() - solveEngineStartTime.getTime());
	
	return suitableEngines;
}

function partitionEngines(enginePacks) {
	var result = [];
	
	var maxThrust = -1;
	for (var enginePackIdx in enginePacks) {
		var enginePack = enginePacks[enginePackIdx];
		for (var engineIdx in enginePack.engines) {
			var engine = enginePack.engines[engineIdx];
			if (!isEngineDisabled(engine)) {
				if (engine.thrust > maxThrust) {
					maxThrust = engine.thrust;
				}
			}
		}
	}
	var maxBucket = getPartitionBucket(maxThrust);
	
	for (var enginePackIdx in enginePacks) {
		var enginePack = enginePacks[enginePackIdx];
		for (var engineIdx in enginePack.engines) {
			var engine = enginePack.engines[engineIdx];
			if (!isEngineDisabled(engine)) {
				var bucket = getPartitionBucket(engine.thrust);
				do {
					var bucketEngines = result[bucket];
					if (typeof(bucketEngines) === 'undefined') {
						bucketEngines = [];
						result[bucket] = bucketEngines;
					}
					bucketEngines.push(engine);
				} while (++bucket <= maxBucket);
			}
		}
	}
	
	return result;
}

function getPartitionBucket(thrust) {
	return Math.floor(thrust / ENGINE_PARTITION_BUCKET_THRUST);
}

function isEngineDisabled(engine) {
	return (typeof(engine.disabled) !== 'undefined') && engine.disabled;
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

function sendRocketConfig(rocketConfig, numRocketConfigsFound) {
	self.postMessage({
		type: 'rocketConfig',
		rocketConfig: rocketConfig,
		timeTaken: new Date().getTime() - startTime.getTime(),
		numRocketConfigsFound: numRocketConfigsFound,
		numCallsToSolveEngine: numCallsToSolveEngine,
		timeSpentInSolveEngine: timeSpentInSolveEngine
	});
}


self.addEventListener('message', function(e) {
	allEngines = partitionEngines(e.data.enginePacks);
	
	var result = solve(e.data);
	sendRocketConfig(result.rocketConfig, result.numRocketConfigsFound);
}, false);
