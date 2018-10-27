
function xLimitsOfChartarea(chart) {
	return {
		left: chart.chartArea.left,
		right: chart.chartArea.right
	};
}

describe('Layoutsync', function() {
	it('Chart has layoutGroupId', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [20, 30, 40, 50]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
					}]
				},
				layoutsync: {
					group: "testGroup"
				}
			}
		});

		expect(chart.layoutGroupId).toEqual("testGroup");
	});

	it('Charts are synced', function() {
		var chart1 = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [20, 30, 40, 50]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						position: "left"
					}]
				},
				layoutsync: {
					group: "testGroup"
				}
			}
		});

		var chart2 = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [20, 30, 40, 50]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						position: "right"
					}]
				},
				layoutsync: {
					group: "testGroup"
				}
			}
		});

		expect(xLimitsOfChartarea(chart1)).toEqual(xLimitsOfChartarea(chart2));
	});

	it('Charts with different layoutGroups are not synced', function() {
		var chart1 = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [20, 30, 40, 50]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						position: "left"
					}]
				},
				layoutsync: {
					group: "testGroup1"
				}
			}
		});

		var chart2 = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [20, 30, 40, 50]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						position: "right"
					}]
				},
				layoutsync: {
					group: "testGroup2"
				}
			}
		});

		expect(xLimitsOfChartarea(chart1).left).not
			.toEqual(xLimitsOfChartarea(chart2).left);
		expect(xLimitsOfChartarea(chart1).right).not
			.toEqual(xLimitsOfChartarea(chart2).right);
	});

	it('Charts without layoutGroups are not synced', function() {
		var chart1 = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [20, 30, 40, 50]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						position: "left"
					}]
				}
			}
		});

		var chart2 = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [20, 30, 40, 50]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						position: "right"
					}]
				}
			}
		});

		expect(xLimitsOfChartarea(chart1).left).not
			.toEqual(xLimitsOfChartarea(chart2).left);
		expect(xLimitsOfChartarea(chart1).right).not
			.toEqual(xLimitsOfChartarea(chart2).right);
	});
});
