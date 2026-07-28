# PlaySync — Find Your Game Partner 🏸🎾⚽

**PlaySync** is a full-stack web application designed to connect sports enthusiasts, gamers, and athletes in their local communities. Whether you're looking for a tennis partner, a chess opponent, or trying to assemble a football squad, PlaySync helps you discover players, schedule matches, and build local sports communities.

---

## 🌟 Key Features

### 1. Authentication & Onboarding
- **Google OAuth:** Secure and seamless login powered by Firebase Authentication.
- **Custom Profiles:** New users go through an onboarding flow to set their location (city/neighborhood), preferred games, skill level (Beginner, Intermediate, Advanced), and a short bio.

### 2. Discover Players & Venues
- **Advanced Filtering:** Browse a directory of registered players and local sports venues. Filter results by city, specific games, or skill level.
- **Detailed Player Profiles:** View a player's preferred sports, location, and skill level before deciding to connect.

### 3. Match Requests & Scheduling
- **Send Play Requests:** Found a match? Send a direct request specifying the game, date, time, and a personalized message.
- **Manage Requests:** Dedicated inbox to track incoming requests (Accept/Decline) and sent requests. 
- **Match History:** View upcoming scheduled games and past matches in a dedicated dashboard.

### 4. Friends & Real-Time Chat
- **Automatic Friendships:** When a play request is accepted, both users automatically become "friends".
- **Messaging System:** Dedicated, WhatsApp-style two-panel chat interface to coordinate logistics with friends.
- **Unread Notifications:** Sidebar and mobile navigation automatically poll and display unread message counts.

### 5. Communities
- **Join Local Groups:** Browse and join user-created communities (Clubs, Societies, Neighborhood groups) based on specific cities and games.
- **Create Communities:** Users can create their own public groups to foster local sports networks.

### 6. Admin Portal
- **Role-Based Access Control:** Secure portal restricted to users with the `admin` role.
- **Platform Analytics:** Real-time stats on total users, active matches, communities, and pending requests.
- **Activity Logging:** Visual logs of recent platform events (new registrations, matches accepted, communities created).
- **User Management:** View all registered users and safely remove abusive accounts.

---

## 🛠 Tech Stack

### Frontend (Client-Side)
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom dark theme with glassmorphism and glowing accents)
- **State Management:** React Hooks (`useState`, `useEffect`, Custom Hooks like `useAuth`)
- **API Communication:** Custom Fetch wrapper (`api.ts`) injecting Firebase Auth tokens automatically.

### Backend (Server-Side)
- **Environment:** Node.js & Express.js
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose ODMs)
- **Authentication:** Firebase Admin SDK (ID Token Verification)
- **Security:** 
  - `helmet` (HTTP Security Headers)
  - `express-rate-limit` (DDoS & Brute-force protection: 200 req/15min general, 20 req/15min for auth)
  - Strict CORS policy (`ALLOWED_ORIGIN`)

---

## 🗄 Database Models

1. **User:** Stores profile data, location, games, role (`user` vs `admin`), and an array of `friends` (references to other Users).
2. **MatchRequest:** Tracks requests between a `senderId` and `receiverId`, including status (`pending`, `accepted`, `declined`, `cancelled`), scheduled time, and messages.
3. **Message:** Tracks chat history between a `senderId` and `receiverId`, including `content`, `read` status, and timestamps.
4. **Community:** Stores community details (`name`, `city`, `type`), an array of `games`, the `admin` (creator), and an array of `members`.

---

## 🚀 Deployment Guide

PlaySync is configured to be deployed as a decoupled application.

### 1. Deploying the Backend (Render / Railway)
The backend includes a `render.yaml` file for automated deployment on **Render**.
- Uses `npm run build` (tsc) and `npm start` (node dist/index.js).
- **Required Environment Variables:**
  - `MONGO_URI`: Your MongoDB Atlas connection string.
  - `ALLOWED_ORIGIN`: Your deployed frontend URL (e.g., `https://playsync.vercel.app`).
  - `FIREBASE_PROJECT_ID`: The ID of your Firebase project.

### 2. Deploying the Frontend (Vercel)
The frontend is optimized for **Vercel**. Set the "Root Directory" to `frontend/` during setup.
- **Required Environment Variables:**
  - `NEXT_PUBLIC_API_URL`: Your deployed backend URL.
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - (and the rest of the Firebase config variables).

*Note: You must whitelist your Vercel URL in the Firebase Console (Authentication > Settings > Authorized Domains) for Google Login to work in production.*

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Firebase Project (with Google Auth enabled)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file with:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   FIREBASE_PROJECT_ID=your_firebase_project_id
   ```
4. `npm run dev` (Runs backend on `http://localhost:5001`)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create a `.env.local` file with your Firebase config and:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:5001
   ```
4. `npm run dev` (Runs frontend on `http://localhost:3000`)

---
*Designed & Built for local sports communities.* 🏆
