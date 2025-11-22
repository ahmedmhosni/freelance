module.exports = {
  apps: [{
    name: 'backend',
    cwd: '/var/app/backend',
    script: 'src/server.js',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_PATH: '/var/app/data/database.sqlite',
      UPLOAD_DIR: '/var/app/uploads'
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '400M',
    error_file: '/var/app/logs/backend-error.log',
    out_file: '/var/app/logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10
  }]
};
