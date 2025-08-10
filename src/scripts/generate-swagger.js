const fs = require('fs');
const path = require('path');
const specs = require('../config/swagger');

const outputPath = path.resolve(process.cwd(),'public', 'swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));

console.log('✅ Swagger JSON generado en /public/swagger.json');
