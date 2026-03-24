const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const AUDIO_DIR = './public/audio';
const BACKUP_DIR = './public/audio-backup';

// Audio files to process
const audioFiles = [
  'overview.mp3',
  'onpage.mp3', 
  'technical.mp3',
  'pagespeed.mp3',
  'keywords.mp3',
  'ai.mp3'
];

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Created backup directory: ${BACKUP_DIR}`);
}

// Process a single audio file
async function fixAudioFile(filename) {
  const inputPath = path.join(AUDIO_DIR, filename);
  const backupPath = path.join(BACKUP_DIR, filename);
  const tempPath = path.join(AUDIO_DIR, `temp_${filename}`);

  try {
    console.log(`\n🔧 Processing: ${filename}`);
    
    // Backup original file
    if (fs.existsSync(inputPath)) {
      fs.copyFileSync(inputPath, backupPath);
      console.log(`  ✅ Backed up original file`);
    }

    // Re-encode with browser-compatible settings
    const command = `ffmpeg -i "${inputPath}" -acodec libmp3lame -ar 44100 -ac 2 -ab 128k -f mp3 "${tempPath}" -y`;
    
    console.log(`  🔄 Re-encoding...`);
    await execAsync(command);
    
    // Replace original with re-encoded file
    fs.copyFileSync(tempPath, inputPath);
    fs.unlinkSync(tempPath);
    
    console.log(`  ✅ Fixed: ${filename}`);
    
    // Check file size
    const stats = fs.statSync(inputPath);
    console.log(`  📊 New size: ${(stats.size / 1024).toFixed(1)}KB`);
    
  } catch (error) {
    console.error(`  ❌ Error processing ${filename}:`, error.message);
    
    // Restore from backup if available
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, inputPath);
      console.log(`  🔄 Restored original file from backup`);
    }
  }
}

// Process all audio files
async function fixAllAudio() {
  console.log('🎵 Starting audio compatibility fix...\n');
  
  for (const filename of audioFiles) {
    await fixAudioFile(filename);
  }
  
  console.log('\n🎉 Audio fix complete!');
  console.log('\n📋 Summary:');
  console.log(`- Processed ${audioFiles.length} files`);
  console.log(`- Backups saved to: ${BACKUP_DIR}`);
  console.log(`- All files re-encoded to: MP3, 44.1kHz, Stereo, 128kbps`);
  console.log('\n✅ Audio should now work in Remotion preview!');
}

// Run if called directly
if (require.main === module) {
  fixAllAudio().catch(console.error);
}

module.exports = { fixAudioFile, fixAllAudio };
