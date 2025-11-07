# Getting Started with React Native Mobile App

## 🎯 Quick Start (WSL + Android Studio on Windows)

This guide will get you running the React Native app on Android Studio emulator with the backend in WSL.

---

## Prerequisites Check

### 1. WSL (Ubuntu) - Where You Are Now ✅
```bash
# Verify you're in WSL
uname -a
# Should show: Linux ... Microsoft ...

# Verify Node.js and npm
node --version  # Should be v18+
npm --version   # Should be v9+
```

### 2. Android Studio (Windows) - Already Installed ✅

You mentioned Android Studio is installed on Windows. We'll use it!

---

## Step 1: Start the Backend (WSL)

**In WSL Terminal:**

```bash
# Navigate to project root
cd /home/hamel/dev/active/fullstack-starter-djvurn

# Start Docker services (if not already running)
docker compose up

# Verify backend is accessible
curl http://localhost:8000/api/schema/ | head -5
# Should return OpenAPI schema
```

**Keep this terminal open** - backend needs to stay running.

---

## Step 2: Start Expo Dev Server (WSL)

**Open a NEW WSL terminal:**

```bash
# Navigate to mobile directory
cd /home/hamel/dev/active/fullstack-starter-djvurn/mobile

# Start Expo (this will show a QR code)
npm start
```

**Expected output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

**Keep this terminal open** - Expo dev server needs to stay running.

---

## Step 3: Open Android Studio (Windows)

### A. Launch Android Studio

1. **In Windows**, open Android Studio
2. Go to **Tools → Device Manager** (or **AVD Manager**)

### B. Create/Start an Emulator

**If you already have an emulator:**
1. Click the ▶️ (Play) button next to your existing emulator
2. Wait for it to boot up (~30 seconds)

**If you need to create one:**
1. Click **Create Device**
2. Choose **Phone → Pixel 7** (or any recent device)
3. Download a **System Image** (Android 13+ recommended)
4. Click **Finish**
5. Start the emulator

**Wait for the emulator to fully boot** - you should see the Android home screen.

---

## Step 4: Install Expo Go on Emulator (First Time Only)

**Option A: Via Play Store (Recommended)**
1. Open **Play Store** in emulator
2. Search for **"Expo Go"**
3. Install Expo Go
4. Open Expo Go

**Option B: Via ADB (Faster)**

In **Windows PowerShell** (not WSL):
```powershell
# Download Expo Go APK
curl -o expo-go.apk https://d1ahtucjixef4r.cloudfront.net/Exponent-2.31.3.apk

# Install via ADB
adb install expo-go.apk
```

---

## Step 5: Connect App to Emulator

### Option 1: Press 'a' in Expo Terminal (Easiest!)

**In your WSL Expo terminal**, just press **`a`**:

```bash
› Press a │ open Android
```

Expo will:
1. Detect the running Android emulator
2. Launch Expo Go automatically
3. Load your app

**This should just work!** 🎉

---

### Option 2: Manual QR Code Scan (Backup)

If pressing `a` doesn't work:

1. In the Android emulator, open **Expo Go**
2. Click **"Scan QR Code"**
3. Use the emulator camera to scan the QR code from your WSL terminal

---

### Option 3: Use Tunnel Mode (If Network Issues)

If both methods above fail:

**In WSL Expo terminal:**
```bash
# Stop the current server (Ctrl+C)

# Restart with tunnel mode
npm start -- --tunnel
```

This creates a cloud tunnel (slower but works around all networking issues).

---

## Step 6: Verify Backend Connection (THE CRITICAL TEST!)

Once the app loads in the emulator:

### A. Check Console Logs

**In WSL Expo terminal**, you should see:
```
LOG  Running "main" with {"rootTag":1}
```

No errors about network connectivity!

### B. Test API Call from Emulator

**In Android emulator**, open the app and try to:
1. Navigate to login/register screen
2. Any API call should work (the `10.0.2.2:8000` magic!)

### C. Verify from Emulator Shell (Debug Mode)

**In the emulator**, shake the device (or press Ctrl+M) to open **Dev Menu**:
1. Select **"Debug Remote JS"**
2. Open browser to `http://localhost:19006/debugger-ui`
3. Open **Console** tab
4. In the console, type:

