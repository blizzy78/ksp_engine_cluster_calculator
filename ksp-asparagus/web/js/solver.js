"use strict";


var BOOSTER_STACK_SIZES = [0.625, 1.25, 2.5, 3.75, 5];


function solve(data) {
	return solveRocket(data.payloadMass, data.payloadFraction, data.minTWR, data.maxTWR,
		data.minCentralThrustFraction, data.maxCentralThrustFraction, data.minBoosters, data.maxBoosters,
		data.maxCentralOuterEngines, data.maxBoosterOuterEngines, data.centralStackSize, data.gravity,
		data.allowPartClipping, data.enginePacks);
}

function solveRocket(payloadMass, payloadFraction, minTWR, maxTWR, minCentralThrustFraction, maxCentralThrustFraction,
	minBoosters, maxBoosters, maxCentralOuterEngines, maxBoosterOuterEngines, centralStackSize, gravity,
	allowPartClipping, enginePacks) {
	
	var rocketMass = payloadMass * 100 / payloadFraction;
	var minThrust = rocketMass * minTWR * gravity;
	var maxThrust = rocketMass * maxTWR * gravity;

	var rocketConfigs = [];

	var minCentralThrust = minThrust * minCentralThrustFraction / 100;
	var maxCentralThrust = maxThrust * maxCentralThrustFraction / 100;
	
	for (var numBoosters = minBoosters; numBoosters <= maxBoosters; numBoosters += 2) {
		var suitableCentralConfigs = solveStack(
			(numBoosters > 0) ? minCentralThrust : minThrust,
			(numBoosters > 0) ? maxCentralThrust : maxThrust,
			maxCentralOuterEngines, true, true, centralStackSize, allowPartClipping, enginePacks);
		for (var suitableCentralConfigIdx = 0; suitableCentralConfigIdx < suitableCentralConfigs.length; suitableCentralConfigIdx++) {
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
								maxBoosterOuterEngines, false, false, boosterStackSize,
								allowPartClipping, enginePacks);
						for (var boosterConfigIdx in suitableBoosterConfigs) {
							var boosterConfig = suitableBoosterConfigs[boosterConfigIdx];
							var totalThrust = centralConfig.thrust + boosterConfig.thrust * numBoosters;
							if (totalThrust >= minThrust) {
								var centralThrustFraction = centralConfig.thrust * 100 / totalThrust;
								if ((centralThrustFraction >= minCentralThrustFraction) &&
									(centralThrustFraction <= maxCentralThrustFraction)) {
									
									var rocketConfig = {
										central: centralConfig,
										booster: boosterConfig,
										numBoosters: numBoosters,
										thrust: totalThrust,
										mass: centralConfig.mass + boosterConfig.mass * numBoosters,
										numParts: centralConfig.numParts + boosterConfig.numParts * numBoosters,
										centralSize: centralStackSize,
										boosterSize: boosterStackSize
									};
									rocketConfigs.push(rocketConfig);
								}
							}
						}
					}
				}
			} else {
				var rocketConfig = {
					central: centralConfig,
					booster: null,
					numBoosters: 0,
					thrust: centralConfig.thrust,
					mass: centralConfig.mass,
					numParts: centralConfig.numParts,
					centralSize: centralStackSize,
					boosterSize: -1
				};
				rocketConfigs.push(rocketConfig);
			}
		}
	}
	
	return rocketConfigs;
}

function solveStack(minThrust, maxThrust, maxOuterEngines, outerEnginesBalanceRequired, vectoringRequired,
	stackSize, allowPartClipping, enginePacks) {
	
	var engineConfigs = [];
	
	var suitableCentralEngines = solveSingleEngine(0, maxThrust, false, vectoringRequired, stackSize,
		false, enginePacks);
	for (var centralEngineIdx = 0; centralEngineIdx < suitableCentralEngines.length; centralEngineIdx++) {
		var centralEngine = suitableCentralEngines[centralEngineIdx];

		var remainingMinThrust = minThrust - centralEngine.thrust; 
		var remainingMaxThrust = maxThrust - centralEngine.thrust;
		var remainingSize = allowPartClipping ?
			((stackSize - centralEngine.clippingSize) / 2) :
			((stackSize - centralEngine.size) / 2);

		for (var numOuterEngines = 0; numOuterEngines <= maxOuterEngines; numOuterEngines++) {
			if (!outerEnginesBalanceRequired || (numOuterEngines !== 1)) {
				if (numOuterEngines > 0) {
					var remainingMinThrustSingle = remainingMinThrust / numOuterEngines;
					var remainingMaxThrustSingle = remainingMaxThrust / numOuterEngines;
					var suitableOuterEngines = solveSingleEngine(remainingMinThrustSingle, remainingMaxThrustSingle,
							false, false, remainingSize, allowPartClipping, enginePacks);
					for (var outerEngineIdx in suitableOuterEngines) {
						var outerEngine = suitableOuterEngines[outerEngineIdx];
						if (outerEngine.size <= centralEngine.size) {
							var totalThrust = centralEngine.thrust + outerEngine.thrust * numOuterEngines;
							if (totalThrust >= minThrust) {
								var engineConfig = {
									central: centralEngine,
									outer: outerEngine,
									numOuter: numOuterEngines,
									thrust: totalThrust,
									mass: centralEngine.mass + outerEngine.mass * numOuterEngines,
									numParts: ((centralEngine.thrust > 0) ? 1 : 0) + numOuterEngines
								};
								engineConfigs.push(engineConfig);
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

function solveSingleEngine(minThrust, maxThrust, allowRadial, vectoringRequired, maxSize, allowPartClipping, enginePacks) {
	// find all engines within thrust range
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
	for (var enginePackIdx in enginePacks) {
		var enginePack = enginePacks[enginePackIdx];
		for (var engineIdx in enginePack.engines) {
			var engine = enginePack.engines[engineIdx];
			var engineSize = allowPartClipping ? engine.clippingSize : engine.size;
			if ((engine.thrust >= minThrust) && (engine.thrust <= maxThrust) &&
				(allowRadial || !engine.radial) &&
				(!vectoringRequired || engine.vectoring) &&
				(engineSize <= maxSize)) {
				
				suitableEngines.push(engine);
			}
		}
	}

	return suitableEngines;
}

function progress(percent) {
	self.postMessage({
		type: 'progress',
		progressPercent: percent
	});
}

function log(message) {
	self.postMessage({
		type: 'log',
		message: message
	});
}


self.addEventListener('message', function(e) {
	var rocketConfigs = solve(e.data);
	self.postMessage({
		type: 'result',
		rocketConfigs: rocketConfigs
	});
}, false);
