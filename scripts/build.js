#!/usr/bin/env node
/**
 * Build script for Boxed Sneakers
 * Copies static files to the dist directory and optimizes for deployment
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}🏗️  Building Boxed Sneakers...${colors.reset}\n`);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Files and directories to copy
const itemsToCopy = [
  // HTML files in root
  { src: '*.html', isGlob: true },
  // Directories
  { src: 'pages', isDir: true },
  { src: 'assets', isDir: true },
  { src: 'src', isDir: true },
  { src: 'data', isDir: true },
];

// Clean and create dist directory
function prepareDist() {
  console.log(`${colors.yellow}📁 Preparing dist directory...${colors.reset}`);
  
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`${colors.green}✓ Dist directory ready${colors.reset}\n`);
}

// Copy a file
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// Copy a directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// Copy items to dist
function copyItems() {
  console.log(`${colors.yellow}📦 Copying files...${colors.reset}`);
  
  // Copy HTML files
  const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));
  for (const file of htmlFiles) {
    const src = path.join(rootDir, file);
    const dest = path.join(distDir, file);
    copyFile(src, dest);
    console.log(`  ${colors.green}✓${colors.reset} ${file}`);
  }

  // Copy directories
  const dirs = ['pages', 'assets', 'src', 'data'];
  for (const dir of dirs) {
    const src = path.join(rootDir, dir);
    const dest = path.join(distDir, dir);
    
    if (fs.existsSync(src)) {
      copyDir(src, dest);
      const fileCount = countFiles(src);
      console.log(`  ${colors.green}✓${colors.reset} ${dir}/ (${fileCount} items)`);
    } else {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${dir}/ (not found, skipping)`);
    }
  }
  
  console.log();
}

// Count files in a directory
function countFiles(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  
  return count;
}

// Verify build
function verifyBuild() {
  console.log(`${colors.yellow}🔍 Verifying build...${colors.reset}`);
  
  const requiredFiles = ['index.html'];
  let allGood = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(distDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ${colors.green}✓${colors.reset} ${file}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${file} (MISSING)`);
      allGood = false;
    }
  }
  
  // Count total files
  const totalFiles = countFiles(distDir);
  console.log(`\n${colors.blue}📊 Total files in dist: ${totalFiles}${colors.reset}`);
  
  if (allGood) {
    console.log(`\n${colors.green}✅ Build completed successfully!${colors.reset}`);
    return true;
  } else {
    console.log(`\n${colors.red}❌ Build verification failed!${colors.reset}`);
    return false;
  }
}

// Copy public files (robots.txt, sitemap.xml, etc.)
function copyPublicFiles() {
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir)) {
    console.log(`${colors.yellow}📄 Copying public files...${colors.reset}`);
    
    const entries = fs.readdirSync(publicDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(publicDir, entry.name);
      const destPath = path.join(distDir, entry.name);
      
      if (entry.isFile()) {
        copyFile(srcPath, destPath);
        console.log(`  ${colors.green}✓${colors.reset} public/${entry.name}`);
      }
    }
    console.log();
  }
}

// Main build process
function build() {
  try {
    prepareDist();
    copyItems();
    copyPublicFiles();
    const success = verifyBuild();
    
    if (success) {
      console.log(`\n${colors.green}🚀 Ready for deployment!${colors.reset}`);
      console.log(`${colors.blue}💡 Run 'npm run optimize' to add compression${colors.reset}`);
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Build failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

build();
