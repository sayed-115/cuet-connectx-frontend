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

- 🔐 **User Authentication** - Secure login/signup with Student ID verification
- 👤 **User Profiles** - Customizable profiles with cover & profile image upload
- 👥 **Follow System** - Follow/unfollow members and see your followers & following lists
- 💼 **Job Board** - Browse and apply to job opportunities shared by the community
- 🎓 **Scholarships** - Discover funding opportunities for academic pursuits
- 🌐 **Community Network** - Connect with students and alumni across the globe
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🔗 **Backend Integration** - Connected to Node.js/Express/MongoDB backend

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
│   │   ├── Home.jsx       # Landing page with hero & gallery
│   │   ├── Jobs.jsx       # Job listings page
│   │   ├── Scholarships.jsx   # Scholarships page
│   │   ├── Community.jsx  # Community members page
│   │   ├── About.jsx      # About page
│   │   ├── FAQ.jsx        # Frequently asked questions
│   │   ├── Login.jsx      # User login page
│   │   ├── Signup.jsx     # User registration page
│   │   ├── Profile.jsx    # User profile with image upload
│   │   └── MemberProfile.jsx  # View other member profiles
│   ├── App.jsx            # Main app with scroll-to-top
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles & Tailwind config
├── index.html             # HTML template
├── netlify.toml           # Netlify deployment config
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
| **Netlify** | Deployment & Hosting |

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

## 🚀 Deployment

The app is deployed on **Netlify** with automatic builds from the main branch.

### Deploy your own:

1. Fork this repository
2. Connect to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

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
  
  **[🌐 Visit Live Site](https://cuet-connectx-react.netlify.app)**
</div>
