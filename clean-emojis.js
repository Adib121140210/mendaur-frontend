// Script untuk membersihkan emoji dari console logs
// Buat versi humanis dari semua console logs

const fs = require('fs');
const path = require('path');

// Define emoji replacements
const emojiReplacements = {
  '🔑': '',
  '👤': '',
  '📝': '',
  '🧩': '',
  '✅': '',
  '❌': '',
  '🆔': '',
  '🔐': '',
  '🌐': '',
  '📡': '',
  '📊': '',
  '📄': '',
  '🔧': '',
  '⚠️': '',
  '💰': '',
  '♻️': '',
  '🛍️': '',
  '🎖️': '',
  '🔴': '',
  '⭐': '',
  '🏆': '',
  '🌟': '',
  '💎': '',
  'ℹ️': '',
  '📋': '',
  '🗂️': '',
  '💡': '',
  '⚡': '',
  '🎯': '',
  '🚀': '',
  '💻': '',
  '📱': '',
  '🖥️': ''
};

function cleanEmojisFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Replace emojis in console logs
    for (const [emoji, replacement] of Object.entries(emojiReplacements)) {
      const beforeReplace = content;
      content = content.replace(new RegExp(emoji, 'g'), replacement);
      if (content !== beforeReplace) {
        hasChanges = true;
      }
    }
    
    // Clean up extra spaces that might be left
    content = content.replace(/console\.(log|error|warn|info)\('\s+/g, 'console.$1(\'');
    content = content.replace(/console\.(log|error|warn|info)\(`\s+/g, 'console.$1(`');
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Files to clean
const filesToClean = [
  'src/services/adminApi.js',
  'src/services/badgeService.js',
  'src/services/notificationService.js',
  'src/Components/Form/FormSetorSampah.jsx',
  'src/Components/Pages/tukarPoin/tukarPoin.jsx',
  'src/Components/Pages/riwayatTransaksi/riwayatTransaksi.jsx',
  'src/Components/Pages/forgotPassword/forgotPassword.jsx',
  'src/Components/Pages/context/AuthContext.jsx',
  'src/Components/Pages/adminDashboard/components/NotificationManagement.jsx',
  'src/Components/Pages/adminDashboard/components/ScheduleManagement.jsx'
];

console.log('Starting emoji cleanup...');

filesToClean.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    cleanEmojisFromFile(fullPath);
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});

console.log('Emoji cleanup completed!');
