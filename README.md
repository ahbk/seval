# Rotating block

A 3d-animation of a rotating block, [see here](http://seval.io).

## Getting started

Clone this repository and cd to project root:

```
git clone https://github.com/ahbk/seval.git && cd seval
```

### Prerequisites

Install [node](https://nodejs.org/en/download/), [parcel](https://parceljs.org/getting_started.html) and [ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html).

### Installing

Run ``npm install``.

### Development

* Run ``parcel watch ui/index.html --out-dir ui/dist & node index.js``
* Open http://your-dev-host:3000 in your browser

### Deploy

Run ``ansible-playbook deploy.yml -i production``
