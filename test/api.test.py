#
# test script for Datawrapper API
#

import requests
import os
import json

domain = 'http://dev.datawrapper.de'

if 'DATAWRAPPER_DOMAIN' in os.environ:
    domain = os.environ['DATAWRAPPER_DOMAIN']
endpoint = domain + '/api/'
import unittest

print 'testing on ' + domain

ns = {
    'chartId': None,
    'session': requests.Session()
}


# create new chart
class TestDatawrapperAPI(unittest.TestCase):

    def checkRes(self, r):
        self.assertEqual(r.json['status'], 'ok')
        if r.json['status'] == 'error':
            print r.json['message']

    def test_01_createChart(self):
        global ns
        r = ns['session'].post(endpoint + 'charts')
        #self.assertEqual(r.json['status'], 'ok')
        self.checkRes(r)
        ns['chartId'] = r.json['data'][0]['id']

    def test_02_putData(self):
        data = 'some,data,to,send\nanother,row,to,send\n'
        url = endpoint + 'charts/%s/data' % ns['chartId']
        r = ns['session'].put(url, data=data)
        self.checkRes(r)
        # check that data was set correctly
        r = ns['session'].get(url)
        self.assertEqual(r.text, data)

    def test_03_postData(self):
        files = {'qqfile': ('report.csv', 'other,data,to,send\nanother,row,to,send\n')}
        url = endpoint + 'charts/%s/data' % ns['chartId']
        r = ns['session'].post(url, files=files)
        self.checkRes(r)
        # check that data was set correctly
        r = ns['session'].get(url)
        self.assertEqual(r.text, files['qqfile'][1])

    def test_04_loadMetadata(self):
        url = endpoint + 'charts/%s' % ns['chartId']
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertEqual(r.json['data']['showInGallery'], False)

    def test_05_saveMetadata(self):
        url = endpoint + 'charts/%s' % ns['chartId']
        r = ns['session'].get(url)
        self.checkRes(r)
        data = r.json['data']
        data['title'] = 'My cool new chart'
        data['metadata']['describe']['source-name'] = 'Example Data Source'
        data['metadata']['describe']['source-url'] = 'http://example.org'
        r = ns['session'].put(url, data=json.dumps(data))
        self.checkRes(r)
        #self.assertEqual(r.json['data']['showInGallery'], False)

    def test_06_gallery(self):
        url = endpoint + 'gallery'
        r = ns['session'].get(url)
        self.checkRes(r)

    def test_06_visualizations(self):
        url = endpoint + 'visualizations'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertIsInstance(r.json['data'], list)

    def test_07_bar_chart(self):
        url = endpoint + 'visualizations/bar-chart'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertIsInstance(r.json['data'], dict)

if __name__ == '__main__':
    unittest.main()
