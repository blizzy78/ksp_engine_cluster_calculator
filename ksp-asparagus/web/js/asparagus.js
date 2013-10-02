"use strict";


var STACK_SIZES = [0.625, 1.25, 2.5, 3.75, 5];
var KERBIN_GRAVITY = 9.81;
var CANVAS_SIZE = 335;
var BASE_PLATE_RADIUS = CANVAS_SIZE / 2 - 1;
var CENTER_X = CANVAS_SIZE / 2;
var CENTER_Y = CANVAS_SIZE / 2;
var ENGINE_COLOR_CENTRAL = 'rgba(204, 0, 0, 0.7)';
var ENGINE_COLOR_OUTER = 'rgba(204, 119, 0, 0.8)';
var ENGINE_COLOR_RADIAL = '#008800';

var DEBUG = false;


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
		maxCentralRadialEngines: parseInt($('#options input[name="maxCentralRadialEngines"]').val()),
		maxBoosterOuterEngines: parseInt($('#options input[name="maxBoosterOuterEngines"]').val()),
		maxBoosterRadialEngines: parseInt($('#options input[name="maxBoosterRadialEngines"]').val()),
		calculateFor: $('#options select[name="calculateFor"]').val(),
		gravity: KERBIN_GRAVITY,
		enginePacks: enginePacks,
	};
	
	var worker = new Worker('js/solver.js');

	worker.addEventListener('message', function(e) {
		switch (e.data.type) {
			case 'result':
				handleSolverResult(e.data.rocketConfig, data.payloadMass, data.payloadFraction, data.gravity);
				break;
			
			case 'progress':
				handleSolverProgress(e.data.progressPercent, e.data.elapsedTime);
				break;
			
			case 'log':
				log(e.data.message);
				break;
		}
	}, false);

	worker.postMessage(data);
}

function handleSolverResult(rocketConfig, payloadMass, payloadFraction, gravity) {
	if (rocketConfig !== null) {
		var mass = payloadMass * 100 / payloadFraction;

		draw($('#centralConfig'), rocketConfig.central, 'Center Stack Layout',
				$('#centralDescription'), rocketConfig.centralSize);
		if (rocketConfig.numBoosters > 0) {
			draw($('#boosterConfig'), rocketConfig.booster, 'Booster Stack Layout', $('#boosterDescription'),
				rocketConfig.boosterSize, rocketConfig.numBoosters);
		} else {
			draw($('#boosterConfig'), '(not required)', null, $('#boosterDescription'), -1, 0);
		}
		
		var thrust = rocketConfig.thrust;
		var twr = thrust / mass / gravity;
		var html = '<h4>Vessel Totals</h4><ul>' +
			'<li>Mass: ' + (Math.round(mass * 10) / 10) + ' t ' +
			'(engines: ' + (Math.round(rocketConfig.mass * 10) / 10) + ' t)</li>' +
			'<li>Thrust: ' + Math.round(thrust) + ' kN</li>' +
			'<li>TWR: ' + (Math.round(twr * 100) / 100) + '</li>' +
			(DEBUG ? ('<li>TWR (engines): ' + (Math.round(rocketConfig.thrust / rocketConfig.mass * 100) / 100) + '</li>') : '') +
			'<li>Number of engines: ' + rocketConfig.numParts + '</li></ul>';
		$('#rocketTotals').empty().append($.parseHTML(html));
	} else {
		draw($('#centralConfig'), '(no solution)', null, $('#centralDescription'), -1);
		draw($('#boosterConfig'), '(no solution)', null, $('#boosterDescription'), -1);
		$('#rocketTotals').empty();
	}

	$('#options button[type="submit"]').removeAttr('disabled').text('Calculate');
	$('#options button[type="reset"]').removeAttr('disabled');
}

function handleSolverProgress(progressPercent, elapsedTime) {
	var totalTime = elapsedTime * 100 / progressPercent;
	var remainingTime = totalTime - elapsedTime;
	var remainingSeconds = remainingTime / 1000;
	var remainingMinutes = Math.floor(remainingSeconds / 60);
	remainingSeconds = Math.round(remainingSeconds - remainingMinutes * 60);
	remainingSeconds = '0' + remainingSeconds;
	remainingSeconds = remainingSeconds.substr(remainingSeconds.length - 2, 2)
	$('#options button[type="submit"]').text(Math.round(progressPercent) + '% - ' +
		remainingMinutes + ':' + remainingSeconds + ' min');
}

