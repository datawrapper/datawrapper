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
TEST_ON = [
    dc.FIREFOX,
    dc.CHROME,
    dict(platform='VISTA', browserName='internet explorer', version='', javascriptEnabled=True),
    dict(platform='XP', browserName='internet explorer', version='', javascriptEnabled=True)
]


def main():
    # login the test user
    login()
    # load list of test charts
    charts = load_charts()
    # dict to store filenames of screenshots per chart
    screenshots = dict()

    # group charts by theme
    charts_by_theme = dict()
    themes = set()
    for chart in charts:
        t = chart['theme']
        if t not in charts_by_theme:
            charts_by_theme[t] = []
            themes.add(t)
        charts_by_theme[t].append(chart)

    themes.remove('default')
    themes = ['default'] + list(themes)

    # now test charts
    envs = []
    for dc in TEST_ON:
        env = test_charts(dc, charts, screenshots)
        envs.append(env)

    out_html = init_output()
    for theme in themes:
        out_html.write('<h2>theme: %s</h2>' % theme)
        out_html.write('<table cellpadding="10" border="1"><thead><tr>')
        for env in envs:
            out_html.write('<th>%s</th>' % env)
        out_html.write('</tr></thead><tbody>')
        for c in charts_by_theme[theme]:
            if c['id'] in screenshots:
                out_html.write('<tr class="row">')
                url = domain + '/chart/' + c['id'] + '/'
                for env in envs:
                    if env not in screenshots[c['id']]:
                        f = False
                    else:
                        f = screenshots[c['id']][env]
                    out_html.write('<td>')
                    if f:
                        out_html.write('<a href="%s"><img src="%s" width="200" /></a>' % (url, f[7:]))
                    else:
                        out_html.write('<div style="width:200px;height:150px;' +
                            'line-height:150px;text-align:center;color:darkred"><a href="%s">fail</a></div>' % url)
                    out_html.write('</td>')  # row
                out_html.write('</tr>')  # row
        out_html.write('</tbody></table>')
        out_html.write('<hr />')
    out_html.write('</body></html>')
    out_html.close()


def test_charts(dc, charts, screenshots):
    bn = dc['browserName'].replace(' ', '-')
    if dc['platform'] != 'ANY':
        bn = dc['platform'].replace(' ', '').lower() + '-' + bn
    if dc['version'] != '':
        bn += '-' + dc['version']
    print "now testing on " + bn

    try:  # open remote webdriver
        driver = webdriver.Remote(SELENIUM_HUB, dc)

        for chart in charts:
            if '__test_id' in chart['metadata']['describe']:
                testId = chart['metadata']['describe']['__test_id']
                test = json.loads(open('test-charts/%s.json' % testId).read())
                if '_sig' in test:
                    #signature = test['_sig']

                    fn = 'result/png/%s-%s.png' % (chart['id'], bn)
                    url = domain + '/chart/' + chart['id'] + '/'

                    w = chart['metadata']['publish']['embed-width']
                    h = chart['metadata']['publish']['embed-height']

                    if dc['browserName'] == 'firefox':
                        w += 70

                    try:
                        driver.get(url)
                        try:
                            WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, '.label')))
                        finally:
                            driver.set_window_size(w + 5, h + 100)
                            driver.save_screenshot(fn)
                    except WebDriverException, e:
                        print 'WARN: javascript error at chart %s / ' % chart['id'], e

                    if chart['id'] not in screenshots:
                        screenshots[chart['id']] = dict()
                    if os.path.exists(fn):
                        screenshots[chart['id']][bn] = fn
                    else:
                        screenshots[chart['id']][bn] = False

        driver.quit()
    except KeyboardInterrupt:
        print "Canceling...", bn
        driver.quit()
    return bn


def init_output():
    if not os.path.isdir('result'):
        os.mkdir('result')
    if not os.path.isdir('result/png'):
        os.mkdir('result/png')
    # remove previous screenshots
    #for img in glob.glob('result/png/*.png'):
    #    os.remove(img)
    f = open('result/screenshots.html', 'w')
    title = 'Test / ' + str(datetime.now())[:19]
    f.write('<!DOCTYPE html><html><head><title>%s</title>' % title)
    f.write('<style>body { background: #eee; padding: 30px; font-family: Helvetica Neue; }')
    f.write('h1, h2 { font-weight: 300; margin-top:0; font-size: 48px; } h2 { font-size: 36px }')
    f.write(' a img { border: 0; vertical-align: top } </style>')
    f.write('</head><body><h1>%s</h1>' % title)
    return f


def load_charts():
    r = session.get(domain + '/api/charts?expand=1&order=theme')
    assert r.json()['status'] == 'ok'
    return r.json()['data']


def login():
    pwd = '1234'
    if 'testuser_pwd' in config:
        pwd = config['testuser_pwd']
    pwd = hmac.new(AUTH_SALT, msg=pwd, digestmod=sha256).hexdigest()
    payload = dict(pwhash=pwd, email='test', keeplogin=False)
    r = session.post(domain + '/api/auth/login', data=json.dumps(payload))
    assert r.json()['status'] == 'ok'


if __name__ == '__main__':
    main()
