var KSP_STOCK_ENGINES = [
	{
		name: 'Rockomax "Skipper"',
		thrust: 650,
		radial: false,
		mass: 4,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'LV-T30',
		thrust: 215,
		radial: false,
		mass: 1.25,
		vectoring: false,
		size: 1.25
	},
	{
		name: 'Rockomax "Mainsail"',
		thrust: 1500,
		radial: false,
		mass: 6,
		vectoring: true,
		size: 2.5
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
		name: 'Rockomax "Poodle"',
		thrust: 220,
		radial: false,
		mass: 2.5,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'LV-909',
		thrust: 50,
		radial: false,
		mass: 0.5,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'Rockomax 48-7S',
		thrust: 20,
		radial: false,
		mass: 0.1,
		vectoring: true,
		size: 0.625
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
		name: 'LV-1R',
		thrust: 1.5,
		radial: true,
		mass: 0.03,
		vectoring: false,
		size: -1
	},
	{
		name: 'Rockomax Mark 55',
		thrust: 120,
		radial: true,
		mass: 0.9,
		vectoring: true,
		size: -1
	},
	{
		name: 'Rockomax 24-77',
		thrust: 20,
		radial: true,
		mass: 0.09,
		vectoring: true,
		size: -1
	},
	{
		name: 'Torodial Aerospike',
		thrust: 175,
		radial: false,
		mass: 1.5,
		vectoring: false,
		size: 1.25
	},
	{
		name: 'LV-N',
		thrust: 60,
		radial: false,
		mass: 2.25,
		vectoring: true,
		size: 1.25
	}
];

var DSM_ENGINES = [
	{
		name: 'DSM 2.5m 4X',
		thrust: 400,
		radial: false,
		mass: 2,
		vectoring: false,
		size: 2.5
	}
];

var KW_ROCKETRY_ENGINES = [
	{
		name: 'KW Rocketry Maverick-1D',
		thrust: 350,
		radial: false,
		mass: 2,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'KW Rocketry Vesta VR-1',
		thrust: 120,
		radial: false,
		mass: 0.6,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'KW Rocketry WildCat-V',
		thrust: 230,
		radial: false,
		mass: 1.5,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'KW Rocketry Griffon-G8D',
		thrust: 1700,
		radial: false,
		mass: 8,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'KW Rocketry Maverick-V',
		thrust: 1300,
		radial: false,
		mass: 6,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'Service Propulsion System',
		thrust: 200,
		radial: false,
		mass: 2.25,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'KW Rocketry Vesta VR-9D',
		thrust: 500,
		radial: false,
		mass: 5,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'KW Rocketry Griffon XX',
		thrust: 3800,
		radial: false,
		mass: 20,
		vectoring: true,
		size: 3.75
	},
	{
		name: 'KW Rocketry Titan-T1',
		thrust: 2700,
		radial: false,
		mass: 14,
		vectoring: true,
		size: 3.75
	},
	{
		name: 'KW Rocketry Wildcat-XR',
		thrust: 1200,
		radial: false,
		mass: 8,
		vectoring: true,
		size: 3.75
	}
];

var KSPX_ENGINES = [
	{
		name: 'LV-NB',
		thrust: 150,
		radial: false,
		mass: 5,
		vectoring: true,
		size: 2.5
	}
];

