const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === 'route.ts' || file === 'route.js') {
      let content = fs.readFileSync(fullPath, 'utf8');
      // If it doesn't already have force-dynamic, add it
      if (!content.includes('export const dynamic')) {
        content = 'export const dynamic = "force-dynamic";\n\n' + content;
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Added force-dynamic to ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'app', 'api'));
