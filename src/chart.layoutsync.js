
// TODO:
// * for right scales the ticks are on the right side (wrong)
// * if there is no axis on one side, a padding is missing

// Get the chart variable
//var Chart = require('chart.js');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;
var helpers = Chart.helpers;

var layoutGroups = {};

const layoutsyncPlugin = {
  beforeInit: (chartInstance) => {
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
    console.log(chartInstance);
  },
  afterLayout: (chartInstance) => {
    var groupId = chartInstance.layoutGroupId
    if (!groupId) {
      return;
    }

    // save computed layout
    chartInstance.initialLayout = {
      left: chartInstance.chartArea.left,
      right: chartInstance.chartArea.right
    };
    console.log(chartInstance.initialLayout);

    var group = layoutGroups[groupId];

//    var layoutOptions = chartInstance.options.layout || {};
//    var padding = helpers.options.toPadding(layoutOptions.padding);

    var maxLeftWidth = 0;
    var minRightWidth = 1000000;
    group.forEach(chart => {
      maxLeftWidth = Math.max(maxLeftWidth, chart.initialLayout.left);
      minRightWidth = Math.min(minRightWidth, chart.initialLayout.right);
    })

    var chartsToUpdate = [];
    group.forEach(chart => {
      var shiftLeft = maxLeftWidth - chart.chartArea.left;
      var shiftRight = minRightWidth - chart.chartArea.right;

      // adjust chart
      chart.chartArea.left += shiftLeft;
      chart.chartArea.right += shiftRight;

      // adjust boxes
      chart.boxes.forEach(box => {
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

      if (chartInstance !== chart && (shiftLeft !== 0 || shiftRight !== 0)) {
        chartsToUpdate.push(chart);
      }
    });
    chartsToUpdate.forEach(chart => {
      chart.update(0);
    });
  },
  destroy: (chartInstance) => {
    var groupId = chartInstance.layoutGroupId
    if (!groupId) {
      return;
    }

    var group = layoutGroups[groupId];
    var findIndex = -1;
    group.forEach((chart, index) => {
      if (chart === chartInstance) {
        findIndex = index;
      }
    })
    if (findIndex != -1) {
      group.splice(findIndex, 1)
    }
  }
}

//module.exports = layoutsyncPlugin;
Chart.pluginService.register(layoutsyncPlugin);
