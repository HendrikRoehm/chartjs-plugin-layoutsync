This project is archived and not maintained anymore.

# chartjs-plugin-layoutsync

A layout synchronisation plugin for Chart.js. Currently requires Chart.js >= 2.9.0

Columns of charts with the same width are synchronized, such that the chart area is aligned.
The alignment works by changing the `options.layout.padding` configuration parameter of each chart.
Hence, it will currently overwrite manually assigned left and right paddings.

## Configuration

To add a chart to a layout group, you simply have to set a group in the options of your chart config:

```javascript
{
	layoutsync: {
		group: "layoutGroupName"
	}
}
```

## License

chartjs-plugin-layoutsync.js is available under the [MIT license](http://opensource.org/licenses/MIT).
