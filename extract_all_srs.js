const fs = require('fs');
const path = require('path');

// Simple extraction for docx files
function extractText(filepath) {
  try {
    const content = fs.readFileSync(filepath);
    const text = content.toString('utf8', 0, content.length);
    // Extract visible text (rough method)
    const visible = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .replace(/\s+/g, ' ');
    return visible.substring(0, 15000);
  } catch (e) {
    return 'Error: ' + e.message;
  }
}

const files = [
  'SRS_Part_1.docx',
  'SRS_Part_2.docx', 
  'SRS_Part_3.docx'
];

files.forEach(file => {
  console.log(`\n========== ${file} ==========\n`);
  console.log(extractText(file));
});
