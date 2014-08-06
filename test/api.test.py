#
# test script for Datawrapper API
#

import requests
import os
from os.path import realpath
from os.path import dirname
import json
from random import randint
import yaml
import hashlib
import hmac
import base64

BASE_PATH = realpath(dirname(__file__)+'/..')

config = yaml.load(open(BASE_PATH + '/config.yaml').read())

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

test_password = '1234'

dig = hmac.new(config['auth_salt'], msg=test_password, digestmod=hashlib.sha256).digest()
#body = dict(pwd=base64.b64encode(dig).decode())
print base64.b64encode(dig).decode()


# create new chart
class TestDatawrapperAPI(unittest.TestCase):

    def checkRes(self, r):
        self.assertIsInstance(r.json(), dict)
        self.assertEqual(r.json()['status'], 'ok')
        if r.json()['status'] == 'error':
            print r.json()['message']

    def test_00_create_user(self):
        url = endpoint + '/users'
        body = dict(pwd=test_password, pwd2=test_password,
                    email=('test-%d@' + config['domain']) % randint(10000, 99999))
        r = ns['session'].post(url, data=json.dumps(body))
        self.checkRes(r)
        ns['userId'] = r.json()['data']['Id']

        # Active the user
        ns['session'].get(domain + '/account/activate/' + r.json()['data']['ActivateToken'])

        # Log in as the user
        body = dict(email=body['email'], pwhash=test_password, keeplogin=True)
        r3 = ns['session'].post(endpoint + '/auth/login', data=json.dumps(body))
        self.checkRes(r3)

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
        data['author_id'] = ns['userId']
        data['metadata']['describe']['source-name'] = 'Example Data Source'
        data['metadata']['describe']['source-url'] = 'http://example.org'
        r = ns['session'].put(url, data=json.dumps(data))
        self.checkRes(r)
        # self.assertEqual(r.json()['data']['showInGallery'], False)

    def test_06_publish_chart(self):
        r = ns['session'].post(endpoint + 'charts/' + str(ns['chartId']) + '/publish')
        self.checkRes(r)

    def test_07_gallery(self):
        url = endpoint + 'gallery'
        r = ns['session'].get(url)
        self.checkRes(r)

    def test_08_visualizations(self):
        url = endpoint + 'visualizations'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertIsInstance(r.json()['data'], list)

    def test_09_bar_chart(self):
        url = endpoint + 'visualizations/bar-chart'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertIsInstance(r.json()['data'], dict)

    def test_10_account(self):
        url = endpoint + 'account'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertIn('user', r.json()['data'])
        self.assertIsInstance(r.json()['data']['user'], dict)

    def test_11_set_lang_to_fr(self):
        url = endpoint + 'account/lang'
        r = ns['session'].put(url, data=json.dumps(dict(lang='fr')))
        self.checkRes(r)

    def test_12_check_lang_is_fr(self):
        url = endpoint + 'account/lang'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertEqual(r.json()['data'], 'fr')

    def test_13_charts(self):
        url = endpoint + 'charts'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertEqual(len(r.json()['data']), 1)

    def test_13a_charts_sorted(self):
        url = endpoint + 'charts?order=theme'
        r = ns['session'].get(url)
        self.checkRes(r)
        self.assertEqual(len(r.json()['data']), 1)

    def test_14_estimate_job(self):
        url = endpoint + 'jobs/export/estimate'
        r = ns['session'].get(url)
        self.checkRes(r)

    # def test_15_oembed_document(self):
    #     chart = 'http://' + config['chart_domain'] + '/' + ns['chartId']
    #     url = endpoint + 'plugin/oembed?url=' + urllib.pathname2url(chart) + '&format=json'
    #     r = ns['session'].get(url)
    #     self.assertIsInstance(r.json(), dict)
    #     self.assertEqual(r.json()['type'], 'rich')
    #     self.assertEqual(r.json()['version'], 1.0)
    #     self.assertEqual(r.json()['title'], 'My cool new chart')

    def test_99_delete_chart(self):
        r = ns['session'].delete(endpoint + 'charts/' + str(ns['chartId']))
        self.checkRes(r)

    def test_99a_delete_user(self):
        body = dict(pwd=test_password)
        r = ns['session'].delete(endpoint + 'users/' + str(ns['userId']), data=json.dumps(body))
        self.checkRes(r)

if __name__ == '__main__':
    unittest.main()
