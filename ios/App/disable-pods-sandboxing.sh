#!/bin/sh

# Script to disable user script sandboxing in Pods project

set -e

echo "Disabling user script sandboxing in Pods project..."

# Path to the Pods project.pbxproj file
PODS_PROJECT_FILE="Pods/Pods.xcodeproj/project.pbxproj"

# Check if the file exists
if [ ! -f "$PODS_PROJECT_FILE" ]; then
  echo "Error: Pods project file not found at $PODS_PROJECT_FILE"
  echo "Make sure you have run 'pod install' first."
  exit 1
fi

# Create a backup of the original project file
if [ ! -f "${PODS_PROJECT_FILE}.original" ]; then
  echo "Creating backup of original Pods project file..."
  cp "$PODS_PROJECT_FILE" "${PODS_PROJECT_FILE}.original"
fi

# Use ruby to modify the project file
ruby -e '
require "xcodeproj"

project_path = "Pods/Pods.xcodeproj"
project = Xcodeproj::Project.open(project_path)

# Disable script sandboxing for all targets and configurations
project.targets.each do |target|
  target.build_configurations.each do |config|
    config.build_settings["ENABLE_USER_SCRIPT_SANDBOXING"] = "NO"
    puts "Disabled script sandboxing for target #{target.name}, configuration #{config.name}"
  end
end

# Save the project
project.save
'

echo "Done! Script sandboxing has been disabled in the Pods project." 