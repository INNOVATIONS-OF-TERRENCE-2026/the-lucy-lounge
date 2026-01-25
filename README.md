# The Lucy Lounge 🌙✨

> **Your AI-powered immersive listening sanctuary**

[![CI](https://github.com/INNOVATIONS-OF-TERRENCE-2026/the-lucy-lounge/actions/workflows/ci.yml/badge.svg)](https://github.com/INNOVATIONS-OF-TERRENCE-2026/the-lucy-lounge/actions)
[![Live Site](https://img.shields.io/badge/Live-thelucylounge.com-purple)](https://thelucylounge.com)

The Lucy Lounge is a cinematic, AI-powered listening experience featuring Lucy — your intelligent companion who curates moods, remembers your preferences, and creates personalized ambient soundscapes.

---

## 🌟 Features

### 🎭 Cinematic Experience
- **Immersive Transitions** - Smooth page animations with Framer Motion
- **Dream Mode** - Ethereal visual effects for deep relaxation
- **Presence System** - Lucy adapts her energy to your activity
- **Ambient Soundscapes** - Layered audio environments
- **Dynamic Backgrounds** - 4K nature scenes that respond to time of day

### 🤖 Lucy AI Companion
- **Conversational AI** - Natural dialogue powered by advanced LLMs
- **Memory & Context** - Lucy remembers your preferences across sessions
- **Mood Detection** - Analyzes your activity to suggest content
- **Proactive Suggestions** - Context-aware recommendations
- **Streaming Responses** - Real-time token-by-token generation

### 🎵 Music & Audio
- **Spotify Integration** - Connect your account for personalized playback
- **Lucy DJ Mode** - AI-curated playlists based on your mood
- **Ambient Audio Library** - Curated collection of relaxation sounds
- **Smart Scene Backgrounds** - Audio-visual harmony

### 🌐 Social & Community
- **Referral System** - Invite friends with unique links
- **Shareable Sessions** - Public/private share links
- **Blog & Content** - Lucy's thoughts and guides

### 📱 PWA Features
- **Installable** - Add to home screen on any device
- **Offline Mode** - Access past sessions offline
- **Push Notifications** - Stay connected with Lucy
- **Background Audio** - Music continues when minimized

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/INNOVATIONS-OF-TERRENCE-2026/the-lucy-lounge.git
cd the-lucy-lounge

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Fill in your Supabase and API credentials

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🔧 Environment Setup

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
VITE_SITE_URL=https://thelucylounge.com
```

See [.env.example](.env.example) for all available options.

---

## 📱 PWA Installation

| Platform | Instructions |
|----------|-------------|
| **iOS** | Safari → Share → Add to Home Screen |
| **Android** | Chrome → Menu → Install App |
| **Desktop** | Click install icon in address bar |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + Framer Motion |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **AI** | OpenRouter + Lovable AI |
| **Music** | Spotify Web API |
| **Hosting** | Vercel / Lovable Cloud |

---

## 📁 Project Structure

```
src/
├── arcade/          # Lucy Arcade games
├── automation/      # Background task runners
├── chat/            # Chat system & renderers
├── cinematic/       # Cinematic UX components
├── components/      # Reusable UI components
├── config/          # App configuration
├── contexts/        # React contexts
├── data/            # Static data & content
├── features/        # Feature modules
├── hooks/           # Custom React hooks
├── integrations/    # Third-party integrations
├── lib/             # Utility libraries
├── navigation/      # Routing configuration
├── pages/           # Page components
└── theme/           # Theme configuration

supabase/
├── functions/       # Edge Functions
└── migrations/      # Database migrations
```

---

## 🔐 Security

- End-to-end encryption
- RLS policies on all tables
- Secure share links
- User data export/deletion tools

---

## 📈 Launch Checklist

### Pre-Launch
- [x] Complete all features
- [x] PWA setup
- [x] SEO optimization
- [x] Analytics tracking
- [x] Security audit

### Launch
- [ ] Deploy to production
- [ ] Custom domain setup
- [ ] Social media announcement
- [ ] Monitor analytics

---

## 📄 Project Structure

```
lucy-ai/
├── src/
│   ├── components/
│   │   ├── avatar/      # Lucy avatar system
│   │   ├── landing/     # Landing page
│   │   ├── chat/        # Chat interface
│   │   └── pwa/         # PWA components
│   ├── pages/           # Route pages
│   └── hooks/           # Custom hooks
└── supabase/
    ├── functions/       # Edge functions
    └── migrations/      # Database migrations
```

---

## 🤝 Support

- **Email**: hello@lucy-ai.app
- **Documentation**: docs.lucy-ai.app

---

**Made with ❤️ using Lovable Cloud**

*Lucy AI - Beyond Intelligence*
