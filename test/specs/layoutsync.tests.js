
describe('Layoutsync', function () {
	it('Chart has layoutGroupId', function () {
		var chart = window.acquireChartWithLayoutGroupId("testGroup");

		expect(chart.layoutGroupId).toEqual("testGroup");
	});

	it('Charts are synced', function () {
		var chart1 = window.acquireChartWithLayoutGroupIdAndScalePosition("testGroup", "left");
		var chart2 = window.acquireChartWithLayoutGroupIdAndScalePosition("testGroup", "right");

		expect(xLimitsOfChartarea(chart1)).toEqual(xLimitsOfChartarea(chart2));
	});

	it('Charts with different layoutGroups are not synced', function () {
		var chart1 = window.acquireChartWithLayoutGroupIdAndScalePosition("testGroup1", "left");
		var chart2 = window.acquireChartWithLayoutGroupIdAndScalePosition("testGroup2", "right");

		expect(xLimitsOfChartarea(chart1).left).not
			.toEqual(xLimitsOfChartarea(chart2).left);
		expect(xLimitsOfChartarea(chart1).right).not
			.toEqual(xLimitsOfChartarea(chart2).right);
	});

	it('Charts without layoutGroups are not synced', function () {
		var chart1 = window.acquireChartWithLayoutGroupIdAndScalePosition(undefined, "left");
		var chart2 = window.acquireChartWithLayoutGroupIdAndScalePosition(undefined, "right");

		expect(xLimitsOfChartarea(chart1).left).not
			.toEqual(xLimitsOfChartarea(chart2).left);
		expect(xLimitsOfChartarea(chart1).right).not
			.toEqual(xLimitsOfChartarea(chart2).right);
	});

	it('Charts are synced after resize', function (done) {
		var wrapperAndCharts = acquireTwoSyncedChartsWithOneWrapper();
		var chart1 = wrapperAndCharts.charts[0];
		var chart2 = wrapperAndCharts.charts[1];

		xLimitsChart1BeforeResizing = xLimitsOfChartarea(chart1);

		wrapperOfBoth.style.width = '1000px';
		waitForAllChartResizes(wrapperAndCharts.charts, function () {
			expect(xLimitsOfChartarea(chart1)).toEqual(xLimitsOfChartarea(chart2));
			expect(xLimitsOfChartarea(chart1)).not.toEqual(xLimitsChart1BeforeResizing);
			done();
		});
	});
});
