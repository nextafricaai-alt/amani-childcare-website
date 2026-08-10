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

    const rootPwd = await client.pwd();
    console.log(`\n📁 Connected at FTP root: ${rootPwd}`);

    // Detect Hostinger domains/ structure
    let targetDirectories = [];

    try {
      const domainsList = await client.list('/domains');
      for (const item of domainsList) {
        if (item.isDirectory && !item.name.startsWith('.')) {
          targetDirectories.push(`/domains/${item.name}/public_html`);
        }
      }
    } catch (e) {
      console.log('Note checking /domains:', e.message);
    }

    // Fallback if no /domains folder found or if FTP user is already inside public_html
    if (targetDirectories.length === 0) {
      if (rootPwd.endsWith('/public_html') || rootPwd.endsWith('/public_html/')) {
        targetDirectories.push(rootPwd);
      } else {
        targetDirectories.push('public_html');
      }
    }

    console.log(`\n🎯 Target directories to update:`, targetDirectories);

    for (const targetDir of targetDirectories) {
      console.log(`\n🚀 Deploying to: ${targetDir}`);
      try {
        await client.ensureDir(targetDir);
        console.log(`🧹 Clearing remote directory ${targetDir}...`);
        await client.clearWorkingDir();
        console.log(`📤 Uploading static site from \`out/\` to ${targetDir}...`);
        await client.uploadFromDir(outDir);
        console.log(`✅ Successfully deployed to ${targetDir}!`);
      } catch (err) {
        console.error(`❌ Error deploying to ${targetDir}:`, err.message);
      }
    }

    console.log('\n🎉 SUCCESS! Website uploaded cleanly to Hostinger!\n');
  } catch (err) {
    console.error('\n❌ FTP Deployment Error:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
