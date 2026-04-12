const fs = require('fs');
const path = require('path');

// Parse .env file manually
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
    name: 'groupery',
    script: './dist/index.cjs',
    cwd: '/home/rami/Groupery',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/home/rami/.pm2/logs/groupery-error.log',
    out_file: '/home/rami/.pm2/logs/groupery-out.log',
    time: true,
    env: envVars
  }]
}
