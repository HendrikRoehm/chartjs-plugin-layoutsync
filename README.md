# chartjs-plugin-layoutsync

A layout synchronisation plugin for Chart.js. Currently requires Chart.js >= 2.6.0

Columns of charts with the same width are synchronized, such that the chart area is aligned.

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
