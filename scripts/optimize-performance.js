#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Analyzes bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Performance Optimization Analysis\n');

// Check if build exists
const buildPath = path.join(process.cwd(), '.next');
if (!fs.existsSync(buildPath)) {
  console.log('❌ No build found. Please run "npm run build" first.');
  process.exit(1);
}

// Analyze bundle size
function analyzeBundleSize() {
  console.log('📊 Bundle Size Analysis:');
  
  const staticPath = path.join(buildPath, 'static');
  if (fs.existsSync(staticPath)) {
    const chunks = fs.readdirSync(path.join(staticPath, 'chunks')).filter(f => f.endsWith('.js'));
    const totalSize = chunks.reduce((acc, chunk) => {
      const filePath = path.join(staticPath, 'chunks', chunk);
      const stats = fs.statSync(filePath);
      return acc + stats.size;
    }, 0);
    
    console.log(`   Total JS Bundle Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Number of Chunks: ${chunks.length}`);
    
    // Recommendations
    if (totalSize > 1024 * 1024) { // > 1MB
      console.log('⚠️  Bundle size is large. Consider code splitting.');
    } else {
      console.log('✅ Bundle size is reasonable.');
    }
  }
}

// Check for optimization opportunities
function checkOptimizations() {
  console.log('\n🔍 Optimization Opportunities:');
  
  const appDir = path.join(process.cwd(), 'app');
  const components = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for large components
        if (content.length > 10000) {
          components.push({
            file: filePath.replace(process.cwd(), ''),
            size: content.length,
            hasLazyLoading: content.includes('lazy') || content.includes('dynamic'),
            hasImageOptimization: content.includes('next/image'),
            hasMemoization: content.includes('useMemo') || content.includes('useCallback') || content.includes('memo')
          });
        }
      }
    });
  }
  
  scanDirectory(appDir);
  
  // Recommendations
  components.forEach(comp => {
    console.log(`\n📄 ${comp.file}:`);
    console.log(`   Size: ${(comp.size / 1024).toFixed(2)} KB`);
    
    if (!comp.hasLazyLoading && comp.size > 15000) {
      console.log('   🔄 Consider lazy loading for this large component');
    }
    
    if (!comp.hasImageOptimization && comp.file.includes('dashboard')) {
      console.log('   🖼️  Consider using next/image for image optimization');
    }
    
    if (!comp.hasMemoization && comp.size > 20000) {
      console.log('   🧠 Consider adding React.memo or useMemo for performance');
    }
  });
}

// Performance recommendations
function performanceRecommendations() {
  console.log('\n💡 Performance Recommendations:');
  
  const recommendations = [
    '1. Implement lazy loading for dashboard components',
    '2. Use React.memo for expensive components',
    '3. Optimize images with next/image',
    '4. Add loading states for better UX',
    '5. Implement virtual scrolling for large lists',
    '6. Use dynamic imports for heavy libraries',
    '7. Add service worker for caching',
    '8. Optimize MongoDB queries with indexes',
    '9. Implement request caching',
    '10. Use compression middleware'
  ];
  
  recommendations.forEach(rec => console.log(`   ${rec}`));
}

// Run analysis
try {
  analyzeBundleSize();
  checkOptimizations();
  performanceRecommendations();
  
  console.log('\n✨ Analysis complete! Apply the recommendations above for better performance.');
} catch (error) {
  console.error('❌ Error during analysis:', error.message);
}