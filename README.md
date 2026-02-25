# Launch Guide

### 1. Requirements
Before starting, ensure you have the following installed:
- **Node.js** (LTS version)
- **Git**
- **Expo Go** app on your mobile device (Android/iOS)

### 2. Installation
Clone the repository and install dependencies:

1. Clone the repo:
`git clone https://github.com/zuluw/game-catalog.git`

2. Go to the project folder:
`cd GameCatalog`

3. Install packages:
`npm install`

### 3. Running the App
Start the development server:

`npx expo start`

### 4. How to view
- **On a physical phone**: Open the **Expo Go** app and scan the QR code displayed in your terminal. (Ensure your phone and PC are on the same Wi-Fi network).
- **On an emulator**: Press `a` for Android or `i` for iOS in the terminal after the server starts.
- **Troubleshooting**: If Wi-Fi connection fails, use: `npx expo start --tunnel`