function draw(canvas, engineConfig, infoHeader, textEl, size, numStacksRequired) {
	var basePlateRadius = BASE_PLATE_RADIUS;
	
	if (typeof(engineConfig) !== 'string') {
		if (engineConfig.numRadial > 0) {
			basePlateRadius = BASE_PLATE_RADIUS * 0.79;
		}
		
		canvas
			.clearCanvas()
	
			// base plate
			.drawArc({
				x: CENTER_X,
				y: CENTER_Y,
				radius: basePlateRadius,
				strokeWidth: 1,
				strokeStyle: '#333',
				fillStyle: '#eee'
			});

		var stackRadius = basePlateRadius * 0.975;
		var radialSpacing = basePlateRadius - stackRadius;

		if (engineConfig.numOuter > 0) {
			var outerAngle = 360 / engineConfig.numOuter;
			// start at the top
			var angle = 270;
			for (var i = 0; i < engineConfig.numOuter; i++) {
				var radius = engineConfig.outer.size * stackRadius / size;
				var x = Math.cos(angle * Math.PI / 180) * (stackRadius - radius) + CENTER_X;
				var y = Math.sin(angle * Math.PI / 180) * (stackRadius - radius) + CENTER_Y;
				
				// engine
				canvas.drawArc({
					x: x,
					y: y,
					radius: radius,
					fillStyle: ENGINE_COLOR_OUTER
				})
	
				angle += outerAngle;
			}
		}
		
		if (engineConfig.numRadial > 0) {
			var outerAngle = 360 / engineConfig.numRadial;
			// start at the top
			var angle = 270;
			for (var i = 0; i < engineConfig.numRadial; i++) {
				// show radial engines as being always exactly 0.625 m in size on a 5 m stack
				var radius = 0.625 * stackRadius / 5;
				var x = Math.cos(angle * Math.PI / 180) * (basePlateRadius + radialSpacing + radius) + CENTER_X;
				var y = Math.sin(angle * Math.PI / 180) * (basePlateRadius + radialSpacing + radius) + CENTER_Y;
				
				// engine
				canvas.drawArc({
					x: x,
					y: y,
					radius: radius,
					fillStyle: ENGINE_COLOR_RADIAL
				})
	
				angle += outerAngle;
			}
		}

		// central engine
		canvas.drawArc({
			x: CENTER_X,
			y: CENTER_Y,
			radius: engineConfig.central.size * stackRadius / size,
			fillStyle: ENGINE_COLOR_CENTRAL
		});
	
		if (engineConfig.numOuter > 0) {
			var outerAngle = 360 / engineConfig.numOuter;
			// start at the top
			var angle = 270;
			for (var i = 0; i < engineConfig.numOuter; i++) {
				var radius = engineConfig.outer.size * stackRadius / size;
				var textRadiusOffset =
					(((engineConfig.central.size + engineConfig.outer.size) >= size) &&
							(engineConfig.central.size < size)) ?
						(size - engineConfig.central.size) / 2 * stackRadius / size :
						0;
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

		var random = Math.round(Math.random() * 100000000);
		var html = '<h4>' + infoHeader + '</h4><ul><li>Stack size: ' + size + ' m</li>' +
			'<li>Center engine: <span id="stack_' + random + '_central" class="engineTooltip">' +
			escapeHTML(engineConfig.central.name) + '</span></li>';
		if (engineConfig.numOuter > 0) {
			html += '<li>Outer engines: ' + engineConfig.numOuter + 'x ' +
				'<span id="stack_' + random + '_outer" class="engineTooltip">' + 
				escapeHTML(engineConfig.outer.name) + '</span></li>';
		}
		if (engineConfig.numRadial > 0) {
			html += '<li>Radial engines: ' + engineConfig.numRadial + 'x ' +
				'<span id="stack_' + random + '_radial" class="engineTooltip">' + 
				escapeHTML(engineConfig.radial.name) + '</span></li>';
		}
		html += '</ul><p>Stack thrust: ' + engineConfig.thrust + ' kN</p>';
		if (numStacksRequired > 1) {
			html += '<p><strong>Vessel requires ' + numStacksRequired + ' of these stacks in ' +
			'<a href="http://wiki.kerbalspaceprogram.com/wiki/Tutorial:Asparagus_Staging">&quot;asparagus&quot;-style</a> ' +
			'staging.</strong></p>';
		}
		textEl.empty().append($.parseHTML(html));
		createEngineTooltip('#stack_' + random + '_central', engineConfig.central);
		if (engineConfig.numOuter > 0) {
			createEngineTooltip('#stack_' + random + '_outer', engineConfig.outer);
		}
		if (engineConfig.numRadial > 0) {
			createEngineTooltip('#stack_' + random + '_radial', engineConfig.radial);
		}
	} else {
		canvas
			.clearCanvas()
	
			// base plate
			.drawArc({
				x: CENTER_X,
				y: CENTER_Y,
				radius: basePlateRadius,
				strokeWidth: 1,
				strokeStyle: '#333',
				fillStyle: '#eee'
			})
			
			.drawText({
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

function createEngineTooltip(selector, engine) {
	$(selector).tooltip({
		title: '<h6><strong>' + escapeHTML(engine.name) + '</strong></h6>' +
			'<p><em>' + escapeHTML(engine.pack.title) + '</em></p>' +
			'<p>' +
			'Thrust: ' + engine.thrust + ' kN<br/>' +
			'Mass: ' + engine.mass + ' t<br/>' +
			(!engine.radial ? 'Size: ' + engine.size + ' m' : 'Mounted radially') + '<br/>' +
			(engine.vectoring ? 'Thrust vectoring' : 'No thrust vectoring') +
			'</p>',
		html: true,
		placement: 'right',
		container: 'body'
	});
}

function addEnginePacks() {
	for (var idx in ENGINE_PACKS) {
		var enginePack = ENGINE_PACKS[idx];
		
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

function log(message) {
	if (DEBUG && (typeof(console.log) !== 'undefined')) {
		console.log(message);
	}
}

function escapeHTML(s) {
	var entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;'
	};
	
	return String(s).replace(/[&<>"]/g, function(c) {
		return entityMap[c];
	});
}


$(function() {
	addEnginePacks();
	
	$('#options').submit(function() {
		solve();
		return false;
	});
	
	solve();
});
