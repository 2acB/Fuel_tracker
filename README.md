# FuelTrack ⛽🫧

FuelTrack is a modern, beautifully designed web application (and Progressive Web App) for tracking your vehicle's fuel expenses and efficiency. 

## ✨ Features
- **Dynamic Dashboard**: Track your fuel efficiency, cost, and monthly trends with interactive charts.
- **Bright & Playful UI**: Enjoy a stunning light theme with glassmorphic cards, soft shadows, and delightful "slime" emoji animations when performing actions.
- **Multi-Vehicle Support**: Seamlessly switch between different vehicles.
- **Offline Capable & PWA**: Designed as a Progressive Web App (PWA) so you can install it on your iOS or Android home screen for a native app feel.
- **Capacitor Ready**: Source code includes Capacitor configurations to easily compile to native `.apk` or `.ipa` files.
- **Smart Fuel Pricing**: Automatically calculates fuel liters based on live/default price rates in Thailand.

## 🚀 Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS + Custom CSS Variables for themes
- **State Management**: Zustand
- **Routing**: React Router
- **Charts**: Recharts
- **Maps**: React Leaflet
- **Native Wrap**: Capacitor

## 🛠️ Local Development

1. Clone the repository
```bash
git clone https://github.com/2acB/Fuel_tracker.git
cd Fuel_tracker
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## 📱 Running on Mobile (PWA)
To test on your mobile device as a Progressive Web App:
1. Run `npm run dev -- --host`
2. Make sure your computer and phone are on the same Wi-Fi network.
3. Open the `Network` URL provided in your terminal on your mobile browser.
4. Use "Add to Home Screen" in Chrome (Android) or Safari (iOS).

## 💡 About the Animations
FuelTrack features a custom `SlimeToast` animation engine built with CSS keyframes and Zustand. Actions like saving a refuel will trigger a physics-based burst of emojis to celebrate your log!

## 📝 License
MIT
