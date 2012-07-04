/**
 * Data Story PaidContent theme for HighCharts
 * @author NKB
 */

Highcharts.theme = {
	colors: ['#775544', '#bbaa99', '#ddddcc', '#eeeeee', '#ffffff', '#775544', '#bbaa99', '#ddddcc', '#eeeeee', '#ffffff'],
	chart: {
		backgroundColor: '#fff',
		plotBackgroundColor: 'rgba(255, 255, 255, .9)',
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: { 
			color: '#222',
			font: 'bold 14px Arial, Helvetica, sans-serif'
		}
	},
	credits: {
		enabled: true,
		position: {
            align: 'left',
            x:10
        },
		href: 'http://shop.highsoft.com/highcharts.html'
	},
	subtitle: {
		style: { 
			color: '#666',
			font: '12px Arial, Helvetica, sans-serif'
		}
	},
	xAxis: {
		gridLineWidth: 0,
		minorTickInterval: null,
		lineColor: '#775544',
		tickColor: '#775544',
		labels: {
			style: {
				color: '#000',
				font: '10px Arial, Helvetica, sans-serif'
			}
		},
		title: {
			style: {
				color: '#222',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'Arial, Helvetica, sans-serif'

			}				
		}
	},
	yAxis: {
		minorTickInterval: null,
		lineColor: '#775544',
		lineWidth: 1,
		tickWidth: 1,
		gridLineWidth: 0,
		tickColor: '#775544',
		labels: {
			style: {
				color: '#000',
				font: '11px Arial, Helvetica, sans-serif'
			}
		},
		title: {
			style: {
				color: '#333',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'Arial, Helvetica, sans-serif'
			}				
		}
	},
	legend: {
		itemStyle: {			
			font: '9px Arial, Helvetica, sans-serif',
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
			fontFamily: 'Arial, Helvetica, sans-serif'
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