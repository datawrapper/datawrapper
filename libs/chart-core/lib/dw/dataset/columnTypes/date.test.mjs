import test from 'ava';
import column from '../column.mjs';
import { range } from 'underscore';

const ymdhms = (y, m = 1, d = 1, h = 0, mm = 0, s = 0) => new Date(y, m - 1, d, h, mm, s);
const ymdhmsUTC = (y, m = 1, d = 1, h = 0, mm = 0, s = 0) =>
    new Date(Date.UTC(y, m - 1, d, h, mm, s));
const ymd = (y, m = 1, d = 1) => new Date(y, m - 1, d);
const ymdUTC = (y, m = 1, d = 1) => new Date(Date.UTC(y, m - 1, d));
const yr = y => ymd(y);

const curYear = new Date().getFullYear();

const run = (name, { values, parsed, invalid, only }) => {
    (only ? test.only : test)(name, t => {
        const col = column('', values);
        if (!invalid) {
            // first check if the column auto-detected dates
            t.is(col.type(), 'date');
        }
        // now check each value
        for (let i = 0; i < parsed.length; i++) {
            t.deepEqual(col.val(i), parsed[i]);
        }
    });
};

run('date objects', {
    values: [ymd(1990), ymd(1990, 7, 1), ymd(1991, 12, 1)],
    parsed: [ymd(1990), ymd(1990, 7, 1), ymd(1991, 12, 1)]
});

run('full years (YYYY)', {
    values: range(1985, 2021).map(String),
    parsed: range(1985, 2021).map(yr)
});

run('no years', {
    values: range(3000, 3021).map(String),
    parsed: range(3000, 3021),
    invalid: true
});

const halfYears = [
    ymd(1990, 7),
    ymd(1991, 1),
    ymd(1991, 7),
    ymd(1992, 1),
    ymd(1992, 7),
    ymd(1993, 1),
    ymd(1993, 7)
];

run('half years (YYYY H)', {
    values: ['1990 H2', '1991 H1', '1991 H2', '1992 H1', '1992 H2', '1993 H1', '1993 H2'],
    parsed: halfYears
});

run('half years (YYYYH)', {
    values: ['1990H2', '1991H1', '1991H2', '1992H1', '1992H2', '1993H1', '1993H2'],
    parsed: halfYears
});

run('half years (YYYY-H)', {
    values: ['1990-H2', '1991-H1', '1991-H2', '1992-H1', '1992-H2', '1993-H1', '1993-H2'],
    parsed: halfYears
});

run('half years (YYYY/H)', {
    values: ['1990/H2', '1991/H1', '1991/H2', '1992/H1', '1992/H2', '1993/H1', '1993/H2'],
    parsed: halfYears
});

run('half years (H-YYYY)', {
    values: ['H2-1990', 'H1-1991', 'H2-1991', 'H1-1992', 'H2-1992', 'H1-1993', 'H2-1993'],
    parsed: halfYears
});

run('half years (H/YYYY)', {
    values: ['H2/1990', 'H1/1991', 'H2/1991', 'H1/1992', 'H2/1992', 'H1/1993', 'H2/1993'],
    parsed: halfYears
});

const quarterYears = [
    ymd(1990, 4),
    ymd(1990, 7),
    ymd(1990, 10),
    ymd(1991, 1),
    ymd(1991, 4),
    ymd(1991, 7),
    ymd(1991, 10),
    ymd(1992, 1),
    ymd(1992, 4),
    ymd(1992, 7),
    ymd(1992, 10)
];

run('quarter years (YYYYQ)', {
    values: [
        '1990Q2',
        '1990Q3',
        '1990Q4',
        '1991Q1',
        '1991Q2',
        '1991Q3',
        '1991Q4',
        '1992Q1',
        '1992Q2',
        '1992Q3',
        '1992Q4'
    ],
    parsed: quarterYears
});

