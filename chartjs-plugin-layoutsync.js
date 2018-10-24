/*!
 * chartjs-plugin-layoutsync
 * https://github.com/HendrikRoehm/chartjs-plugin-layoutsync/
 * Version: 0.1.3
 *
 * Copyright 2018 Hendrik Roehm
 * Released under the MIT license
 * https://github.com/HendrikRoehm/chartjs-plugin-layoutsync/blob/master/LICENSE.md
 */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){

// TODO:
// * for right scales the ticks are on the right side (wrong)
// * check https://github.com/chartjs/Chart.js/issues/4982

// Get the chart variable
var Chart = require('chart.js');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;
var helpers = Chart.helpers;

var layoutGroups = {};

// Approach:
// save layouts
// compute left and right maximum values
// on afterLayout check if left and right max values changed
// if yes, trigger update of other charts
// Charts always double trigger afterLayout?

var layoutsyncPlugin = {
  beforeInit: function (chartInstance) {
    var options = chartInstance.options;
    var groupId = options.layoutsync && options.layoutsync.group;
    if (!groupId) {
      return;
    }

    chartInstance.layoutGroupId = groupId;
    var group = layoutGroups[groupId];
    if (group) {
      group.push(chartInstance);
    } else {
      layoutGroups[groupId] = [chartInstance];
    }
  },
  afterLayout: function (chartInstance, optionalParameter) {
    var groupId = chartInstance.layoutGroupId
    if (!groupId) {
      return;
    }

    if (optionalParameter === "layoutSync") {
      // afterLayout is triggered through this function, nothing to do.
      return;
    }

    // save computed layout
    chartInstance.initialLayout = {
      left: chartInstance.chartArea.left,
      right: chartInstance.chartArea.right
    };

    var group = layoutGroups[groupId];

    var maxLeftWidth = 0;
    var minRightWidth = 1000000;
    group.forEach(function (chart) {
      maxLeftWidth = Math.max(maxLeftWidth, chart.initialLayout.left);
      minRightWidth = Math.min(minRightWidth, chart.initialLayout.right);
    })

    var chartsToUpdate = [];
    group.forEach(function (chart) {
      var shiftLeft = maxLeftWidth - chart.chartArea.left;
      var shiftRight = minRightWidth - chart.chartArea.right;

      // adjust chart
      chart.chartArea.left += shiftLeft;
      chart.chartArea.right += shiftRight;

      // adjust boxes
      chart.boxes.forEach(function (box) {
        if (box.position === "left") {
          box.left += shiftLeft;
          box.right += shiftLeft;
        } else if (box.position === "right") {
          box.left += shiftRight;
          box.right += shiftRight;
        } else {
          box.left += shiftLeft;
          box.right += shiftRight;
          if (!box.fullWidth) {
            box.width += shiftRight - shiftLeft;
          }
        }
      })

      if (shiftLeft !== 0 || shiftRight !== 0) {
        if (chartInstance === chart) {
          // notify again to distribute the changes
          Chart.pluginService.notify(chart, "afterLayout", ["layoutSync"]);
          Chart.pluginService.notify(chart, "afterScaleUpdate");
        } else {
          chartsToUpdate.push(chart);
        }
      }
    });
    chartsToUpdate.forEach(function (chart) {
      chart.update();
    });
  },
  destroy: function (chartInstance) {
    var groupId = chartInstance.layoutGroupId
    if (!groupId) {
      return;
    }

    var group = layoutGroups[groupId];
    var findIndex = -1;
    group.forEach(function (chart, index) {
      if (chart === chartInstance) {
        findIndex = index;
      }
    })
    if (findIndex != -1) {
      group.splice(findIndex, 1)
    }
  }
}

module.exports = layoutsyncPlugin;
Chart.pluginService.register(layoutsyncPlugin);

},{"chart.js":1}]},{},[2]);