var NP_ENGINES = [
	{
		name: 'SLS-125 Bearcat Series One',
		thrust: 240,
		radial: false,
		mass: 1.5,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'LF-A30',
		thrust: 285,
		radial: false,
		mass: 2,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'Basic Bertha Mini Quad',
		thrust: 125,
		radial: false,
		mass: 1.25,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'K2-X',
		thrust: 195,
		radial: false,
		mass: 1.2,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'RMA-3 Orbital Achievement Device',
		thrust: 75,
		radial: false,
		mass: 0.65,
		vectoring: true,
		size: 1.25
	},
	{
		name: '4X-800',
		thrust: 1850,
		radial: false,
		mass: 6.5,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'SLS-250 Bearcat Series Two',
		thrust: 1400,
		radial: false,
		mass: 3.25,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'NERVA Mk. I',
		thrust: 300,
		radial: false,
		mass: 9.5,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'Orbital Bertha',
		thrust: 475,
		radial: false,
		mass: 3,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'Bearcat Series Two Tri-nozzle',
		thrust: 2200,
		radial: false,
		mass: 4.5,
		vectoring: true,
		size: 3.75
	},
	{
		name: 'TD-180 Bronco Quad',
		thrust: 2650,
		radial: false,
		mass: 12,
		vectoring: true,
		size: 3.75
	},
	{
		name: '"The Little Mother"',
		thrust: 1800,
		radial: false,
		mass: 10,
		vectoring: true,
		size: 3.75
	},
	{
		name: 'Bearcat Series Two 5x',
		thrust: 7500,
		radial: false,
		mass: 19,
		vectoring: true,
		size: 5
	},
	{
		name: 'The Matriarch',
		thrust: 4500,
		radial: false,
		mass: 18,
		vectoring: true,
		size: 5
	},
	{
		name: 'Radial Large Liquid Booster',
		thrust: 150,
		radial: true,
		mass: 0.8,
		vectoring: true,
		size: -1
	},
	{
		name: 'Radial Liquid Booster',
		thrust: 75,
		radial: true,
		mass: 0.4,
		vectoring: true,
		size: -1
	},
	{
		name: 'SAS-2 Vernier Pod',
		thrust: 33,
		radial: true,
		mass: 0.2,
		vectoring: true,
		size: -1
	},
	{
		name: 'Odin Command Module Trunk Section',
		thrust: 100,
		radial: false,
		mass: 4.4,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'LM-01 Thor Lander Ascent Package',
		thrust: 49,
		radial: false,
		mass: 1.27925,
		vectoring: true,
		size: 1.875
	},
	{
		name: 'LM-01 Thor Lander Descent Package',
		thrust: 65,
		radial: false,
		mass: 1.875,
		vectoring: true,
		size: 1.9
	}
];

var AIES_ENGINES =
[
	{
		name: 'AIES Constellation-C6',
		thrust: 200,
		radial: false,
		mass: 1.25,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'AIES Des-T5',
		thrust: 4,
		radial: true,
		mass: 0.04,
		vectoring: true,
		size: -1
	},
	{
		name: 'AIES Exper-05',
		thrust: 160,
		radial: false,
		mass: 0.85,
		vectoring: false,
		size: 1.25
	},
	{
		name: 'AIES Mogul-MP1500',
		thrust: 1250,
		radial: false,
		mass: 5,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'AIES Produl-VR2',
		thrust: 500,
		radial: false,
		mass: 1.8,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'AIES Galaxy-VR2',
		thrust: 50,
		radial: false,
		mass: 0.4,
		vectoring: true,
		size: 0.625
	},
	{
		name: 'AIES MODC-2',
		thrust: 20,
		radial: false,
		mass: 0.2,
		vectoring: true,
		size: 0.4
	},
	{
		name: 'AIES Orbit II',
		thrust: 300,
		radial: false,
		mass: 1.2,
		vectoring: true,
		size: 2.5
	},
	{
		name: 'AIES EX-1 SAT',
		thrust: 3,
		radial: false,
		mass: 0.035,
		vectoring: true,
		size: 0.3125
	},
	{
		name: 'AIES M-SE',
		thrust: 2,
		radial: false,
		mass: 0.03,
		vectoring: true,
		size: 0.15625
	},
	{
		name: 'AIES Vulcan-VR1',
		thrust: 220,
		radial: false,
		mass: 1.5,
		vectoring: true,
		size: 1.25
	}
];

var HOME_ENGINES = [
	{
		name: 'HOME Radial Aerospike',
		thrust: 110,
		radial: true,
		mass: 0.5,
		vectoring: true,
		size: -1
	},
	{
		name: 'HOME radial engine',
		thrust: 110,
		radial: true,
		mass: 0.5,
		vectoring: true,
		size: -1
	}
];

