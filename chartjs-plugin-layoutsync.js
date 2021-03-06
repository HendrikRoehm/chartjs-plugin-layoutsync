/*!
 * chartjs-plugin-layoutsync
 * https://github.com/HendrikRoehm/chartjs-plugin-layoutsync/
 * Version: 0.3.1
 *
 * Copyright 2019 Hendrik Roehm
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
Chart = typeof (Chart) === 'function' ? Chart : window.Chart;

var layoutGroups = {}

// Approach:
// save layouts
// compute left and right maximum values
// on afterLayout check if left and right max values changed
// if yes, trigger update of other charts

function removeElementFromList(element, list) {
  var index = list.indexOf(element);
  if (index > -1) {
    list.splice(index, 1);
  }
}

function addElementIfNotAlreadyInList(element, list) {
  var index = list.indexOf(element)
  if (index === -1) {
    list.push(element)
  }
}

function shiftPadding(direction, chart, shift) {
  if (!chart.options) {
    chart.options = {}
  }
  if (!chart.options.layout) {
    chart.options.layout = {}
  }
  if (!chart.options.layout.padding) {
    chart.options.layout.padding = {
      left: 0,
      right: 0
    }
  }
  chart.options.layout.padding[direction] = Math.max(
    chart.options.layout.padding[direction] + shift,
    0
  )
}

function getPadding(direction, chart) {
  return chart.options && chart.options.layout && chart.options.layout.padding
    && chart.options.layout.padding[direction]
    ? chart.options.layout.padding[direction]
    : 0
}

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
      group.members.push(chartInstance);
    } else {
      layoutGroups[groupId] = {
        members: [chartInstance],
        layout: null,
        updateQueue: [],
        chartLastWidth: {}
      };
    }
  },
  beforeLayout: function (chartInstance) {
    var groupId = chartInstance.layoutGroupId
    if (!groupId) {
      return
    }

    var group = layoutGroups[groupId]
    if (group.layout === null || chartInstance.chartArea === undefined) {
      return
    }

    var lastWidth = group.chartLastWidth[chartInstance.id]
    var widthDiff = lastWidth ? chartInstance.width - lastWidth : 0;

    var isLayoutCorrect = chartInstance.chartArea.left === group.layout.left
      && chartInstance.chartArea.right + widthDiff === group.layout.right

    if (!isLayoutCorrect) {
      var shiftLeft = group.layout.left - chartInstance.chartArea.left
      var shiftRight = chartInstance.chartArea.right - group.layout.right + widthDiff
      shiftPadding("left", chartInstance, shiftLeft)
      shiftPadding("right", chartInstance, shiftRight)
    }
  },
  afterLayout: function (chartInstance) {
    var groupId = chartInstance.layoutGroupId;
    if (!groupId) {
      return;
    }

    var group = layoutGroups[groupId];
    if (group.chartLastWidth[chartInstance.id] !== chartInstance.width) {
      group.chartLastWidth[chartInstance.id] = chartInstance.width
      addElementIfNotAlreadyInList(chartInstance, group.updateQueue)
    }
    

    // detect layout changes
    var maxLeftWidth = 0;
    var minRightWidth = 1000000;
    var minPaddingLeft = 1000000;
    var minPaddingRight = 1000000;
    group.members.forEach(function (chart) {
      maxLeftWidth = Math.max(maxLeftWidth, chart.chartArea.left)
      minRightWidth = Math.min(minRightWidth, chart.chartArea.right)
      minPaddingLeft = Math.min(minPaddingLeft, getPadding("left", chart))
      minPaddingRight = Math.min(minPaddingRight, getPadding("right", chart))
    })
    maxLeftWidth -= minPaddingLeft
    minRightWidth += minPaddingRight

    var hasLayoutChanged = !group.layout
      || maxLeftWidth !== group.layout.left
      || minRightWidth !== group.layout.right
    if (hasLayoutChanged && group.updateQueue.length === 0) {
      group.layout = {
        left: maxLeftWidth,
        right: minRightWidth
      }
      group.members.forEach(function (chart) {
        addElementIfNotAlreadyInList(chart, group.updateQueue)
      })
    }

    setTimeout(function () {
      if (group.updateQueue.length > 0) {
        var element = group.updateQueue[0]
        removeElementFromList(element, group.updateQueue)
        element.update();
      }
    });
  },
  destroy: function (chartInstance) {
    var groupId = chartInstance.layoutGroupId;
    if (!groupId) {
      return;
    }

    var group = layoutGroups[groupId];
    removeElementFromList(chartInstance, group.members);
    removeElementFromList(chartInstance, group.updateQueue);
  }
};

module.exports = layoutsyncPlugin;
Chart.pluginService.register(layoutsyncPlugin);

},{"chart.js":1}]},{},[2]);
