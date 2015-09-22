import re
import sys
import os.path as path
import os
from glob import glob
import csv
from collections import OrderedDict
import json

plugin = sys.argv[1]

glob_base = 'plugins/'+plugin+'/'
glob_patterns = ['*.php', '*/*.php', 'templates/*.twig']

out = OrderedDict()

for gp in glob_patterns:
    for f in glob(glob_base + gp):
        fn = f.replace(glob_base, '')
        print fn
        s = open(f).read()
        patterns = ['__\("([^"]*)"\)', '__\(\'([^\']*)\'\)', '{% trans "([^"]*)" %}', '{% trans \'([^\']*)\' %}']
        for pattern in patterns:
            for msg in re.findall(pattern, s):
                if msg not in out:
                    key = raw_input('Enter key for "'+msg+'": ')
                    if key.strip() == '':
                        key = msg
                    else:
                        # replace msg in source file
                        pat = pattern.replace('\\', '').replace('[^"]', '.').replace('[^\']', '.')
                        needle = pat.replace('(.*)', msg)
                        repl = pat.replace('(.*)', key)
                        # print needle, repl
                        s = s.replace(needle, repl)
                    out[key] = msg
        open(f, 'w').write(s)

f_out = open('messages-'+plugin+'.tsv', 'w')

log = csv.writer(f_out, dialect='excel-tab')

for k in out:
    log.writerow([plugin, k, out[k], out[k]])

f_out.close()

if not path.exists('plugins/'+plugin+'/locale'):
    os.mkdir('plugins/'+plugin+'/locale')

print open('messages-'+plugin+'.tsv').read()
open('plugins/'+plugin+'/locale/en_US.json', 'w').write(json.dumps(out))

