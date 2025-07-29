#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function autoPush() {
  try {
    // Check if there are any changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim()) {
      console.log('🔄 Changes detected, committing and pushing...');
      
      // Add all changes
      execSync('git add .', { stdio: 'inherit' });
      
      // Create commit with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const commitMessage = `Auto-commit: ${timestamp}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      
      // Push to remote
      execSync('git push origin main', { stdio: 'inherit' });
      
      console.log('✅ Successfully pushed changes to GitHub');
    } else {
      console.log('📝 No changes to commit');
    }
  } catch (error) {
    console.error('❌ Error during auto-push:', error.message);
  }
}

// Run auto-push
autoPush(); 