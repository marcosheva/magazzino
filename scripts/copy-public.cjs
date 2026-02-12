const fs = require('fs');
const path = require('path');

const from = path.join(__dirname, '..', 'frontend', 'dist');
const to = path.join(__dirname, '..', 'backend', 'public');

if (!fs.existsSync(from)) {
  console.error('Esegui prima: cd frontend && npm run build');
  process.exit(1);
}
fs.mkdirSync(to, { recursive: true });
fs.cpSync(from, to, { recursive: true });
console.log('Frontend copiato in backend/public');
