describe('Layoutsync tests', function() {
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
});