run('quarter years (YYYY Q)', {
    values: [
        '1990 Q2',
        '1990 Q3',
        '1990 Q4',
        '1991 Q1',
        '1991 Q2',
        '1991 Q3',
        '1991 Q4',
        '1992 Q1',
        '1992 Q2',
        '1992 Q3',
        '1992 Q4'
    ],
    parsed: quarterYears
});

run('quarter years (YYYY/Q)', {
    values: [
        '1990/Q2',
        '1990/Q3',
        '1990/Q4',
        '1991/Q1',
        '1991/Q2',
        '1991/Q3',
        '1991/Q4',
        '1992/Q1',
        '1992/Q2',
        '1992/Q3',
        '1992/Q4'
    ],
    parsed: quarterYears
});

run('quarter years (YYYY-Q)', {
    values: [
        '1990-Q2',
        '1990-Q3',
        '1990-Q4',
        '1991-Q1',
        '1991-Q2',
        '1991-Q3',
        '1991-Q4',
        '1992-Q1',
        '1992-Q2',
        '1992-Q3',
        '1992-Q4'
    ],
    parsed: quarterYears
});

run('quarter years (Q YYYY)', {
    values: [
        'Q2 1990',
        'Q3 1990',
        'Q4 1990',
        'Q1 1991',
        'Q2 1991',
        'Q3 1991',
        'Q4 1991',
        'Q1 1992',
        'Q2 1992',
        'Q3 1992',
        'Q4 1992'
    ],
    parsed: quarterYears
});

run('quarter years (Q/YYYY)', {
    values: [
        'q2/1990',
        'q3/1990',
        'q4/1990',
        'q1/1991',
        'q2/1991',
        'q3/1991',
        'q4/1991',
        'q1/1992',
        'q2/1992',
        'q3/1992',
        'q4/1992'
    ],
    parsed: quarterYears
});

run('quarter years (Q-YYYY)', {
    values: [
        'Q2-1990',
        'Q3-1990',
        'Q4-1990',
        'Q1-1991',
        'Q2-1991',
        'Q3-1991',
        'Q4-1991',
        'Q1-1992',
        'Q2-1992',
        'Q3-1992',
        'Q4-1992'
    ],
    parsed: quarterYears
});

const months = [
    ymd(1999, 7),
    ymd(1999, 8),
    ymd(1999, 9),
    ymd(1999, 10),
    ymd(1999, 11),
    ymd(1999, 12),
    ymd(2000, 1),
    ymd(2000, 2),
    ymd(2000, 3),
    ymd(2000, 4),
    ymd(2000, 5),
    ymd(2000, 6)
];

run('numeric months (YYYY-MM)', {
    values: [
        '1999-07',
        '1999-08',
        '1999-09',
        '1999-10',
        '1999-11',
        '1999-12',
        '2000-01',
        '2000-02',
        '2000-03',
        '2000-04',
        '2000-05',
        '2000-06'
    ],
    parsed: months
});

run('numeric months (YYYY/MM)', {
    values: [
        '1999/07',
        '1999/08',
        '1999/09',
        '1999/10',
        '1999/11',
        '1999/12',
        '2000/01',
        '2000/02',
        '2000/03',
        '2000/04',
        '2000/05',
        '2000/06'
    ],
    parsed: months
});

run('numeric months (YYYY M)', {
    values: [
        '1999 7',
        '1999 8',
        '1999 9',
        '1999 10',
        '1999 11',
        '1999 12',
        '2000 1',
        '2000 2',
        '2000 3',
        '2000 4',
        '2000 5',
        '2000 6'
    ],
    parsed: months
});

run('numeric months (YYYY/M)', {
    values: [
        '1999/7',
        '1999/8',
        '1999/9',
        '1999/10',
        '1999/11',
        '1999/12',
        '2000/1',
        '2000/2',
        '2000/3',
        '2000/4',
        '2000/5',
        '2000/6'
    ],
    parsed: months
});

