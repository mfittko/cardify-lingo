#!/bin/sh
# Script to build the app with sandbox workaround

set -e

# Make sure our custom frameworks script is executable
chmod +x copy-frameworks.sh

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*

# Deintegrate and reinstall pods
pod deintegrate
pod install

# Create a backup of the original frameworks script
if [ ! -f "Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh.original" ]; then
  cp "Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh" "Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh.original"
fi

# Replace the CocoaPods frameworks script with a simple wrapper that calls our custom script
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

# Set environment variables for the build
export SANDBOX_ISSUES_WORKAROUND=1
export CONFIGURATION_BUILD_DIR="$(pwd)/build/Debug-iphonesimulator"
export BUILT_PRODUCTS_DIR="$(pwd)/build/Debug-iphonesimulator"

# Create the build directory
mkdir -p "$(pwd)/build/Debug-iphonesimulator"

echo "Building with sandbox workaround..."
echo "CONFIGURATION_BUILD_DIR=$CONFIGURATION_BUILD_DIR"

# Build with sandbox workaround and additional flags
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -sdk iphonesimulator \
  CONFIGURATION_BUILD_DIR="$CONFIGURATION_BUILD_DIR" \
  BUILT_PRODUCTS_DIR="$BUILT_PRODUCTS_DIR" \
  ENABLE_USER_SCRIPT_SANDBOXING=NO \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGN_ENTITLEMENTS="" CODE_SIGNING_ALLOWED=NO

echo "Build completed!" 