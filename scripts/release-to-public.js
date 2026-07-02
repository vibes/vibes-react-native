#!/usr/bin/env node
'use strict';

/**
 * Interactive release script for publishing vibes-react-native from the
 * internal development repo to the public GitHub repo and npm.
 *
 * Usage:
 *   node scripts/release-to-public.js
 *   npm run release:public
 *
 * Environment variables:
 *   VIBES_PUBLIC_REPO_PATH - local path to the public repo (default: ../vibes-react-native)
 *   VIBES_PUBLIC_REPO_URL  - git URL used when cloning the public repo
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

const INTERNAL_ROOT = path.resolve(__dirname, '..');
const PUBLIC_REPO_URL =
  process.env.VIBES_PUBLIC_REPO_URL ||
  'https://github.com/vibes/vibes-react-native.git';
const DEFAULT_PUBLIC_REPO_PATH = path.resolve(
  INTERNAL_ROOT,
  '..',
  'vibes-react-native'
);
const PUBLIC_REPO_PATH = path.resolve(
  process.env.VIBES_PUBLIC_REPO_PATH || DEFAULT_PUBLIC_REPO_PATH
);
const PUBLIC_BRANCH = 'master';

const RSYNC_EXCLUDES = [
  '.git',
  'node_modules',
  'sample-app/ios/Pods',
  'sample-app/build',
  'android/build',
  'ios/build',
  '.DS_Store',
  '.expo',
  '.vscode',
  'lib',
  '.env',
  '.envrc',
  'sample-app/fastlane/.env',
  'sample-app/fastlane/.env.default',
  'sample-app/fastlane/report.xml',
  'sample-app/fastlane/Preview.html',
  'sample-app/fastlane/screenshots',
  'sample-app/fastlane/test_output',
  '**/google-services.json',
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function confirm(question, defaultYes = false) {
  const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
  const answer = (await prompt(`${question}${suffix}`)).toLowerCase();
  if (!answer) {
    return defaultYes;
  }
  return answer === 'y' || answer === 'yes';
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || INTERNAL_ROOT,
    stdio: options.stdio || 'inherit',
    encoding: 'utf-8',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(
      options.errorMessage ||
        `Command failed: ${command} ${args.join(' ')} (exit ${result.status})`
    );
  }

  return result;
}

function runGit(args, options = {}) {
  return run('git', args, options);
}

function readPackageVersion(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return packageJson.version;
}