run('numeric months (M/YYYY)', {
    values: [
        '7/1999',
        '8/1999',
        '9/1999',
        '10/1999',
        '11/1999',
        '12/1999',
        '1/2000',
        '2/2000',
        '3/2000',
        '4/2000',
        '5/2000',
        '6/2000'
    ],
    parsed: months
});

run('numeric months (M-YYYY)', {
    values: [
        '7-1999',
        '8-1999',
        '9-1999',
        '10-1999',
        '11-1999',
        '12-1999',
        '1-2000',
        '2-2000',
        '3-2000',
        '4-2000',
        '5-2000',
        '6-2000'
    ],
    parsed: months
});

run('abbreviated months (YYYY-MMM)', {
    values: [
        '1999-Jul',
        '1999-Aug',
        '1999-Sep',
        '1999-Oct',
        '1999-Nov',
        '1999-Dec',
        '2000-Jan',
        '2000-Feb',
        '2000-Mar',
        '2000-Apr',
        '2000-May',
        '2000-Jun'
    ],
    parsed: months
});

run('abbreviated months (YYYY MMM)', {
    values: [
        '1999 JUL',
        '1999 AUG',
        '1999 SEP',
        '1999 OCT',
        '1999 NOV',
        '1999 DEC',
        '2000 JAN',
        '2000 FEB',
        '2000 MAR',
        '2000 APR',
        '2000 MAY',
        '2000 JUN'
    ],
    parsed: months
});

run('abbreviated months (YYYY MMM, de)', {
    values: [
        '1999 JUL',
        '1999 AUG',
        '1999 SEPT',
        '1999 OKT',
        '1999 NOV',
        '1999 DEZ',
        '2000 JAN',
        '2000 FEB',
        '2000 MÄR',
        '2000 APR',
        '2000 MAI',
        '2000 JUN'
    ],
    parsed: months
});

run('abbreviated months (MMM-YYYY)', {
    values: [
        'Jul-1999',
        'Aug-1999',
        'Sep-1999',
        'Oct-1999',
        'Nov-1999',
        'Dec-1999',
        'Jan-2000',
        'Feb-2000',
        'Mar-2000',
        'Apr-2000',
        'May-2000',
        'Jun-2000'
    ],
    parsed: months
});

run('abbreviated months (MMM. YYYY)', {
    values: [
        'Jul. 1999',
        'Aug. 1999',
        'Sep. 1999',
        'Oct. 1999',
        'Nov. 1999',
        'Dec. 1999',
        'Jan. 2000',
        'Feb. 2000',
        'Mar. 2000',
        'Apr. 2000',
        'May. 2000',
        'Jun. 2000'
    ],
    parsed: months
});

run('abbreviated months (MMM YY)', {
    values: [
        'Jul 99',
        'Aug 99',
        'Sep 99',
        'Oct 99',
        'Nov 99',
        'Dec 99',
        'Jan 00',
        'Feb 00',
        'Mar 00',
        'Apr 00',
        'May 00',
        'Jun 00'
    ],
    parsed: months
});

run('abbreviated months (MMM. YY)', {
    values: [
        'Jul. 99',
        'Aug. 99',
        'Sep. 99',
        'Oct. 99',
        'Nov. 99',
        'Dec. 99',
        'Jan. 00',
        'Feb. 00',
        'Mar. 00',
        'Apr. 00',
        'May. 00',
        'Jun. 00'
    ],
    parsed: months
});

run('abbreviated months (MMM. ’YY)', {
    values: [
        'Jul. ’99',
        'Aug. ’99',
        'Sep. ’99',
        'Oct. ’99',
        'Nov. ’99',
        'Dec. ’99',
        'Jan. ’00',
        'Feb. ’00',
        'Mar. ’00',
        'Apr. ’00',
        'May. ’00',
        'Jun. ’00'
    ],
    parsed: months
});

const months2 = range(1, 13).map(m => ymd(curYear, m));

