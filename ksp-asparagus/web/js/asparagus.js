"use strict";


var STACK_SIZES = [0.625, 1.25, 2.5, 3.75, 5];
var KERBIN_GRAVITY = 9.81;
var BASE_PLATE_RADIUS = 171;
var CENTER_X = 180;
var CENTER_Y = 180;


function solve() {
	var enginePacks = [];
	$('#options input[name="enginePacks"]:checked').each(function(idx, el) {
		var name = $(el).val();
		for (var enginePackIdx in ENGINE_PACKS) {
			var enginePack = ENGINE_PACKS[enginePackIdx];
			if (enginePack.name === name) {
				enginePacks.push(enginePack);
			}
		}
	});
	
	$('#options button[type="submit"], #options button[type="reset"]').attr('disabled', 'true');

	var data = {
		payloadMass: parseInt($('#options input[name="payloadMass"]').val()),
		payloadFraction: parseInt($('#options input[name="payloadFraction"]').val()),
		minTWR: parseFloat($('#options input[name="minTWR"]').val()),
		maxTWR: parseFloat($('#options input[name="maxTWR"]').val()),
		centralStackSize: parseFloat($('#options select[name="centralStackSize"]').val()),
		minBoosters: parseInt($('#options input[name="minBoosters"]').val()),
		maxBoosters: parseInt($('#options input[name="maxBoosters"]').val()),
		allowPartClipping: $('#options input[name="allowPartClipping"]')[0].checked,
		minCentralThrustFraction: parseInt($('#options input[name="minCentralThrustFraction"]').val()),
		maxCentralThrustFraction: parseInt($('#options input[name="maxCentralThrustFraction"]').val()),
		maxCentralOuterEngines: parseInt($('#options input[name="maxCentralOuterEngines"]').val()),
		maxBoosterOuterEngines: parseInt($('#options input[name="maxBoosterOuterEngines"]').val()),
		gravity: KERBIN_GRAVITY,
		enginePacks: enginePacks
	};
	
	var worker = new Worker('js/solver.js');

	worker.addEventListener('message', function(e) {
		if (typeof(e.data.rocketConfigs) === 'object') {
			var rocketConfigs = e.data.rocketConfigs;
			if (rocketConfigs.length > 0) {
				// use the one with highest TWR
				var rocketConfig;
				var maxTWR = -1;
				for (var rocketConfigIdx in rocketConfigs) {
					var currentRocketConfig = rocketConfigs[rocketConfigIdx];
					var rocketConfigTWR = currentRocketConfig.thrust / currentRocketConfig.mass;
					if (rocketConfigTWR > maxTWR) {
						rocketConfig = currentRocketConfig;
						maxTWR = rocketConfigTWR;
					}
				}

				draw($('#centralConfig'), rocketConfig.central, 'Central Stack Layout',
						$('#centralDescription'), rocketConfig.centralSize);
				if (rocketConfig.numBoosters > 0) {
					draw($('#boosterConfig'), rocketConfig.booster, 'Booster Stack Layout', $('#boosterDescription'),
						rocketConfig.boosterSize, rocketConfig.numBoosters);
				} else {
					draw($('#boosterConfig'), '(not required)', null, $('#boosterDescription'), -1, 0);
				}
				
				var mass = data.payloadMass * 100 / data.payloadFraction;
				var thrust = rocketConfig.thrust;
				var twr = thrust / mass / data.gravity;
				var html = '<h5>Vessel Totals</h5><ul><li>Mass: ' + (Math.round(mass * 10) / 10) + ' t ' +
					'(engines: ' + (Math.round(rocketConfig.mass * 10) / 10) + ' t)</li>' +
					'<li>Thrust: ' + Math.round(thrust) + ' kN</li><li>TWR: ' + (Math.round(twr * 100) / 100) + '</li></ul>';
				$('#rocketTotals').empty().append($.parseHTML(html));
			} else {
				draw($('#centralConfig'), '(no solution)', null, $('#centralDescription'), -1);
				draw($('#boosterConfig'), '(no solution)', null, $('#boosterDescription'), -1);
				$('#rocketTotals').empty();
			}
	
			$('#options button[type="submit"]').removeAttr('disabled').text('Calculate');
			$('#options button[type="reset"]').removeAttr('disabled');
		} else if (typeof(e.data.progressPercent) !== 'undefined') {
			$('#options button[type="submit"]').text(e.data.progressPercent + '%');
		}
	}, false);

	worker.postMessage(data);
}

