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


var ENGINES = [
	{
		name: 'LV-T30',
		thrust: 215,
		radial: false,
		mass: 1.25,
		vectoring: false,
		size: 1.25
	},
	{
		name: 'LV-T45',
		thrust: 200,
		radial: false,
		mass: 1.5,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'LV-1',
		thrust: 1.5,
		radial: false,
		mass: 0.03,
		vectoring: false,
		size: 0.625
	},
	{
		name: 'Rockomax 24-77',
		thrust: 20,
		radial: true,
		mass: 0.09,
		vectoring: true,
		size: -1
	}
];


function assertEngines(engines, engineNames) {
	equal(engines.length, engineNames.length, 'engines count: ' + engineNames.length);
	for (var engineNameIdx in engineNames) {
		var foundEngine = false;
		for (var engineIdx in engines) {
			if (engines[engineIdx].name === engineNames[engineNameIdx]) {
				foundEngine = true;
				break;
			}
		}
		ok(foundEngine, 'engine: ' + engineNames[engineNameIdx]);
	}
}


module('Solver');

test('solveEngine - no match', function() {
	var engines = solveEngine(1, false, false, 5, false, false, ENGINES);
	assertEngines(engines, []);
});

test('solveEngine - single match', function() {
	var engines = solveEngine(2, false, false, 5, false, false, ENGINES);
	assertEngines(engines, ['LV-1']);
});

test('solveEngine - no engine here', function() {
	var engines = solveEngine(1, false, false, 5, false, true, ENGINES);
	equal(engines.length, 1);
	equal(engines[0].thrust, 0);
});

test('solveEngine - multiple matches', function() {
	var engines = solveEngine(201, false, false, 5, false, false, ENGINES);
	assertEngines(engines, ['LV-1', 'LV-T45']);
});

test('solveEngine - radial', function() {
	var engines = solveEngine(21, true, false, 5, false, false, ENGINES);
	assertEngines(engines, ['LV-1', 'Rockomax 24-77']);
});

test('solveEngine - vectoring', function() {
	var engines = solveEngine(220, false, true, 5, false, false, ENGINES);
	assertEngines(engines, ['LV-T45']);
});


test('solveStack - no vectoring required', function() {
	var engineConfigs = solveStack(190, 220, 0, 0, 0, 0, true, false, 5, false, ENGINES);
	equal(engineConfigs.length, 2);
	equal(engineConfigs[0].thrust, 215);
	equal(engineConfigs[0].central.name, 'LV-T30');
	equal(engineConfigs[1].thrust, 200);
	equal(engineConfigs[1].central.name, 'LV-T45');
});

test('solveStack - vectoring required', function() {
	var engineConfigs = solveStack(190, 220, 0, 0, 0, 0, true, true, 5, false, ENGINES);
	equal(engineConfigs.length, 1);
	equal(engineConfigs[0].thrust, 200);
	equal(engineConfigs[0].central.name, 'LV-T45');
});

test('solveStack - with outer engines', function() {
	var engineConfigs = solveStack(599, 601, 0, 4, 0, 0, true, true, 5, false, ENGINES);
	equal(engineConfigs.length, 2);
	equal(engineConfigs[0].thrust, 600);
	equal(engineConfigs[0].central.name, 'LV-T45');
	equal(engineConfigs[0].numOuter, 2);
	equal(engineConfigs[0].outer.name, 'LV-T45');
	equal(engineConfigs[1].thrust, 600);
	equal(engineConfigs[1].central, null);
	equal(engineConfigs[1].numOuter, 3);
	equal(engineConfigs[1].outer.name, 'LV-T45');
});

test('solveStack - with outer and radial engines', function() {
	var engineConfigs = solveStack(639, 641, 0, 4, 0, 4, true, true, 5, false, ENGINES);
	equal(engineConfigs.length, 2);
	equal(engineConfigs[0].thrust, 640);
	equal(engineConfigs[0].central.name, 'LV-T45');
	equal(engineConfigs[0].numOuter, 2);
	equal(engineConfigs[0].outer.name, 'LV-T45');
	equal(engineConfigs[0].numRadial, 2);
	equal(engineConfigs[0].radial.name, 'Rockomax 24-77');
	equal(engineConfigs[1].thrust, 640);
	equal(engineConfigs[1].central, null);
	equal(engineConfigs[1].numOuter, 3);
	equal(engineConfigs[1].outer.name, 'LV-T45');
	equal(engineConfigs[1].numRadial, 2);
	equal(engineConfigs[1].radial.name, 'Rockomax 24-77');
});

test('solveStack - with radial engines', function() {
	var engineConfigs = solveStack(239, 241, 0, 4, 0, 4, true, true, 5, false, ENGINES);
	equal(engineConfigs.length, 1);
	equal(engineConfigs[0].thrust, 240);
	equal(engineConfigs[0].central.name, 'LV-T45');
	equal(engineConfigs[0].numOuter, 0);
	equal(engineConfigs[0].numRadial, 2);
	equal(engineConfigs[0].radial.name, 'Rockomax 24-77');
});

test('solveStack - no balance required', function() {
	var engineConfigs = solveStack(234, 236, 0, 4, 0, 4, false, false, 5, false, ENGINES);
	console.log(engineConfigs);
	equal(engineConfigs.length, 2);
	equal(engineConfigs[0].thrust, 235);
	equal(engineConfigs[0].central.name, 'LV-T30');
	equal(engineConfigs[0].numOuter, 0);
	equal(engineConfigs[0].numRadial, 1);
	equal(engineConfigs[0].radial.name, 'Rockomax 24-77');
	equal(engineConfigs[1].thrust, 235);
	equal(engineConfigs[1].central, null);
	equal(engineConfigs[1].numOuter, 1);
	equal(engineConfigs[1].outer.name, 'LV-T30');
	equal(engineConfigs[1].numRadial, 1);
	equal(engineConfigs[1].radial.name, 'Rockomax 24-77');
});
