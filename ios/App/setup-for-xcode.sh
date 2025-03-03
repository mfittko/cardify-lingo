#!/bin/sh

# Script to set up the project for building in Xcode UI

set -e

echo "Setting up project for Xcode UI building..."

# Make sure our custom frameworks script is executable
chmod +x copy-frameworks.sh

# Clean derived data
echo "Cleaning derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*

# Deintegrate and reinstall pods
echo "Reinstalling pods..."
pod deintegrate
pod install

# Create a backup of the original frameworks script
if [ ! -f "Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh.original" ]; then
  echo "Creating backup of original frameworks script..."
  cp "Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh" "Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh.original"
fi

# Replace the CocoaPods frameworks script with a simple wrapper that calls our custom script
echo "Replacing CocoaPods frameworks script with custom wrapper..."
cat > "Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh" << 'EOF'
#!/bin/sh
set -e
set -u
set -o pipefail

# Get the absolute path to the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/../../.." && pwd )"

echo "Using custom framework copying script instead of CocoaPods script"
echo "Project directory: $PROJECT_DIR"

# Run the custom script with full path
"$PROJECT_DIR/copy-frameworks.sh"
EOF

# Make sure the frameworks script is executable
chmod +x "Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh"

# Disable script sandboxing in the main project
echo "Disabling script sandboxing in main project..."
./disable-script-sandboxing.sh

# Disable script sandboxing in the Pods project
echo "Disabling script sandboxing in Pods project..."
./disable-pods-sandboxing.sh

echo "Setup complete! You can now build the app in Xcode UI without sandbox permission issues."
echo ""
echo "Instructions for building in Xcode:"
echo "1. Open App.xcworkspace in Xcode"
echo "2. Select the App scheme"
echo "3. Choose a simulator or device"
echo "4. Click the Run button or press Cmd+R"
echo ""
echo "If you still encounter issues, you can manually set ENABLE_USER_SCRIPT_SANDBOXING to NO in the build settings for both the App target and all Pod targets." 