run('abbreviated months, no year (MMM)', {
    values: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    parsed: months2
});

run('full months (MMMM)', {
    values: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ],
    parsed: months2
});

run('full months (MMMM, de)', {
    values: [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember'
    ],
    parsed: months2
});

run('full months (MMMM-YYYY)', {
    values: [
        'Juli-1999',
        'August-1999',
        'September-1999',
        'October-1999',
        'November-1999',
        'December-1999',
        'January-2000',
        'February-2000',
        'March-2000',
        'April-2000',
        'May-2000',
        'June-2000'
    ],
    parsed: months
});

run('full months (MMMM YYYY)', {
    values: [
        'Juli 1999',
        'August 1999',
        'September 1999',
        'October 1999',
        'November 1999',
        'December 1999',
        'January 2000',
        'February 2000',
        'March 2000',
        'April 2000',
        'May 2000',
        'June 2000'
    ],
    parsed: months
});

const weeks = [ymdUTC(2011, 7, 25), ymdUTC(2011, 8, 1), ymdUTC(2011, 8, 8), ymdUTC(2011, 8, 15)];

run('weeks (YYYYW)', {
    values: ['2011W30', '2011W31', '2011W32', '2011W33'],
    parsed: weeks
});

run('weeks (YYYY W)', {
    values: ['2011 W30', '2011 W31', '2011 W32', '2011 W33'],
    parsed: weeks
});

run('weeks (YYYY/W)', {
    values: ['2011/W30', '2011/W31', '2011/W32', '2011/W33'],
    parsed: weeks
});

run('weeks (W YYYY)', {
    values: ['W30 2011', 'W31 2011', 'W32 2011', 'W33 2011'],
    parsed: weeks
});

run('weeks (W-YYYY)', {
    values: ['W30-2011', 'W31-2011', 'W32-2011', 'W33-2011'],
    parsed: weeks
});

const dates = [
    ymd(1999, 12, 27),
    ymd(1999, 12, 28),
    ymd(1999, 12, 29),
    ymd(1999, 12, 30),
    ymd(1999, 12, 31),
    ymd(2000, 1, 1),
    ymd(2000, 1, 2),
    ymd(2000, 1, 3),
    ymd(2000, 1, 4),
    ymd(2000, 1, 5),
    ymd(2000, 1, 6),
    ymd(2000, 1, 7)
];

run('numeric date (YYYY-MM-DD)', {
    values: [
        '1999-12-27',
        '1999-12-28',
        '1999-12-29',
        '1999-12-30',
        '1999-12-31',
        '2000-01-01',
        '2000-01-02',
        '2000-01-03',
        '2000-01-04',
        '2000-01-05',
        '2000-01-06',
        '2000-01-07'
    ],
    parsed: dates
});

run('numeric date (DD.MM.YYYY)', {
    values: [
        '27.12.1999',
        '28.12.1999',
        '29.12.1999',
        '30.12.1999',
        '31.12.1999',
        '01.01.2000',
        '02.01.2000',
        '03.01.2000',
        '04.01.2000',
        '05.01.2000',
        '06.01.2000',
        '07.01.2000'
    ],
    parsed: dates
});

run('numeric date (DD/MM/YYYY)', {
    values: [
        '27/12/1999',
        '28/12/1999',
        '29/12/1999',
        '30/12/1999',
        '31/12/1999',
        '01/01/2000',
        '02/01/2000',
        '03/01/2000',
        '04/01/2000',
        '05/01/2000',
        '06/01/2000',
        '07/01/2000'
    ],
    parsed: dates
});

run('numeric date (MM/DD/YYYY)', {
    values: [
        '12/27/1999',
        '12/28/1999',
        '12/29/1999',
        '12/30/1999',
        '12/31/1999',
        '01/01/2000',
        '01/02/2000',
        '01/03/2000',
        '01/04/2000',
        '01/05/2000',
        '01/06/2000',
        '01/07/2000'
    ],
    parsed: dates
});

