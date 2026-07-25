const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');
const cssDir = path.join(outDir, '_next/static/css');

// Find compiled CSS file
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
if (cssFiles.length === 0) {
  console.error('No CSS files found!');
  process.exit(1);
}

const cssPath = path.join(cssDir, cssFiles[0]);
const cssContent = fs.readFileSync(cssPath, 'utf8');

console.log(`Found CSS file (${cssFiles[0]}), size: ${cssContent.length} bytes.`);

const styleTag = `<style id="inlined-amani-css">\n${cssContent}\n</style>`;

// List html files to process
const htmlFiles = ['index.html', 'fees.html', 'visit.html', 'our-promise.html', '404.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf8');

  // Replace external link rel="stylesheet" with inlined <style> tag
  html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/i, styleTag);

  // Replace root-absolute links (/fees -> fees.html) for static host compatibility
  html = html.replace(/href="\/fees"/g, 'href="fees.html"');
  html = html.replace(/href="\/visit"/g, 'href="visit.html"');
  html = html.replace(/href="\/our-promise"/g, 'href="our-promise.html"');
  html = html.replace(/href="\/our-promise#safeguarding"/g, 'href="our-promise.html#safeguarding"');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Successfully inlined CSS into ${file}`);
});

console.log('✅ All HTML files now have CSS 100% inlined directly inside them!');
