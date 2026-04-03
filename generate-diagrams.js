/**
 * Script to generate diagram images from SYSTEM_ARCHITECTURE.md
 * 
 * Prerequisites:
 * npm install -g @mermaid-js/mermaid-cli
 * 
 * Usage:
 * node generate-diagrams.js
 */

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Read the markdown file
const markdownContent = fs.readFileSync('SYSTEM_ARCHITECTURE.md', 'utf8');

// Extract all mermaid code blocks
const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
const diagrams = [];
let match;

while ((match = mermaidRegex.exec(markdownContent)) !== null) {
  diagrams.push(match[1].trim());
}

console.log(`Found ${diagrams.length} diagrams`);

// Create output directory
const outputDir = 'architecture-diagrams';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Diagram names
const diagramNames = [
  '01-complete-system-architecture',
  '02-sos-event-creation-flow',
  '03-supervisor-registration-approval',
  '04-event-acceptance-flow',
  '05-dashboard-realtime-updates',
  '06-locate-button-flow',
  '07-technology-stack',
  '08-security-architecture',
  '09-deployment-architecture'
];

// Generate each diagram
diagrams.forEach((diagram, index) => {
  const filename = diagramNames[index] || `diagram-${index + 1}`;
  const mmdFile = path.join(outputDir, `${filename}.mmd`);
  const pngFile = path.join(outputDir, `${filename}.png`);
  const svgFile = path.join(outputDir, `${filename}.svg`);
  
  // Write mermaid file
  fs.writeFileSync(mmdFile, diagram);
  
  // Generate PNG
  exec(`mmdc -i "${mmdFile}" -o "${pngFile}" -b transparent`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating PNG for ${filename}:`, error.message);
      return;
    }
    console.log(`✅ Generated: ${pngFile}`);
  });
  
  // Generate SVG
  exec(`mmdc -i "${mmdFile}" -o "${svgFile}" -b transparent`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating SVG for ${filename}:`, error.message);
      return;
    }
    console.log(`✅ Generated: ${svgFile}`);
  });
});

console.log('\n📁 All diagrams will be saved in:', outputDir);
console.log('\nFormats generated:');
console.log('  - PNG (for presentations, documents)');
console.log('  - SVG (for web, scalable graphics)');
console.log('  - MMD (source files for editing)');
