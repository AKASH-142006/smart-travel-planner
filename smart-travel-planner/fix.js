const fs = require('fs');
let content = fs.readFileSync('client/js/app.js', 'utf8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$\{/g, '${');
content = content.replace(/proceedToHotels\(\$\{d\.id\}, '\$\{d\.name\}', \$\{d\.price\}\)/g, 'openDestDetail(${d.id})');

fs.writeFileSync('client/js/app.js', content);
console.log('Fixed app.js');
