#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Configuration
const WATCH_PATTERNS = [
  'src/**/*',
  'public/**/*',
  '*.json',
  '*.md',
  '*.ts',
  '*.tsx',
  '*.js',
  '*.jsx'
];

const IGNORE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  '.git/**',
  '*.log',
  'dist/**',
  'build/**'
];

let isCommitting = false;
let pendingChanges = new Set();

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function autoCommitAndPush() {
  if (isCommitting || pendingChanges.size === 0) return;
  
  isCommitting = true;
  
  try {
    console.log('🔄 Changes detected, committing and pushing...');
    
    // Check if there are any changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim()) {
      // Add all changes
      execSync('git add .', { stdio: 'inherit' });
      
      // Create commit with timestamp and changed files
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const changedFiles = Array.from(pendingChanges).slice(0, 5).join(', ');
      const commitMessage = `Auto-commit: ${timestamp} - ${changedFiles}${pendingChanges.size > 5 ? ' and more...' : ''}`;
      
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      
      // Push to remote
      execSync('git push origin main', { stdio: 'inherit' });
      
      console.log('✅ Successfully pushed changes to GitHub');
      pendingChanges.clear();
    }
  } catch (error) {
    console.error('❌ Error during auto-push:', error.message);
  } finally {
    isCommitting = false;
  }
}

// Debounced version of auto-commit
const debouncedAutoCommit = debounce(autoCommitAndPush, 2000);

function onFileChange(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  pendingChanges.add(relativePath);
  console.log(`📝 File changed: ${relativePath}`);
  debouncedAutoCommit();
}

function onFileDelete(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  pendingChanges.add(relativePath);
  console.log(`🗑️  File deleted: ${relativePath}`);
  debouncedAutoCommit();
}

function startWatching() {
  console.log('👀 Starting file watcher for auto-push...');
  console.log('📁 Watching patterns:', WATCH_PATTERNS.join(', '));
  console.log('🚫 Ignoring patterns:', IGNORE_PATTERNS.join(', '));
  console.log('⏰ Auto-push will trigger 2 seconds after changes');
  console.log('🛑 Press Ctrl+C to stop watching');
  
  const watcher = chokidar.watch(WATCH_PATTERNS, {
    ignored: IGNORE_PATTERNS,
    persistent: true,
    ignoreInitial: true
  });
  
  watcher
    .on('add', onFileChange)
    .on('change', onFileChange)
    .on('unlink', onFileDelete)
    .on('error', error => console.error('Watcher error:', error));
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping file watcher...');
    watcher.close();
    process.exit(0);
  });
}

// Check if chokidar is available, if not, fall back to simple auto-push
try {
  require.resolve('chokidar');
  startWatching();
} catch (error) {
  console.log('⚠️  chokidar not found, falling back to simple auto-push');
  console.log('💡 Install chokidar for file watching: npm install chokidar');
  autoCommitAndPush();
} 