run('date with abbreviated month (MMM DD, YYYY)', {
    values: [
        'Dec 27, 1999',
        'Dec 28, 1999',
        'Dec 29, 1999',
        'Dec 30, 1999',
        'Dec 31, 1999',
        'Jan 1, 2000',
        'Jan 2, 2000',
        'Jan 3, 2000',
        'Jan 4, 2000',
        'Jan 5, 2000',
        'Jan 6, 2000',
        'Jan 7, 2000'
    ],
    parsed: dates
});

run('date with abbreviated month (MMM/DD/YYYY)', {
    values: [
        'Dec/27/1999',
        'Dec/28/1999',
        'Dec/29/1999',
        'Dec/30/1999',
        'Dec/31/1999',
        'Jan/01/2000',
        'Jan/02/2000',
        'Jan/03/2000',
        'Jan/04/2000',
        'Jan/05/2000',
        'Jan/06/2000',
        'Jan/07/2000'
    ],
    parsed: dates
});

run('date with full month (MMMM DD, YYYY)', {
    values: [
        'December/27/1999',
        'December 28, 1999',
        'December 29, 1999',
        'December 30, 1999',
        'December 31, 1999',
        'January 1, 2000',
        'January 2, 2000',
        'January 3, 2000',
        'January 4, 2000',
        'January 5, 2000',
        'January 6, 2000',
        'January 7, 2000'
    ],
    parsed: dates
});

run('date with full month (MMMM/DD/YYYY)', {
    values: [
        'December/27/1999',
        'December/28/1999',
        'December/29/1999',
        'December/30/1999',
        'December/31/1999',
        'January/01/2000',
        'January/02/2000',
        'January/03/2000',
        'January/04/2000',
        'January/05/2000',
        'January/06/2000',
        'January/07/2000'
    ],
    parsed: dates
});

run('date with week and day (YYYY/W/D)', {
    values: ['2011-W30-3', '2011-W30-4', '2011-W30-5', '2011-W30-6'],
    parsed: [ymdUTC(2011, 7, 27), ymdUTC(2011, 7, 28), ymdUTC(2011, 7, 29), ymdUTC(2011, 7, 30)]
});

run('date with abbreviated month (DD-MMM-YY)', {
    values: ['08-Aug-14', '15-Aug-14', '22-Aug-14', '29-Aug-14'],
    parsed: [ymd(2014, 8, 8), ymd(2014, 8, 15), ymd(2014, 8, 22), ymd(2014, 8, 29)]
});

const datetimes = [
    ymdhms(1999, 12, 27, 22),
    ymdhms(1999, 12, 27, 22, 30),
    ymdhms(1999, 12, 27, 23, 0),
    ymdhms(1999, 12, 27, 23, 30),
    ymdhms(1999, 12, 28, 0),
    ymdhms(1999, 12, 28, 0, 30),
    ymdhms(1999, 12, 28, 1),
    ymdhms(1999, 12, 28, 1, 30),
    ymdhms(1999, 12, 28, 2, 0),
    ymdhms(1999, 12, 28, 2, 30)
];

run('date with time (YYYY/MM/DD HH:MM)', {
    values: [
        '1999-12-27 22:00',
        '1999-12-27 22:30',
        '1999-12-27 23:00',
        '1999-12-27 23:30',
        '1999-12-28 00:00',
        '1999-12-28 00:30',
        '1999-12-28 01:00',
        '1999-12-28 01:30',
        '1999-12-28 02:00',
        '1999-12-28 02:30'
    ],
    parsed: datetimes
});

run('date with time (YYYY/MM/DD HH:MM AM)', {
    values: [
        '1999-12-27 10:00 PM',
        '1999-12-27 10:30 PM',
        '1999-12-27 11:00 PM',
        '1999-12-27 11:30 PM',
        '1999-12-28 12:00 AM',
        '1999-12-28 12:30 AM',
        '1999-12-28 01:00 AM',
        '1999-12-28 01:30 AM',
        '1999-12-28 02:00 AM',
        '1999-12-28 02:30 AM'
    ],
    parsed: datetimes
});

