(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("GetSheetDone", [], factory);
	else if(typeof exports === 'object')
		exports["GetSheetDone"] = factory();
	else
		root["GetSheetDone"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildUrl = buildUrl;
exports.parseRawCells = parseRawCells;
exports.parseLabeledCols = parseLabeledCols;
exports.parseLabeledRowsCols = parseLabeledRowsCols;
exports.raw = raw;
exports.labeledCols = labeledCols;
exports.labeledColsRows = labeledColsRows;
function buildUrl(id, sheetNum, mode) {
  return 'https://spreadsheets.google.com/feeds/' + mode + '/' + id + '/' + sheetNum + '/public/values?alt=json';
}

// Generic fetch and parse function
function fetchAndParse(id, sheetNum, type, parseEntries) {
  if (id.length === 0) {
    return Promise.reject(new Error('empty id'));
  }
  var url = buildUrl(id, sheetNum, type);
  return new Promise(function (resolve, reject) {
    fetch(url).then(function (response) {
      return response.json();
    }).then(function (json) {
      var data = parseEntries(json.feed.entry);
      var res = {
        title: json.feed.title.$t,
        updated: json.feed.updated.$t,
        data: data
      };
      resolve(res);
    }).catch(function (ex) {
      reject(ex);
    });
  });
}

function parseRawCells(entries) {
  var data = [];
  entries.forEach(function (cell) {
    var row = parseInt(cell.gs$cell.row, 10) - 1;
    var col = parseInt(cell.gs$cell.col, 10) - 1;
    var content = cell.gs$cell.$t;
    if (data[row] === undefined) {
      data[row] = [];
    }
    data[row][col] = content;
  });
  return data;
}

/**
 * Use for table with labels only for columns
 */
function parseEntry(entry) {
  var res = {};
  Object.keys(entry).forEach(function (key) {
    if (key.indexOf('gsx$') === 0) {
      var label = key.substr(4);
      res[label] = entry[key].$t;
    }
  });
  return res;
}

/**
 * Parser for table where just the columns are labeled
 * @return array of objects where the labels are keys
 */
function parseLabeledCols(entries) {
  return entries.map(function (entry) {
    return parseEntry(entry);
  });
}

/**
 * Use for table with labels for rows AND columns
 * Example input: "bar: 123, baz: 122, bab: 234"
 */
function parseLabeledRow(row) {
  var cols = row.split(', ');
  var res = {};
  var prevCol = null;
  cols.forEach(function (col, idx) {
    var pair = col.split(': ');
    if (pair.length === 2) {
      res[pair[0]] = pair[1];
      prevCol = pair[0];
    } else if (pair.length === 1 && prevCol) {
      res[prevCol] = res[prevCol] + ', ' + pair[0];
    } else {
      // noop
    }
  });
  return res;
}

/**
 * Parser for table where both rows and columns are labeled
 * @return object where keys are row labels and values are objects where keys are the column labels
 */
function parseLabeledRowsCols(entries) {
  var res = {};
  entries.forEach(function (entry) {
    res[entry.title.$t] = parseLabeledRow(entry.content.$t);
  });
  return res;
}

// fetch as raw arrays
function raw(id) {
  var sheetNum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  return fetchAndParse(id, sheetNum, 'cells', parseRawCells);
}

// fetch as array of labeled columns
function labeledCols(id) {
  var sheetNum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  return fetchAndParse(id, sheetNum, 'list', parseLabeledCols);
}

// fetch as labeled map of labeled columns
function labeledColsRows(id) {
  var sheetNum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  return fetchAndParse(id, sheetNum, 'list', parseLabeledRowsCols);
}

exports.default = {
  raw: raw,
  labeledCols: labeledCols,
  labeledColsRows: labeledColsRows
};

/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=GetSheetDone.js.map