const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const colorMap = {
  // brand -> indigo
  'brand-50': 'indigo-50 dark:bg-indigo-500/10',
  'brand-100': 'indigo-100 dark:bg-indigo-500/20',
  'brand-200': 'indigo-200 dark:border-indigo-500/30',
  'brand-300': 'indigo-300 dark:text-indigo-400',
  'brand-400': 'indigo-400 dark:text-indigo-400',
  'brand-500': 'indigo-500 dark:bg-indigo-600',
  'brand-600': 'indigo-600 dark:text-indigo-400',
  'brand-700': 'indigo-700 dark:text-indigo-300',
  'brand-800': 'indigo-800',
  'brand-900': 'indigo-900',
  'brand-950': 'indigo-950',
  
  // surface -> slate
  'surface-50': 'slate-50 dark:bg-slate-900',
  'surface-100': 'slate-100 dark:bg-slate-800',
  'surface-200': 'slate-200 dark:border-slate-700',
  'surface-300': 'slate-300 dark:text-slate-400',
  'surface-400': 'slate-400 dark:text-slate-400',
  'surface-500': 'slate-500 dark:text-slate-400',
  'surface-600': 'slate-600 dark:text-slate-300',
  'surface-700': 'slate-700 dark:text-slate-200',
  'surface-800': 'slate-800 dark:text-slate-100',
  'surface-900': 'slate-900 dark:text-slate-50',
  'surface-950': 'slate-950 dark:bg-slate-950',
};

function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace surface-* with slate-*
  content = content.replace(/([a-z-]+)-surface-(\d+)(\/[0-9]+)?/g, (match, prefix, num, opacity) => {
    return `${prefix}-slate-${num}${opacity || ''} dark:${prefix}-slate-${num === '50' ? '900' : num === '100' ? '800' : num === '200' ? '700' : num === '800' ? '200' : num === '900' ? '100' : num === '950' ? '50' : '400'}${opacity || ''}`;
  });

  // Replace brand-* with indigo-*
  content = content.replace(/([a-z-]+)-brand-(\d+)(\/[0-9]+)?/g, (match, prefix, num, opacity) => {
    return `${prefix}-indigo-${num}${opacity || ''} dark:${prefix}-indigo-${num === '50' ? '900/20' : num === '100' ? '800/30' : num === '200' ? '700/40' : num === '500' ? '400' : num === '600' ? '400' : num === '700' ? '300' : '400'}${opacity || ''}`;
  });
  
  // Replace arbitrary gradient maps
  content = content.replace(/bg-gradient-brand/g, 'bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500');
  content = content.replace(/bg-brand-canvas/g, 'bg-slate-50 dark:bg-slate-950');
  content = content.replace(/text-gradient-brand/g, 'bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300');

  if (content !== original) {
    // deduplicate dark: classes if we accidentally generated dark:bg-slate-900 dark:bg-slate-900
    // simple cleanup
    content = content.replace(/dark:([a-z-]+)-([a-z0-9\/]+)\s+dark:\1-\2/g, 'dark:$1-$2');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

walkDir('./src/pages', processFile);
walkDir('./src/components', processFile);
console.log('Tokens replaced successfully.');
