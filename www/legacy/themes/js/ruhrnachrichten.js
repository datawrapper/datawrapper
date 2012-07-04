/**
 * Data Story PaidContent theme for HighCharts
 * @author NKB
 */

Highcharts.theme = {
	colors: ['#009ee0', '#db0031', '#b7b09e', '#e2dacb', '#627a83', '#009ee0', '#db0031', '#b7b09e', '#e2dacb', '#627a83'],
	chart: {
		backgroundColor: '#fff',
		plotBackgroundColor: 'rgba(255, 255, 255, .9)',
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: { 
			color: '#222',
			font: 'bold 14px verdana, "Bitstream Vera Sans", "DejaVu Sans", Tahoma, Geneva, Arial, Sans-serif'
		}
	},
	credits: {
		enabled: false
	},
	subtitle: {
		style: { 
			color: '#666',
			font: '12px verdana, "Bitstream Vera Sans", "DejaVu Sans", Tahoma, Geneva, Arial, Sans-serif'
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
				font: '10px verdana, "Bitstream Vera Sans", "DejaVu Sans", Tahoma, Geneva, Arial, Sans-serif'
			}
		},
		title: {
			style: {
				color: '#222',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'verdana, "Bitstream Vera Sans", "DejaVu Sans", Tahoma, Geneva, Arial, Sans-serif'

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
				font: '11px verdana, "Bitstream Vera Sans", "DejaVu Sans", Tahoma, Geneva, Arial, Sans-serif'
			}
		},
		title: {
			style: {
				color: '#333',
				fontWeight: 'bold',
				fontSize: '12px',
				fontFamily: 'verdana, "Bitstream Vera Sans", "DejaVu Sans", Tahoma, Geneva, Arial, Sans-serif'
			}				
		}
	},
	legend: {
		itemStyle: {			
			font: '9px verdana, "Bitstream Vera Sans", "DejaVu Sans", Tahoma, Geneva, Arial, Sans-serif',
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
			fontFamily: 'verdana, "Bitstream Vera Sans", "DejaVu Sans", Tahoma, Geneva, Arial, Sans-serif'
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
