#!/usr/bin/env node
/**
 * Build Optimization Script
 * Adds pre-compressed gzip/brotli files for better performance
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const brotliCompress = promisify(zlib.brotliCompress);

const DIST_DIR = path.join(__dirname, '..', 'dist');

// Files to compress
const COMPRESSIBLE_EXTENSIONS = ['.html', '.css', '.js', '.json', '.svg', '.xml'];

async function shouldCompress(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return COMPRESSIBLE_EXTENSIONS.includes(ext);
}

async function compressFile(filePath) {
  const content = fs.readFileSync(filePath);
  const originalSize = content.length;
  
  // Skip small files (< 1KB)
  if (originalSize < 1024) {
    return { skipped: true };
  }
  
  try {
    // Gzip compression
    const gzipped = await gzip(content, { level: 9 });
    fs.writeFileSync(`${filePath}.gz`, gzipped);
    
    // Brotli compression
    const brotli = await brotliCompress(content, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11
      }
    });
    fs.writeFileSync(`${filePath}.br`, brotli);
    
    return {
      original: originalSize,
      gzip: gzipped.length,
      brotli: brotli.length,
      gzipSavings: ((originalSize - gzipped.length) / originalSize * 100).toFixed(1),
      brotliSavings: ((originalSize - brotli.length) / originalSize * 100).toFixed(1)
    };
  } catch (err) {
    console.error(`Failed to compress ${filePath}:`, err.message);
    return { error: true };
  }
}

async function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await walkDir(fullPath, callback);
    } else {
      await callback(fullPath);
    }
  }
}

async function optimize() {
  console.log('🚀 Optimizing build output...\n');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run npm run build first.');
    process.exit(1);
  }
  
  let compressed = 0;
  let skipped = 0;
  let errors = 0;
  let totalOriginal = 0;
  let totalGzip = 0;
  let totalBrotli = 0;
  
  await walkDir(DIST_DIR, async (filePath) => {
    if (await shouldCompress(filePath)) {
      // Skip already compressed files
      if (filePath.endsWith('.gz') || filePath.endsWith('.br')) {
        return;
      }
      
      const result = await compressFile(filePath);
      
      if (result.error) {
        errors++;
      } else if (result.skipped) {
        skipped++;
      } else {
        compressed++;
        totalOriginal += result.original;
        totalGzip += result.gzip;
        totalBrotli += result.brotli;
        
        const relativePath = path.relative(DIST_DIR, filePath);
        console.log(`✓ ${relativePath}`);
        console.log(`  Original: ${result.original} bytes`);
        console.log(`  Gzip: ${result.gzip} bytes (${result.gzipSavings}% smaller)`);
        console.log(`  Brotli: ${result.brotli} bytes (${result.brotliSavings}% smaller)\n`);
      }
    }
  });
  
  console.log('='.repeat(50));
  console.log(`Files compressed: ${compressed}`);
  console.log(`Files skipped (too small): ${skipped}`);
  console.log(`Errors: ${errors}`);
  
  if (compressed > 0) {
    const gzipSavings = ((totalOriginal - totalGzip) / totalOriginal * 100).toFixed(1);
    const brotliSavings = ((totalOriginal - totalBrotli) / totalOriginal * 100).toFixed(1);
    
    console.log(`\nTotal savings:`);
    console.log(`  Gzip: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalGzip / 1024).toFixed(1)}KB (${gzipSavings}%)`);
    console.log(`  Brotli: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalBrotli / 1024).toFixed(1)}KB (${brotliSavings}%)`);
  }
  
  console.log('\n✅ Optimization complete!');
}

optimize().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
});
