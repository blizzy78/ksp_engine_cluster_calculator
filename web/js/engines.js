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


var KSP_STOCK_ENGINES = [
	{
		name: 'LFB KR-1x2',
		thrust: 2000,
		radial: false,
		mass: 10.4,
		vectoring: true,
		size: 2.5,
		isp: 320,
		disabled: true   // no engine/tank combinations for now
	},
	{
		name: 'Kerbodyne KR-2L',
		thrust: 2500,
		radial: false,
		mass: 6.5,
		vectoring: true,
		size: 3.75,
		isp: 280
	},
	{
		name: 'S3 KS-25x4',
		thrust: 3200,
		radial: false,
		mass: 9.75,
		vectoring: true,
		size: 3.75,
		isp: 320
	},
	{
		name: 'Rockomax "Skipper"',
		thrust: 650,
		radial: false,
		mass: 4,
		vectoring: true,
		size: 2.5,
		isp: 300
	},
	{
		name: 'LV-T30',
		thrust: 215,
		radial: false,
		mass: 1.25,
		vectoring: false,
		size: 1.25,
		isp: 320
	},
	{
		name: 'Rockomax "Mainsail"',
		thrust: 1500,
		radial: false,
		mass: 6,
		vectoring: true,
		size: 2.5,
		isp: 280
	},
	{
		name: 'LV-T45',
		thrust: 200,
		radial: false,
		mass: 1.5,
		vectoring: true,
		size: 1.25,
		isp: 320
	},
	{
		name: 'Rockomax "Poodle"',
		thrust: 220,
		radial: false,
		mass: 2.5,
		vectoring: true,
		size: 2.5,
		isp: 270
	},
	{
		name: 'LV-909',
		thrust: 50,
		radial: false,
		mass: 0.5,
		vectoring: true,
		size: 1.25,
		isp: 300
	},
	{
		name: 'Rockomax 48-7S',
		thrust: 30,
		radial: false,
		mass: 0.1,
		vectoring: true,
		size: 0.625,
		isp: 300
	},
	{
		name: 'LV-1',
		thrust: 4,
		radial: false,
		mass: 0.03,
		vectoring: false,
		size: 0.625,
		isp: 220
	},
	{
		name: 'LV-N',
		thrust: 60,
		radial: false,
		mass: 2.25,
		vectoring: true,
		size: 1.25,
		isp: 220
	},
	{
		name: 'LV-1R',
		thrust: 4,
		radial: true,
		mass: 0.03,
		vectoring: false,
		size: -1,
		isp: 220
	},
	{
		name: 'Rockomax Mark 55',
		thrust: 120,
		radial: true,
		mass: 0.9,
		vectoring: true,
		size: -1,
		isp: 290
	},
	{
		name: 'R.A.P.I.E.R.',
		thrust: 175,
		radial: false,
		mass: 1.75,
		vectoring: true,
		size: 1.25,
		isp: 320
	},
	{
		name: 'Rockomax 24-77',
		thrust: 20,
		radial: true,
		mass: 0.09,
		vectoring: true,
		size: -1,
		isp: 250
	},
	{
		name: 'Toroidal Aerospike',
		thrust: 175,
		radial: false,
		mass: 1.5,
		vectoring: false,
		size: 1.25,
		isp: 388
	}
];

var KW_ROCKETRY_ENGINES = [
	{
		name: 'Maverick-1D',
		thrust: 350,
		radial: false,
		mass: 2,
		vectoring: true,
		size: 1.25,
		isp: 320
	},
	{
		name: 'Vesta VR-1',
		thrust: 120,
		radial: false,
		mass: 0.6,
		vectoring: true,
		size: 1.25,
		isp: 350
	},
	{
		name: 'WildCat-V',
		thrust: 230,
		radial: false,
		mass: 1.5,
		vectoring: true,
		size: 1.25,
		isp: 325
	},
	{
		name: 'Griffon-G8D',
		thrust: 1900,
		radial: false,
		mass: 8,
		vectoring: true,
		size: 2.5,
		isp: 280
	},
	{
		name: 'Maverick-V',
		thrust: 1400,
		radial: false,
		mass: 6,
		vectoring: true,
		size: 2.5,
		isp: 285
	},
	{
		name: 'Service Propulsion System',
		thrust: 200,
		radial: false,
		mass: 2.25,
		vectoring: true,
		size: 2.5,
		isp: 270
	},
	{
		name: 'Vesta VR-9D',
		thrust: 600,
		radial: false,
		mass: 5,
		vectoring: true,
		size: 2.5,
		isp: 310
	},
	{
		name: 'Griffon XX',
		thrust: 4900,
		radial: false,
		mass: 18,
		vectoring: true,
		size: 3.75,
		isp: 265
	},
	{
		name: 'Titan-T1',
		thrust: 3600,
		radial: false,
		mass: 14,
		vectoring: true,
		size: 3.75,
		isp: 270
	},
	{
		name: 'Wildcat-XR',
		thrust: 1400,
		radial: false,
		mass: 8,
		vectoring: true,
		size: 3.75,
		isp: 275
	}
];

