#!/bin/sh

# Script to open the project in Xcode

set -e

echo "Opening project in Xcode..."

# Check if the workspace exists
if [ ! -d "App.xcworkspace" ]; then
  echo "Error: App.xcworkspace not found. Make sure you're in the ios/App directory."
  exit 1
fi

# Open the workspace in Xcode
open App.xcworkspace

echo "Xcode should be opening now."
echo ""
echo "If you encounter script sandboxing issues when building:"
echo "1. Run ./setup-for-xcode.sh to automatically fix the issues"
echo "2. Or follow the manual instructions in XCODE_MANUAL_SETUP.md" 