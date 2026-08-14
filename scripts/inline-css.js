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

const styleTag = `<style id="inlined-pikadon-css">\n${cssContent}\n</style>`;

// Copy _next to next_assets to bypass Hostinger _next leading underscore directory restrictions
const nextSrc = path.join(outDir, '_next');
const nextAssetsDir = path.join(outDir, 'next_assets');

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  fs.readdirSync(source).forEach((file) => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

if (fs.existsSync(nextSrc)) {
  copyFolderRecursiveSync(nextSrc, nextAssetsDir);
  console.log('Successfully copied _next to next_assets');
}

// List html files to process
const htmlFiles = ['index.html', 'fees.html', 'gallery.html', 'visit.html', 'our-promise.html', '404.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf8');

  // Replace external link rel="stylesheet" with inlined <style> tag
  html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/i, styleTag);

  // Replace /_next/ with /next_assets/ to prevent Hostinger _next directory 404s
  html = html.replace(/\/_next\//g, '/next_assets/');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Successfully inlined CSS & updated assets in ${file}`);
});

// Create folder routes so both /fees and /fees.html work on Hostinger
const routeFolders = [
  { file: 'fees.html', folder: 'fees' },
  { file: 'gallery.html', folder: 'gallery' },
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
const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On

  # Rewrite _next requests to next_assets
  RewriteRule ^_next/(.*)$ next_assets/$1 [L]

  # Clean HTML extension rewrite
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^(.*)$ $1.html [L]
</IfModule>
`;

fs.writeFileSync(path.join(outDir, '.htaccess'), htaccessContent, 'utf8');
console.log('Created Hostinger .htaccess rewrite file');

// Copy assets to out/
const videoSrc = path.join(__dirname, '../public/daily-update-video.mp4');
if (fs.existsSync(videoSrc)) {
  fs.copyFileSync(videoSrc, path.join(outDir, 'daily-update-video.mp4'));
  console.log('Copied daily-update-video.mp4 to out/ directory');
}

const standardsVideoSrc = path.join(__dirname, '../public/daily-standards-video.mp4');
if (fs.existsSync(standardsVideoSrc)) {
  fs.copyFileSync(standardsVideoSrc, path.join(outDir, 'daily-standards-video.mp4'));
  console.log('Copied daily-standards-video.mp4 to out/ directory');
}

const crawlingBabySrc = path.join(__dirname, '../public/crawling-baby.mp4');
if (fs.existsSync(crawlingBabySrc)) {
  fs.copyFileSync(crawlingBabySrc, path.join(outDir, 'crawling-baby.mp4'));
  console.log('Copied crawling-baby.mp4 to out/ directory');
}

const slidingChildSrc = path.join(__dirname, '../public/sliding-child.mp4');
if (fs.existsSync(slidingChildSrc)) {
  fs.copyFileSync(slidingChildSrc, path.join(outDir, 'sliding-child.mp4'));
  console.log('Copied sliding-child.mp4 to out/ directory');
}

const portraitSrc = path.join(__dirname, '../public/founders-portrait.jpg');
if (fs.existsSync(portraitSrc)) {
  fs.copyFileSync(portraitSrc, path.join(outDir, 'founders-portrait.jpg'));
  console.log('Copied founders-portrait.jpg to out/ directory');
}

const promiseHeroSrc = path.join(__dirname, '../public/our-promise-hero.webp');
if (fs.existsSync(promiseHeroSrc)) {
  fs.copyFileSync(promiseHeroSrc, path.join(outDir, 'our-promise-hero.webp'));
  console.log('Copied our-promise-hero.webp to out/ directory');
}

['black-child-yellow-burst.jpg', 'black-child-peeking.jpg', 'black-child-astronaut.jpg', 'black-child-blocks.jpg', 'black-child-pointing-pikadon.jpg', 'black-child-peeking-pikadon.jpg', 'black-child-yellow-celebrate.jpg', 'black-child-celebrate-pikadon.jpg', 'black-child-lightbulb-idea.jpg', 'black-children-circle-learning.jpg', 'black-child-doctor-dream.jpg', 'black-child-dark-astronaut.jpg', 'black-vetted-nanny-pikadon.jpg', 'black-child-reading-safety.jpg', 'bible-faith-card.jpg', 'daily-life-card.jpg', 'black-child-camera-gallery.jpg'].forEach(imgName => {
  const imgSrc = path.join(__dirname, `../public/${imgName}`);
  if (fs.existsSync(imgSrc)) {
    fs.copyFileSync(imgSrc, path.join(outDir, imgName));
    console.log(`Copied ${imgName} to out/ directory`);
  }
});

const slidesSrcDir = path.join(__dirname, '../public/hero-slides');
const slidesOutDir = path.join(outDir, 'hero-slides');
if (fs.existsSync(slidesSrcDir)) {
  fs.mkdirSync(slidesOutDir, { recursive: true });
  fs.readdirSync(slidesSrcDir).forEach(file => {
    fs.copyFileSync(path.join(slidesSrcDir, file), path.join(slidesOutDir, file));
  });
  console.log('Copied hero-slides directory to out/hero-slides');
}

const cardsSrcDir = path.join(__dirname, '../public/standards-cards');
const cardsOutDir = path.join(outDir, 'standards-cards');
if (fs.existsSync(cardsSrcDir)) {
  fs.mkdirSync(cardsOutDir, { recursive: true });
  fs.readdirSync(cardsSrcDir).forEach(file => {
    fs.copyFileSync(path.join(cardsSrcDir, file), path.join(cardsOutDir, file));
  });
  console.log('Copied standards-cards directory to out/standards-cards');
}

console.log('✅ Production build ready for Hostinger upload!');