function draw(canvas, engineConfig, infoHeader, textEl, size, numStacksRequired) {
	var stackRadius = BASE_PLATE_RADIUS * 0.975;
	
	canvas
		.clearCanvas()

		// base plate
		.drawArc({
			x: CENTER_X,
			y: CENTER_Y,
			radius: BASE_PLATE_RADIUS,
			strokeWidth: 1,
			strokeStyle: '#333',
			fillStyle: '#eee'
		});
	
	if (typeof(engineConfig) !== 'string') {
		if (engineConfig.numOuter > 0) {
			var outerAngle = 360 / engineConfig.numOuter;
			var angle = 0;
			for (var i = 0; i < engineConfig.numOuter; i++) {
				var radius = engineConfig.outer.size * stackRadius / size;
				var x = Math.cos(angle * Math.PI / 180) * (stackRadius - radius) + CENTER_X;
				var y = Math.sin(angle * Math.PI / 180) * (stackRadius - radius) + CENTER_Y;
				
				// engine
				canvas.drawArc({
					x: x,
					y: y,
					radius: radius,
					fillStyle: 'rgba(204, 119, 0, 0.8)'
				})
	
				angle += outerAngle;
			}
		}

		// central engine
		canvas.drawArc({
			x: CENTER_X,
			y: CENTER_Y,
			radius: engineConfig.central.size * stackRadius / size,
			fillStyle: 'rgba(204, 0, 0, 0.7)'
		});
	
		if (engineConfig.numOuter > 0) {
			var outerAngle = 360 / engineConfig.numOuter;
			var angle = 0;
			for (var i = 0; i < engineConfig.numOuter; i++) {
				var radius = engineConfig.outer.size * stackRadius / size;
				var textRadiusOffset = ((engineConfig.central.size + engineConfig.outer.size) >= size) ?
					(size - engineConfig.central.size) * stackRadius / 6 : 0;
				console.log("textRadiusOffset: " + textRadiusOffset);
				var x = Math.cos(angle * Math.PI / 180) * (stackRadius - radius + textRadiusOffset) + CENTER_X;
				var y = Math.sin(angle * Math.PI / 180) * (stackRadius - radius + textRadiusOffset) + CENTER_Y;
				
				// engine name
				canvas.drawText({
					x: x,
					y: y,
					text: engineConfig.outer.name,
					fillStyle: '#fff',
					fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
					fontSize: 12,
					maxWidth: radius * 0.9,
					lineHeight: 1.2
				});
	
				angle += outerAngle;
			}
		}
		
		// central engine name
		canvas.drawText({
			x: CENTER_X,
			y: CENTER_Y,
			text: engineConfig.central.name,
			fillStyle: '#fff',
			fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
			fontSize: 12,
			maxWidth: engineConfig.central.size * stackRadius / size * 0.9,
			lineHeight: 1.2
		});

		var html = '<h5>' + infoHeader + '</h5><ul><li>Stack size: ' + size + ' m</li>' +
			'<li>Center engine: ' + engineConfig.central.name.replace(/"/g, '&quot;') + '</li>';
		if (engineConfig.numOuter > 0) {
			html += '<li>Outer engines: ' + engineConfig.numOuter + 'x ' +
				engineConfig.outer.name.replace(/"/g, '&quot;') + '</li>';
		}
		html += '</ul><p>Stack thrust: ' + engineConfig.thrust + ' kN</p>';
		if (numStacksRequired > 1) {
			html += '<p><strong>Vessel requires ' + numStacksRequired + ' of these stacks in ' +
			'<a href="http://wiki.kerbalspaceprogram.com/wiki/Tutorial:Asparagus_Staging">&quot;asparagus&quot;-style</a> ' +
			'staging.</strong></p>';
		}
		textEl.empty().append($.parseHTML(html));
	} else {
		canvas.drawText({
			x: CENTER_X,
			y: CENTER_Y,
			text: engineConfig,
			fillStyle: '#000',
			fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
			fontSize: 15
		});
		textEl.empty();
	}
}

function addEnginePacks() {
	for (var idx in ENGINE_PACKS) {
		var enginePack = ENGINE_PACKS[idx];
		
		// radial engines are currently not supported
		var engines = [];
		for (var engineIdx in enginePack.engines) {
			var engine = enginePack.engines[engineIdx];
			if (!engine.radial) {
				engines.push(engine);
			}
		}
		enginePack.engines = engines;
		
		if (enginePack.engines.length > 0) {
			var html = '<label class="checkbox"><input type="checkbox" name="enginePacks" value="' +
				enginePack.name + '"';
			if (enginePack.name === 'kspStock') {
				html += ' checked="true"';
			}
			html += '/> ';
			if (typeof(enginePack.url) === 'string') {
				html += '<a href="' + enginePack.url + '">';
			}
			html += enginePack.title;
			if (typeof(enginePack.url) === 'string') {
				html += '</a>';
			}
			html += ' (' + enginePack.engines.length + ')</label>';
			$('#enginePacks').append($.parseHTML(html));
		}
	}
}


$(function() {
	addEnginePacks();
	
	$('#options').submit(function() {
		solve();
		return false;
	});
	
	solve();
});
