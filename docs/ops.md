# Devops

## Configure hull

Login on target host.

Install nginx and LXC.
```
# apt install nginx lxc
```

Change /etc/default/lxc-net to:
```
lxc.network.type = veth
lxc.network.link = lxcbr0
lxc.network.flags = up
lxc.network.hwaddr = 00:16:3e:xx:xx:xx
lxc.network.ipv4 = 10.0.3.2/24
lxc.network.ipv4.gateway = 10.0.3.1

lxc.start.auto = 1
```

Create container, set root password and start a console. Inside container, enable root login over ssh on port 8022.
```
# lxc-create -n seval -t debian -- -r stretch
# systemctl restart networking
# lxc-start -n seval
# lxc-attach -n seval passwd
# lxc-console -n seval
...
# echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
# systemctl restart sshd
```

Create `/etc/nginx/modules-enabled/seval.conf` with
```
stream {
    server {
        listen 8022:
        proxy_pass 10.0.3.2:22
    }
}
```

Replace `/etc/nginx/sites-enabled/default` with
```
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://10.0.3.2:3000;
    }
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream websocket {
    server 10.0.3.2:8000;
}

server {
    listen 8000 default_server;
    server_name _;
    location / {
        proxy_pass http://10.0.3.2:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

## Configure container

[Create and enter](https://wiki.debian.org/LXC) a [debian stretch base system](https://wiki.debian.org/Debootstrap).

Add a dedicated unprivileged user. Prompts are used below to tell whether a shell command should be run as the dedicated user ($) or as root (#). Current working directory will be shown in front of prompt when it matters.
```
# adduser frans
```

Install `git` and clone this repo.
```
# apt install git
~$ git clone https://github.com/ahbk/seval.git
```

Download and extract node. Create symbolic links for `node` and `npm` in `~/bin/`.
```
# apt install wget xz-utils
~$ wget https://nodejs.org/dist/v10.15.2/node-v10.15.2-linux-x64.tar.xz
~$ tar xvf node-v10.15.2-linux-x64.tar.xz
$ ln -s ~/node-v10.15.2-linux-x64/bin/node ~/bin/
$ ln -s ~/node-v10.15.2-linux-x64/bin/npm ~/bin/
```

Install node modules for HTTP-server.
```
~/seval$ npm i
```

Install `parcel` and build web user interface
```
$ npm i -g parcel
$ ln -s ~/node-v10.15.2-linux-x64/bin/parcel ~/bin/
~/seval/ui$ npm i
~/seval/ui$ parcel build index.html
```

Configure database.
```
# apt install postgresql postgresql-client
postgres:$ createuser frans
postgres:$ createdb seval -O frans
```

Install python requirements.
```
# apt install python3-venv
~$ python3 -m venv pyvenv
~$ source pyvenv/bin/activate
(pyvenv) ~/seval$ pip install -r requirements.txt
(pyvenv) ~/seval$ ./manage.py migrate
(pyvenv) ~/seval$ ./manage.py loaddata store/fixtures/base.json
```

Install and start pm2
```
$ npm i pm2 -g
$ ln -s ~/node-v10.15.2-linux-x64/bin/pm2 ~/bin/
~/seval$ pm2 start
```

The application is served from port 3000.

