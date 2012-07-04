/**
 * Data Story default theme for HighCharts
 * @author NKB
 */

Highcharts.theme = {
	colors: ['#0063A5', '#74A1C2', '#0063A5', '#74A1C2', '#0063A5', '#74A1C2', '#0063A5', '#74A1C2', '#0063A5', '#74A1C2'],
	chart: {
		backgroundColor: '#fff',
		plotBackgroundColor: 'rgba(255, 255, 255, .9)',
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: { 
			color: '#000',
			font: 'bold 16px Georgia, serif'
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
			color: '#666666',
			font: 'bold 12px Georgia, serif'
		}
	},
	xAxis: {
		gridLineWidth: 0,
		gridLineColor: '#ddd',
		lineColor: '#C9271C',
		tickColor: '#C9271C',
		labels: {
			style: {
				color: '#000',
				font: '11px Georgia, serif'
			}
		},
		title: {
			style: {
				color: '#333',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'Georgia, serif'

			}				
		}
	},
	yAxis: {
		lineColor: '#C9271C',
		gridLineWidth: 1,
		gridLineColor: '#ddd',
		lineWidth: 1,
		tickWidth: 1,
		tickColor: '#C9271C',
		labels: {
			style: {
				color: '#000',
				font: '11px Georgia, serif'
			}
		},
		title: {
			style: {
				color: '#333',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'Georgia, serif'
			}				
		}
	},
	legend: {
		itemStyle: {			
			font: '9px Georgia, serif',
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
		style: {
			color: '#99b'
		}
	},
	tooltip:{
		style: {
			color: '#333',
			fontWeight: 'normal',
			fontSize: '12px',
			fontFamily: 'Georgia, serif'
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