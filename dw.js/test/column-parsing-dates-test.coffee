
global._ = require 'underscore'
global.Globalize = require 'globalize'
vows = require 'vows'
assert = require 'assert'
dw = require '../dw-2.0.js'

ymd = (y,m=1,d=1) -> new Date y,m-1,d
ymdhms = (y,m=1,d=1,h=0,mm=0,s=0) -> new Date y,m-1,d,h,mm,s
ymd2 = (y,m=1,d=1) -> new Date Date.UTC y,m-1,d
yr = (y) -> ymd y

cur_year = (new Date()).getFullYear()

half_years = [ymd(1990,7),ymd(1991,1),ymd(1991,7),ymd(1992,1),ymd(1992,7),ymd(1993,1),ymd(1993,7)]
quarter_years = [ymd(1990,4),ymd(1990,7),ymd(1990,10),ymd(1991,1),ymd(1991,4),ymd(1991,7),ymd(1991,10),ymd(1992,1),ymd(1992,4),ymd(1992,7),ymd(1992,10)]
months = [ymd(1999,7),ymd(1999,8),ymd(1999,9),ymd(1999,10),ymd(1999,11),ymd(1999,12),ymd(2000,1),ymd(2000,2),ymd(2000,3),ymd(2000,4),ymd(2000,5),ymd(2000,6)]
months2 = [1..12].map (m) -> ymd(cur_year, m)
dates = [ymd(1999,12,27),ymd(1999,12,28),ymd(1999,12,29),ymd(1999,12,30),ymd(1999,12,31),ymd(2000,1,1),ymd(2000,1,2),ymd(2000,1,3),ymd(2000,1,4),ymd(2000,1,5),ymd(2000,1,6),ymd(2000,1,7)]
weeks = [ymd2(2011,7,25),ymd2(2011,8,1),ymd2(2011,8,8),ymd2(2011,8,15)]
datetimes = [ymdhms(1999,12,27,22), ymdhms(1999,12,27,22,30), ymdhms(1999,12,27,23,0), ymdhms(1999,12,27,23,30), ymdhms(1999,12,28, 0), ymdhms(1999,12,28,0,30), ymdhms(1999,12,28,1), ymdhms(1999,12,28,1,30), ymdhms(1999,12,28,2,0), ymdhms(1999,12,28,2,30)]
datetimes2 = [ymdhms(1999,12,27,22), ymdhms(1999,12,27,22,30,1), ymdhms(1999,12,27,23,0,2), ymdhms(1999,12,27,23,30,3), ymdhms(1999,12,28,0,0,4), ymdhms(1999,12,28,0,30,5), ymdhms(1999,12,28,1,0,6), ymdhms(1999,12,28,1,30,7), ymdhms(1999,12,28,2,0,8), ymdhms(1999,12,28,2,30,59)]