var KSPX_ENGINES = [
	{
		name: 'LV-NB',
		thrust: 150,
		radial: false,
		mass: 5,
		vectoring: true,
		size: 2.5,
		isp: 220
	}
];

var NP_ENGINES = [
	{
		name: 'SLS-125 Bearcat Series One',
		thrust: 240,
		radial: false,
		mass: 1.5,
		vectoring: true,
		size: 1.25,
		isp: 330
	},
	{
		name: 'LF-A30',
		thrust: 285,
		radial: false,
		mass: 2,
		vectoring: true,
		size: 1.25,
		isp: 375
	},
	{
		name: 'Basic Bertha Mini Quad',
		thrust: 125,
		radial: false,
		mass: 1.25,
		vectoring: true,
		size: 1.25,
		isp: 335
	},
	{
		name: 'K2-X 1.25 m',
		thrust: 195,
		radial: false,
		mass: 1.2,
		vectoring: true,
		size: 1.25,
		isp: 350
	},
	{
		name: 'K2-X 3.75 m',
		thrust: 1600,
		radial: false,
		mass: 7,
		vectoring: true,
		size: 3.75,
		isp: 290
	},
	{
		name: 'K2-X 5 m',
		thrust: 5000,
		radial: false,
		mass: 18,
		vectoring: true,
		size: 5,
		isp: 270
	},
	{
		name: 'RMA-3',
		thrust: 75,
		radial: false,
		mass: 0.65,
		vectoring: true,
		size: 1.25,
		isp: 300
	},
	{
		name: '4X-800',
		thrust: 1850,
		radial: false,
		mass: 6.5,
		vectoring: true,
		size: 2.5,
		isp: 275
	},
	{
		name: 'SLS-250 Bearcat Series Two',
		thrust: 1400,
		radial: false,
		mass: 5.25,
		vectoring: true,
		size: 2.5,
		isp: 290
	},
	{
		name: 'NERVA Mk. I',
		thrust: 300,
		radial: false,
		mass: 11,
		vectoring: true,
		size: 2.5,
		isp: 200
	},
	{
		name: 'In-line Twin Fusion 1.25 m',
		thrust: 75,
		radial: false,
		mass: 2.5,
		vectoring: true,
		size: 1.25,
		isp: 220
	},
	{
		name: 'In-line Twin Fusion 2.5 m',
		thrust: 150,
		radial: false,
		mass: 5,
		vectoring: true,
		size: 2.5,
		isp: 200
	},
	{
		name: 'Orbital Bertha',
		thrust: 475,
		radial: false,
		mass: 3.8,
		vectoring: true,
		size: 2.5,
		isp: 335
	},
	{
		name: 'Bearcat Series Two Tri-nozzle',
		thrust: 2400,
		radial: false,
		mass: 9.25,
		vectoring: true,
		size: 3.75,
		isp: 270
	},
	{
		name: 'TD-180 Bronco Quad',
		thrust: 3000,
		radial: false,
		mass: 10.7,
		vectoring: true,
		size: 3.75,
		isp: 280
	},
	{
		name: '"The Little Mother"',
		thrust: 2000,
		radial: false,
		mass: 6,
		vectoring: true,
		size: 3.75,
		isp: 285
	},
	{
		name: 'Advanced Heavy Lifter Engine',
		thrust: 7500,
		radial: false,
		mass: 26,
		vectoring: true,
		size: 5,
		isp: 265
	},
	{
		name: 'Bearcat Series Two 5x',
		thrust: 10000,
		radial: false,
		mass: 30,
		vectoring: true,
		size: 5,
		isp: 265
	},
	{
		name: 'The Matriarch',
		thrust: 4000,
		radial: false,
		mass: 13.8,
		vectoring: true,
		size: 5,
		isp: 275
	},
	{
		name: 'The Micro Mother',
		thrust: 1000,
		radial: false,
		mass: 4.5,
		vectoring: true,
		size: 2.5,
		isp: 295
	},
	{
		name: 'Freyja Light Duty',
		thrust: 35,
		radial: false,
		mass: 0.16,
		vectoring: true,
		size: 0.3125,
		isp: 300
	},
	{
		name: 'Radial Liquid Booster',
		thrust: 75,
		radial: true,
		mass: 0.4,
		vectoring: true,
		size: -1,
		isp: 280
	},
	{
		name: 'Radial Large Liquid Booster',
		thrust: 150,
		radial: true,
		mass: 0.8,
		vectoring: true,
		size: -1,
		isp: 280
	}
];

