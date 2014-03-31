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


module('Compare');

test('createSingleRocketConfigComparator - nulls', function() {
	ok(createSingleRocketConfigComparator('nulls', 0, 0).compare(null, {}) > 0);
	ok(createSingleRocketConfigComparator('nulls', 0, 0).compare({}, null) < 0);
	equal(createSingleRocketConfigComparator('nulls', 0, 0).compare({}, {}), 0);
});

test('createSingleRocketConfigComparator - engineTWR', function() {
	ok(createSingleRocketConfigComparator('engineTWR', 0, 0).compare({ thrust: 1000, mass: 100 }, { thrust: 100, mass: 100 }) < 0);
	ok(createSingleRocketConfigComparator('engineTWR', 0, 0).compare({ thrust: 100, mass: 100 }, { thrust: 1000, mass: 100 }) > 0);
	equal(createSingleRocketConfigComparator('engineTWR', 0, 0).compare({ thrust: 1000, mass: 100 }, { thrust: 1000, mass: 100 }), 0);
});

test('createSingleRocketConfigComparator - engineMass', function() {
	ok(createSingleRocketConfigComparator('engineMass', 0, 0).compare({ mass: 100 }, { mass: 1000 }) < 0);
	ok(createSingleRocketConfigComparator('engineMass', 0, 0).compare({ mass: 1000 }, { mass: 100 }) > 0);
	equal(createSingleRocketConfigComparator('engineMass', 0, 0).compare({ mass: 100 }, { mass: 100 }), 0);
});

test('createSingleRocketConfigComparator - twr', function() {
	ok(createSingleRocketConfigComparator('twr', 10, 15).compare({ thrust: 1000 }, { thrust: 100 }) < 0);
	ok(createSingleRocketConfigComparator('twr', 10, 15).compare({ thrust: 100 }, { thrust: 1000 }) > 0);
	equal(createSingleRocketConfigComparator('twr', 10, 15).compare({ thrust: 100 }, { thrust: 100 }), 0);
});

test('createSingleRocketConfigComparator - isp', function() {
	ok(createSingleRocketConfigComparator('isp', 0, 0).compare({ isp: 500 }, { isp: 1000 }) > 0);
	ok(createSingleRocketConfigComparator('isp', 0, 0).compare({ isp: 1000 }, { isp: 500 }) < 0);
	equal(createSingleRocketConfigComparator('isp', 0, 0).compare({ isp: 500 }, { isp: 500 }), 0);
});

test('createSingleRocketConfigComparator - numParts', function() {
	ok(createSingleRocketConfigComparator('numParts', 0, 0).compare({ numParts: 2 }, { numParts: 5 }) < 0);
	ok(createSingleRocketConfigComparator('numParts', 0, 0).compare({ numParts: 5 }, { numParts: 2 }) > 0);
	equal(createSingleRocketConfigComparator('numParts', 0, 0).compare({ numParts: 2 }, { numParts: 2 }), 0);
});

test('createSingleRocketConfigComparator - numShells', function() {
	var rc1 = {
		central: {
			central: {}
		},
		booster: null
	};
	var rc2 = {
		central: {
			central: {},
			outer: {},
			numOuter: 2
		},
		booster: null
	};
	ok(createSingleRocketConfigComparator('numShells', 0, 0).compare(rc1, rc2) < 0);
	ok(createSingleRocketConfigComparator('numShells', 0, 0).compare(rc2, rc1) > 0);
	equal(createSingleRocketConfigComparator('numShells', 0, 0).compare(rc1, rc1), 0);
});

test('createCompoundComparator - single', function() {
	var numbersComparator = {
		compare: function(a, b) {
			return a - b;
		}
	};
	var comparator = createCompoundComparator(numbersComparator);
	ok(comparator.compare(1, 2) < 0);
	ok(comparator.compare(2, 1) > 0);
	equal(comparator.compare(1, 1), 0);
});

test('createCompoundComparator - multiple', function() {
	var greaterThanTenFirstComparator = {
		compare: function(a, b) {
			if ((a > 10) && (b > 10)) {
				return 0;
			} else if (a > 10) {
				return -1;
			} else if (b > 10) {
				return 1;
			} else {
				return 0;
			}
		}
	};
	var numbersComparator = {
		compare: function(a, b) {
			return a - b;
		}
	};
	var comparator = createCompoundComparator(greaterThanTenFirstComparator).thenCompare(numbersComparator);
	ok(comparator.compare(1, 11) > 0);
	ok(comparator.compare(11, 1) < 0);
	equal(comparator.compare(1, 1), 0);
	equal(comparator.compare(11, 11), 0);
	ok(comparator.compare(1, 2) < 0);
	ok(comparator.compare(2, 1) > 0);
	ok(comparator.compare(11, 12) < 0);
	ok(comparator.compare(12, 11) > 0);
});

test('getSpecificImpulseOfEngineConfig - single', function() {
	var engineConfig = {
		central: {
			thrust: 120,
			isp: 290
		},
		numOuter: 0,
		numRadial: 0
	};
	equal(getSpecificImpulseOfEngineConfig(engineConfig), 290);
});

test('getSpecificImpulseOfEngineConfig - two', function() {
	var engineConfig = {
		central: {
			thrust: 120,
			isp: 290
		},
		numOuter: 1,
		outer: {
			thrust: 20,
			isp: 250
		},
		numRadial: 0
	};
	equal(Math.round(getSpecificImpulseOfEngineConfig(engineConfig) * 10) / 10, 283.5);
});

test('getSpecificImpulseOfEngineConfig - three', function() {
	var engineConfig = {
		central: {
			thrust: 120,
			isp: 290
		},
		numOuter: 1,
		outer: {
			thrust: 20,
			isp: 250
		},
		numRadial: 1,
		radial: {
			thrust: 1.5,
			isp: 220
		}
	};
	equal(Math.round(getSpecificImpulseOfEngineConfig(engineConfig) * 10) / 10, 282.7);
});

test('getSpecificImpulse', function() {
	var rocketConfig = {
		thrust: 281.5,
		central: {
			thrust: 140,
			central: {
				thrust: 120,
				isp: 290
			},
			numOuter: 1,
			outer: {
				thrust: 20,
				isp: 250
			},
			numRadial: 0,
			isp: 283.519553
		},
		numBoosters: 1,
		booster: {
			thrust: 141.5,
			central: {
				thrust: 120,
				isp: 290
			},
			numOuter: 1,
			outer: {
				thrust: 20,
				isp: 250
			},
			numRadial: 1,
			radial: {
				thrust: 1.5,
				isp: 220
			},
			isp: 282.654435
		}
	};
	equal(Math.round(getSpecificImpulse(rocketConfig) * 10) / 10, 283.1);
});
