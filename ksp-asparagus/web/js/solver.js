"use strict";


var BOOSTER_STACK_SIZES = [0.625, 1.25, 2.5, 3.75, 5];
var RADIAL_MAX_SIZE = 1.25;


function solve(data) {
	var sortValueFunc;
	var sortLowerIsBetter;
	switch (data.calculateFor) {
		case 'twr':
			{
				var mass = data.payloadMass * 100 / data.payloadFraction;
				sortValueFunc = function(rocketConfig) {
					return rocketConfig.thrust / mass
				};
				sortLowerIsBetter = false;
			}
			break;

		case 'engineTWR':
			sortValueFunc = function(rocketConfig) {
				return rocketConfig.thrust / rocketConfig.mass;
			};
			sortLowerIsBetter = false;
			break;
			
		case 'numParts':
			sortValueFunc = function(rocketConfig) {
				return rocketConfig.numParts;
			};
			sortLowerIsBetter = true;
			break;
	}

	var allEngines = [];
	for (var enginePackIdx in data.enginePacks) {
		var enginePack = data.enginePacks[enginePackIdx];
		for (var engineIdx in enginePack.engines) {
			var engine = enginePack.engines[engineIdx];
			allEngines.push(engine);
		}
	}
	
	return solveRocket(data.payloadMass, data.payloadFraction, data.minTWR, data.maxTWR,
		data.minCentralThrustFraction, data.maxCentralThrustFraction, data.minBoosters, data.maxBoosters,
		data.maxCentralOuterEngines, data.maxCentralRadialEngines, data.maxBoosterOuterEngines,
		data.maxBoosterRadialEngines, data.centralStackSize, data.gravity, data.allowPartClipping,
		sortValueFunc, sortLowerIsBetter, allEngines);
}

function solveRocket(payloadMass, payloadFraction, minTWR, maxTWR, minCentralThrustFraction, maxCentralThrustFraction,
	minBoosters, maxBoosters, maxCentralOuterEngines, maxCentralRadialEngines, maxBoosterOuterEngines,
	maxBoosterRadialEngines, centralStackSize, gravity, allowPartClipping, sortValueFunc, sortLowerIsBetter, allEngines) {
	
	var startTime = new Date().getTime();
	
	var rocketMass = payloadMass * 100 / payloadFraction;
	var minThrust = rocketMass * minTWR * gravity;
	var maxThrust = rocketMass * maxTWR * gravity;

	var rocketConfig = null;

	var minCentralThrust = minThrust * minCentralThrustFraction / 100;
	var maxCentralThrust = maxThrust * maxCentralThrustFraction / 100;
	
	var suitableCentralConfigsWithoutBoosters = solveStack(
		minThrust, maxThrust,
		maxCentralOuterEngines, maxCentralRadialEngines, true, true, centralStackSize, allowPartClipping, allEngines);
	var suitableCentralConfigsWithBoosters = solveStack(
		minCentralThrust, maxCentralThrust,
		maxCentralOuterEngines, maxCentralRadialEngines, true, true, centralStackSize, allowPartClipping, allEngines);

	var maxProgressUnits = suitableCentralConfigsWithoutBoosters.length;
	if (maxBoosters > 0) {
		maxProgressUnits = suitableCentralConfigsWithBoosters.length * maxBoosters / 2;
	}
	var progressUnits = 0;
	var lastProgressReported = 0;
	
	for (var numBoosters = minBoosters; numBoosters <= maxBoosters; numBoosters += 2) {
		var suitableCentralConfigs = (numBoosters > 0) ? suitableCentralConfigsWithBoosters : suitableCentralConfigsWithoutBoosters;
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
								maxBoosterOuterEngines, maxBoosterRadialEngines, false, false, boosterStackSize,
								allowPartClipping, allEngines);
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
									rocketConfig = getBetterRocketConfig(rocketConfig, newRocketConfig, sortValueFunc,
										sortLowerIsBetter);
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
				rocketConfig = getBetterRocketConfig(rocketConfig, newRocketConfig, sortValueFunc, sortLowerIsBetter);
			}
			
			progressUnits++;
			var now = new Date().getTime();
			if ((now - lastProgressReported) >= 1000) {
				var elapsedTime = now - startTime;
				sendProgress(progressUnits * 100 / maxProgressUnits, elapsedTime);
				lastProgressReported = now;
			}
		}
	}
	
	return rocketConfig;
}

