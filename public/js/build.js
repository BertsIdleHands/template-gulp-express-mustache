(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

(function () {
    var method;
    var noop = function noop() {};
    var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'];
    var length = methods.length;
    var console = window.console = window.console || {};

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
})();

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

var wasSetup = false;

exports.init = function () {
	$('#thank-you').hide();
	$('#alreadyPlayedError').hide();
	$('#contact-details > div').removeClass('vertical-center');
	if (wasSetup) return;
	$('input[name="postal"], input[name="answerTiebreaker"]').numeric();
	$('form').bind('submit', onSubmit);
	wasSetup = true;
};

function onSubmit(event) {
	event.preventDefault();
	$('#alreadyPlayedError').hide();

	if (isValid()) {
		var data = $('form').serializeObject();
		data.game = global.game;
		data.optin = data.optin == "on";
		data.answerQuestion1 = global.selectAnswer;
		//do the answer sorting
		for (var i = 0; i < global.matchAnswers.length; i++) {
			global.matchAnswers[i] = global.matchAnswers[i].sort();
		};

		global.matchAnswers = global.matchAnswers.sort(function (a, b) {
			return a[0] - b[0];
		});

		data.answerQuestion2 = JSON.stringify(global.matchAnswers).replace(/ /g, '');

		$.post('/' + currentLanguage + '/participate', data, function (response) {
			if (response.error) {
				$('input[type="submit"]').css('background-color', 'red').velocity({
					"backgroundColor": '#142e67'
				}, { duration: 600 });
				$('#alreadyPlayedError').show().css('color', 'red').velocity({
					"color": '#ffffff'
				}, { duration: 600 });
			} else {
				$('form').hide();
				$('#contact-details > div').addClass('vertical-center');
				$('#thank-you').show();
			}
		});
	}
}

function isValid() {
	var isValid = true;
	$('.invalid').removeClass('invalid');
	$('input[type="text"]:not(.not-required)').each(function () {
		if ($(this).val() == '') {
			isValid = false;
			$(this).css('background-color', 'red').velocity({
				"backgroundColor": '#ffffff'
			}, { duration: 600 });
		}
	});

	if (!validateEmail($('input[name="email"]').val())) {
		isValid = false;
		$('input[name="email"]').css('background-color', 'red').velocity({
			"backgroundColor": '#ffffff'
		}, { duration: 600 });
	}

	if (!$('#rules').is(':checked')) {
		isValid = false;
		$('label[for="rules"]').css('background-color', 'red').velocity({
			"backgroundColorAlpha": '0'
		}, { duration: 600 });
	}

	return isValid;
}

function validateEmail(email) {
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return re.test(email);
}

$.fn.serializeObject = function () {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function () {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

require('./console-support');
var scroller = require('./side-scroller');
var minScroller = require('./minimal-scroller');
var form = require('./form');

$(function () {
	scroller.init();
	minScroller.init();
	global.scrollTo = scroller.scrollTo;
	global.initForm = form.init;
});

global.selectAnswer = -1;
global.matchAnswers = [];
global.game = "";

$('#match-button').click(function (e) {
	e.preventDefault();
	var id1 = $('#top-selector .active').remove().attr('id');
	var id2 = $('#bottom-selector .active').remove().attr('id');
	minScroller.init();
	global.matchAnswers.push([parseInt(id1), parseInt(id2)]);
	if (global.matchAnswers.length == 4) {
		initForm();
		scrollTo('#contact-details');
	}
});

$('a[href="#question-2"]').click(function (e) {
	e.preventDefault();
	global.selectAnswer = $('#first-question .active').attr('id');
});

$('#intro-right a').click(function (e) {
	var logo1 = $(this).find('img.orig-logo-player1').attr('src');
	var logo2 = $(this).find('img.orig-logo-player2').attr('src');
	var player1 = $(this).find('.orig-player1-name').text();
	var player2 = $(this).find('.orig-player2-name').text();
	var date = $(this).find('.date').text();

	$('img.logo-player1').attr('src', logo1);
	$('img.logo-player2').attr('src', logo2);
	$('.player1-name').text(player1);
	$('.player2-name').text(player2);
	$('.game-date').text(date);

	global.game = [date, player1, player2].join(' - ');
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./console-support":1,"./form":2,"./minimal-scroller":4,"./side-scroller":5}],4:[function(require,module,exports){
'use strict';

exports.init = function () {
	$('.slider').each(function () {
		var currentIndex = 0;

		var slider = $(this);
		var content = slider.find('.content');
		var items = content.find('> *');

		content.velocity({ translateX: 0 }, { duration: 0 });

		var first = $(items[0]);
		first.addClass('active');

		var origH = first.height();
		var origW = first.width();
		var ratio = origH / origW;

		$(window).resize(sizeIt);sizeIt();
		updateArrows();

		function sizeIt() {
			var w = slider.width();
			var h = w * ratio;

			$(items).width(w).height(h);
			slider.height(h).find('.clipper').height(h);
			content.width(w * items.length);

			if (currentIndex > 0) scrollTo(items[currentIndex], false);
		}

		slider.find('.arrow.right').unbind('click').click(function (e) {
			e.preventDefault();
			currentIndex++;
			scrollTo(items[currentIndex]);
			updateArrows();
		});

		slider.find('.arrow.left').unbind('click').click(function (e) {
			e.preventDefault();
			currentIndex--;
			scrollTo(items[currentIndex]);
			updateArrows();
		});

		function scrollTo(elem) {
			var animate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

			var targetPosition = $(elem).position().left;
			$(items).removeClass('active');
			$(elem).addClass('active');

			content.velocity({
				translateX: targetPosition == 0 ? 0 : -targetPosition
			}, {
				duration: animate ? 600 : 0,
				easing: 'ease-in-out'
			});
		}

		function updateArrows() {
			slider.find('.arrow').show();

			if (currentIndex == 0) slider.find('.arrow.left').hide();
			if (currentIndex == items.length - 1) slider.find('.arrow.right').hide();
		}
	});
};

},{}],5:[function(require,module,exports){
'use strict';

var windowW, sectionW, midBarW, totalW, numberOfSections;
var sectionPercentage = 1;
var slideSpeed = 500;
var currentPanel;

var backgroundLength, neededBackgroundLength, backgroundStart, bgCor, bgTarget, bgRest;

exports.init = function () {
	midBarW = $('#white-bar-holder').width();
	$('a.scroll').click(function (e) {
		e.preventDefault();
		scrollTo($(this).attr('href'));
	});
	backgroundLength = $('#parallaxBackground').width();
	$(window).resize(resize);resize();
};

function resize() {
	windowW = window.innerWidth;

	if (windowW < 650) {
		resizeMobile();
		return;
	} else {
		midBarW = $('#white-bar-holder').width();
		$('#white-bar, #white-bar-holder').show();
	}

	//Intro Panels
	totalW = 0;
	$('#intro-left, #intro-right').width((windowW - midBarW) / 2);
	totalW += windowW;

	//Standard sections
	sectionW = windowW * sectionPercentage - midBarW;
	numberOfSections = $('section:gt(3)').width(sectionW).length;
	$($('section:gt(3)')[numberOfSections - 1]).width(windowW - midBarW);
	totalW += numberOfSections * (sectionW - 1) + windowW - midBarW;
	$('#content').width(totalW);

	//Background measureMents
	backgroundStart = $('#question-1').position().left;
	$('#parallaxBackground').css('left', backgroundStart);
	neededBackgroundLength = sectionW * 3;
	bgCor = backgroundLength / neededBackgroundLength;
	bgRest = neededBackgroundLength - backgroundLength;

	//Scroll offset
	if (currentPanel) scrollTo(currentPanel, false);else $('#white-bar').show().velocity({ translateX: $('#intro-left').width() }, { duration: 0 });
}

function resizeMobile() {
	midBarW = 0;
	var numberOfSections = $('section:not(#white-bar-holder, #white-bar)').width(windowW).length;
	totalW = windowW * numberOfSections;
	$('#content').width(totalW);

	$('#white-bar, #white-bar-holder').hide();

	//Background measureMents
	backgroundStart = $('#question-1').position().left;
	$('#parallaxBackground').css('left', backgroundStart);
	neededBackgroundLength = windowW * 3;
	bgCor = backgroundLength / neededBackgroundLength;
	bgRest = neededBackgroundLength - backgroundLength;

	//Scroll offset
	if (currentPanel) scrollTo(currentPanel, false);
}

exports.scrollTo = scrollTo;

function scrollTo(id) {
	var animate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

	id = id == 'back' ? back() : id;

	//GOOGLE TRACKING
	if (dataLayer) {
		dataLayer.push({
			'event': 'VirtualPageview',
			'virtualPageURL': '/' + currentLanguage + '/' + id,
			'virtualPageTitle': id
		});
	}

	var targetPosition = $(id).position().left;
	currentPanel = id;
	bgTarget = 0;

	$('#white-bar .back')[targetPosition > 0 ? 'show' : 'hide']();
	$('#white-bar #gradient')[targetPosition > 0 ? 'hide' : 'show']();

	if (targetPosition > backgroundStart) {
		var panel = Math.round((targetPosition - backgroundStart) / sectionW);
		if (panel == 1) {
			bgTarget = targetPosition - backgroundStart + (sectionW - backgroundLength) / 2;
		}
		if (panel == 2) {
			bgTarget = targetPosition - backgroundStart + (windowW - backgroundLength);
		}
	}

	$('#content').velocity({
		translateX: targetPosition == 0 ? 0 : -(targetPosition - midBarW)
	}, {
		duration: animate ? slideSpeed : 0,
		easing: 'ease-in-out'
	});

	$('#parallaxBackground').velocity({
		translateX: bgTarget
	}, {
		duration: animate ? slideSpeed : 0,
		easing: 'ease-in-out'
	});

	$('#white-bar').velocity({
		translateX: targetPosition == 0 ? $('#intro-left').width() : targetPosition - midBarW
	}, {
		duration: animate ? slideSpeed : 0,
		easing: 'ease-in-out'
	});
}

function back() {
	if (currentPanel == '#confirm') {
		return '#intro-left';
	} else {
		return '#' + $(currentPanel).prev().attr('id');
	}
}

},{}]},{},[3])


//# sourceMappingURL=build.js.map
