const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '.env');
const envVars = {};
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
  });
}

module.exports = {
  apps: [{
    name: 'accor-mailer',
    script: './dist/index.cjs',
    cwd: '/home/rami/accor-mailer',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    error_file: '/home/rami/.pm2/logs/accor-mailer-error.log',
    out_file: '/home/rami/.pm2/logs/accor-mailer-out.log',
    time: true,
    env: envVars
  }]
};
