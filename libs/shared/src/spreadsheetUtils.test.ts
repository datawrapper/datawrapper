import test from 'ava';
import { convertSpreadsheetUrl, isSpreadsheetUrl } from './spreadsheetUtils';

test('isSpreadsheetUrl returns false for a dummy URL', t => {
    t.false(isSpreadsheetUrl('https://www.example.com/'));
});

test('isSpreadsheetUrl returns true for a Google Sheets "edit" URL', t => {
    t.true(isSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/edit'));
});

test('isSpreadsheetUrl returns true for a Google Sheets "edit" URL with gid', t => {
    t.true(isSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/edit#gid=0'));
    t.true(isSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/edit#gid=1'));
});

test('isSpreadsheetUrl returns true for a Google Sheets "edit" URL with gid and random params', t => {
    t.true(
        isSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/edit?foo=bar&spam=spam#gid=0')
    );
    t.true(
        isSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/edit?foo=bar&spam=spam#gid=1')
    );
});

test('isSpreadsheetUrl returns true for a Google Sheets "export" URL', t => {
    t.true(isSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/export'));
});

test('isSpreadsheetUrl returns true for a Google Sheets "export" URL with gid', t => {
    t.true(isSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/export?gid=0'));
    t.true(isSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/export?gid=1'));
});

test('isSpreadsheetUrl returns true for a Google Sheets "export" URL with gid and random params', t => {
    t.true(
        isSpreadsheetUrl(
            'https://docs.google.com/spreadsheets/d/1234/export?format=csv&id=1234&foo=bar&gid=0&spam=spam'
        )
    );
    t.true(
        isSpreadsheetUrl(
            'https://docs.google.com/spreadsheets/d/1234/export?format=csv&id=1234&foo=bar&gid=1&spam=spam'
        )
    );
});

test("isSpreadsheetUrl returns false for a URL that doesn't start with docs.google.com", t => {
    t.false(
        isSpreadsheetUrl('https://1.1.1.1/test?https://docs.google.com/spreadsheets/d/123/edit')
    );
});

test('convertSpreadsheetUrl converts a Google Sheets "edit" URL into an "export" URL', t => {
    t.is(
        convertSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/edit'),
        'https://docs.google.com/spreadsheets/d/1234/export?format=csv&id=1234'
    );
});

test('convertSpreadsheetUrl converts a Google Sheets "edit" URL with gid into an "export" URL', t => {
    t.is(
        convertSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1234/edit#gid=0'),
        'https://docs.google.com/spreadsheets/d/1234/export?format=csv&id=1234&gid=0'
    );
});

test('convertSpreadsheetUrl removes params other than gid from Google Sheets "export" URL', t => {
    t.is(
        convertSpreadsheetUrl(
            'https://docs.google.com/spreadsheets/d/1234/export?format=csv&id=1234&foo=bar&gid=0&spam=spam'
        ),
        'https://docs.google.com/spreadsheets/d/1234/export?format=csv&id=1234&gid=0'
    );
});
