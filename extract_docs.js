const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const files = ["SRS_Part_1.docx", "SRS_Part_2.docx", "SRS_Part_3.docx"];

async function extractAll() {
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    console.log(`\n========== ${file} ==========\n`);
    
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      console.log(result.value);
      if (result.messages.length > 0) {
        console.log("\nMessages:", result.messages);
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
}

extractAll();
