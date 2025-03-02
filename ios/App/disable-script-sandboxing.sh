#!/bin/sh

# Script to disable user script sandboxing in Xcode project

set -e

echo "Disabling user script sandboxing in Xcode project..."

# Path to the project.pbxproj file
PROJECT_FILE="App.xcodeproj/project.pbxproj"

# Check if the file exists
if [ ! -f "$PROJECT_FILE" ]; then
  echo "Error: Project file not found at $PROJECT_FILE"
  exit 1
fi

# Create a backup of the original project file
if [ ! -f "${PROJECT_FILE}.original" ]; then
  echo "Creating backup of original project file..."
  cp "$PROJECT_FILE" "${PROJECT_FILE}.original"
fi

# Use ruby to modify the project file
# This is more reliable than sed for complex XML/plist files
ruby -e '
require "xcodeproj"

project_path = "App.xcodeproj"
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
' || {
  echo "Failed to modify project with ruby xcodeproj. Trying alternative method..."
  
  # Alternative method using plutil (macOS property list utility)
  # Convert to XML format for easier editing
  plutil -convert xml1 "$PROJECT_FILE"
  
  # Use grep and sed to add the setting
  if ! grep -q "ENABLE_USER_SCRIPT_SANDBOXING" "$PROJECT_FILE"; then
    # Find all buildSettings sections and add the setting
    echo "Adding ENABLE_USER_SCRIPT_SANDBOXING = NO to all build configurations..."
    
    # Create a temporary file
    TMP_FILE=$(mktemp)
    
    # Process the file line by line
    while IFS= read -r line; do
      echo "$line" >> "$TMP_FILE"
      if [[ "$line" == *"buildSettings = {"* ]]; then
        echo -e "\t\t\t\tENABLE_USER_SCRIPT_SANDBOXING = NO;" >> "$TMP_FILE"
      fi
    done < "$PROJECT_FILE"
    
    # Replace the original file
    mv "$TMP_FILE" "$PROJECT_FILE"
    
    echo "Script sandboxing has been disabled in the project."
  else
    echo "ENABLE_USER_SCRIPT_SANDBOXING setting already exists in the project."
  fi
  
  # Convert back to binary format
  plutil -convert binary1 "$PROJECT_FILE"
}

echo "Done! You can now build the app in Xcode without sandbox permission issues."

echo "Note: You may need to install the xcodeproj gem if you don't have it:"
echo "gem install xcodeproj" 