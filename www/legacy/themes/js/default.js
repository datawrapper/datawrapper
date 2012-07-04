/**
 * Data Story default theme for HighCharts
 * @author NKB
 */

Highcharts.theme = {
	colors: ['#A41717', '#5B5B5B', '#9A2020', '#737373', '#8E2B2B', '#8B8B8B', '#803838', '#5B5B5B', '#793F3F', '#737373', '#714747', '#8B8B8B', '#655252', '#A41717', '#5B5B5B', '#9A2020', '#737373', '#8E2B2B', '#8B8B8B', '#803838', '#5B5B5B', '#793F3F', '#737373', '#714747', '#8B8B8B', '#655252'],
	chart: {
		backgroundColor: '#fff',
		plotBackgroundColor: 'rgba(255, 255, 255, .9)',
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: { 
			color: '#000',
			font: 'bold 16px Arial, Helvetica, sans-serif'
		}
	},
	credits: {
		enabled: false
	},
	subtitle: {
		style: { 
			color: '#666666',
			font: 'bold 12px Arial, Helvetica, sans-serif'
		}
	},
	xAxis: {
		gridLineWidth: 0,
		gridLineColor: '#ddd',
		lineColor: '#000',
		tickColor: '#000',
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
	yAxis: {
		lineColor: '#000',
		gridLineWidth: 1,
		gridLineColor: '#ddd',
		lineWidth: 1,
		tickWidth: 1,
		tickColor: '#000',
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
		}
	},
	labels: {
		align: 'right',
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
			borderWidth: 1,
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
			markers: {
				enabled: true
			}
		}
	}
};
	
