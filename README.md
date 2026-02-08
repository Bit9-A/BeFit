# BeFit - Holistic AI Wellness Companion

**BeFit** is an intelligent, cross-platform wellness application designed to transform your lifestyle through a holistic approach connecting **Fitness**, **Nutrition**, and **Mind**. Powered by advanced AI and gamification, BeFit makes the journey to a healthier you engaging and personalized.

![BeFit Banner](https://via.placeholder.com/1200x400.png?text=BeFit+App)

## 🚀 Key Features

### 🏋️‍♂️ Physical Wellness (Body)

- **Personalized Workouts**: AI-generated routines tailored to your goals and equipment.
- **Progress Tracking**: Visualize your weight history and activity streaks with interactive charts.
- **Activity Logging**: Track workouts and movement missions.

### 🥗 Smart Nutrition (Food)

- **AI Fridge Analysis**: Snap a photo of your fridge or pantry, and our AI will suggest healthy recipes and meal plans.
- **Nutrition Tracking**: Log meals and track your hydration.

### 🧠 Mental Health (Mind)

- **AI Therapist Chat**: A supportive companion for mental wellness, stress management, and mindfulness.
- **Daily Feed**: Curated wellness content for motivation and education.

### 🎮 Gamification

- **Level Up System**: Earn XP for every healthy action. Climb from "Novice" to "Cyborg" and beyond.
- **Daily Missions**: Complete simple tasks (Move, Eat, Hydrate) to keep your streak alive.
- **Streaks & Badges**: Stay motivated by maintaining your daily activity streak.

## 🛠️ Tech Stack

### Frontend (Mobile & Web)

Built with **React Native** and **Expo**.

- **Framework**: [Expo SDK 52](https://expo.dev) + [React Native](https://reactnative.dev)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Visualization**: [React Native Gifted Charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts)
- **Backend Integration**: [Supabase Client](https://supabase.com)

### Backend (API)

A robust Node.js API powered by **Express**.

- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Engine**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Database**: Supabase (PostgreSQL)
- **File Handling**: Multer (Framework agnostic file uploading)

## 📂 Project Structure

```
BeFit/
├── app/                 # Expo Frontend Application
│   ├── app/             # Expo Router pages (screens)
│   ├── components/      # Reusable UI components
│   ├── stores/          # Global state (Zustand)
│   ├── services/        # API and Supabase services
│   └── ...
├── backend/             # Node.js Express API
│   ├── server.js        # Main entry point
│   ├── middleware/      # Auth and request processing
│   └── ...
└── README.md            # You are here
```

## ⚡ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app (for mobile testing)

### 1. Setup Backend

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with your credentials (see `.env.example` if available, or ask the admin):

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
```

Start the server:

```bash
npm run dev
```

### 2. Setup Frontend (App)

Open a new terminal, navigate to the app directory, and install dependencies:

```bash
cd app
npm install
```

Create a `.env` file in the `app` folder:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the app:

```bash
npx expo start
```

Press `w` for Web, `a` for Android, or scan the QR code with your phone.

## 🤝 Contribution

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
