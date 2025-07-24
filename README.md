# 🎵 MUSICRESET – Full-Stack Music Streaming Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Tech](https://img.shields.io/badge/stack-React%20%7C%20Node%20%7C%20MongoDB-blue)

A full-featured, production-ready music streaming platform built with the modern web stack. MUSICRESET allows users to stream encrypted music, purchase songs or albums, subscribe to artists, and enjoy a seamless music experience.

---

## 🚀 Key Features

- 🔐 User authentication (register/login/logout)
- 🔊 Stream music using **HLS + AES encryption**
- 💳 Payment integration with **Stripe & Razorpay**
- 🎧 Buy songs/albums or subscribe to artists
- ❤️ Like/unlike songs and manage playlists
- 🔍 Powerful search and filters
- 🎨 Admin dashboard for managing artists, albums, songs, and playlists
- 🌙 Fully responsive UI built with **React + Tailwind CSS**

---

## 🧠 Tech Stack

| Frontend  | Backend   | Media/Infra        | Payments        |
|-----------|-----------|--------------------|-----------------|
| React     | Node.js   | AWS S3 + MediaConvert | Stripe |
| Redux Toolkit | Express.js | HLS (with AES)         |                 |
| Tailwind CSS | MongoDB (Mongoose) |               |                 |

---

## ⚙️ Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/musicreset.git
cd streaming

# 2. Install dependencies
cd backend && npm install
cd frontend && npm install

# 3. Set up your environment variables
# → Create .env files in both /backend and /frontend folders

# 4. Start the dev servers
cd backend && npm run dev
cd ../frontend && npm start
