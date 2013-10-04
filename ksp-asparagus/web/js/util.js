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
	if (rocketConfig1 === null) {
		return rocketConfig2;
	} else if (rocketConfig2 === null) {
		return rocketConfig1;
	} else {
		var value1 = rocketConfigSort.valueFunc(rocketConfig1);
		var value2 = rocketConfigSort.valueFunc(rocketConfig2);
		if (rocketConfigSort.lowerIsBetter) {
			return (value1 < value2) ? rocketConfig1 : rocketConfig2;
		} else {
			return (value1 < value2) ? rocketConfig2 : rocketConfig1;
		}
	}
}
