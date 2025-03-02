# Manual Setup for Xcode

If you encounter script sandboxing issues when building in Xcode, you can manually disable script sandboxing in the build settings.

## Disabling Script Sandboxing Manually

1. Open the Xcode workspace:
   ```bash
   open App.xcworkspace
   ```

2. In Xcode, select the "App" project in the Project Navigator (left sidebar).

3. Select the "App" target.

4. Go to the "Build Settings" tab.

5. Search for "sandboxing" in the search field.

6. Find the "Enable User Script Sandboxing" setting.

7. Change its value from "Yes" to "No".

8. Repeat steps 2-7 for the Pods project and each of its targets:
   - Select the "Pods" project in the Project Navigator
   - Select each target one by one (Capacitor, CapacitorCordova, CapacitorLocalNotifications, Pods-App)
   - Go to the "Build Settings" tab
   - Search for "sandboxing"
   - Change "Enable User Script Sandboxing" from "Yes" to "No"

## Alternative: Using the Provided Scripts

We've provided scripts to automate this process:

```bash
# Navigate to the iOS app directory
cd ios/App

# Make the scripts executable
chmod +x disable-script-sandboxing.sh
chmod +x disable-pods-sandboxing.sh

# Run the scripts
./disable-script-sandboxing.sh
./disable-pods-sandboxing.sh
```

Or use the all-in-one setup script:

```bash
cd ios/App
chmod +x setup-for-xcode.sh
./setup-for-xcode.sh
```

## Troubleshooting

If you still encounter issues:

1. Clean the build folder in Xcode (Product > Clean Build Folder or Shift+Cmd+K)
2. Delete the derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
   ```
3. Close and reopen Xcode
4. Try building again 