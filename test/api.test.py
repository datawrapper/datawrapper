#
# test script for Datawrapper API
#

import requests
import os
import json
from random import randint
import yaml


config = yaml.load(open('../config.yaml').read())

domain = 'http://' + config['domain']

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
        self.assertIsInstance(r.json(), dict)
        self.assertEqual(r.json()['status'], 'ok')
        if r.json()['status'] == 'error':
            print r.json()['message']

    def test_01_create_new_chart(self):
        global ns
        r = ns['session'].post(endpoint + 'charts')
        self.checkRes(r)
        ns['chartId'] = r.json()['data'][0]['id']

    def test_02_set_chart_data(self):
        data = 'some,data,to,send\nanother,row,to,send\n'
        url = endpoint + 'charts/%s/data' % ns['chartId']
        r = ns['session'].put(url, data=data)
        self.checkRes(r)
        # check that data was set correctly
        r = ns['session'].get(url)
        self.assertEqual(r.text, data)

    def test_03_upload_chart_data(self):
        files = {'qqfile': (
            'report.csv', 'other,data,to,send\nanother,row,to,send\n')}
        url = endpoint + 'charts/%s/data' % ns['chartId']
        r = ns['session'].post(url, files=files)
        self.checkRes(r)
        # check that data was set correctly
        r = ns['session'].get(url)
        self.assertEqual(r.text, files['qqfile'][1])

    def test_04_get_chart_meta(self):
        url = endpoint + 'charts/%s' % ns['chartId']
        r = ns['session'].get(url)
        self.checkRes(r)
        gallery_default = False
        if 'defaults' in config and 'show_in_gallery' in config['defaults']:
            gallery_default = config['defaults']['show_in_gallery']
        self.assertEqual(r.json()['data']['showInGallery'], gallery_default)

    def test_05_saveMetadata(self):
        url = endpoint + 'charts/%s' % ns['chartId']
        r = ns['session'].get(url)
        self.checkRes(r)
        data = r.json()['data']
        data['title'] = 'My cool new chart'
        data['metadata']['describe']['source-name'] = 'Example Data Source'
        data['metadata']['describe']['source-url'] = 'http://example.org'
        r = ns['session'].put(url, data=json.dumps(data))
        self.checkRes(r)
        # self.assertEqual(r.json()['data']['showInGallery'], False)

    def test_06_gallery(self):
        url = endpoint + 'gallery'
        r = ns['session'].get(url)
        self.checkRes(r)

    def test_06_visualizations(self):
        url = endpoint + 'visualizations'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertIsInstance(r.json()['data'], list)

    def test_07_bar_chart(self):
        url = endpoint + 'visualizations/bar-chart'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertIsInstance(r.json()['data'], dict)

    def test_08_account(self):
        url = endpoint + 'account'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertIn('user', r.json()['data'])
        self.assertIsInstance(r.json()['data']['user'], dict)

    def test_09_set_lang_to_fr(self):
        url = endpoint + 'account/lang'
        r = ns['session'].put(url, data=json.dumps(dict(lang='fr')))
        self.checkRes(r)

    def test_10_check_lang_is_fr(self):
        url = endpoint + 'account/lang'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertEqual(r.json()['data'], 'fr')

    def test_11_charts(self):
        url = endpoint + 'charts'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertEqual(len(r.json()['data']), 1)

    def test_11a_charts_sorted(self):
        url = endpoint + 'charts?order=theme'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertEqual(len(r.json()['data']), 1)

    def test_12_estimate_job(self):
        url = endpoint + 'jobs/export/estimate'
        r = ns['session'].get(url)
        self.checkRes(r)

    def test_13_create_user(self):
        url = endpoint + '/users'
        password = '1234'
        body = dict(pwd=password, pwd2=password,
                    email=('test-%d@' + config['domain']) % randint(10000, 99999))
        r = ns['session'].post(url, data=json.dumps(body))
        self.checkRes(r)

if __name__ == '__main__':
    unittest.main()
