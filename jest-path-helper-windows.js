#!/usr/bin/env node

/**
 * This script helps run Jest with proper file paths on Windows.
 * It converts backslashes to forward slashes in file paths.
 * 
 * Usage: node jest-path-helper-windows.js [file-path]
 */

const path = require('path');
const { spawnSync } = require('child_process');

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path');
  process.exit(1);
}

// Convert backslashes to forward slashes
const normalizedPath = filePath.replace(/\\/g, '/');

console.log(`Running Jest with normalized path: ${normalizedPath}`);

// Determine the Jest executable path based on platform
const jestBin = path.resolve(
  process.cwd(), 
  'node_modules', 
  '.bin', 
  process.platform === 'win32' ? 'jest.cmd' : 'jest'
);

// Run Jest with the normalized path
const result = spawnSync(
  jestBin, 
  ['--runInBand', '--watchAll=false', normalizedPath], 
  { 
    stdio: 'inherit',
    shell: true
  }
);

// Exit with the same code as Jest
process.exit(result.status); 