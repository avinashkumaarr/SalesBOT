# 🛍️ ShopBot AI — Autonomous Luxury E-Commerce Shopping Concierge

<div align="center">
  <h3>The Next-Generation AI Shopping Concierge & Live Multi-Store Price Comparison Engine</h3>
  <p>Built with <b>Gemini AI</b>, <b>PostgreSQL</b>, <b>React / Vite</b>, and <b>React Native (Expo)</b>.</p>
</div>

---

## ✨ Overview

**ShopBot AI** is an ultra-modern, luxury-themed autonomous e-commerce shopping concierge designed to revolutionize online shopping. By combining Google's **Gemini AI** with live multi-store product intelligence, ShopBot AI acts as an expert personal shopper—analyzing hardware specs, scoring products out of 10, comparing prices across India's top retail stores, and remembering your conversation history and preferences.

Designed with a **Luxury Editorial Monochrome Aesthetic** (*Instrument Serif* italics, *Inter* typography, deep `zinc-950` glassmorphic interfaces, and high-contrast styling), ShopBot AI delivers a state-of-the-art shopping experience on both Web and Mobile.

---

## 🚀 Key Features

### 🧠 1. Gemini AI Intelligent Scoring & Deep Analysis
- **2nd Pass Spec Assessment**: Analyzes raw hardware specifications (CPU, GPU, RAM, Display OLED/IPS, Battery) and assigns an objective AI Score out of 10.
- **Curated Recommendations**: Highlights the `#1 RECOMMENDED` product with tailored pros & cons, explaining exactly *why* a model fits your workflow (e.g., coding, gaming, video editing).
- **Expert Verdict & Buying Strategy**: Replaces robotic AI responses with professional editorial buying advice, advising whether to buy immediately or wait for sales like *Flipkart Big Billion Days* or *Amazon Great Indian Festival*.

### 🏬 2. Multi-Store Live Price Comparison
- **Real-Time Retail Tracking**: Aggregates and compares live prices across major Indian retailers:
  - **Amazon India** 🇮🇳
  - **Flipkart** 🛍️
  - **Croma** ⚡
  - **Reliance Digital** 📱
  - **Vijay Sales** 🖥️
  - **Tata CliQ** 🏷️
- **Best Price Badge**: Automatically calculates and highlights the lowest price across all stores with a prominent `BEST` badge.

### 🔗 3. Smart Canonical URLs & Zero-404 Fallback Engine
- **Granular Model Matching**: Differentiates between specific laptop and phone series (*IdeaPad Slim 3* vs. *Slim 5*, *Vivobook Go*, *Aspire Lite*, *MacBook Air M2* vs. *M3*) so no two product cards share generic store links.
- **Automated Search Redirector (`!ducky`)**: Features an automated search-to-first-result redirection endpoint (`/api/products/redirect`). If an exact direct link isn't cached, it intelligently routes to the exact first product on the retailer's site—guaranteeing **zero broken links or 404 errors**.

### 📈 4. Zero-Cost Price History & Trend Verification
- **No Paid APIs or Fabricated Data**: Integrates directly with trusted public historical price trackers (**PriceHistory.app** and **PriceBefore.com**).
- **One-Click Trend Analysis**: Every product card includes a prominent `📈 View Price History` button that opens verified historical pricing charts, helping users identify price drops and avoid fake discounts.

### 💬 5. Universal Chat & Follow-Up Memory (PostgreSQL)
- **Persistent Conversation Memory**: Powered by PostgreSQL and Prisma ORM across 5 relational tables (`chat_sessions`, `chat_messages`, `user_preferences`, `products_cache`, `recent_products`).
- **Contextual Awareness**: Automatically extracts and remembers user preferences (budget limit, favorite brand, profession, target category). Ask follow-up questions like *"Which one has better battery backup?"* or *"Suggest an ASUS laptop under my budget instead"* without repeating your criteria!
- **Smart 1-Hour Caching**: Caches live search results in PostgreSQL (`products_cache`) to deliver instant responses and optimize API usage.

### 📱 6. Cross-Platform Mobile App (iOS & Android)
- **Built with Expo & React Native**: Delivers a fluid, native mobile experience with full web feature parity.
- **Global Swipeable Sidebar Drawer**: Replaces standard bottom tabs with a sleek navigation hub. Includes custom **PanResponder gesture control**—simply swipe from right to left anywhere on screen to smoothly close the drawer!
- **Race-Condition Free**: Optimized NativeWind style interop layer ensures rock-solid navigation stability without UI crashes or lag.

---

## 🏗️ Architecture & Technology Stack

```
SalesBOT/
├── backend/          # Node.js, Express, Prisma ORM, PostgreSQL, Gemini AI SDK
├── frontend/         # React 18, Vite, Tailwind CSS, Lucide Icons, Vanilla CSS
└── mobile/           # React Native, Expo Router, NativeWind (Tailwind), Google Fonts
```

| Component | Stack / Technology |
| :--- | :--- |
| **Backend API** | Node.js, Express.js, REST API, Axios |
| **Database & ORM** | PostgreSQL, Prisma ORM (`chat_sessions`, `chat_messages`, `user_preferences`, `products_cache`, `recent_products`) |
| **AI Engine** | Google Gemini AI (`@google/genai` SDK), Custom Prompt Engineering, 2nd Pass Ranker |
| **Search & Scraping** | Hybrid Engine: Google Shopping (SerpAPI), ScrapingDog, Intelligent Fallback Catalog |
| **Web Frontend** | React 18, Vite, Tailwind CSS, Glassmorphic UI, Responsive Design |
| **Mobile App** | React Native, Expo Router, NativeWind v4, PanResponder Gestures, Google Fonts (*Instrument Serif*, *Inter*) |

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher running locally or hosted)
- **Google Gemini API Key** (Get one free from [Google AI Studio](https://aistudio.google.com/))
- **Expo Go App** (for testing mobile on iOS/Android)

---

### 1️⃣ Backend Setup
```bash
cd backend
npm install

# Create a .env file from the example
cp .env.example .env
```
Edit `backend/.env` and configure your database and API keys:
```env
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/salesbot"
GEMINI_API_KEYS="your_gemini_api_key_here"
FRONTEND_URL=http://localhost:5173
```
Run Prisma migrations and start the backend server:
```bash
npx prisma migrate dev --name init
npm run dev
```
*Backend will start on `http://localhost:3001`*

---

### 2️⃣ Web Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Web application will start on `http://localhost:5173`*

---

### 3️⃣ Mobile App Setup (React Native / Expo)
In a new terminal:
```bash
cd mobile
npm install --legacy-peer-deps
npm start
```
- Press **`a`** to open in Android Emulator.
- Press **`i`** to open in iOS Simulator (macOS only).
- Or scan the terminal QR code using the **Expo Go** app on your physical smartphone!

> **Note for Physical Phone Testing**: If testing on a physical phone, update `mobile/utils/api.ts` to use your computer's local Wi-Fi IP address (e.g., `http://192.168.1.100:3001`) instead of `localhost`.

---

## 🔒 Security & Privacy

This repository is pre-configured with industry-standard `.gitignore` rules to ensure total security:
- All `.env` environment variables, secrets, and API keys are strictly excluded.
- Database logs, local SQLite/Postgres journals, and temporary scratch files are ignored.
- Build artifacts (`node_modules/`, `.expo/`, `dist/`, `build/`) are excluded from version control.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Designed and Developed with ❤️ for the Future of E-Commerce.</p>
</div>
