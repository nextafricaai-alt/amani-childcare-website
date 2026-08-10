const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local or .env
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const {
  FTP_HOST,
  FTP_USER,
  FTP_PASSWORD,
  FTP_PORT = 21,
  FTP_SECURE = false,
  FTP_REMOTE_ROOT = 'public_html'
} = process.env;

async function deploy() {
  if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
    console.error('\n❌ Missing FTP Credentials!');
    console.log('Please create or update your `.env.local` file in the project root with your Hostinger FTP details:\n');
    console.log('FTP_HOST=ftp.pikadon.ug  (or your Hostinger IP address)');
    console.log('FTP_USER=your_ftp_username');
    console.log('FTP_PASSWORD=your_ftp_password');
    console.log('FTP_PORT=21');
    console.log('FTP_REMOTE_ROOT=public_html\n');
    process.exit(1);
  }

  const client = new ftp.Client(45000); // 45s timeout
  client.ftp.verbose = true;

  const outDir = path.join(__dirname, '../out');

  if (!fs.existsSync(outDir)) {
    console.error('\n❌ `out/` folder not found. Please run `npm run build` first.');
    process.exit(1);
  }

  try {
    console.log(`\n🚀 Connecting to FTP server: ${FTP_HOST}...`);
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      port: parseInt(FTP_PORT, 10),
      secure: FTP_SECURE === 'true' || FTP_SECURE === true,
      secureOptions: { rejectUnauthorized: false }
    });

    console.log(`\n📁 Uploading static site from \`out/\` to \`${FTP_REMOTE_ROOT}/\` on Hostinger...`);
    await client.ensureDir(FTP_REMOTE_ROOT);
    await client.clearWorkingDir(); // Cleans remote directory so old subfolders/files are removed!
    await client.uploadFromDir(outDir);

    console.log('\n🎉 SUCCESS! Website uploaded cleanly to Hostinger!');
    console.log('🌐 Visit https://pikadon.ug (or refresh in Incognito mode)\n');
  } catch (err) {
    console.error('\n❌ FTP Deployment Error:', err.message);
  } finally {
    client.close();
  }
}

deploy();