```javascript
// Test the API connection
fetch('http://10.0.2.2:8000/api/schema/')
  .then(res => res.text())
  .then(data => console.log(data.substring(0, 200)))
  .catch(err => console.error('Connection failed:', err))
```

**Expected result**: OpenAPI schema text (first 200 characters)

**If this works, your 10.0.2.2 → Windows localhost → WSL Docker chain is PERFECT!** 🔥

---

## Troubleshooting

### Issue 1: "Unable to connect to Expo Go"

**Solution: Use Tunnel Mode**
```bash
npm start -- --tunnel
```

### Issue 2: "Network request failed" in app

**Check backend is accessible from Windows:**

In **Windows PowerShell**:
```powershell
curl http://localhost:8000/api/schema/
```

If this fails, restart WSL:
```bash
# In WSL
docker compose down
wsl --shutdown  # Run this from PowerShell
# Then restart WSL and docker compose up
```

### Issue 3: Emulator won't start

**Check virtualization is enabled:**
1. Task Manager → Performance → CPU
2. "Virtualization" should say "Enabled"
3. If not, enable in BIOS

### Issue 4: "ADB not found"

**Add ADB to PATH** (Windows PowerShell as Admin):
```powershell
$env:Path += ";C:\Users\<YourUsername>\AppData\Local\Android\Sdk\platform-tools"
```

### Issue 5: Can't see WSL IP address

**Find WSL IP:**
```bash
# In WSL
hostname -I
# e.g., 172.28.160.5
```

**BUT YOU DON'T NEED THIS!** The `10.0.2.2` pattern bypasses this entirely.

---

## Development Workflow

### Terminal 1 (WSL): Backend
```bash
docker compose up
```

### Terminal 2 (WSL): Mobile Dev Server
```bash
cd mobile
npm start
```

### Terminal 3 (WSL): Type-checking / Tests
```bash
cd mobile
npm run type-check    # TypeScript
npm run test:run      # Tests
```

### Windows: Android Studio
- Keep emulator running
- Use for UI testing

---

## Hot Reload & Fast Refresh

**Code changes auto-reload!**
- Edit any `.tsx` file in `mobile/src/`
- Save the file
- Emulator **automatically reloads** (Fast Refresh)

**Manual reload:**
- Shake emulator (Ctrl+M)
- Click "Reload"
- Or press `r` in Expo terminal

---

## Pro Tips

### 1. Keep Backend Running
Always start backend BEFORE mobile app. The app will crash if it can't reach the API.

### 2. Use Type-Check During Development
```bash
# In WSL Terminal 3
npm run type-check -- --watch
```

Catches errors as you type!

### 3. Check Logs for Errors
**Expo terminal shows all console.log, errors, and warnings.**

### 4. Test on Physical Device (Optional)
1. Enable **Developer Options** on Android phone
2. Enable **USB Debugging**
3. Connect via USB
4. Run `npm start`, press `a`
5. Expo will detect physical device

### 5. Performance Mode
If emulator is slow:
- Allocate more RAM in AVD settings (4GB+)
- Enable hardware acceleration
- Close other apps

---

## Next Steps

Once the app is running:

1. **Explore the current app** (it's just the Expo template for now)
2. **Session 3**: We'll add TanStack Query hooks for auth and projects
3. **Session 4**: Build actual login/register screens
4. **Session 5**: Build projects list and CRUD screens
5. **Session 6**: Add offline support and polish

---

## Quick Reference

### WSL Commands
```bash
# Start backend
docker compose up

# Start mobile dev server
cd mobile && npm start

# Type-check
npm run type-check

# Generate API types (after backend changes)
npm run generate:api
```

### Expo Dev Server Commands
```
a - Open on Android emulator
r - Reload app
j - Open debugger
m - Toggle menu
? - Show all commands
```

### Useful URLs
- **Backend API**: http://localhost:8000/api/
- **Backend Admin**: http://localhost:8000/admin/
- **Expo DevTools**: Will open automatically in browser
- **Android Emulator Access**: Backend at http://10.0.2.2:8000 🎯

---

**YOU'RE READY TO GO!** 🚀

Start with Step 1 and work your way through. The `10.0.2.2` pattern makes this BULLETPROOF for WSL + Android development!
