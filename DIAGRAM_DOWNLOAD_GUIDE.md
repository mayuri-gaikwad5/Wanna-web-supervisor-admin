# How to Download Architecture Diagrams

## 🎯 Quick Methods

### Method 1: Online (Easiest - No Installation)

1. **Go to**: https://mermaid.live
2. **Open** `SYSTEM_ARCHITECTURE.md` in this project
3. **Copy** the code between ` ```mermaid ` and ` ``` ` for any diagram
4. **Paste** into Mermaid Live Editor
5. **Click** the download icon (top right)
6. **Choose format**: PNG, SVG, or PDF
7. **Repeat** for each of the 9 diagrams

**Pros**: No installation needed, works immediately  
**Cons**: Manual process for each diagram

---

### Method 2: Using Mermaid CLI (Automated - All at Once)

#### Step 1: Install Mermaid CLI
```bash
npm install -g @mermaid-js/mermaid-cli
```

#### Step 2: Run the generation script
```bash
node generate-diagrams.js
```

#### Step 3: Find your diagrams
All diagrams will be in the `architecture-diagrams/` folder:
- PNG files (for presentations, Word docs)
- SVG files (for web, scalable)
- MMD files (source for editing)

**Output files**:
```
architecture-diagrams/
├── 01-complete-system-architecture.png
├── 01-complete-system-architecture.svg
├── 01-complete-system-architecture.mmd
├── 02-sos-event-creation-flow.png
├── 02-sos-event-creation-flow.svg
├── 02-sos-event-creation-flow.mmd
├── 03-supervisor-registration-approval.png
├── 03-supervisor-registration-approval.svg
├── 03-supervisor-registration-approval.mmd
├── 04-event-acceptance-flow.png
├── 04-event-acceptance-flow.svg
├── 04-event-acceptance-flow.mmd
├── 05-dashboard-realtime-updates.png
├── 05-dashboard-realtime-updates.svg
├── 05-dashboard-realtime-updates.mmd
├── 06-locate-button-flow.png
├── 06-locate-button-flow.svg
├── 06-locate-button-flow.mmd
├── 07-technology-stack.png
├── 07-technology-stack.svg
├── 07-technology-stack.mmd
├── 08-security-architecture.png
├── 08-security-architecture.svg
├── 08-security-architecture.mmd
├── 09-deployment-architecture.png
├── 09-deployment-architecture.svg
└── 09-deployment-architecture.mmd
```

**Pros**: Generates all diagrams at once, multiple formats  
**Cons**: Requires Node.js and npm installation

---

### Method 3: Using VS Code Extension

#### Step 1: Install Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Markdown Preview Mermaid Support"
4. Install it

#### Step 2: Export Diagrams
1. Open `SYSTEM_ARCHITECTURE.md`
2. Click "Open Preview" (Ctrl+Shift+V)
3. Right-click on any diagram in preview
4. Select "Export to..." → Choose PNG/SVG/PDF
5. Save the file

**Pros**: Visual preview, easy to use  
**Cons**: Manual export for each diagram

---

### Method 4: Using GitHub (If pushed to repo)

1. **Push** `SYSTEM_ARCHITECTURE.md` to GitHub
2. **View** the file on GitHub (diagrams render automatically)
3. **Right-click** on any diagram
4. **Save image as...**

**Pros**: No local tools needed  
**Cons**: Lower resolution, requires GitHub

---

## 🎨 Recommended Formats

| Format | Best For | File Size |
|--------|----------|-----------|
| **PNG** | Presentations, Word docs, Reports | Medium |
| **SVG** | Websites, Scalable graphics, Print | Small |
| **PDF** | Documentation, Archiving | Medium |

---

## 🔧 Troubleshooting

### Issue: "mmdc command not found"
**Solution**: Install Mermaid CLI globally
```bash
npm install -g @mermaid-js/mermaid-cli
```

### Issue: Puppeteer installation fails
**Solution**: Install with legacy peer deps
```bash
npm install -g @mermaid-js/mermaid-cli --legacy-peer-deps
```

### Issue: Diagrams look blurry
**Solution**: Use SVG format instead of PNG for better quality

### Issue: Script doesn't run
**Solution**: Make sure you're in the project root directory
```bash
cd /path/to/your/project
node generate-diagrams.js
```

---

## 📦 Quick Start (Recommended)

For the fastest results, use **Method 1** (Mermaid Live):

1. Open https://mermaid.live
2. Copy diagram code from `SYSTEM_ARCHITECTURE.md`
3. Paste and download
4. Takes ~2 minutes per diagram

For bulk download, use **Method 2** (CLI):

```bash
# One-time setup
npm install -g @mermaid-js/mermaid-cli

# Generate all diagrams
node generate-diagrams.js

# Done! Check architecture-diagrams/ folder
```

---

## 📝 Notes

- All diagrams are in `SYSTEM_ARCHITECTURE.md`
- 9 diagrams total
- Each diagram is independent
- Source code is in Mermaid format
- Can be edited and regenerated anytime

---

**Need help?** Check the Mermaid documentation: https://mermaid.js.org/
