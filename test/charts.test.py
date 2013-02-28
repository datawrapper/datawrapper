#
# Selenium WebDriver client script to
# test Datawrapper chart in different browsers
#

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import requests
import yaml
from hashlib import sha256
import hmac
import json
import sys
import os
import glob
from datetime import datetime

config = yaml.load(open('../config.yaml').read())

if 'selenium' not in config:
    sys.stderr.write('Selenium WebDriver is not configured in config.yaml\n')
    sys.exit(-1)


domain = 'http://' + config['domain']
session = requests.Session()

AUTH_SALT = 'uRPAqgUJqNuBdW62bmq3CLszRFkvq4RW'
SELENIUM_HUB = config['selenium']

dc = webdriver.DesiredCapabilities
TEST_ON = [dc.INTERNETEXPLORER, dc.FIREFOX, dc.CHROME]


def main():
    # login the test user
    login()
    # load list of test charts
    charts = load_charts()
    # create empty directory for screenshots if not exists
    out_html = init_output()
    # now test charts
    for dc in TEST_ON:
        for chart in charts:
            if '__test_id' in chart['metadata']['describe']:
                testId = chart['metadata']['describe']['__test_id']
                test = json.loads(open('test-charts/%s.json' % testId).read())
                if '_sig' in test:
                    sig = test['_sig']
                    test_chart(dc, chart, sig, out_html)

    out_html.write('</body></html>')
    out_html.close()


def test_chart(dc, chart, signature, out_html):
    print 'testing', chart['id']
    bn = dc['browserName'].replace(' ', '-')
    if dc['platform'] != 'ANY':
        bn = dc['platform'].replace(' ', '-').lower() + '-' + bn
    if dc['version'] != '':
        bn += '-' + dc['version']
    fn = 'result/png/%s-%s.png' % (chart['id'], bn)
    url = domain + '/chart/' + chart['id'] + '/'
    print fn
    print url
    w = chart['metadata']['publish']['embed-width']
    h = chart['metadata']['publish']['embed-height']
    print w, h
    try:
        driver = webdriver.Remote(SELENIUM_HUB, dc)
        driver.get(url)
        driver.set_window_size(w + 5, h + 100)
        #WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CLASS_NAME, 'label')))
        driver.save_screenshot(fn)
        driver.quit()

    except WebDriverException, e:
        print "err", e
    #iw, ih = driver.execute_script('return [$(window).width(), $(window).height()]')
    #print iw, ih


def init_output():
    if not os.path.isdir('result'):
        os.mkdir('result')
    if not os.path.isdir('result/png'):
        os.mkdir('result/png')
    # remove previous screenshots
    for img in glob.glob('result/png/*.png'):
        os.remove(img)
    f = open('result/screenshots.html', 'w')
    title = 'Test / ' + str(datetime.now())[:19]
    f.write('<!DOCTYPE html><html><head><title>%s</title></head><body><h1>%s</h1>' % (title, title))
    return f


def load_charts():
    r = session.get(domain + '/api/charts?expand=1')
    assert r.json['status'] == 'ok'
    return r.json['data']


def login():
    pwd = '1234'
    if 'testuser_pwd' in config:
        pwd = config['testuser_pwd']
    pwd = hmac.new(AUTH_SALT, msg=pwd, digestmod=sha256).hexdigest()
    pwd = hmac.new('123', msg=pwd, digestmod=sha256).hexdigest()
    payload = dict(pwhash=pwd, time='123', email='test', keeplogin=False)
    r = session.post(domain + '/api/auth/login', data=json.dumps(payload))
    assert r.json['status'] == 'ok'


if __name__ == '__main__':
    main()