formats =
    'dates':
        values: [ymd(1990), ymd(1990,7,1), ymd(1991,12,1)]
        parsed: [ymd(1990), ymd(1990,7,1), ymd(1991,12,1)]
    # full years
    'YYYY':
        values: [1985..2010].map String
        parsed: [1985..2010].map yr
    'no years':
        values: [3000..3010].map String
        parsed: [3000..3010]

    # half years
    'YYYY H':
        values: ['1990 H2', '1991 H1', '1991 H2', '1992 H1', '1992 H2', '1993 H1', '1993 H2']
        parsed: half_years
    'YYYYH':
        values: ['1990H2', '1991H1', '1991H2', '1992H1', '1992H2', '1993H1', '1993H2']
        parsed: half_years
    'YYYY-H':
        values: ['1990-H2', '1991-H1', '1991-H2', '1992-H1', '1992-H2', '1993-H1', '1993-H2']
        parsed: half_years
    'YYYY/H':
        values: ['1990/H2', '1991/H1', '1991/H2', '1992/H1', '1992/H2', '1993/H1', '1993/H2']
        parsed: half_years
    'H YYYY':
        values: ['H2 1990', 'H1 1991', 'H2 1991', 'H1 1992', 'H2 1992', 'H1 1993', 'H2 1993']
        parsed: half_years
    'H-YYYY':
        values: ['H2-1990', 'H1-1991', 'H2-1991', 'H1-1992', 'H2-1992', 'H1-1993', 'H2-1993']
        parsed: half_years
    'H/YYYY':
        values: ['H2/1990', 'H1/1991', 'H2/1991', 'H1/1992', 'H2/1992', 'H1/1993', 'H2/1993']
        parsed: half_years

    # quarter years
    'YYYYQ':
        values: ['1990Q2', '1990Q3', '1990Q4', '1991Q1', '1991Q2', '1991Q3', '1991Q4', '1992Q1', '1992Q2', '1992Q3', '1992Q4']
        parsed: quarter_years
    'YYYY Q':
        parsed: quarter_years
        values: ['1990 Q2', '1990 Q3', '1990 Q4', '1991 Q1', '1991 Q2', '1991 Q3', '1991 Q4', '1992 Q1', '1992 Q2', '1992 Q3', '1992 Q4']
    'YYYY/Q':
        parsed: quarter_years
        values: ['1990/q2', '1990/q3', '1990/q4', '1991/q1', '1991/q2', '1991/q3', '1991/q4', '1992/q1', '1992/q2', '1992/q3', '1992/q4']
    'YYYY-Q':
        parsed: quarter_years
        values: ['1990-Q2', '1990-Q3', '1990-Q4', '1991-Q1', '1991-Q2', '1991-Q3', '1991-Q4', '1992-Q1', '1992-Q2', '1992-Q3', '1992-Q4']
    'Q YYYY':
        parsed: quarter_years
        values: ['Q2 1990', 'Q3 1990', 'Q4 1990', 'Q1 1991', 'Q2 1991', 'Q3 1991', 'Q4 1991', 'Q1 1992', 'Q2 1992', 'Q3 1992', 'Q4 1992']
    'Q/YYYY':
        parsed: quarter_years
        values: ['q2/1990', 'q3/1990', 'q4/1990', 'q1/1991', 'q2/1991', 'q3/1991', 'q4/1991', 'q1/1992', 'q2/1992', 'q3/1992', 'q4/1992']
    'Q-YYYY':
        parsed: quarter_years
        values: ['Q2-1990', 'Q3-1990', 'Q4-1990', 'Q1-1991', 'Q2-1991', 'Q3-1991', 'Q4-1991', 'Q1-1992', 'Q2-1992', 'Q3-1992', 'Q4-1992']

    # months (numeric)
    'YYYY-MM':
        parsed: months
        values: ['1999-07', '1999-08', '1999-09', '1999-10', '1999-11', '1999-12', '2000-01', '2000-02', '2000-03', '2000-04', '2000-05', '2000-06']
    'YYYY/MM':
        parsed: months
        values: ['1999/07', '1999/08', '1999/09', '1999/10', '1999/11', '1999/12', '2000/01', '2000/02', '2000/03', '2000/04', '2000/05', '2000/06']
    'YYYY M':
        parsed: months
        values: ['1999 7', '1999 8', '1999 9', '1999 10', '1999 11', '1999 12', '2000 1', '2000 2', '2000 3', '2000 4', '2000 5', '2000 6']
    'YYYY/M':
        parsed: months
        values: ['1999/7', '1999/8', '1999/9', '1999/10', '1999/11', '1999/12', '2000/1', '2000/2', '2000/3', '2000/4', '2000/5', '2000/6']
    'M/YYYY':
        parsed: months
        values: ['7/1999', '8/1999', '9/1999', '10/1999', '11/1999', '12/1999', '1/2000', '2/2000', '3/2000', '4/2000', '5/2000', '6/2000'],
    'M-YYYY':
        parsed: months
        values: ['7-1999', '8-1999', '9-1999', '10-1999', '11-1999', '12-1999', '1-2000', '2-2000', '3-2000', '4-2000', '5-2000', '6-2000'],

    # months abbreviated
    'YYYY-MMM':
        parsed: months
        values: ['1999-Jul', '1999-Aug', '1999-Sep', '1999-Oct', '1999-Nov', '1999-Dec', '2000-Jan', '2000-Feb', '2000-Mar', '2000-Apr', '2000-May', '2000-Jun']
    'YYYY MMM':
        parsed: months
        values: ['1999 JUL', '1999 AUG', '1999 SEP', '1999 OCT', '1999 NOV', '1999 DEC', '2000 JAN', '2000 FEB', '2000 MAR', '2000 APR', '2000 MAY', '2000 JUN']
    'YYYY MMM (de)':
        parsed: months
        values: ['1999 JUL', '1999 AUG', '1999 SEPT', '1999 OKT', '1999 NOV', '1999 DEZ', '2000 JAN', '2000 FEB', '2000 MÄR', '2000 APR', '2000 MAI', '2000 JUN']
    'MMM-YYYY':
        parsed: months
        values: ['Jul-1999', 'Aug-1999', 'Sep-1999', 'Oct-1999', 'Nov-1999', 'Dec-1999', 'Jan-2000', 'Feb-2000', 'Mar-2000', 'Apr-2000', 'May-2000', 'Jun-2000']
    'MMM YYYY':
        parsed: months
        values: ['Jul 1999', 'Aug 1999', 'Sep 1999', 'Oct 1999', 'Nov 1999', 'Dec 1999', 'Jan 2000', 'Feb 2000', 'Mar 2000', 'Apr 2000', 'May 2000', 'Jun 2000']
    'MMM/YYYY':
        parsed: months
        values: ['Jul/1999', 'Aug/1999', 'Sep/1999', 'Oct/1999', 'Nov/1999', 'Dec/1999', 'Jan/2000', 'Feb/2000', 'Mar/2000', 'Apr/2000', 'May/2000', 'Jun/2000']
    'MMM. YYYY':
        parsed: months
        values: ['Jul. 1999', 'Aug. 1999', 'Sep. 1999', 'Oct. 1999', 'Nov. 1999', 'Dec. 1999', 'Jan. 2000', 'Feb. 2000', 'Mar. 2000', 'Apr. 2000', 'May. 2000', 'Jun. 2000']
    'MMM YY':
        parsed: months
        values: ['Jul 99', 'Aug 99', 'Sep 99', 'Oct 99', 'Nov 99', 'Dec 99', 'Jan 00', 'Feb 00', 'Mar 00', 'Apr 00', 'May 00', 'Jun 00']
    'MMM. YY':
        parsed: months
        values: ['Jul. 99', 'Aug. 99', 'Sep. 99', 'Oct. 99', 'Nov. 99', 'Dec. 99', 'Jan. 00', 'Feb. 00', 'Mar. 00', 'Apr. 00', 'May. 00', 'Jun. 00']
    'MMM. ’YY':
        parsed: months
        values: ['Jul. ’99', 'Aug. ’99', 'Sep. ’99', 'Okt. ’99', 'Nov. ’99', 'Dez. ’99', 'Jan. ’00', 'Feb. ’00', 'Mar. ’00', 'Apr. ’00', 'Mai ’00', 'Juni ’00']
    'MMM':
        parsed: months2
        values: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    # months (full)
    'MMMM':
        parsed: months2
        values: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    'MMMM (de)':
        parsed: months2
        values: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    'MMMM-YYYY':
        parsed: months
        values: ['Juli-1999', 'August-1999', 'September-1999', 'October-1999', 'November-1999', 'December-1999', 'January-2000', 'February-2000', 'March-2000', 'April-2000', 'May-2000', 'June-2000']
    'MMMM YYYY':
        parsed: months
        values: ['Juli 1999', 'August 1999', 'September 1999', 'October 1999', 'November 1999', 'December 1999', 'January 2000', 'February 2000', 'March 2000', 'April 2000', 'May 2000', 'June 2000']

    # weeks
    'YYYYW':
        parsed: weeks
        values: ['2011W30','2011W31','2011W32','2011W33']
    'YYYY W':
        parsed: weeks
        values: ['2011 W30','2011 W31','2011 W32','2011 W33']
    'YYYY/W':
        parsed: weeks
        values: ['2011/W30','2011/W31','2011/W32','2011/W33']
    'W YYYY':
        parsed: weeks
        values: ['W30 2011','W31 2011','W32 2011','W33 2011']
    'W-YYYY':
        parsed: weeks
        values: ['W30-2011','W31-2011','W32-2011','W33-2011']

    # date (numeric)
    'YYYY-MM-DD':
        parsed: dates
        values: ['1999-12-27', '1999-12-28', '1999-12-29', '1999-12-30', '1999-12-31', '2000-01-01', '2000-01-02', '2000-01-03', '2000-01-04', '2000-01-05', '2000-01-06', '2000-01-07']
    'DD.MM.YYYY':
        parsed: dates
        values: ['27.12.1999', '28.12.1999', '29.12.1999', '30.12.1999', '31.12.1999', '01.01.2000', '02.01.2000', '03.01.2000', '04.01.2000', '05.01.2000', '06.01.2000', '07.01.2000']
    'DD/MM/YYYY':
        parsed: dates
        values: ['27/12/1999', '28/12/1999', '29/12/1999', '30/12/1999', '31/12/1999', '01/01/2000', '02/01/2000', '03/01/2000', '04/01/2000', '05/01/2000', '06/01/2000', '07/01/2000']
    'MM/DD/YYYY':
        parsed: dates
        values: ['12/27/1999', '12/28/1999', '12/29/1999', '12/30/1999', '12/31/1999', '01/01/2000', '01/02/2000', '01/03/2000', '01/04/2000', '01/05/2000', '01/06/2000', '01/07/2000']
    'DD/MM/YY':
        parsed: dates
        values: ['27/12/99', '28/12/99', '29/12/99', '30/12/99', '31/12/99', '01/01/00', '02/01/00', '03/01/00', '04/01/00', '05/01/00', '06/01/00', '07/01/00']
    'MM/DD/YY':
        parsed: dates
        values: ['12/27/99', '12/28/99', '12/29/99', '12/30/99', '12/31/99', '01/01/00', '01/02/00', '01/03/00', '01/04/00', '01/05/00', '01/06/00', '01/07/00']

    # date abbrev month
    'MMM DD, YYYY':
        parsed: dates
        values: ['Dec 27, 1999', 'Dec 28, 1999', 'Dec 29, 1999', 'Dec 30, 1999', 'Dec 31, 1999', 'Jan 1, 2000', 'Jan 2, 2000', 'Jan 3, 2000', 'Jan 4, 2000', 'Jan 5, 2000', 'Jan 6, 2000', 'Jan 7, 2000']

    'MMM/DD/YYYY':
        parsed: dates
        values: ['Dec/27/1999', 'Dec/28/1999', 'Dec/29/1999', 'Dec/30/1999', 'Dec/31/1999', 'Jan/01/2000', 'Jan/02/2000', 'Jan/03/2000', 'Jan/04/2000', 'Jan/05/2000', 'Jan/06/2000', 'Jan/07/2000']

    'MMMM DD, YYYY':
        parsed: dates
        values: ['December/27/1999', 'December 28, 1999', 'December 29, 1999', 'December 30, 1999', 'December 31, 1999', 'January 1, 2000', 'January 2, 2000', 'January 3, 2000', 'January 4, 2000', 'January 5, 2000', 'January 6, 2000', 'January 7, 2000']

    'MMMM/DD/YYYY':
        parsed: dates
        values: ['December/27/1999', 'December/28/1999', 'December/29/1999', 'December/30/1999', 'December/31/1999', 'January/01/2000', 'January/02/2000', 'January/03/2000', 'January/04/2000', 'January/05/2000', 'January/06/2000', 'January/07/2000']

    'YYYY/W/D':
        parsed: [ymd2(2011,7,27), ymd2(2011,7,28), ymd2(2011,7,29), ymd2(2011,7,30)]
        values: ['2011-W30-3','2011-W30-4','2011-W30-5','2011-W30-6'],

    'DD-MMM-YY':
        parsed: [ymd(2014,8,8), ymd(2014,8,15), ymd(2014,8,22), ymd(2014,8,29)]
        values: ['08-Aug-14','15-Aug-14','22-Aug-14','29-Aug-14']

    'YYYY/MM/DD HH:MM':
        parsed: datetimes
        values: ['1999-12-27 22:00', '1999-12-27 22:30', '1999-12-27 23:00', '1999-12-27 23:30', '1999-12-28 00:00', '1999-12-28 00:30', '1999-12-28 01:00', '1999-12-28 01:30', '1999-12-28 02:00', '1999-12-28 02:30']

    'YYYY/MM/DD HH:MM AM':
        parsed: datetimes
        values: ['1999-12-27 10:00 PM', '1999-12-27 10:30 PM', '1999-12-27 11:00 PM', '1999-12-27 11:30 PM', '1999-12-28 12:00 AM', '1999-12-28 12:30 AM', '1999-12-28 01:00 AM', '1999-12-28 01:30 AM', '1999-12-28 02:00 AM', '1999-12-28 02:30 AM']

    'YYYY/MM/DD HH:MM:SS AM':
        parsed: datetimes2
        values: ['1999-12-27 10:00:00 PM', '1999-12-27 10:30:01 PM', '1999-12-27 11:00:02 PM', '1999-12-27 11:30:03 PM', '1999-12-28 12:00:04 AM', '1999-12-28 12:30:05 AM', '1999-12-28 01:00:06 AM', '1999-12-28 01:30:07 AM', '1999-12-28 02:00:08 AM', '1999-12-28 02:30:59 AM']

    'MMM-YY':
        parsed: [ymd(2013), ymd(2014), ymd(2015), ymd(2016)]
        values: ['ene-13', 'ene-14', 'ene-15', 'ene-16']

batch = {}
for k of formats
    batch[k] =
        'topic': formats[k]
    if k.substr(0,3) != 'no '
        batch[k]['type is date'] = (topic) ->
            assert.equal dw.column('', topic.values).type(), 'date'
    batch[k]['parsed correctly'] = (topic) ->
        parsed = dw.column('', topic.values).values()
        for i of parsed
            if parsed[i].getTime
                assert.equal(topic.parsed[i].getTime(), parsed[i].getTime())
            else
                assert.equal(topic.parsed[i], parsed[i])
vows
    .describe('Some tests for different number formats')
    .addBatch(batch)
    .export module
