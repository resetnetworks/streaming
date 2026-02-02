# 🎵 RESET MUSIC – Frontend Music Streaming Application

<div align="center">

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Tech](https://img.shields.io/badge/frontend-React%20%7C%20Vite%20%7C%20Tailwind-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![Status](https://img.shields.io/badge/status-active-success)

<img src="logo.svg" alt="Reset Music Logo" width="60" />

</div>

---

## 🌟 Overview

**RESET MUSIC (Frontend)** is a modern, scalable **music streaming user interface** built using **React + Vite**.  
This repository contains **only the frontend (client-side)** codebase, focused on delivering a smooth audio playback experience, clean UI, and secure integration with backend APIs.

The application is designed with **performance, usability, and scalability** in mind, making it suitable for production-ready music platforms.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication UI
- Login & registration screens  
- Social login UI (Google-ready)  
- Protected routes (Auth Guard)  
- Token-based session handling (frontend)  
- Persistent authentication state  

### 🎵 Music Streaming UI
- Interactive audio player interface  
- Album & playlist browsing  
- Skeleton loaders for smooth UX  
- Optimized rendering for large song lists  

</td>
<td width="50%">

### 💳 Payments (Frontend Integration)
- Razorpay checkout UI  
- PayPal payment flow UI  
- Song, album & subscription purchase screens  
- Payment success & failure handling  

### 🎨 User Experience
- Fully responsive layout  
- Dark mode support  
- Like / unlike songs UI  
- Search & filter interface  
- Loading, empty & error states  

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

<div align="center">

### Frontend Technologies

| Core | UI / UX | Routing & State | Build Tools |
|-----|--------|-----------------|-------------|
| React 18 | Tailwind CSS | React Router v6 | Vite |
| Redux Toolkit | Framer Motion | React Helmet | ESLint |

### Payments & Integrations

| Payments | Auth UI |
|---------|--------|
| Razorpay | Google OAuth (UI) |
| PayPal | |

</div>

---

## 📁 Folder Structure

```text
src/
├── assets/
├── components/
├── features/
├── hooks/
├── pages/
├── routes/
├── services/
├── utils/
├── App.jsx
└── main.jsx
