const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// ─── Crypto helpers ────────────────────────────────────────────────────────────
const SALT_LENGTH = 32;
const IV_LENGTH   = 16;
const TAG_LENGTH  = 16;
const KEY_LENGTH  = 32;
const ITERATIONS  = 200000;
const DIGEST      = 'sha512';

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
}

function encryptVault(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv   = crypto.randomBytes(IV_LENGTH);
  const key  = deriveKey(password, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

function decryptVault(ciphertext, password) {
  const data = Buffer.from(ciphertext, 'base64');
  const salt      = data.slice(0, SALT_LENGTH);
  const iv        = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag       = data.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = data.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

// ─── Vault path ────────────────────────────────────────────────────────────────
function getDefaultVaultPath() {
  return path.join(app.getPath('userData'), 'vault.vlt');
}

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    const s = fs.readFileSync(getSettingsPath(), 'utf8');
    return JSON.parse(s);
  } catch {
    return { vaultPath: getDefaultVaultPath(), autoLockMinutes: 5 };
  }
}

function saveSettings(settings) {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2));
}

// ─── IPC handlers ──────────────────────────────────────────────────────────────
ipcMain.handle('vault:exists', () => {
  const settings = loadSettings();
  return fs.existsSync(settings.vaultPath || getDefaultVaultPath());
});

ipcMain.handle('vault:load', async (_, password) => {
  const settings = loadSettings();
  const vaultPath = settings.vaultPath || getDefaultVaultPath();
  try {
    const ciphertext = fs.readFileSync(vaultPath, 'utf8');
    const plaintext  = decryptVault(ciphertext, password);
    return { success: true, data: JSON.parse(plaintext) };
  } catch {
    return { success: false, error: 'Wrong master password or corrupted vault.' };
  }
});

ipcMain.handle('vault:save', async (_, { password, data }) => {
  const settings = loadSettings();
  const vaultPath = settings.vaultPath || getDefaultVaultPath();
  try {
    const plaintext  = JSON.stringify(data);
    const ciphertext = encryptVault(plaintext, password);
    fs.writeFileSync(vaultPath, ciphertext, 'utf8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('vault:create', async (_, { password }) => {
  const settings  = loadSettings();
  const vaultPath = settings.vaultPath || getDefaultVaultPath();
  const initial   = { entries: [], categories: ['Social', 'Banking', 'Work', 'Shopping', 'Other'] };
  try {
    const ciphertext = encryptVault(JSON.stringify(initial), password);
    fs.writeFileSync(vaultPath, ciphertext, 'utf8');
    return { success: true, data: initial };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('vault:changePassword', async (_, { oldPassword, newPassword }) => {
  const settings  = loadSettings();
  const vaultPath = settings.vaultPath || getDefaultVaultPath();
  try {
    const ciphertext = fs.readFileSync(vaultPath, 'utf8');
    const plaintext  = decryptVault(ciphertext, oldPassword);
    const newCipher  = encryptVault(plaintext, newPassword);
    fs.writeFileSync(vaultPath, newCipher, 'utf8');
    return { success: true };
  } catch {
    return { success: false, error: 'Current password is incorrect.' };
  }
});

ipcMain.handle('settings:load', () => loadSettings());
ipcMain.handle('settings:save', (_, settings) => { saveSettings(settings); return { success: true }; });

ipcMain.handle('dialog:pickVaultPath', async () => {
  const result = await dialog.showSaveDialog({ title: 'Choose vault location', defaultPath: 'vault.vlt', filters: [{ name: 'Vaultify Vault', extensions: ['vlt'] }] });
  return result.canceled ? null : result.filePath;
});

// ─── Window ────────────────────────────────────────────────────────────────────
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#faf8f4',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
