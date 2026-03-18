# 🔐 Vaultify — Offline Password Manager

A beautiful, fully offline password manager built with Electron + React.
All data is encrypted locally using AES-256-GCM. Nothing ever leaves your machine.

---

## Features

- **AES-256-GCM encryption** — military-grade, zero-knowledge
- **Categories & folders** — Social, Banking, Work, Shopping, Other
- **Auto-lock** — locks vault after configurable idle time
- **Password generator** — customisable length, character sets
- **Strength indicator** — visual strength meter on all passwords
- **One-click copy** — clipboard auto-clears after 30 seconds
- **Fuzzy search** — find entries by title, username, or URL
- **Single vault file** — one `.vlt` file you can back up anywhere

---

## Quick Start (Development)

### Prerequisites
- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9 or higher (comes with Node)

### 1. Install dependencies
```bash
cd vaultify
npm install
```

### 2. Run in development mode
```bash
npm run electron-dev
```
This starts the React dev server and Electron simultaneously.
The app window will open automatically.

---

## Build a distributable installer

### Windows (.exe installer)
```bash
npm run dist
```
Output: `dist/Vaultify Setup X.X.X.exe`

### macOS (.dmg)
```bash
npm run dist
```
Output: `dist/Vaultify-X.X.X.dmg`

### Linux (.AppImage)
```bash
npm run dist
```
Output: `dist/Vaultify-X.X.X.AppImage`

### Quick build (no installer, just the app folder)
```bash
npm run package
```

---

## Project Structure

```
vaultify/
├── electron/
│   ├── main.js          # Electron main process + encryption + IPC
│   └── preload.js       # Secure bridge between Electron and React
├── src/
│   ├── App.jsx           # Root component, auth state, auto-lock
│   ├── index.css         # Global styles + off-white theme variables
│   ├── pages/
│   │   ├── UnlockScreen.jsx   # Login / vault creation
│   │   └── VaultScreen.jsx    # Main app UI (sidebar + list + detail)
│   ├── components/
│   │   ├── EntryForm.jsx       # Add / edit entry form
│   │   ├── GeneratorPanel.jsx  # Password generator
│   │   └── SettingsPanel.jsx   # Settings + change master password
│   └── utils/
│       └── passwords.js        # Password utils (generate, strength, copy)
├── public/
│   └── index.html
└── package.json
```

---

## Security

| Layer | Implementation |
|-------|---------------|
| Encryption | AES-256-GCM (authenticated) |
| Key derivation | PBKDF2-SHA512, 200,000 iterations |
| Salt | 32 bytes, random per save |
| IV | 16 bytes, random per save |
| Storage | Single `.vlt` file in `%APPDATA%/vaultify` (or chosen path) |
| Clipboard | Auto-cleared after 30 seconds |
| IPC | `contextIsolation: true`, no `nodeIntegration` |

Your master password is **never stored** — it is only used to derive the encryption key in memory.

---

## Vault file location

By default, your vault is stored at:
- **Windows**: `C:\Users\<you>\AppData\Roaming\vaultify\vault.vlt`
- **macOS**: `~/Library/Application Support/vaultify/vault.vlt`
- **Linux**: `~/.config/vaultify/vault.vlt`

You can change this in **Settings → Storage**. Back it up by simply copying the `.vlt` file.

---

## Customising auto-lock

Go to **Settings → Security** and choose from:
Never / 1 min / 2 min / 5 min / 10 min / 30 min / 1 hour

---

## License

MIT — use freely, modify freely.