var AIES_ENGINES =
[
	{
		name: 'Constellation-C6',
		thrust: 200,
		radial: false,
		mass: 1.25,
		vectoring: true,
		size: 1.25,
		isp: 320
	},
	{
		name: 'Des-T5',
		thrust: 4,
		radial: true,
		mass: 0.04,
		vectoring: true,
		size: -1,
		isp: 250
	},
	{
		name: 'Exper-05',
		thrust: 160,
		radial: false,
		mass: 0.85,
		vectoring: false,
		size: 1.25,
		isp: 320
	},
	{
		name: 'Mogul-MP1500',
		thrust: 1250,
		radial: false,
		mass: 5,
		vectoring: true,
		size: 2.5,
		isp: 280
	},
	{
		name: 'Produl-VR2',
		thrust: 500,
		radial: false,
		mass: 1.8,
		vectoring: true,
		size: 2.5,
		isp: 320
	},
	{
		name: 'Galaxy-VR2',
		thrust: 50,
		radial: false,
		mass: 0.4,
		vectoring: true,
		size: 0.625,
		isp: 300
	},
	{
		name: 'MODC-2',
		thrust: 20,
		radial: false,
		mass: 0.2,
		vectoring: true,
		size: 0.4,
		isp: 300
	},
	{
		name: 'Orbit II',
		thrust: 300,
		radial: false,
		mass: 1.2,
		vectoring: true,
		size: 2.5,
		isp: 320
	},
	{
		name: 'EX-1 SAT',
		thrust: 3,
		radial: false,
		mass: 0.035,
		vectoring: true,
		size: 0.3125,
		isp: 220
	},
	{
		name: 'M-SE',
		thrust: 2,
		radial: false,
		mass: 0.03,
		vectoring: true,
		size: 0.15625,
		isp: 220
	},
	{
		name: 'Vulcan-VR1',
		thrust: 220,
		radial: false,
		mass: 1.5,
		vectoring: true,
		size: 1.25,
		isp: 320
	}
];

var KOSMOS_ENGINES = [
	{
		name: 'RD-0146',
		thrust: 130,
		radial: false,
		mass: 0.335,
		vectoring: true,
		size: 1.25,
		disabled: true, // atmosphere curve not suitable for ascent
		isp: 200
	},
	{
		name: 'RD-0146-N2',
		thrust: 135,
		radial: false,
		mass: 0.233,
		vectoring: true,
		size: 1.25,
		disabled: true, // atmosphere curve not suitable for ascent
		isp: 188
	},
	{
		name: 'RD-275K',
		thrust: 425,
		radial: false,
		mass: 2.25,
		vectoring: true,
		size: 1.25,
		isp: 333
	},
	{
		name: 'RD-33NK',
		thrust: 588,
		radial: false,
		mass: 1.68,
		vectoring: true,
		size: 1.25,
		isp: 297
	},
	{
		name: 'RD-58SS',
		thrust: 325,
		radial: false,
		mass: 1.4,
		vectoring: true,
		size: 1.25,
		isp: 361
	}
];

