require('dotenv').config();
const AudioService = require('./services/audioService');
const fs = require('fs');
const path = require('path');

async function cleanupCorruptedAudio() {
  console.log('🧹 Cleaning up corrupted audio files...\n');
  
  const audioService = new AudioService();
  const audioDir = audioService.OUTPUT_DIR;
  
  try {
    // Check if audio directory exists
    if (!fs.existsSync(audioDir)) {
      console.log('📁 Audio directory does not exist. Nothing to clean.');
      return;
    }
    
    // Get all MP3 files
    const files = fs.readdirSync(audioDir).filter(file => file.endsWith('.mp3'));
    console.log(`📊 Found ${files.length} MP3 files to check\n`);
    
    let corruptedCount = 0;
    let validCount = 0;
    let fixedCount = 0;
    
    for (const file of files) {
      const projectId = path.basename(file, '.mp3');
      const filePath = path.join(audioDir, file);
      
      try {
        const stats = fs.statSync(filePath);
        console.log(`🔍 Checking: ${file} (${stats.size} bytes)`);
        
        // Check if file is too small (likely corrupted)
        if (stats.size < 1024) {
          console.log(`❌ Corrupted (too small): ${file}`);
          corruptedCount++;
          
          // Fix by creating valid silent audio
          console.log(`🔧 Fixing: ${file}`);
          audioService.createSilentAudio(projectId);
          fixedCount++;
          console.log(`✅ Fixed: ${file}`);
        } else {
          console.log(`✅ Valid: ${file}`);
          validCount++;
        }
      } catch (error) {
        console.log(`❌ Error checking ${file}: ${error.message}`);
        corruptedCount++;
        
        // Try to fix anyway
        try {
          console.log(`🔧 Attempting to fix: ${file}`);
          audioService.createSilentAudio(projectId);
          fixedCount++;
          console.log(`✅ Fixed: ${file}`);
        } catch (fixError) {
          console.log(`❌ Failed to fix ${file}: ${fixError.message}`);
        }
      }
    }
    
    console.log('\n📋 Cleanup Summary:');
    console.log(`✅ Valid files: ${validCount}`);
    console.log(`❌ Corrupted files found: ${corruptedCount}`);
    console.log(`🔧 Files fixed: ${fixedCount}`);
    console.log(`📁 Total files processed: ${files.length}`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 Corrupted audio files have been fixed!');
      console.log('🚀 Remotion rendering should now work without audio errors.');
    } else if (corruptedCount === 0) {
      console.log('\n✨ All audio files are already valid!');
    } else {
      console.log('\n⚠️ Some files could not be fixed automatically.');
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupCorruptedAudio().catch(console.error);
}

module.exports = { cleanupCorruptedAudio };