function writePackageVersion(packageJsonPath, version) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  packageJson.version = version;
  fs.writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`
  );
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function bumpVersion(currentVersion, bumpType) {
  const parts = parseVersion(currentVersion);
  if (!parts) {
    throw new Error(`Invalid version: ${currentVersion}`);
  }

  switch (bumpType) {
    case 'patch':
      return `${parts.major}.${parts.minor}.${parts.patch + 1}`;
    case 'minor':
      return `${parts.major}.${parts.minor + 1}.0`;
    case 'major':
      return `${parts.major + 1}.0.0`;
    default:
      throw new Error(`Unknown bump type: ${bumpType}`);
  }
}

function isGitRepo(dir) {
  return fs.existsSync(path.join(dir, '.git'));
}

function assertCleanWorkingTree(repoPath, label) {
  const result = spawnSync('git', ['status', '--porcelain'], {
    cwd: repoPath,
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    throw new Error(`Unable to read git status for ${label}`);
  }

  if (result.stdout.trim()) {
    throw new Error(
      `${label} has uncommitted changes. Commit or stash them before releasing.`
    );
  }
}

function getCurrentBranch(repoPath) {
  const result = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: repoPath,
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    throw new Error(`Unable to determine current branch in ${repoPath}`);
  }

  return result.stdout.trim();
}

function ensurePublicRepo() {
  if (isGitRepo(PUBLIC_REPO_PATH)) {
    console.log(`\nUsing existing public repo at ${PUBLIC_REPO_PATH}`);
    runGit(['fetch', 'origin'], { cwd: PUBLIC_REPO_PATH });

    const currentBranch = getCurrentBranch(PUBLIC_REPO_PATH);
    if (currentBranch !== PUBLIC_BRANCH) {
      console.log(`Checking out ${PUBLIC_BRANCH} in public repo...`);
      runGit(['checkout', PUBLIC_BRANCH], { cwd: PUBLIC_REPO_PATH });
    }

    runGit(['pull', '--ff-only', 'origin', PUBLIC_BRANCH], {
      cwd: PUBLIC_REPO_PATH,
    });
    return;
  }

  if (fs.existsSync(PUBLIC_REPO_PATH)) {
    throw new Error(
      `${PUBLIC_REPO_PATH} exists but is not a git repository. Remove it or set VIBES_PUBLIC_REPO_PATH.`
    );
  }

  console.log(`\nCloning public repo into ${PUBLIC_REPO_PATH}...`);
  fs.mkdirSync(path.dirname(PUBLIC_REPO_PATH), { recursive: true });
  run('git', ['clone', PUBLIC_REPO_URL, PUBLIC_REPO_PATH]);
}

function syncToPublicRepo() {
  const excludeArgs = RSYNC_EXCLUDES.flatMap((pattern) => [
    '--exclude',
    pattern,
  ]);

  console.log('\nSyncing files from internal repo to public repo...');
  run(
    'rsync',
    [
      '-a',
      '--delete',
      ...excludeArgs,
      `${INTERNAL_ROOT}/`,
      `${PUBLIC_REPO_PATH}/`,
    ],
    {
      errorMessage:
        'rsync failed. Ensure rsync is installed and both repo paths are accessible.',
    }
  );
}

function updateLockfileVersion(newVersion) {
  const lockfilePath = path.join(INTERNAL_ROOT, 'package-lock.json');
  if (!fs.existsSync(lockfilePath)) {
    return;
  }

  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf-8'));
  if (lockfile.version) {
    lockfile.version = newVersion;
  }
  if (lockfile.packages && lockfile.packages['']) {
    lockfile.packages[''].version = newVersion;
  }
  fs.writeFileSync(lockfilePath, `${JSON.stringify(lockfile, null, 2)}\n`);
}

async function chooseVersion(currentVersion) {
  console.log(`\nCurrent version: ${currentVersion}`);
  console.log('\nSelect a version bump:');
  console.log(`  1) patch  -> ${bumpVersion(currentVersion, 'patch')}`);
  console.log(`  2) minor  -> ${bumpVersion(currentVersion, 'minor')}`);
  console.log(`  3) major  -> ${bumpVersion(currentVersion, 'major')}`);
  console.log('  4) custom version');

  const choice = await prompt('\nEnter choice [1-4]: ');

  switch (choice) {
    case '1':
    case 'patch':
      return bumpVersion(currentVersion, 'patch');
    case '2':
    case 'minor':
      return bumpVersion(currentVersion, 'minor');
    case '3':
    case 'major':
      return bumpVersion(currentVersion, 'major');
    case '4':
    case 'custom': {
      const customVersion = await prompt('Enter new version (e.g. 1.2.4): ');
      if (!parseVersion(customVersion)) {
        throw new Error(`Invalid version format: ${customVersion}`);
      }
      return customVersion;
    }
    default:
      throw new Error(`Invalid choice: ${choice}`);
  }
}

function printSummary(newVersion) {
  console.log('\nRelease plan:');
  console.log(`  Internal repo: ${INTERNAL_ROOT}`);
  console.log(`  Public repo:   ${PUBLIC_REPO_PATH}`);
  console.log(`  New version:   ${newVersion}`);
  console.log('\nSteps:');
  console.log('  1. Run lint and TypeScript checks (npm run lint, npm run typescript)');
  console.log('  2. Bump version and commit to internal repo');
  console.log('  3. Sync files to public repo');
  console.log(`  4. Commit public repo as "v${newVersion}"`);
  console.log('  5. Optionally push public repo to GitHub');
  console.log('  6. Optionally publish to npm from public repo');
}

async function main() {
  console.log('Vibes React Native - Release to Public');
  console.log('=====================================');

  if (!isGitRepo(INTERNAL_ROOT)) {
    throw new Error('This script must be run from the internal git repository.');
  }

  const currentVersion = readPackageVersion(
    path.join(INTERNAL_ROOT, 'package.json')
  );
  const newVersion = await chooseVersion(currentVersion);
  printSummary(newVersion);

  if (!(await confirm('\nProceed with release?', false))) {
    console.log('Release cancelled.');
    return;
  }

  assertCleanWorkingTree(INTERNAL_ROOT, 'Internal repo');

  console.log('\n[1/6] Running pre-release checks...');
  run('npm', ['run', 'lint'], { cwd: INTERNAL_ROOT });
  run('npm', ['run', 'typescript'], { cwd: INTERNAL_ROOT });

  console.log('\n[2/6] Bumping version in internal repo...');
  const packageJsonPath = path.join(INTERNAL_ROOT, 'package.json');
  writePackageVersion(packageJsonPath, newVersion);
  updateLockfileVersion(newVersion);

  runGit(['add', 'package.json']);
  runGit(['commit', '-m', `chore: release v${newVersion}`]);

  if (await confirm('\nPush internal repo to GitHub?', true)) {
    const internalBranch = getCurrentBranch(INTERNAL_ROOT);
    console.log(`\nPushing internal repo (${internalBranch})...`);
    runGit(['push', 'origin', internalBranch]);
  }

  console.log('\n[3/6] Preparing public repo...');
  ensurePublicRepo();
  assertCleanWorkingTree(PUBLIC_REPO_PATH, 'Public repo');

  console.log('\n[4/6] Syncing files to public repo...');
  syncToPublicRepo();

  console.log('\n[5/6] Committing public repo...');
  runGit(['add', '-A'], { cwd: PUBLIC_REPO_PATH });
  const publicStatus = spawnSync('git', ['status', '--porcelain'], {
    cwd: PUBLIC_REPO_PATH,
    encoding: 'utf-8',
  });

  if (!publicStatus.stdout.trim()) {
    console.log('No changes to commit in public repo.');
  } else {
    runGit(['commit', '-m', `v${newVersion}`], { cwd: PUBLIC_REPO_PATH });
  }

  if (await confirm('\nPush public repo to GitHub?', true)) {
    console.log('\nPushing public repo...');
    runGit(['push', 'origin', PUBLIC_BRANCH], { cwd: PUBLIC_REPO_PATH });
  }

  if (await confirm('\nPublish to npm now?', true)) {
    console.log('\n[6/6] Publishing to npm from public repo...');
    console.log('You may be prompted to log in if your npm session has expired.');

    const whoami = spawnSync('npm', ['whoami'], {
      cwd: PUBLIC_REPO_PATH,
      encoding: 'utf-8',
    });

    if (whoami.status !== 0) {
      console.log('\nNot logged in to npm. Starting npm login...');
      run('npm', ['login'], { cwd: PUBLIC_REPO_PATH });
    } else {
      console.log(`\nLogged in to npm as ${whoami.stdout.trim()}`);
    }

    run('npm', ['publish'], { cwd: PUBLIC_REPO_PATH });
    console.log(`\nPublished vibes-react-native@${newVersion} to npm.`);
  } else {
    console.log('\nSkipped npm publish.');
    console.log(`To publish manually:\n  cd ${PUBLIC_REPO_PATH} && npm login && npm publish`);
  }

  console.log('\nRelease complete.');
}

main()
  .catch((error) => {
    console.error(`\nRelease failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
