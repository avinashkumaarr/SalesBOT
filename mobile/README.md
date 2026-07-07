# ShopBot AI — Mobile App

Cross-platform iOS & Android app built with **Expo (React Native)**.

## Prerequisites

- Node.js 18+
- Expo Go app on your phone **OR** Android Emulator / iOS Simulator

## Setup

```bash
cd sales-bot/mobile
npm install --legacy-peer-deps
```

## Running

```bash
# Start Expo dev server
npm start

# Or run directly:
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS only)
```

Then scan the QR code with the **Expo Go** app on your phone.

## Backend Connection

- **Android Emulator**: Connects to `http://10.0.2.2:3001` (maps to host `localhost`)
- **iOS Simulator**: Connects to `http://localhost:3001`
- **Physical Phone**: Update `utils/api.ts` with your LAN IP, e.g. `http://192.168.1.x:3001`

Make sure the backend (`sales-bot/backend`) is running: `npm run dev`

## Features

- 🏠 **Home** — Animated hero, category grid, feature highlights
- 💬 **ShopBot AI** — Full AI chat with product cards, store links, compare modal, price history
- 💳 **Plans** — Pricing tiers (Starter / Pro / Power) with monthly/annual toggle
- 🔐 **Auth** — Login & Register (modal screen)
