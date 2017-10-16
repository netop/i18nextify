"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.debounce = debounce;
exports.getAttribute = getAttribute;
function debounce(func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
		    args = arguments;
		var later = function later() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function getAttribute(node, attr) {
	return node.properties && node.properties.attributes && node.properties.attributes[attr];
}