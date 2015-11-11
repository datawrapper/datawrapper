import re
import sys
import os.path as path
import os
from glob import glob
import csv
from collections import OrderedDict
import json

if len(sys.argv) < 2:
    print 'Usage:'
    print '         python parse_translations.py [scope]\n'
    print '         Valid scopes are plugin names or "core"'
    print '         e.g. python parse_translations.py theme-default-single\n'
    exit(-1)

scope = sys.argv[1]

remap_keys = False
found_in = dict()

if scope == 'core':
    glob_base = './'
    glob_patterns = ['*.php', 'controller/*.php', 'controller/*/*.php',
        'lib/*.php', 'lib/*/*.php', 'lib/*/*/*.php', 'templates/*.twig', 'templates/*/*.twig', 'templates/*/*/*.twig']
else:
    glob_base = 'plugins/'+scope+'/'
    glob_patterns = ['*.php', '*/*.php', 'templates/*.twig', 'templates/*/*.twig', 'templates/*/*/*.twig']

out = OrderedDict()

locales = set()

existing = dict()

if scope == 'core':
    locale_path = 'locale/'
else:
    locale_path = 'plugins/'+scope+'/locale/'

for f in glob(locale_path + '*_*.json'):
    s = json.loads(open(f).read())
    loc = f[-10:-5]
    locales.add(loc)
    existing[loc] = s

for gp in glob_patterns:
    for f in glob(glob_base + gp):
        fn = f.replace(glob_base, '')
        if scope == 'core' and fn[:18] == 'templates/scopes/':
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
                print msg
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



if scope != 'core':
    if not path.exists(locale_path[:-1]):
        os.mkdir(locale_path[:-1])

keymap = None

if path.exists(locale_path + 'messages.json'):
    missing = 0
    keymap = dict()
    ref = json.load(open(locale_path + 'messages.json'))
    for k in sorted(ref.keys()):
        k2 = k
        if k2 not in out:
            k2 = k.replace('\n', '').strip().encode('utf-8')
            if k2 not in out:
                missing += 1
                print 'found in json, but missing in source: "{}"'.format(k)
                continue
        keymap[k2] = k
    print '-----'
    missing2 = 0
    for k in sorted(out.keys()):
        k2 = k
        if k2 not in ref:
            k2 = k.replace('\n', '').strip().encode('utf-8')
            if k2 not in ref:
                missing2 += 1
                print 'found in source, but missing in json: "{}"'.format(k)
                continue
        keymap[k2] = k
    print 'missing in source total', missing
    print 'missing in json', missing2

# open(locale_path + 'en_US.json', 'w').write(json.dumps(out))




f_out = open(locale_path + 'messages.tsv', 'w')
log = csv.writer(f_out, dialect='excel-tab')
# 
locales = ['en_US', 'de_DE', 'fr_FR', 'es_ES', 'it_IT', 'zh_CN', 'pt_BR', 'fi_FI', 'da_DK', 'nl_NL', 'sl_SI']
if scope == 'core':
    log.writerow(['found in', 'key'] + locales)
else:
    log.writerow(['scope', 'key'] + locales)

for k in out:
    if scope == 'core':
        row = [found_in[k], k]
    else:
        row = [scope, k]

    for loc in locales:
        if loc in existing and keymap is not None and k in keymap and keymap[k] in existing[loc]:
            row.append(existing[loc][keymap[k]].encode('utf-8'))
        else:
            row.append(out[k])
    log.writerow(row)
    
f_out.close()
