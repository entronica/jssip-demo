var $ = jqLite = typeof jQuery != "undefined" ? jQuery : (typeof angular != "undefined" ? angular.element : undefined);
if (jqLite && jqLite === angular.element) {
	jqLite.extend = angular.extend;
}

var waitForCondition = function(condition, callback, interval, tries) {
	if (!interval) {
		interval = 1000;
	}
	if (condition() === true) {
		callback();
	} else {
		if (tries === 0) {
			return;
		}
		var that = this;
		setTimeout(function () {
			waitForCondition(condition, callback, interval, isNaN(tries) ? tries : tries - 1);
		}, interval);
	}
};

// Only used by forEach
var includes = function(bwlist, element) {
	if (!bwlist) {
		return false;
	}
	if (typeof bwlist === "function") {
		return bwlist(element);
	}
	if (bwlist.indexOf) {
		return bwlist.indexOf(element) >= 0;
	}
	return false;
}

module.exports = {
	jqLite: jqLite,

	/** Removes the given element from this array.
	 * @param element the element to be searched 
	 * @return the index of the first element removed 
	 */
	remove: function(array, element) {
		var idx = array.indexOf(element);
		var firstIndex = idx;
		while (idx >= 0) {
			array.splice(idx, 1);
			idx = array.indexOf(element);
		}
		return firstIndex;
	},
	
	/** Adds all elements from the second array to the first one. Unlike concat this modifies the first argument. 
	 * @return the first array
	 */
	addAll: function(targetArray, sourceArray) {
		for (var i = 0; i < sourceArray.length; i++) {
			targetArray.push(sourceArray);
		}
		return targetArray;
	},

	/**
	 * Generates a random integer in the given range.
	 * @param min the minimum value to be generated, inclusive
	 * @param max the maximum value to be generated, exclusive
	 */
	randomInt : function(min, max) {  
		return Math.floor(Math.random() * (max - min)) + min;  
	},

	/**
	 * Function for including a JS script into the page
	 * @param src script inline code when "inline" parameter is true, otherwise the script URL should be provided
	 * @param options a set of options to include the script
	 * - inline if it holds {@code true} value, the first parameter is considered the script code. If not
	 * specified, false, then the first parameter is considered the script URL. 
	 * - defer if true, it defers the load of the script
	 * - onload|onLoad a function that it will be executed, when the script is loaded
	 * @return script node 
	 */
	includeScript : function(src, options) {
		// don't use jQuery/Zepto - they have different bugs when inserting scripts
		// scripts are not getting executed or "onLoad" script event is not triggered
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");

		if (options && options.inline === true) {
			if (script.innerHTML) {
				script.innerHTML = src;
			} else {
				script.text = src;
			}
		} else {
			script.setAttribute("src", src);
		}

		if (options) {	
			if (options.defer === true) {
				script.setAttribute("defer", "defer");
			}

			if (options.id) {
				script.setAttribute("id", options.id);
			}

			if (options.onload || options.onLoad) {
				$(script).on("load", options.onload || options.onLoad);
			}			
		}
		document.getElementsByTagName("HEAD")[0].appendChild(script);
		return script;
	},

	/**
	 * Return the CSS code for defining a custom font. This code can be embedded inside a style tag.
	 * @param fontName the font name
	 * @param fontFilePrefix the prefix for the font files
	 * @param fontWeight the font weight, if not specified then normal
	 * @param fontStyle the font style, if not specified then normal
	 * @returns CSS code
	 */
	getCustomFontCss : function(fontName, fontFilePrefix, fontWeight, fontStyle) {
		fontWeight = fontWeight || "normal";
		fontStyle = fontStyle || "normal";
		return "@font-face {"
				+ "font-family: " + fontName + ";"
				+ "src: url('" + fontFilePrefix + "-eot.eot');"
				+ "src: url('" + fontFilePrefix + "-eot.eot?#iefix') format('embedded-opentype'),"
				+ "url('" + fontFilePrefix + "-woff.woff') format('woff'),"
				+ "url('" + fontFilePrefix + "-ttf.ttf') format('truetype');"
				+ "font-weight: " + fontWeight + ";"
				+ "font-style: " + fontStyle + ";"
				+ "}";
	},

	escapeQuotes : function(str) {
		str = str.replace(/"/g, '\\"');
		return str;
	},

	toTitleCase : function (str) {
		return str ? str.charAt(0).toUpperCase() + str.substring(1) : str;
	},
	
	findAll: function (needle, haystack, caseSensitive) {
		var indices = [], startIndex = 0, needleLength = needle.length;
		if (caseSensitive !== true) {
			haystack = haystack.toLowerCase();
			needle = needle.toLowerCase();
		}
		while ((index = haystack.indexOf(needle, startIndex)) > -1) {
			indices.push(index);
			startIndex = index + needleLength;
		}
		return indices;
	},

	isString: function(str) {
		return (typeof str == 'string' || str instanceof String);
	},
	
	isInt: function(n){
		return Number(n) === n && n % 1 === 0;
	},

	isFloat: function(n){
		return n === Number(n) && n % 1 !== 0;
	},
	
	regExpEscape : function(value) {
		return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	},
	
	extendClass : function(child, parent) {
		for (var p in parent.prototype) {
			if (parent.prototype.hasOwnProperty(p)) {
				child.prototype[p] = parent.prototype[p];
			}
		}
	}
	
	, waitForCondition: waitForCondition, 
	
	/** Waits until the given object's property will have the specified value.
	 * @param obj the object to be tested
	 * @param property the property name
	 * @param value the desired value to wait for
	 * @param callback what is happening when the property meets the value
	 * @param interval the time interval in milliseconds to poll the property, by default 1000 (1 second)
	 * @param tries the number of tries to poll the property, undefined or null for infinite, by default infinite 
	 */
	waitForProperty: function(obj, property, value, callback, interval, tries) {
		waitForCondition(function() {
			return (obj[property] === value);
		}, callback, interval, tries);
	}, 
	
	/**
	 * Moves the caret inside a text input element (INPUT[type='text'] or TEXTAREA) to the end.
	 */
	moveCaretToEnd: function(el) {
		if (typeof el.selectionStart == "number") {
			el.selectionStart = el.selectionEnd = el.value.length;
		} else if (typeof el.createTextRange != "undefined") {
			el.focus();
			var range = el.createTextRange();
			range.collapse(false);
			range.select();
		}
	},
	
	/**
	 * Creates a comparator function based on the given property
	 * @param propertyName the property used to compare objects by the created comparator
	 * @return a comparator function that can be passed as a parameter to Array.sort() method. 
	 */
	comparatorByProperty: function(propertyName) {
		return function(a, b) {
			return a[propertyName] - b[propertyName];
		};
	},

	comparatorByMethod: function(methodName) {
		return function(a, b) {
			return a[methodName]() - b[methodName]();
		};
	},

	comparatorByFunction: function(func) {
		return function(a, b) {
			return func(a) - func(b);
		};
	},

	reverseComparator: function(comparator) {
		return function(a, b) {
			return -comparator(a, b);
		};
	},

	/**
	 * Tries to convert a given string to a boolean or integer. If unsuccessful returns the string
	 * @param value the value
	 * @returns the converted type or the original object if it cannot convert
	 */
	guessType: function(value) {
		if (value === undefined || value === null || !value.split) {
			return value;
		}
		if (value === "true") {
			return true;
		}
		if (value === "false") {
			return false;
		}
		var r = parseInt(value, 10);
		if (!isNaN(r) && r.toString() == value) {
			return r;
		}
		r = parseFloat(value, 10);
		if (!isNaN(r) && r.toString() == value) {
			return r;
		}
		return value;
	},

	/**
	 * @param obj the object for which we iterate the properties
	 * @param callback the callback function called for each property (similar to Array.forEach()). It must accept three arguments
	 * - value the value of the property
	 * - name the name of the property (in Array.forEach() the second argument is the index)
	 * - obj the object owning the property (in Array.forEach() the third argument is the array itself) 
	 * @param options
	 * - onlyOwnProperties: If true, only properties of this object will be included. By default, true.
	 * - skipFunctions: if true, the properties of which values are functions will be excluded. By default, true.
	 * - whitelist: an array or function used to include properties. 
	 * If an array, all the strings in the array are property names to be included. 
	 * If a function, then the function will be called for each property and the property will be included if the returned value is true.
	 * If not specified, all properties will be included. If specified, only those properties will be included. 
	 * - blacklist: an array or function used to exclude properties. 
	 * If an array, all the strings in the array are property names to be excluded. 
	 * If a function, then the function will be called for each property and the property will be excluded if the returned value is true.
	 * If not specified, no properties will be excluded. 
	 * - comparator: a comparator function similar to the ones passed to Array.sort, used to sort properties in the order in which they will be
	 * passed to the callback function
	 */
	forEach: function(obj, callback, options) {
		options = options || {};
		var props = [];
		for (var p in obj) {
			if (options.onlyOwnProperties === false && !obj.hasOwnProperty(p)) {
				continue;
			}
			if (options.skipFunctions !== false && (typeof obj[p] === "function")) {
				continue;
			}
			if (options.whitelist && !includes(options.whitelist, p)) {
				continue;
			}
			if (options.blacklist && includes(options.blacklist, p)) {
				continue;
			}
			props.push(p);
		}
		props.sort(options.comparator);
		for (var i = 0; i < props.length; i++) {
			callback(obj[props[i]], props[i], obj);
		}
	}
};
