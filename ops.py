import sys
import subprocess
import warnings
from fabric import Connection

warnings.filterwarnings("ignore")

user = 'frans'
env = 'production'

c = Connection(host=sys.argv[1])

# Operations. Run [ bash command(s) ], as [ user ], at [ path ] after deps [ op_keys ].
ops = {
        'container': {
            'run': [
                'lxc-create -n seval -t debian -- -r stretch && systemctl restart networking && lxc-start -n seval && lxc-attach -n seval passwd || true',
                ],
            'as': 'root',
            },
        'apt': {
            'run': [
                'apt update',
                'apt upgrade -y',
                ],
            'as': 'root',
            },
        'nginx': {
            'run': 'apt install nginx -y',
            'as': 'root',
            'deps': ['apt'],
            },
        'lxc': {
            'run': 'apt install lxc -y',
            'as': 'root',
            'deps': ['apt'],
            },
        'build': {
            'run': 'apt install build-essential -y',
            'as': 'root',
            'deps': ['apt'],
            },
        'sudo': {
            'run': 'apt install sudo',
            'as': 'root',
            'deps': ['apt'],
            },
        'wget': {
            'run': 'apt install wget -y',
            'as': 'root',
            'deps': ['apt'],
            },
        'user': {
            'run': [
                'adduser %s || true' % user,
                'adduser %s sudo' % user,
                ],
            'as': 'root',
            'deps': ['sudo'],
            },
        'localbin': {
            'run': 'mkdir ~/bin || true',
            'as': user,
            'deps': ['user'],
            },
        'node': {
            'run': [
                'wget https://nodejs.org/dist/v10.15.2/node-v10.15.2-linux-x64.tar.xz',
                'tar xvf node-v10.15.2-linux-x64.tar.xz',
                'ln -s ~/node-v10.15.2-linux-x64/bin/node ~/bin/ || true',
                'ln -s ~/node-v10.15.2-linux-x64/bin/npm ~/bin/ || true',
                ],
            'as': user,
            'at': '~',
            'deps': ['wget', 'localbin'],
            },
        'src': {
            'run': [
                'mkdir ~/seval || true',
                'tar xvf /tmp/seval.tgz -C ~/seval',
                ],
            'as': user,
            },
        'node_modules': {
            'run': '~/bin/npm i',
            'as': user,
            'at': '~/seval',
            'deps': ['node', 'src'],
            },
        'node_modules_ui': {
            'run': '~/bin/npm i',
            'as': user,
            'at': '~/seval/ui',
            'deps': ['node', 'src'],
            },
        'parcel': {
            'run': [
                '~/bin/npm i -g parcel',
                'ln -s ~/node-v10.15.2-linux-x64/bin/parcel ~/bin/ || true',
                ],
            'as': user,
            'deps': ['node'],
            },
        'pm2': {
            'run': [
                '~/bin/npm i -g pm2',
                'ln -s ~/node-v10.15.2-linux-x64/bin/pm2 ~/bin/ || true',
                ],
            'as': user,
            'deps': ['node'],
            },
        'build_ui': {
            'run': '~/bin/parcel build index.html',
            'as': user,
            'at': '~/seval/ui',
            'deps': ['node_modules_ui', 'parcel'],
            },
        'python3': {
            'run': 'apt install python3-dev python3-venv -y',
            'as': 'root',
            'deps': ['apt', 'build'],
            },
        'pyvenv': {
            'run': 'python3 -m venv pyvenv',
            'as': user,
            'at': '~',
            'deps': ['python3', 'user'],
            },
        'requirements.txt': {
            'run': '~/pyvenv/bin/pip install -r ~/seval/requirements.txt',
            'as': user,
            'deps': ['pyvenv', 'src'],
            },
        'install_db': {
            'run': 'apt install postgresql postgresql-client -y',
            'as': 'root',
            'deps': ['apt'],
            },
        'configure_db': {
            'run': [
                'createuser %s || true' % user,
                'createdb seval -O %s || true' % user,
                ],
            'as': 'postgres',
            'deps': ['install_db', 'user'],
            },
        'migrate': {
            'run': [
                '~/pyvenv/bin/python manage.py migrate',
                '~/pyvenv/bin/python manage.py loaddata store/fixtures/base.json',
            ],
            'at': '~/seval',
            'as': user,
            'deps': ['configure_db', 'pyvenv', 'requirements.txt'],
            },
        'hull_restart': {
            'run': 'systemctl restart nginx',
            'as': 'root',
            },
        'start': {
            'run': '~/bin/pm2 start --env ' + env,
            'at': '~/seval',
            'as': user,
            },
        'stop': {
            'run': '~/bin/pm2 stop all',
            'at': '~/seval',
            'as': user,
            },
        'restart': {
            'run': '~/bin/pm2 restart all',
            'at': '~/seval',
            'as': user,
            },
        'status': {
            'run': '~/bin/pm2 status',
            'at': '~/seval',
            'as': user,
            },
        }


def deploy():
    put()
    run('src')
    restart()

# This should be run as dedicated user, otherwise root will be owner.
def secret_key():
    c.put('store/settings/secret_key.py', remote='/home/%s/seval/store/settings/' % user)

# Put archived snapshot from HEAD at host's /tmp
def put():
    subprocess.run(["git", "archive", '-o', 'seval.tgz', 'HEAD'])
    c.put('seval.tgz', remote='/tmp/')
    subprocess.run(['rm', 'seval.tgz'])

# Do everthing that needs to be done for the project to start (but don't start it)
def unfold():
    for op in ['migrate', 'build_ui', 'node_modules', 'pm2']:
        run(op)

# Make host a public webserver
def serve():
    run('nginx')
    run('lxc')

    c.put('hull/lxc/default.conf', remote='/etc/lxc/default.conf')
    c.put('hull/nginx/modules-enabled/seval.conf', remote='/etc/nginx/modules-enabled/seval.conf')
    c.put('hull/nginx/sites-enabled/default', remote='/etc/nginx/sites-enabled/default')

    run('container')
    run('hull_restart')

# Bring up and down or check status
def start():
    run('start')

def stop():
    run('stop')
    
def restart():
    run('stop')
    run('start')
    
def status():
    run('status')
    
# Run an op by key along with its dependencies
def run(op_key, ignore=[]):

    # Don't run same op twice
    if op_key in ignore:
        return
    ignore.append(op_key)
    
    op = ops[op_key]

    # Run dependencies first
    for dep_op_key in op.get('deps', []):
        run(dep_op_key, ignore)

    if isinstance(op['run'], str):
        op['run'] = [op['run']]

    for command in op['run']:
        c.run("cd {at} && su {su} -c 'PATH=/home/{user}/bin:$PATH {run}'".format(
                at=op.get('at', '/tmp').replace('~', '/home/' + user),
                su=op['as'],
                user=user,
                run=command,
                ))


globals()[sys.argv[2]]()
