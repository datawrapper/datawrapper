#
# test script for Datawrapper API
#

import requests

domain = 'http://datawrapper'
endpoint = domain + '/api/'
import unittest

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
        r = ns['session'].get(url, data=data)
        self.assertEqual(r.text, data)

    def test_03_postData(self):
        files = {'file': ('report.csv', 'other,data,to,send\nanother,row,to,send\n')}
        r = ns['session'].post(endpoint + 'charts/%s/data' % ns['chartId'], files=files)
        print r.text
        self.checkRes(r)


if __name__ == '__main__':
    unittest.main()
