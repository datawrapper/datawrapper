/**
 * Data Story Berlin Maniacs theme for HighCharts
 * @author NKB
 */

Highcharts.theme = {
	colors: ['#F3CF72', '#E0A812', '#B7890F', '#543F07', '#1D1D1B', '#F3CF72', '#E0A812', '#B7890F', '#543F07', '#1D1D1B', '#FBEDCA',],
	chart: {
		backgroundColor: null,
		plotBackgroundColor: null,
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: { 
			color: '#ddd',
			font: 'bold 14px Verdana, Arial, Helvetica, sans-serif'
		}
	},
	credits: {
		enabled: false
	},
	subtitle: {
		style: { 
			color: '#666',
			font: '12px Verdana, Arial, Helvetica, sans-serif'
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
				font: '10px Verdana, Arial, Helvetica, sans-serif'
			}
		},
		title: {
			style: {
				color: '#222',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'Verdana, Arial, Helvetica, sans-serif'

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
				font: '11px Verdana, Arial, Helvetica, sans-serif'
			}
		},
		title: {
			style: {
				color: '#ddd',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'Verdana, Arial, Helvetica, sans-serif'
			}				
		}
	},
	legend: {
		itemStyle: {			
			font: '9px Verdana, Arial, Helvetica, sans-serif',
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
			fontFamily: 'Verdana, Arial, Helvetica, sans-serif'
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
			pointPadding: 0,
			groupPadding: 0.1,
			shadow:false,
			borderWidth: 0,
			borderColor: '#0C0C0C',
			marker: {
				enabled: true
			}
		},
		bar : {
			pointPadding: 0,
			groupPadding: 0.1,
			shadow:false,
			borderWidth: 0,
			borderColor: '#0C0C0C',
			marker: {
				enabled: true
			}
		},
		line : {
			pointPadding: 0.2,
			borderWidth: 0,
			borderColor: '#0C0C0C',
			marker: {
				enabled: true
			}
		},
		pie : {
			allowPointSelect: true,
			pointPadding: 0.2,
			borderWidth: 0,
			borderColor: '#0C0C0C',
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