var SMP_ENGINES = [
	{
		name: 'Small Rockomax "Skipper"',
		thrust: 40,
		radial: false,
		mass: 0.35,
		vectoring: true,
		size: 0.625,
		isp: 265
	},
	{
		name: 'Small Rockomax "Mainsail"',
		thrust: 60,
		radial: false,
		mass: 0.52,
		vectoring: true,
		size: 0.625,
		isp: 260
	},
	{
		name: 'Small Rockomax "Poodle"',
		thrust: 15,
		radial: false,
		mass: 0.25,
		vectoring: true,
		size: 0.625,
		isp: 270
	},
	{
		name: 'Small LV-909',
		thrust: 9,
		radial: false,
		mass: 0.14,
		vectoring: true,
		size: 0.625,
		isp: 310
	},
	{
		name: 'Small LV-N',
		thrust: 10,
		radial: false,
		mass: 0.75,
		vectoring: true,
		size: 0.625,
		isp: 100
	},
	{
		name: 'Small Toroidal Aerospike',
		thrust: 25,
		radial: false,
		mass: 0.25,
		vectoring: false,
		size: 0.625,
		isp: 378
	}
];

var RLA_ENGINES = [
	{
		name: 'Rockomax "Cutter" Linear Aerospike',
		thrust: 210,
		radial: false,
		mass: 1.5,
		vectoring: false,
		size: 0.625,
		isp: 340
	},
	{
		name: 'Rockomax "Spinnaker"',
		thrust: 30,
		radial: false,
		mass: 0.125,
		vectoring: true,
		size: 0.625,
		isp: 280
	},
	{
		name: 'LV-T5',
		thrust: 5,
		radial: false,
		mass: 0.05,
		vectoring: true,
		size: 0.625,
		isp: 330
	},
	{
		name: 'TtH-2B "Kingfisher"',
		thrust: 15,
		radial: false,
		mass: 0.1,
		vectoring: true,
		size: 0.625,
		isp: 310
	},
	{
		name: 'LV-Nc',
		thrust: 6.5,
		radial: false,
		mass: 0.25,
		vectoring: false,
		size: 0.625,
		isp: 220
	}
];


var ENGINE_PACKS = [
	{
		name: 'kspStock',
		title: 'KSP Stock 0.23.5',
		engines: KSP_STOCK_ENGINES
	},
	
	{
		name: 'aies',
		title: 'AIES Aerospace 1.5.1',
		url: 'http://forum.kerbalspaceprogram.com/threads/35383',
		engines: AIES_ENGINES
	},
	{
		name: 'kosmos',
		title: 'KOSMOS SSPP 4.7.2',
		url: 'http://forum.kerbalspaceprogram.com/threads/24970',
		engines: KOSMOS_ENGINES
	},
	{
		name: 'kspx',
		title: 'KSPX 0.2.6.1',
		url: 'http://forum.kerbalspaceprogram.com/threads/30472',
		engines: KSPX_ENGINES
	},
	{
		name: 'kwRocketry',
		title: 'KW Rocketry 2.5.6B',
		url: 'http://forum.kerbalspaceprogram.com/threads/51037',
		engines: KW_ROCKETRY_ENGINES
	},
	{
		name: 'np',
		title: 'NovaPunch 2.04',
		url: 'http://forum.kerbalspaceprogram.com/threads/3870',
		engines: NP_ENGINES
	},
	{
		name: 'rla',
		title: 'RLA Stockalike 0.9.4',
		url: 'http://forum.kerbalspaceprogram.com/threads/24593',
		engines: RLA_ENGINES
	},
	{
		name: 'smp',
		title: 'Sceppie\'s 0.5m Minipack 0.23.0.2',
		url: 'http://kerbalspaceport.com/0-18-2-sceppies-0-5m-minipack/',
		engines: SMP_ENGINES
	}
];


for (var packIdx in ENGINE_PACKS) {
	var pack = ENGINE_PACKS[packIdx];
	for (var engineIdx in pack.engines) {
		var engine = pack.engines[engineIdx];
		engine.pack = pack;
		engine.clippingSize = !engine.radial ? (engine.size * 2 / 3.1) : -1;
	}
}
