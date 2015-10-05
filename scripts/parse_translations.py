import re
import sys
import os.path as path
import os
from glob import glob
import csv
from collections import OrderedDict
import json

plugin = sys.argv[1]

remap_keys = False
found_in = dict()

if plugin == 'core':
    glob_base = './'
    glob_patterns = ['*.php', 'controller/*.php', 'controller/*/*.php',
        'lib/*.php', 'lib/*/*.php', 'lib/*/*/*.php', 'templates/*.twig', 'templates/*/*.twig', 'templates/*/*/*.twig']
else:
    glob_base = 'plugins/'+plugin+'/'
    glob_patterns = ['*.php', '*/*.php', 'templates/*.twig']

out = OrderedDict()

locales = set()

if plugin == 'core':
    existing = dict()
    for f in glob('locale/*_*.json'):
        s = json.loads(open(f).read())
        loc = f[-10:-5]
        locales.add(loc)
        existing[loc] = s


for gp in glob_patterns:
    for f in glob(glob_base + gp):
        fn = f.replace(glob_base, '')
        if plugin == 'core' and fn[:18] == 'templates/plugins/':
            continue
        print fn
        s = open(f).read()
        pat_s0 = '"((?:[^"\\\]|\\\.)*)"'
        pat_s1 = "'((?:[^'\\\]|\\\.)*)'"
        patterns = ['__\('+pat_s0+'\)', '__\('+pat_s1+'\)',
                    '{% +trans +'+pat_s0+' +%}', '{% +trans +'+pat_s1+' +%}',
                    '{{ +'+pat_s0+' +| *trans', '{{ +'+pat_s1+' +| *trans', ]
        for pattern in patterns:
            for msg in re.findall(pattern, s):
                msg = msg.strip().replace('\\\'', '\'').replace('\\"', '"')
                if msg not in out:
                    if remap_keys:
                        key = raw_input('Is there a better key for "'+msg+'": ')
                    else:
                        key = ''
                    if key.strip() == '':
                        key = msg
                    else:
                        # replace msg in source file
                        pat = pattern.replace(pat_s0, '"(.*)"').replace(pat_s1, '\'(.*)\'').replace('\\', '')
                        needle = pat.replace('(.*)', msg)
                        repl = pat.replace('(.*)', key)
                        # print needle, repl
                        s = s.replace(needle, repl)
                    out[key] = msg
                    found_in[key] = fn
        open(f, 'w').write(s)


locale_dir = 'locale'

if plugin != 'core':
    locale_dir = 'plugins/'+plugin+'/locale'
    if not path.exists(locale_dir):
        os.mkdir(locale_dir)
else:
    missing = 0
    keymap = dict()
    ref = json.load(open('locale/messages.json'))
    for k in sorted(ref.keys()):
        k2 = k
        if k2 not in out:
            k2 = k.replace('\n', '').strip().encode('utf-8')
            if k2 not in out:
                missing += 1
                print 'missing "{}"'.format(k)
                continue
        keymap[k2] = k
    print 'missing total', missing

open(locale_dir + '/en_US.json', 'w').write(json.dumps(out))


f_out = open(locale_dir + '/messages.tsv', 'w')
log = csv.writer(f_out, dialect='excel-tab')
if plugin == 'core':
    locales = list(locales)
    log.writerow(['found in', 'key'] + locales)
for k in out:
    if plugin == 'core':
        row = [found_in[k], k]
        for loc in locales:
            if k in keymap and keymap[k] in existing[loc]:
                row.append(existing[loc][keymap[k]].encode('utf-8'))
            else:
                row.append(out[k])
        log.writerow(row)
    else:
        log.writerow([plugin, k, out[k], out[k]])

f_out.close()
