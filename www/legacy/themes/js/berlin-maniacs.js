/**
 * Data Story Berlin Maniacs theme for HighCharts
 * @author NKB
 */

Highcharts.theme = {
	colors: ['#3de08e', '#979493', '#e3e2d8', '#3a3435', '#9b9b00', '#019893', '#0a1b1b', '#633f59', '#eae556', '#928e12'],
	chart: {
		backgroundColor: '#fff',
		plotBackgroundColor: 'rgba(255, 255, 255, .9)',
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: { 
			color: '#333',
			font: 'bold 14px "Lucida Grande", Verdana, Arial, Helvetica, sans-serif'
		}
	},
	credits: {
		enabled: false
	},
	subtitle: {
		style: { 
			color: '#666',
			font: '12px "Lucida Grande", Verdana, Arial, Helvetica, sans-serif'
		}
	},
	xAxis: {
		gridLineWidth: 0,
		minorTickInterval: null,
		lineColor: '#000',
		tickColor: '#000',
		labels: {
			style: {
				color: '#000',
				font: '10px "Lucida Grande", Verdana, Arial, Helvetica, sans-serif'
			}
		},
		title: {
			style: {
				color: '#222',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: '"Lucida Grande", Verdana, Arial, Helvetica, sans-serif'

			}				
		}
	},
	yAxis: {
		minorTickInterval: null,
		lineColor: '#000',
		lineWidth: 1,
		tickWidth: 1,
		gridLineWidth: 0,
		tickColor: '#000',
		labels: {
			style: {
				color: '#000',
				font: '11px "Lucida Grande", Verdana, Arial, Helvetica, sans-serif'
			}
		},
		title: {
			style: {
				color: '#333',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: '"Lucida Grande", Verdana, Arial, Helvetica, sans-serif'
			}				
		}
	},
	legend: {
		itemStyle: {			
			font: '9px "Lucida Grande", Verdana, Arial, Helvetica, sans-serif',
			color: 'black'

		},
		itemHoverStyle: {
			color: '#039'
		},
		itemHiddenStyle: {
			color: 'gray'
		},
		borderWidth: 0,
		borderRadius: 0
	},
	labels: {
		style: {
			color: '#99b'
		}
	},
	tooltip:{
		style: {
			color: '#333',
			fontWeight: 'normal',
			fontSize: '12px',
			fontFamily: '"Lucida Grande", Verdana, Arial, Helvetica, sans-serif'
		}	
	},
	plotOptions: {	
		series : {
			pointPadding: 0.03,
			groupPadding: 0.05,
            borderWidth: 0, 
            shadow: false,
            dataLabels: {
				enabled: true
			}
		},
		column : {
			pointPadding: 0.2,
			borderWidth: 0,
			borderColor: '#aaa',
			marker: {
				enabled: true
			}
		},
		line : {
			pointPadding: 0.2,
			borderWidth: 0,
			marker: {
				enabled: true
			}
		},
		pie : {
			allowPointSelect: true,
			cursor: "pointer",
			dataLabels: {
				enabled: true
			},
			markers: {
				enabled: true
			}
		}
	}
};