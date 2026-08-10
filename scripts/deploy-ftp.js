const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local or .env
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const host = process.env.FTP_HOST || process.env.FTP_SERVER;
const user = process.env.FTP_USER || process.env.FTP_USERNAME;
const password = process.env.FTP_PASSWORD;
const port = process.env.FTP_PORT || 21;
const remoteRoot = process.env.FTP_REMOTE_ROOT || process.env.FTP_SERVER_DIR || 'public_html';

async function deploy() {
  if (!host || !user || !password) {
    console.error('\n❌ Missing FTP Credentials!');
    console.log('Environment variables required: FTP_HOST (or FTP_SERVER), FTP_USER (or FTP_USERNAME), FTP_PASSWORD');
    process.exit(1);
  }

  const client = new ftp.Client(60000); // 60s timeout
  client.ftp.verbose = true;

  const outDir = path.join(__dirname, '../out');

  if (!fs.existsSync(outDir)) {
    console.error('\n❌ `out/` folder not found. Please run `npm run build` first.');
    process.exit(1);
  }

  try {
    console.log(`\n🚀 Connecting to FTP server: ${host}...`);
    await client.access({
      host,
      user,
      password,
      port: parseInt(port, 10),
      secure: false, // Standard FTP with TLS upgrade if supported
      secureOptions: { rejectUnauthorized: false }
    });

    const currentDir = await client.pwd();
    console.log(`\n📁 Current working directory: ${currentDir}`);

    const isAlreadyInPublicHtml = currentDir.endsWith('/public_html') || currentDir.endsWith('/public_html/');

    if (!isAlreadyInPublicHtml && remoteRoot && remoteRoot !== '.' && remoteRoot !== './') {
      try {
        console.log(`Navigating to ${remoteRoot}...`);
        await client.ensureDir(remoteRoot);
      } catch (e) {
        console.log(`Note navigating: ${e.message}`);
      }
    } else {
      console.log(`Already in root web folder, uploading directly here.`);
    }

    console.log(`\n🧹 Clearing remote directory to ensure clean update...`);
    try {
      await client.clearWorkingDir();
    } catch (e) {
      console.log(`Note clearing dir: ${e.message}`);
    }

    console.log(`\n📤 Uploading static site from \`out/\` to Hostinger...`);
    await client.uploadFromDir(outDir);

    console.log('\n🎉 SUCCESS! Website uploaded cleanly to Hostinger!\n');
  } catch (err) {
    console.error('\n❌ FTP Deployment Error:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
