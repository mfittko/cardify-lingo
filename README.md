# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/660a78c1-d643-423c-8ff4-dc41ddfba944

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/660a78c1-d643-423c-8ff4-dc41ddfba944) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Testing

This project uses Playwright for end-to-end testing. The tests are located in the `tests` directory.

### Running Tests Locally

```sh
# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run tests in headed mode (with browser UI)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run a specific test file
npm run test:single -- tests/landing-page.spec.ts
```

### Continuous Integration

This project is configured to run tests on CircleCI. The configuration is in the `.circleci/config.yml` file.

To run tests in CI mode locally:

```sh
# Run tests in CI mode
npm run test:ci:full
```

This will:
- Run tests in headless mode
- Generate JUnit XML reports for test insights
- Create HTML reports for visual inspection
- Set appropriate timeouts and retry settings for CI environments

When tests run on CircleCI, the following artifacts are uploaded:
- JUnit XML reports for test insights
- HTML reports for visual inspection
- Screenshots of failed tests
- Trace files for debugging

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/660a78c1-d643-423c-8ff4-dc41ddfba944) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## iOS Deployment with CircleCI

This project is configured to automatically deploy iOS builds to TestFlight when changes are pushed to the `main` branch. The deployment is handled by Fastlane and CircleCI.

### Required Environment Variables

Set up the following environment variables in your CircleCI project settings:

- `APPLE_ID`: Your Apple ID email used for App Store Connect
- `APPLE_TEAM_ID`: Your Apple Developer Team ID (found in the Apple Developer Portal)
- `APP_BUNDLE_ID`: Your app's bundle identifier (e.g., app.lovable.660a78c1d643423c8ff4dc41ddfba944)
- `PROVISIONING_PROFILE_NAME`: Name of the provisioning profile for your app
- `IOS_DISTRIBUTION_CERTIFICATE_BASE64`: Base64-encoded distribution certificate (.p12 file)
- `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD`: Password for the distribution certificate
- `IOS_PROVISIONING_PROFILE_BASE64`: Base64-encoded provisioning profile (.mobileprovision file)
- `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`: App-specific password for your Apple ID

### Generating Required Files

1. **Distribution Certificate**:
   - Create in Apple Developer Portal or Xcode
   - Export as .p12 file with password
   - Convert to base64: `base64 -i distribution.p12 | pbcopy`

2. **Provisioning Profile**:
   - Create in Apple Developer Portal
   - Download and convert to base64: `base64 -i profile.mobileprovision | pbcopy`

3. **App-Specific Password**:
   - Generate at https://appleid.apple.com/account/manage
   - Use for `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`

### Manual Deployment

You can also deploy manually using Fastlane:

```bash
# Deploy to TestFlight
cd ios/App && bundle exec fastlane beta

# Deploy to App Store
cd ios/App && bundle exec fastlane release
```
