//
// This file is part of Smoothie.
//
// Smoothie is free software: you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Smoothie is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
// details.You should have received a copy of the GNU Lesser General Public
// License along with Smoothie.  If not, see <http://www.gnu.org/licenses/>.
//
////////////////////////////////////////////////////////////////////////////////

// NOTE The load parameter points to the function, which prepares the
//      environment for each module and runs its code. Scroll down to the end of
//      the file to see the function definition.
(function(load) { 'use strict';

// INFO Module paths
var paths = window.smoothie&&window.smoothie.requirePaths?window.smoothie.requirePaths.slice(0):['./'];
// INFO Module path (0 = current)
var pwd = Array('');
// INFO Module cache
var cache = new Object();
// INFO Path parser
var parser = document.createElement('A');

function require(identifier, callback) {
	var module = resolve(identifier);

	if (cache[module.id]) {
		if (typeof cache[module.id] === 'function')
			load(module, cache, pwd, cache[module.id]);
		// NOTE The callback should always be called asynchronously to ensure
		//      that a cached call won't differ from an uncached one.
		callback && setTimeout(function(){callback(cache[module.id])}, 0);
		return cache[module.id];
	}

	var request = new XMLHttpRequest();
	request.open('GET', module.uri, !!callback);
	request.send();
	cache[module.id] = null;	
	request.onload = callback?onLoad:onLoad();
	return cache[module.id];
	
	function onLoad() {
		if (request.status != 200)
			throw 'require() exception: GET '+module.uri+' '+request.status+' ('+request.statusText+')';
		if (!cache[module.id]) { 
			load(module, cache, pwd, 'function(){\n'+request.responseText+'\n}');
		}
		callback && callback(cache[module.id]);
	}
}

function resolve(identifier) {
	var m = identifier.match(/^(?:([^:\/]+):)?(\.\.?)?\/?((?:.*\/)?)([^\.]+)?(\..*)?$/);
	var p = pwd[0].match(/^(?:([^:\/]+):)?(.*)/);
	parser.href = '/'+((m[2]?p[2]+m[2]+'/':'')+m[3])+(m[4]?m[4]:'index');
	return {
		'id': (parseInt(m[1])>0?m[1]+':':'')+parser.href.replace(/^[^:]*:\/\/[^\/]*\/|\/(?=\/)/g, ''),
		'uri': paths[p[1]?parseInt(p[1]):m[1]?parseInt(m[1]):0]+parser.href.replace(/^[^:]*:\/\/[^\/]*\//, '')+(m[5]?m[5]:'.js')
	};
}

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';

// NOTE Older browsers (including IE8) don't know about defineProperty, so we
//      have to use the unsave method as fallback in these cases.
try {
	Object.defineProperty(require, 'resolve', {'value':resolve,'writable':false,'configurable':false});
	Object.defineProperty(require, 'paths', {'get':function(){return paths.slice(0);},'configurable':false});
	Object.defineProperty(window, 'require', {'value':require,'writable':false,'configurable':false});
}
catch(e) {
	require.resolve = resolve;
	window.require = require;
}

// INFO Module loader
// NOTE This functions is defined as an anonymous function, which is passed a
//      a parameter to the closure above to provide a clean environment (only
//      global variables, module and exports) for the loaded module. This is
//      also the reason why 'source', 'pwd' & 'cache' are not named parameters.
})(function(module/*, cache, pwd, source*/) {
	var exports = arguments[1][module.id] = new Object();
	arguments[2].unshift(module.id.match(/(?:.*\/)?/)[0]);
	eval('('+arguments[3]+')();\n//@ sourceURL='+module.uri+'\n');
	// NODE Add modules into cache if loaded file is a bundle
	if (typeof module.id !== 'String')
		for (id in module)
			arguments[1][require.resolve(id).id] = module[id];
	arguments[2].shift();
});
