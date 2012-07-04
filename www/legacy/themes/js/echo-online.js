/**
 * Data Story PaidContent theme for HighCharts
 * @author NKB
 */

Highcharts.theme = {
	colors: ['#cc071e', '#2f4f5e', '#51707e', '#748d99', '#cc071e', '#2f4f5e', '#51707e', '#748d99'],
	chart: {
		backgroundColor: '#fff',
		plotBackgroundColor: 'rgba(255, 255, 255, .9)',
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: { 
			color: '#20272B',
			font: 'bold 14px Georgia, serif'
		}
	},
	credits: {
		enabled: false
	},
	subtitle: {
		style: { 
			color: '#666',
			font: '12px verdana, Tahoma, Geneva, Arial, Sans-serif'
		}
	},
	xAxis: {
		gridLineWidth: 0,
		minorTickInterval: null,
		lineColor: '#20272B',
		tickColor: '#20272B',
		labels: {
			style: {
				color: '#000',
				font: '10px verdana, Tahoma, Geneva, Arial, Sans-serif'
			}
		},
		title: {
			style: {
				color: '#222',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'verdana, Tahoma, Geneva, Arial, Sans-serif'

			}				
		}
	},
	yAxis: {
		minorTickInterval: null,
		lineColor: '#20272B',
		lineWidth: 1,
		tickWidth: 1,
		gridLineWidth: 0,
		tickColor: '#20272B',
		labels: {
			style: {
				color: '#000',
				font: '11px verdana, Tahoma, Geneva, Arial, Sans-serif'
			}
		},
		title: {
			style: {
				color: '#333',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'verdana, Tahoma, Geneva, Arial, Sans-serif'
			}				
		}
	},
	legend: {
		itemStyle: {			
			font: '9px verdana, Tahoma, Geneva, Arial, Sans-serif',
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
			fontFamily: 'verdana, Tahoma, Geneva, Arial, Sans-serif'
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

	
