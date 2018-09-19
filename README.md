# Rotating block

A 3d-animation of a rotating block, [see here](http://seval.io:3000).

## Getting started

Clone this repository and cd to project root:

```
git clone https://github.com/alexh546/seval.git && cd seval
```

### Prerequisites

Make sure [node](https://nodejs.org/en/download/) is installed.

### Installing

Run ``npm install``.

### Running

* Run ``node index.js``
* Open http://your-dev-host:3000 in your browser

### Deploy

Use [ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) to deploy to a target host
running debian. Create a host file with IP or domain:
```
[seval]
your.target.host.org
```

And run ``ansible-playbook deploy.yml -i path/to/your/host/file``
