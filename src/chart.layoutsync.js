
// TODO:
// * for right scales the ticks are on the right side (wrong)
// * check https://github.com/chartjs/Chart.js/issues/4982

// Get the chart variable
var Chart = require('chart.js');
Chart = typeof (Chart) === 'function' ? Chart : window.Chart;

var layoutGroups = {};

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
        updateQueue: []
      };
    }
  },
  afterLayout: function (chartInstance, optionalParameter) {
    var groupId = chartInstance.layoutGroupId;
    if (!groupId) {
      return;
    }

    if (optionalParameter === 'layoutSync') {
      // afterLayout is triggered through this function, nothing to do.
      return;
    }

    // save computed layout
    chartInstance.initialLayout = {
      left: chartInstance.chartArea.left,
      right: chartInstance.chartArea.right
    };

    var group = layoutGroups[groupId];

    // detect layout changes
    var maxLeftWidth = 0;
    var minRightWidth = 1000000;
    group.members.forEach(function (chart) {
      maxLeftWidth = Math.max(maxLeftWidth, chart.initialLayout.left);
      minRightWidth = Math.min(minRightWidth, chart.initialLayout.right);
    });
    var hasLayoutChanged = !group.layout
      || maxLeftWidth !== group.layout.left
      || minRightWidth !== group.layout.right;
    if (hasLayoutChanged) {
      group.layout = {
        left: maxLeftWidth,
        right: minRightWidth
      };
      group.updateQueue = group.members.slice();
    }

    var isLayoutCorrect = chartInstance.initialLayout.left == maxLeftWidth
      && chartInstance.initialLayout.right == minRightWidth;

    if (!isLayoutCorrect) {
      var shiftLeft = maxLeftWidth - chartInstance.chartArea.left;
      var shiftRight = minRightWidth - chartInstance.chartArea.right;

      // adjust chart
      chartInstance.chartArea.left += shiftLeft;
      chartInstance.chartArea.right += shiftRight;

      // adjust boxes
      chartInstance.boxes.forEach(function (box) {
        if (box.position === 'left') {
          box.left += shiftLeft;
          box.right += shiftLeft;
        } else if (box.position === 'right') {
          box.left += shiftRight;
          box.right += shiftRight;
        } else {
          box.left += shiftLeft;
          box.right += shiftRight;
          if (!box.fullWidth) {
            box.width += shiftRight - shiftLeft;
          }
        }
      });

      // notify again to distribute the changes
      Chart.pluginService.notify(chartInstance, 'afterLayout', ['layoutSync']);
      Chart.pluginService.notify(chartInstance, 'afterScaleUpdate');
    }
    removeElementFromList(chartInstance, group.updateQueue);
    setTimeout(function () {
      if (group.updateQueue.length > 0) {
        group.updateQueue[0].update();
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
