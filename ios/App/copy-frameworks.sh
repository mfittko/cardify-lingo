#!/bin/sh

# Fix for sandbox issues - ensure script has proper permissions
if [ -n "${SANDBOX_ISSUES_WORKAROUND:-}" ]; then
  echo "Applying sandbox workaround..."
  chmod +x "$0"
fi

# Set error handling
set -e
set -u
set -o pipefail

# Get the absolute path to the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" && pwd )"

# Define paths
FRAMEWORKS_FOLDER_PATH="Frameworks"

# Use environment variables if set, otherwise use default paths
if [ -n "${BUILT_PRODUCTS_DIR:-}" ]; then
  echo "Using BUILT_PRODUCTS_DIR from environment: $BUILT_PRODUCTS_DIR"
else
  BUILT_PRODUCTS_DIR="$SCRIPT_DIR/build/Debug-iphonesimulator"
  echo "Using default BUILT_PRODUCTS_DIR: $BUILT_PRODUCTS_DIR"
fi

if [ -n "${CONFIGURATION_BUILD_DIR:-}" ]; then
  echo "Using CONFIGURATION_BUILD_DIR from environment: $CONFIGURATION_BUILD_DIR"
else
  CONFIGURATION_BUILD_DIR="$BUILT_PRODUCTS_DIR"
  echo "Using default CONFIGURATION_BUILD_DIR: $CONFIGURATION_BUILD_DIR"
fi

APP_PATH="${CONFIGURATION_BUILD_DIR}/App.app"

echo "Copying frameworks to ${APP_PATH}/${FRAMEWORKS_FOLDER_PATH}"

# Create frameworks directory if it doesn't exist
mkdir -p "${APP_PATH}/${FRAMEWORKS_FOLDER_PATH}"

# Function to find and copy a framework
copy_framework() {
  local framework_name=$1
  local source_dir=$2
  
  echo "Copying ${framework_name}..."
  if [ -d "${source_dir}/${framework_name}.framework" ]; then
    cp -R "${source_dir}/${framework_name}.framework" "${APP_PATH}/${FRAMEWORKS_FOLDER_PATH}/"
    echo "Successfully copied ${framework_name}.framework"
  else
    echo "Warning: ${framework_name}.framework not found at ${source_dir}/${framework_name}.framework"
    
    # Try to find the framework in other locations
    local found_framework=$(find "$SCRIPT_DIR" -name "${framework_name}.framework" -type d -maxdepth 3 | head -n 1)
    if [ -n "$found_framework" ]; then
      echo "Found ${framework_name}.framework at $found_framework"
      cp -R "$found_framework" "${APP_PATH}/${FRAMEWORKS_FOLDER_PATH}/"
      echo "Successfully copied ${framework_name}.framework from alternate location"
    else
      echo "Error: Could not find ${framework_name}.framework in any location"
    fi
  fi
}

# Copy frameworks
copy_framework "Capacitor" "${BUILT_PRODUCTS_DIR}/Capacitor"
copy_framework "Cordova" "${BUILT_PRODUCTS_DIR}/CapacitorCordova"
copy_framework "CapacitorLocalNotifications" "${BUILT_PRODUCTS_DIR}/CapacitorLocalNotifications"

echo "Framework copying completed successfully!" 