var KOSMOS_ENGINES = [
	{
		name: 'RD-0146',
		thrust: 130,
		radial: false,
		mass: 0.335,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'RD-275K',
		thrust: 425,
		radial: false,
		mass: 2.25,
		vectoring: true,
		size: 1.25
	},
	{
		name: 'RD-33NK',
		thrust: 588,
		radial: false,
		mass: 1.68,
		vectoring: true,
		size: 1.25
	}
];

var SMP_ENGINES = [
	{
		name: 'Small Rockomax "Skipper"',
		thrust: 36.8,
		radial: false,
		mass: 0.0625,
		vectoring: true,
		size: 0.625
	},
	{
		name: 'Small Rockomax "Mainsail"',
		thrust: 85,
		radial: false,
		mass: 0.09375,
		vectoring: true,
		size: 0.625
	},
	{
		name: 'Small Rockomax "Poodle"',
		thrust: 13.75,
		radial: false,
		mass: 0.0390625,
		vectoring: true,
		size: 0.625
	},
	{
		name: 'Small LV-909',
		thrust: 12.5,
		radial: false,
		mass: 0.0325,
		vectoring: true,
		size: 0.625
	},
	{
		name: 'Small LV-N',
		thrust: 15,
		radial: false,
		mass: 0.5,
		vectoring: true,
		size: 0.625
	},
	{
		name: 'Small Torodial Aerospike',
		thrust: 43.75,
		radial: false,
		mass: 0.1875,
		vectoring: true,
		size: 0.625
	}
];

var ENGINE_PACKS = [
	{
		name: 'kspStock',
		title: 'KSP Stock 0.21.1',
		engines: KSP_STOCK_ENGINES
	},
	
	{
		name: 'aies',
		title: 'AIES Aerospace 1.4.2',
		url: 'http://forum.kerbalspaceprogram.com/showthread.php/35383-0-20-2-AIES-Aerospace-v1-3',
		engines: AIES_ENGINES
	},
	{
		name: 'dsm',
		title: 'DSM 1.8',
		url: 'http://forum.kerbalspaceprogram.com/showthread.php/7790-0-20-Parts-Pack-Deep-Space-Mission-Pack',
		engines: DSM_ENGINES
	},
	{
		name: 'home',
		title: 'H.O.M.E. 1.0.5',
		url: 'http://kerbalspaceport.com/0-18-1-h-o-m-e-start-kit/',
		engines: HOME_ENGINES
	},
	{
		name: 'kosmos',
		title: 'KOSMOS SSPP 4.6',
		url: 'http://forum.kerbalspaceprogram.com/showthread.php/24970-0-19-Kosmos-Spacecraft-Design-Bureau',
		engines: KOSMOS_ENGINES
	},
	{
		name: 'kspx',
		title: 'KSPX 0.2.3',
		url: 'http://forum.kerbalspaceprogram.com/showthread.php/30472-KSPX-Kerbal-Stock-Part-eXpansion-mod-reposted',
		engines: KSPX_ENGINES
	},
	{
		name: 'kwRocketry',
		title: 'KW Rocketry 2.4',
		url: 'http://forum.kerbalspaceprogram.com/showthread.php/33168-20-1-KW-Rocketry-0-2-3',
		engines: KW_ROCKETRY_ENGINES
	},
	{
		name: 'np',
		title: 'NovaPunch 2.02',
		url: 'http://forum.kerbalspaceprogram.com/showthread.php/3870',
		engines: NP_ENGINES
	},
	{
		name: 'smp',
		title: 'Sceppie\'s 0.5m Minipack 0.21.0.1',
		url: 'http://kerbalspaceport.com/0-18-2-sceppies-0-5m-minipack/',
		engines: SMP_ENGINES
	}
];


for (var packIdx in ENGINE_PACKS) {
	var pack = ENGINE_PACKS[packIdx];
	for (var engineIdx in pack.engines) {
		var engine = pack.engines[engineIdx];
		if (engine.size > 0) {
			engine.clippingSize = engine.size * 2 / 3.1;
			engine.pack = pack;
		}
	}
}
