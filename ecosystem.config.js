module.exports = {
  apps : [{
    name: 'http',
    script: 'index.js',
    env: {
      "NODE_ENV": 'development',
    },
    env_production: {
      "NODE_ENV": 'production',
    },
  },
  {
    name: 'store',
    script: '../pyvenv/bin/daphne',
    args: '-b 0.0.0.0 -p 8000 store.asgi:application',
    interpreter: '../pyvenv/bin/python3',
    env: {
      "DJANGO_SETTINGS_MODULE": 'store.settings.development',
    },
    env_production: {
      "DJANGO_SETTINGS_MODULE": 'store.settings.production',
    },
  },
  ],
};
