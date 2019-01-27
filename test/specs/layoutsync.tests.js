
describe('Layoutsync', function () {
	it('Chart has layoutGroupId', function () {
		var chart = window.acquireChartWithLayoutGroupId("testGroup");

		expect(chart.layoutGroupId).toEqual("testGroup");
	});

	it('Charts are synced', function (done) {
		var chart1 = window.acquireChartWithLayoutGroupIdAndScalePosition("testGroup", "left");
		var chart2 = window.acquireChartWithLayoutGroupIdAndScalePosition("testGroup", "right");

		executeEvents().then(() => {
			expect(xLimitsOfChartarea(chart1)).toEqual(xLimitsOfChartarea(chart2));
			done();
		});
	});

	it('Charts with different layoutGroups are not synced', function (done) {
		var chart1 = window.acquireChartWithLayoutGroupIdAndScalePosition("testGroup1", "left");
		var chart2 = window.acquireChartWithLayoutGroupIdAndScalePosition("testGroup2", "right");

		executeEvents().then(() => {
			expect(xLimitsOfChartarea(chart1).left).not
				.toEqual(xLimitsOfChartarea(chart2).left);
			expect(xLimitsOfChartarea(chart1).right).not
				.toEqual(xLimitsOfChartarea(chart2).right);
			done();
		});
	});

	it('Charts without layoutGroups are not synced', function (done) {
		var chart1 = window.acquireChartWithLayoutGroupIdAndScalePosition(undefined, "left");
		var chart2 = window.acquireChartWithLayoutGroupIdAndScalePosition(undefined, "right");

		executeEvents().then(() => {
			expect(xLimitsOfChartarea(chart1).left).not
				.toEqual(xLimitsOfChartarea(chart2).left);
			expect(xLimitsOfChartarea(chart1).right).not
				.toEqual(xLimitsOfChartarea(chart2).right);
			done();
		});
	});

	it('Charts are synced after resize', function (done) {
		var wrapperAndCharts = acquireTwoSyncedChartsWithOneWrapper();
		var chart1 = wrapperAndCharts.charts[0];
		var chart2 = wrapperAndCharts.charts[1];

		xLimitsChart1BeforeResizing = xLimitsOfChartarea(chart1);

		wrapperOfBoth.style.width = '1000px';
		executeEvents().then(() => {
			expect(xLimitsOfChartarea(chart1)).toEqual(xLimitsOfChartarea(chart2));
			expect(xLimitsOfChartarea(chart1)).not.toEqual(xLimitsChart1BeforeResizing);
			done();
		});
	});
});