run('date with time and seconds (YYYY/MM/DD HH:MM:SS AM)', {
    values: [
        '1999-12-27 10:00:00 PM',
        '1999-12-27 10:30:01 PM',
        '1999-12-27 11:00:02 PM',
        '1999-12-27 11:30:03 PM',
        '1999-12-28 12:00:04 AM',
        '1999-12-28 12:30:05 AM',
        '1999-12-28 01:00:06 AM',
        '1999-12-28 01:30:07 AM',
        '1999-12-28 02:00:08 AM',
        '1999-12-28 02:30:59 AM'
    ],
    parsed: [
        ymdhms(1999, 12, 27, 22),
        ymdhms(1999, 12, 27, 22, 30, 1),
        ymdhms(1999, 12, 27, 23, 0, 2),
        ymdhms(1999, 12, 27, 23, 30, 3),
        ymdhms(1999, 12, 28, 0, 0, 4),
        ymdhms(1999, 12, 28, 0, 30, 5),
        ymdhms(1999, 12, 28, 1, 0, 6),
        ymdhms(1999, 12, 28, 1, 30, 7),
        ymdhms(1999, 12, 28, 2, 0, 8),
        ymdhms(1999, 12, 28, 2, 30, 59)
    ]
});

run('date with abbreviated month (MMM-YY)', {
    values: ['ene-13', 'ene-14', 'ene-15', 'ene-16'],
    parsed: [ymd(2013), ymd(2014), ymd(2015), ymd(2016)]
});

run('ISO dates with seconds', {
    values: [
        '2023-01-03T14:00:00.000Z',
        '2023-01-03T13:00:00.000Z',
        '2023-01-03T12:00:00.000Z',
        '2023-01-03T11:00:00.000Z'
    ],
    parsed: [
        ymdhmsUTC(2023, 1, 3, 14, 0, 0),
        ymdhmsUTC(2023, 1, 3, 13, 0, 0),
        ymdhmsUTC(2023, 1, 3, 12, 0, 0),
        ymdhmsUTC(2023, 1, 3, 11, 0, 0)
    ]
});

run('ISO dates without seconds', {
    values: ['2023-01-03T14:00Z', '2023-01-03T13:00Z', '2023-01-03T12:00Z', '2023-01-03T11:00Z'],
    parsed: [
        ymdhmsUTC(2023, 1, 3, 14, 0, 0),
        ymdhmsUTC(2023, 1, 3, 13, 0, 0),
        ymdhmsUTC(2023, 1, 3, 12, 0, 0),
        ymdhmsUTC(2023, 1, 3, 11, 0, 0)
    ]
});

run('ISO dates without separators', {
    values: ['20230103T140000Z', '20230103T130000Z', '20230103T120000Z', '20230103T110000Z'],
    parsed: [
        ymdhmsUTC(2023, 1, 3, 14, 0, 0),
        ymdhmsUTC(2023, 1, 3, 13, 0, 0),
        ymdhmsUTC(2023, 1, 3, 12, 0, 0),
        ymdhmsUTC(2023, 1, 3, 11, 0, 0)
    ]
});

run('ISO dates with timezones', {
    values: [
        '2023-01-03T14:00Z',
        '2023-01-03T14:00+01:00',
        '2023-01-03T14:00-02:00',
        '2023-01-03T14:00+02:30'
    ],
    parsed: [
        ymdhmsUTC(2023, 1, 3, 14, 0, 0),
        ymdhmsUTC(2023, 1, 3, 13, 0, 0),
        ymdhmsUTC(2023, 1, 3, 16, 0, 0),
        ymdhmsUTC(2023, 1, 3, 11, 30, 0)
    ]
});
