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

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Successfully inlined CSS into ${file}`);
});

// Create folder routes so both /fees and /fees.html work on Hostinger
const routeFolders = [
  { file: 'fees.html', folder: 'fees' },
  { file: 'visit.html', folder: 'visit' },
  { file: 'our-promise.html', folder: 'our-promise' }
];

routeFolders.forEach(({ file, folder }) => {
  const srcPath = path.join(outDir, file);
  const targetDir = path.join(outDir, folder);
  if (fs.existsSync(srcPath)) {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(srcPath, path.join(targetDir, 'index.html'));
    console.log(`Created route folder ${folder}/index.html`);
  }
});

// Create .htaccess for Hostinger clean URL rewrites
const htaccessContent = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]
`;

fs.writeFileSync(path.join(outDir, '.htaccess'), htaccessContent, 'utf8');
console.log('Created Hostinger .htaccess rewrite file');

// Copy video asset to out/
const videoSrc = path.join(__dirname, '../public/daily-update-video.mp4');
if (fs.existsSync(videoSrc)) {
  fs.copyFileSync(videoSrc, path.join(outDir, 'daily-update-video.mp4'));
  console.log('Copied daily-update-video.mp4 to out/ directory');
}

console.log('✅ Production build ready for Hostinger upload!');
