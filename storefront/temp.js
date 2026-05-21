const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'app/admin/dashboard/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace hex codes with CSS variables
content = content.replace(/#111111/g, 'var(--text)');
content = content.replace(/#ffffff/g, 'var(--bg)');
content = content.replace(/#f8f9fa/g, 'var(--bg2)');
content = content.replace(/#434844/g, 'var(--text2)');
content = content.replace(/#1c1c18/g, 'var(--text)');
content = content.replace(/#e9ecef/g, 'var(--bd)');

fs.writeFileSync(file, content);
console.log('Colors replaced!');
