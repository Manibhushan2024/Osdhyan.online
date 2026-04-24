import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

const rawArgs = process.argv.slice(2);
const hasBrowserExecutable = rawArgs.some((arg) => arg.startsWith('--browser-executable'));

const browserCandidates = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA
    ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
    : null,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/snap/bin/chromium',
].filter(Boolean);

const detectedBrowser = browserCandidates.find((candidate) => existsSync(candidate));
const args = hasBrowserExecutable || !detectedBrowser
  ? rawArgs
  : [...rawArgs, `--browser-executable=${detectedBrowser}`];

const cliPackageJson = require.resolve('@remotion/cli/package.json');
const cliEntry = path.join(path.dirname(cliPackageJson), 'remotion-cli.js');

const child = spawn(process.execPath, [cliEntry, ...args], {
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
