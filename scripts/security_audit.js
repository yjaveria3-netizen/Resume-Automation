#!/usr/bin/env node

/**
 * Frontend Security Audit & Linter Script
 * Day 8 Security-Awareness Pass
 *
 * Scans the frontend source code (src/ or frontend/src/) for:
 * 1. Hardcoded secrets and API keys (ghp_, sk-, secret, password:, jwt_secret)
 * 2. Insecure DOM insertions (dangerouslySetInnerHTML, innerHTML)
 * 3. Insecure console.log statements containing credentials or tokens
 * 4. External links missing rel='noopener noreferrer'
 * 5. Insecure/Hardcoded non-HTTPS API URLs without environment variables
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

const STATS = {
  scannedFiles: 0,
  passCount: 0,
  warnCount: 0,
  failCount: 0,
  issues: []
};

// Target scan directories
const searchDirs = [
  path.join(__dirname, '..', 'frontend', 'src'),
  path.join(__dirname, '..', 'src')
];

const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.vue', '.svelte'];

function findFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(file)) {
        results = results.concat(findFiles(filePath));
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (validExtensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  return results;
}

// Security Check Rules
const RULES = [
  {
    id: 'SEC-001',
    name: 'Hardcoded Secret Patterns',
    severity: 'FAIL',
    regex: /(ghp_[a-zA-Z0-9]{30,}|sk-[a-zA-Z0-9]{20,}|jwt_secret\s*=\s*['"][^'"]+['"]|password\s*:\s*['"][^'"]{4,}['"])/i,
    filter: (match, line) => {
      // Ignore placeholders, comments, sample forms, prop definitions
      if (line.includes('type="password"') || line.includes('type=\'password\'') || line.includes('placeholder=') || line.includes('//') || line.includes('/*')) return false;
      return true;
    },
    message: 'Potential hardcoded API token, secret key, or plaintext password found.'
  },
  {
    id: 'SEC-002',
    name: 'Insecure DOM Manipulation / XSS Risk',
    severity: 'FAIL',
    regex: /(dangerouslySetInnerHTML|\.innerHTML\s*=)/,
    filter: () => true,
    message: 'Dangerous innerHTML or dangerouslySetInnerHTML usage detected. Potential XSS vector.'
  },
  {
    id: 'SEC-003',
    name: 'Sensitive Credential Logging in Console',
    severity: 'WARN',
    regex: /console\.(log|debug|info|warn|error)\s*\([^)]*(token|password|secret|auth_token|bearer)[^)]*\)/i,
    filter: (match, line) => {
      // Ignore simple boolean or existence checks like "if (!token) console.log('No token found')"
      return true;
    },
    message: 'console.log statement may output sensitive credentials or tokens in browser logs.'
  },
  {
    id: 'SEC-004',
    name: 'External Link Security (Target Blank Vulnerability)',
    severity: 'WARN',
    regex: /<a[^>]+target=["']_blank["'][^>]*>/i,
    filter: (match, line) => {
      return !/rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i.test(line) && !/rel=["'][^"']*noreferrer[^"']*noopener[^"']*["']/i.test(line);
    },
    message: 'External link opens in a new tab without rel="noopener noreferrer" (Reverse Tabnabbing risk).'
  },
  {
    id: 'SEC-005',
    name: 'Insecure Direct HTTP / Non-Environment API URL',
    severity: 'WARN',
    regex: /fetch\s*\(\s*['"`]http:\/\/(?!localhost|127\.0\.0\.1)/i,
    filter: () => true,
    message: 'Unencrypted plain HTTP API URL found. API endpoints should use HTTPS or environment variables.'
  }
];

function auditFile(filePath) {
  STATS.scannedFiles++;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relPath = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');

  let fileHasIssues = false;

  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1;
    const trimmed = line.trim();

    RULES.forEach(rule => {
      if (rule.regex.test(trimmed)) {
        if (rule.filter(trimmed.match(rule.regex), trimmed)) {
          fileHasIssues = true;
          if (rule.severity === 'FAIL') {
            STATS.failCount++;
          } else {
            STATS.warnCount++;
          }
          STATS.issues.push({
            file: relPath,
            line: lineNum,
            code: trimmed,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            message: rule.message
          });
        }
      }
    });
  });

  if (!fileHasIssues) {
    STATS.passCount++;
  }
}

function runAudit() {
  console.log(`\n${colors.bright}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}         DAY 8 FRONTEND SECURITY AUDIT & LINTER REPORT                  ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}========================================================================${colors.reset}\n`);

  let allFiles = [];
  searchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(findFiles(dir));
    }
  });

  // Remove duplicates
  allFiles = Array.from(new Set(allFiles));

  if (allFiles.length === 0) {
    console.log(`${colors.yellow}[WARN] No source files found in target scan paths.${colors.reset}`);
    return;
  }

  console.log(`${colors.dim}Scanning ${allFiles.length} source file(s) for security oversights...${colors.reset}\n`);

  allFiles.forEach(auditFile);

  // Print Issues
  if (STATS.issues.length > 0) {
    console.log(`${colors.bright}${colors.white}DETAILED FINDINGS:${colors.reset}\n`);
    STATS.issues.forEach(issue => {
      const badge = issue.severity === 'FAIL' 
        ? `${colors.bgRed}${colors.white} FAIL ${colors.reset}` 
        : `${colors.bgYellow}${colors.white} WARN ${colors.reset}`;
      
      console.log(`${badge} ${colors.bright}${issue.file}:${issue.line}${colors.reset} [${issue.ruleId}] ${issue.ruleName}`);
      console.log(`       ${colors.dim}Reason:${colors.reset} ${issue.message}`);
      console.log(`       ${colors.dim}Line:  ${colors.reset} ${colors.yellow}${issue.code.substring(0, 100)}${colors.reset}\n`);
    });
  } else {
    console.log(`${colors.green}✔ No security oversights or credential leaks detected across source files!${colors.reset}\n`);
  }

  // Summary Table
  console.log(`${colors.bright}${colors.cyan}------------------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bright}AUDIT SUMMARY:${colors.reset}`);
  console.log(`  Files Scanned:       ${colors.bright}${STATS.scannedFiles}${colors.reset}`);
  console.log(`  Clean Files (PASS):  ${colors.green}${STATS.passCount}${colors.reset}`);
  console.log(`  Warnings (WARN):     ${STATS.warnCount > 0 ? colors.yellow : colors.green}${STATS.warnCount}${colors.reset}`);
  console.log(`  Violations (FAIL):   ${STATS.failCount > 0 ? colors.red : colors.green}${STATS.failCount}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}------------------------------------------------------------------------${colors.reset}`);

  const overallStatus = STATS.failCount === 0 ? 'PASSED - AUDIT CLEAN' : 'FAILED - CRITICAL ISSUES DETECTED';
  const statusColor = STATS.failCount === 0 ? colors.green : colors.red;

  console.log(`  Final Verdict:       ${colors.bright}${statusColor}${overallStatus}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}========================================================================${colors.reset}\n`);

  if (STATS.failCount > 0) {
    process.exit(1);
  }
}

runAudit();