function solveStack(minThrust, maxThrust, maxOuterEngines, maxRadialEngines, outerAndRadialEnginesBalanceRequired,
	vectoringRequired, stackSize, allowPartClipping, allEngines) {
	
	var engineConfigs = [];
	
	var suitableCentralEngines = solveSingleEngine(0, maxThrust, false, vectoringRequired, stackSize,
		false, allEngines);
	for (var centralEngineIdx in suitableCentralEngines) {
		var centralEngine = suitableCentralEngines[centralEngineIdx];

		var remainingMinThrust = minThrust - centralEngine.thrust; 
		var remainingMaxThrust = maxThrust - centralEngine.thrust;
		var remainingSize = allowPartClipping ?
			((stackSize - centralEngine.clippingSize) / 2) :
			((stackSize - centralEngine.size) / 2);

		for (var numOuterEngines = 0; numOuterEngines <= maxOuterEngines; numOuterEngines++) {
			if (!outerAndRadialEnginesBalanceRequired || (numOuterEngines !== 1)) {
				if (numOuterEngines > 0) {
					var remainingMinThrustSingle = remainingMinThrust / numOuterEngines;
					var remainingMaxThrustSingle = remainingMaxThrust / numOuterEngines;
					var suitableOuterEngines = solveSingleEngine(remainingMinThrustSingle, remainingMaxThrustSingle,
							false, false, remainingSize, allowPartClipping, allEngines);
					for (var outerEngineIdx in suitableOuterEngines) {
						var outerEngine = suitableOuterEngines[outerEngineIdx];
						
						var outerEnginesThrust = outerEngine.thrust * numOuterEngines;
						var remainingMinThrustRadial = remainingMinThrust - outerEnginesThrust;
						var remainingMaxThrustRadial = remainingMaxThrust - outerEnginesThrust;
						
						if (outerEngine.size <= centralEngine.size) {
							for (var numRadialEngines = 0; numRadialEngines <= maxRadialEngines; numRadialEngines++) {
								if (!outerAndRadialEnginesBalanceRequired || (numRadialEngines !== 1)) {
									if (numRadialEngines > 0) {
										var remainingMinThrustRadialSingle = remainingMinThrustRadial / numRadialEngines;
										var remainingMaxThrustRadialSingle = remainingMaxThrustRadial / numRadialEngines;
										var suitableRadialEngines = solveSingleEngine(remainingMinThrustRadialSingle,
											remainingMaxThrustRadialSingle, true, false, RADIAL_MAX_SIZE, allowPartClipping,
											allEngines);
										for (var radialEngineIdx in suitableRadialEngines) {
											var radialEngine = suitableRadialEngines[radialEngineIdx];
											
											var radialEnginesThrust = radialEngine.thrust * numRadialEngines;
											
											var totalThrust = centralEngine.thrust + outerEnginesThrust + radialEnginesThrust;
											if (totalThrust >= minThrust) {
												var engineConfig = {
													central: centralEngine,
													outer: outerEngine,
													numOuter: numOuterEngines,
													radial: radialEngine,
													numRadial: numRadialEngines,
													thrust: totalThrust,
													mass: centralEngine.mass + outerEngine.mass * numOuterEngines +
														radialEngine.mass * numRadialEngines,
													numParts: ((centralEngine.thrust > 0) ? 1 : 0) + numOuterEngines +
														numRadialEngines
												};
												engineConfigs.push(engineConfig);
											}
										}
									} else {
										var totalThrust = centralEngine.thrust + outerEnginesThrust;
										if (totalThrust >= minThrust) {
											var engineConfig = {
												central: centralEngine,
												outer: outerEngine,
												numOuter: numOuterEngines,
												radial: null,
												numRadial: 0,
												thrust: totalThrust,
												mass: centralEngine.mass + outerEngine.mass * numOuterEngines,
												numParts: ((centralEngine.thrust > 0) ? 1 : 0) + numOuterEngines
											};
											engineConfigs.push(engineConfig);
										}
									}
								}
							}
						}
					}
				} else {
					if (centralEngine.thrust >= minThrust) {
						var engineConfig = {
							central: centralEngine,
							outer: null,
							numOuter: 0,
							thrust: centralEngine.thrust,
							mass: centralEngine.mass,
							numParts: 1
						};
						engineConfigs.push(engineConfig);
					}
				}
			}
		}
	}
	
	return engineConfigs;
}

function solveSingleEngine(minThrust, maxThrust, allowRadial, vectoringRequired, maxSize, allowPartClipping, allEngines) {
	var suitableEngines = [];
	if (minThrust == 0) {
		// allow for "no engine here"
		suitableEngines.push({
			thrust: 0,
			size: 0,
			clippingSize: 0,
			mass: 0
		});
	}
	for (var engineIdx in allEngines) {
		var engine = allEngines[engineIdx];
		if ((engine.thrust >= minThrust) && (engine.thrust <= maxThrust) &&
			(allowRadial || !engine.radial) &&
			(!vectoringRequired || engine.vectoring)) {
			
			var engineSize = allowPartClipping ? engine.clippingSize : engine.size;
			if (engineSize <= maxSize) {
				suitableEngines.push(engine);
			}
		}
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

function getBetterRocketConfig(rocketConfig1, rocketConfig2, valueFunc, lowerIsBetter) {
	if (rocketConfig1 === null) {
		return rocketConfig2;
	} else if (rocketConfig2 === null) {
		return rocketConfig1;
	} else {
		var value1 = valueFunc(rocketConfig1);
		var value2 = valueFunc(rocketConfig2);
		if (lowerIsBetter) {
			return (value1 < value2) ? rocketConfig1 : rocketConfig2;
		} else {
			return (value1 < value2) ? rocketConfig2 : rocketConfig1;
		}
	}
}


self.addEventListener('message', function(e) {
	var rocketConfig = solve(e.data);
	sendRocketConfig(rocketConfig);
}, false);
