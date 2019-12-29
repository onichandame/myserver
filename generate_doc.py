#!/usr/bin/env python3

import sys
import os
import subprocess
import shutil
from jobqueue.jobqueue import JobQueue

q = JobQueue()

if not shutil.which('jsdoc'):
    print('[Error] jsdoc has not been found on your system')
    sys.exit(1)

print('building doc')

_out_dir_=os.path.join(os.path.dirname(__file__),'out')
if os.path.exists(_out_dir_):
    shutil.rmtree(_out_dir_)
if q.run([shutil.which('jsdoc'),'-c',os.path.join(os.path.dirname(_out_dir_),'jsdoc.json'),'-p','-R','README.md','-r',os.path.dirname(_out_dir_),'-d',_out_dir_],cwd=os.path.dirname(_out_dir_),stdout=subprocess.PIPE):
    print('[Error] jsdoc failed')
    sys.exit(1)
