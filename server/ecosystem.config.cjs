module.exports = {
  apps: [{
    name: 'toko-nusantara',
    script: 'app.js',
    cwd: __dirname,
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
