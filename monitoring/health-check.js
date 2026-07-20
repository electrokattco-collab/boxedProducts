/**
 * Health Check Script for Boxed Sneakers
 * Run this script to verify deployment health
 * 
 * Usage: node monitoring/health-check.js <url>
 * Example: node monitoring/health-check.js https://boxedsneakers.com
 */

const https = require('https');
const http = require('http');

const CHECKS = [
  { path: '/', name: 'Homepage' },
  { path: '/health', name: 'Health Endpoint' },
  { path: '/admin.html', name: 'Admin Page' },
  { path: '/boxedCart.html', name: 'Cart Page' },
  { path: '/data/products.json', name: 'Products Data' },
  { path: '/assets/back.jpg', name: 'Static Asset' },
];

const REQUIRED_HEADERS = [
  'x-frame-options',
  'x-content-type-options',
  'x-xss-protection'
];

async function checkUrl(baseUrl, path) {
  return new Promise((resolve) => {
    const client = baseUrl.startsWith('https') ? https : http;
    const url = new URL(path, baseUrl);
    
    const startTime = Date.now();
    
    const req = client.request(url, { method: 'GET', timeout: 10000 }, (res) => {
      const responseTime = Date.now() - startTime;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          responseTime,
          headers: res.headers,
          size: data.length,
          ok: res.statusCode === 200
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        path,
        status: 0,
        error: err.message,
        ok: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        path,
        status: 0,
        error: 'Timeout',
        ok: false
      });
    });
    
    req.end();
  });
}

function checkSecurityHeaders(headers) {
  const missing = [];
  for (const header of REQUIRED_HEADERS) {
    if (!headers[header]) {
      missing.push(header);
    }
  }
  return missing;
}

async function runHealthChecks() {
  const baseUrl = process.argv[2] || 'http://localhost:80';
  
  console.log(`🔍 Running health checks against: ${baseUrl}\n`);
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const check of CHECKS) {
    process.stdout.write(`  Checking ${check.name}... `);
    
    const result = await checkUrl(baseUrl, check.path);
    results.push(result);
    
    if (result.ok) {
      console.log(`✅ ${result.status} (${result.responseTime}ms)`);
      passed++;
      
      // Check security headers
      if (check.path === '/') {
        const missingHeaders = checkSecurityHeaders(result.headers);
        if (missingHeaders.length > 0) {
          console.log(`    ⚠️  Missing security headers: ${missingHeaders.join(', ')}`);
        }
      }
    } else {
      console.log(`❌ ${result.error || result.status}`);
      failed++;
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n❌ Health check FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ All health checks passed');
    process.exit(0);
  }
}

runHealthChecks().catch(err => {
  console.error('Health check error:', err);
  process.exit(1);
});
