"use strict";


var STACK_SIZES = [0.625, 1.25, 2.5, 3.75, 5];
var KERBIN_GRAVITY = 9.81;
var CANVAS_SIZE = 335;
var BASE_PLATE_RADIUS = CANVAS_SIZE / 2 - 1;
var CENTER_X = CANVAS_SIZE / 2;
var CENTER_Y = CANVAS_SIZE / 2;

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
		maxBoosterOuterEngines: parseInt($('#options input[name="maxBoosterOuterEngines"]').val()),
		gravity: KERBIN_GRAVITY,
		enginePacks: enginePacks
	};
	var calculateFor = $('#options select[name="calculateFor"]').val();
	
	var worker = new Worker('js/solver.js');

	worker.addEventListener('message', function(e) {
		switch (e.data.type) {
			case 'result':
				var rocketConfigs = e.data.rocketConfigs;
				if (rocketConfigs.length > 0) {
					var mass = data.payloadMass * 100 / data.payloadFraction;

					var rocketConfig;
					switch (calculateFor) {
						case 'twr':
							rocketConfig = $(rocketConfigs).max(function(rocketConfig) {
								return rocketConfig.thrust / mass
							});
							break;

						case 'engineTWR':
							rocketConfig = $(rocketConfigs).max(function(rocketConfig) {
								return rocketConfig.thrust / rocketConfig.mass;
							});
							break;
							
						case 'numParts':
							rocketConfig = $(rocketConfigs).min(function(rocketConfig) {
								return rocketConfig.numParts;
							});
							break;
					}
	
					draw($('#centralConfig'), rocketConfig.central, 'Central Stack Layout',
							$('#centralDescription'), rocketConfig.centralSize);
					if (rocketConfig.numBoosters > 0) {
						draw($('#boosterConfig'), rocketConfig.booster, 'Booster Stack Layout', $('#boosterDescription'),
							rocketConfig.boosterSize, rocketConfig.numBoosters);
					} else {
						draw($('#boosterConfig'), '(not required)', null, $('#boosterDescription'), -1, 0);
					}
					
					var thrust = rocketConfig.thrust;
					var twr = thrust / mass / data.gravity;
					var html = '<h4>Vessel Totals</h4><ul>' +
						'<li>Mass: ' + (Math.round(mass * 10) / 10) + ' t ' +
						'(engines: ' + (Math.round(rocketConfig.mass * 10) / 10) + ' t)</li>' +
						'<li>Thrust: ' + Math.round(thrust) + ' kN</li>' +
						'<li>TWR: ' + (Math.round(twr * 100) / 100) + '</li>' +
						'<li>Number of engines: ' + rocketConfig.numParts + '</li></ul>';
					$('#rocketTotals').empty().append($.parseHTML(html));
				} else {
					draw($('#centralConfig'), '(no solution)', null, $('#centralDescription'), -1);
					draw($('#boosterConfig'), '(no solution)', null, $('#boosterDescription'), -1);
					$('#rocketTotals').empty();
				}
		
				$('#options button[type="submit"]').removeAttr('disabled').text('Calculate');
				$('#options button[type="reset"]').removeAttr('disabled');
				break;
			
			case 'progress':
				$('#options button[type="submit"]').text(e.data.progressPercent + '%');
				break;
			
			case 'log':
				log(e.data.message);
				break;
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
//				log("textRadiusOffset: " + textRadiusOffset);
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
			engineConfig.central.name.replace(/"/g, '&quot;') + '</span></li>';
		if (engineConfig.numOuter > 0) {
			html += '<li>Outer engines: ' + engineConfig.numOuter + 'x ' +
				'<span id="stack_' + random + '_outer" class="engineTooltip">' + 
				engineConfig.outer.name.replace(/"/g, '&quot;') + '</span></li>';
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

function createEngineTooltip(selector, engine) {
	$(selector).tooltip({
		title: '<h6><strong>' + escapeHTML(engine.name) + '</strong></h6>' +
			'<p><em>' + escapeHTML(engine.pack.title) + '</em></p>' +
			'<p>' +
			'Thrust: ' + engine.thrust + ' kN<br/>' +
			'Mass: ' + engine.mass + ' t<br/>' +
			'Size: ' + engine.size + ' m<br/>' +
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

function log(message) {
	if (DEBUG && (typeof(console.log) !== 'undefined')) {
		console.log(message);
	}
}

function escapeHTML(s) {
	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;'
	};
	
	return String(s).replace(/[&<>"]/g, function(c) {
		return entityMap[c];
	});
}


$(function() {
	$.fn.extend({
		min: function(valueCallback) {
			var numElements = this.length;
			if (numElements >= 2) {
				var minElement = this[0];
				var minValue = valueCallback(minElement);
				for (var i = 1; i < numElements; i++) {
					var element = this[i];
					var value = valueCallback(element);
					if (value < minValue) {
						minElement = element;
						minValue = value;
					}
				}
				return minElement;
			} else if (numElements === 1) {
				return this[0];
			} else {
				return null;
			}
		},

		max: function(valueCallback) {
			var numElements = this.length;
			if (numElements >= 2) {
				var maxElement = this[0];
				var maxValue = valueCallback(maxElement);
				for (var i = 1; i < numElements; i++) {
					var element = this[i];
					var value = valueCallback(element);
					if (value > maxValue) {
						maxElement = element;
						maxValue = value;
					}
				}
				return maxElement;
			} else if (numElements === 1) {
				return this[0];
			} else {
				return null;
			}
		}
	});
	
	
	addEnginePacks();
	
	$('#options').submit(function() {
		solve();
		return false;
	});
	
	solve();
});
