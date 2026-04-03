# Mobile App Setup Instructions

## Prerequisites

1. **Node.js** (version 14 or higher)
   - Download from: https://nodejs.org/

2. **Java Development Kit (JDK 8 or 11)**
   - Download from: https://www.oracle.com/java/technologies/downloads/

3. **Android Studio** (for Android builds)
   - Download from: https://developer.android.com/studio
   - Install Android SDK and set ANDROID_HOME environment variable

4. **Cordova CLI**
   ```bash
   npm install -g cordova
   ```

## Setup Steps

### 1. Navigate to Mobile Directory
```bash
cd "d:\python example\mobile"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Android Platform
```bash
cordova platform add android
```

### 4. Install Required Plugins
```bash
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-network-information
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-splashscreen
```

### 5. Update Server URL
Edit `www/js/mobile-app.js` and change the API URL:
```javascript
this.apiUrl = 'https://your-deployed-server.com/api/tasks';
```

### 6. Build APK

#### Debug Build (for testing)
```bash
cordova build android
```
The APK will be created at: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

#### Release Build (for distribution)
```bash
cordova build android --release
```

## Testing

### 1. Test in Browser
```bash
cordova serve
```
Then open: http://localhost:8000

### 2. Test on Device/Emulator
```bash
cordova run android
```

## APK Location

After building, your APK files will be located at:
- **Debug APK**: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Alternative: Online Build Services

If you prefer not to install Android Studio locally, you can use:

1. **PhoneGap Build** (Adobe)
2. **Ionic Appflow**
3. **AppCenter** (Microsoft)

These services can build your APK in the cloud.

## Features Included

✅ **Offline Support** - Works without internet
✅ **Data Sync** - Syncs when connection restored  
✅ **Touch-Optimized** - Mobile-friendly interface
✅ **Native Feel** - Uses device back button
✅ **Responsive Design** - Works on all screen sizes
✅ **Local Storage** - Saves data locally

## Troubleshooting

### Common Issues:

1. **Build fails**: Make sure ANDROID_HOME is set correctly
2. **White screen**: Check console for JavaScript errors
3. **Network errors**: Update the API URL to your deployed server
4. **Plugins missing**: Run `cordova plugin list` to verify installations

### Environment Variables (Windows):
```
ANDROID_HOME=C:\Users\[username]\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-11.0.x
```

## Next Steps

1. Deploy your Flask backend to a cloud service (Heroku, DigitalOcean, etc.)
2. Update the API URL in the mobile app
3. Build and test the APK
4. Consider adding app icons and splash screens
5. Test on multiple devices
6. Prepare for app store submission (if needed)