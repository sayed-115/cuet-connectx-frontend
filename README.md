# CUET ConnectX - Frontend

<div align="center">
  <img src="src/assets/logos/CUET_Vector_Logo.svg.png" alt="CUET Logo" width="120" />
  
  **Connect with CUETians Worldwide**
  
  [![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.4.1-646CFF?logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## 📖 About

CUET ConnectX is a modern web platform designed to connect students and alumni of **Chittagong University of Engineering and Technology (CUET)**. The platform facilitates networking, job opportunities, scholarship discovery, and community building among CUETians worldwide.

### ✨ Key Features

- 🔐 **Authentication** — Signup with email verification, forgot/reset password, change password from profile
- 📧 **Email Verification** — Crypto token sent via Resend; login blocked until verified
- 🔑 **Session Security** — Password change invalidates all existing sessions
- 👤 **User Profiles** — Customizable profiles with cover & profile image upload (Cloudinary)
- 👥 **Follow System** — Follow/unfollow members, followers & following lists
- 💼 **Job Board** — Browse and apply to job opportunities
- 🎓 **Scholarships** — Discover funding opportunities
- 🌐 **Community Network** — Connect with CUETians worldwide
- 🛡️ **Admin Portal** — User management, content moderation, analytics
- 🌙 **Dark Mode** — System-aware light/dark theme toggle
- 📱 **Responsive Design** — Mobile, tablet, and desktop optimized

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn package manager
- Backend server running (see [cuet-connectx-backend](https://github.com/sayed-115/cuet-connectx-backend))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sayed-115/cuet-connectx-frontend.git
   cd cuet-connectx-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Demo Account
```
Student ID: 2204115
Password: demo1234
```

---

## 📁 Project Structure

```
CUET-ConnectX/
├── public/                 # Static assets
├── src/
│   ├── assets/
│   │   ├── images/        # Image assets
│   │   └── logos/         # Logo files (CUET logo)
│   ├── components/
│   │   ├── Navbar.jsx     # Navigation bar with profile sync
│   │   └── Footer.jsx     # Footer component
│   ├── context/
│   │   ├── AuthContext.jsx    # Auth, following & followers management
│   │   └── ThemeContext.jsx   # Theme (dark/light) management
│   ├── pages/
│   │   ├── Home.jsx           # Landing page
│   │   ├── Jobs.jsx           # Job listings
│   │   ├── Scholarships.jsx   # Scholarships
│   │   ├── Community.jsx      # Community members
│   │   ├── About.jsx          # About page
│   │   ├── FAQ.jsx            # FAQ
│   │   ├── Login.jsx          # Login (blocks unverified users)
│   │   ├── Signup.jsx         # Registration + email verification
│   │   ├── VerifyEmail.jsx    # Email verification handler
│   │   ├── ForgotPassword.jsx # Forgot password form
│   │   ├── ResetPassword.jsx  # Reset password via token
│   │   ├── Profile.jsx        # User profile + change password
│   │   ├── MemberProfile.jsx  # View other member profiles
│   │   └── AdminPortal.jsx    # Admin dashboard
│   ├── App.jsx            # Main app with scroll-to-top
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles & Tailwind config
├── index.html             # HTML template
├── vercel.json            # Vercel deployment config
├── package.json           # Project dependencies
├── vite.config.js         # Vite configuration
└── README.md              # Project documentation
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **Vite 6** | Build Tool & Dev Server |
| **React Router 7** | Client-side Routing |
| **Tailwind CSS 4** | Utility-first CSS Framework |
| **Font Awesome 6** | Icon Library |
| **Google Fonts** | Typography (Inter, Poppins) |
| **Vercel** | Deployment & Hosting |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🎨 Features Breakdown

### Authentication
- Student ID-based registration (7-digit format)
- Automatic batch year detection from Student ID
- User type classification (Student/Alumni)
- Persistent login state with localStorage

### User Profiles
- **Cover Image Upload** - Customizable profile cover with compression
- **Profile Picture Upload** - Optimized image upload for mobile & desktop
- **Profile Info** - About, contact, social links, education, skills
- **Real-time Sync** - Profile picture syncs across navbar

### Follow System
- **Follow/Unfollow** - Follow members from their profile page
- **Followers List** - See who follows you with modal view
- **Following List** - View and manage who you follow
- **Persistent Storage** - Follow relationships saved locally

### Job Board
- Search functionality (by title, company, location)
- Apply tracking per session
- Login redirect for non-authenticated users

### Scholarships
- Visual scholarship cards with provider info
- Deadline tracking with visual indicators
- Apply functionality with status feedback

### Community
- Member profiles with batch and department info
- Follow/Unfollow functionality
- Profile initials avatars with gradient backgrounds

### Theme System
- System-aware dark mode
- Persistent theme preference
- Smooth transition animations

### UX Improvements
- Scroll to top on navigation
- Loading states for image uploads
- Mobile-optimized file inputs
- Toast notifications for actions

---

## 🏗️ Architecture

```
Frontend (Vercel)  →  Backend API (Render)  →  MongoDB Atlas
                                             →  Cloudinary (images)
                                             →  Resend (emails)
```

## 🔐 Authentication Flow

1. **Signup** → Email verification sent → User clicks link → Account activated
2. **Login** → Blocked if email not verified (403) → JWT issued on success
3. **Forgot password** → Enter email/Student ID → Reset link sent → 10-min expiry
4. **Change password** → From Profile page → All sessions invalidated → Re-login required

## 🚀 Deployment (Vercel)

1. Push to GitHub
2. Import repo on [Vercel](https://vercel.com)
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy — Vercel auto-detects Vite

The `vercel.json` includes a rewrite rule for SPA client-side routing.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- **CUET** - Chittagong University of Engineering and Technology
- **CUET Alumni Association** - For inspiration and community support
- All contributors and community members

---

<div align="center">
  <p>Made with ❤️ for CUETians</p>
  <p>© 2026 CUET ConnectX. All rights reserved.</p>
  
  **[🌐 Visit Live Site](https://cuet-connectx-frontend.vercel.app)**
</div>
