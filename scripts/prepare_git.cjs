const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Helper to recursively collect all files respecting gitignore rules
function getFiles(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'dist-ssr' || file.startsWith('.env') && file !== '.env.example') {
      continue;
    }
    const fullPath = path.join(dir, file);
    const relPath = base ? `${base}/${file}` : file;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

async function main() {
  console.log('--- Initializing Git Repository via Isomorphic-Git ---');
  await git.init({ fs, dir: rootDir, defaultBranch: 'main' });
  console.log('✓ Git repository initialized with default branch: main');

  const files = getFiles(rootDir);
  console.log(`Found ${files.length} project files to stage.`);

  for (const file of files) {
    await git.add({ fs, dir: rootDir, filepath: file });
  }
  console.log(`✓ Staged ${files.length} files successfully.`);

  const sha = await git.commit({
    fs,
    dir: rootDir,
    message: 'Initial release: GramVenture AI',
    author: {
      name: 'Venkatasai Guggilla',
      email: 'venkatasaiguggilla620@gmail.com',
    },
  });

  console.log(`✓ Committed successfully! Latest commit SHA: ${sha}`);

  const commits = await git.log({ fs, dir: rootDir, depth: 1 });
  console.log('Commit metadata:', {
    oid: commits[0].oid,
    message: commits[0].commit.message,
    author: commits[0].commit.author.name,
    timestamp: new Date(commits[0].commit.author.timestamp * 1000).toISOString(),
  });
}

main().catch((err) => {
  console.error('Error in git operation:', err);
  process.exit(1);
});
