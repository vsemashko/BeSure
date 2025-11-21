# BeSure - Mutual Voting Platform

**Make decisions faster with collective wisdom**

BeSure is a mobile-first platform where users help each other make decisions through voting. To ask for help, you first vote on others' questions. No comments, no endless debates—just quick, clear results powered by community wisdom.

![Version](https://img.shields.io/badge/version-1.0.0--mvp-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Project Overview

BeSure helps people make everyday decisions by:
- **Voting on others' questions** to earn points
- **Creating your own questions** when you need help
- **Getting quick results** without noise or toxicity
- **Gamified point system** that keeps participation fair

## 📚 Documentation

Comprehensive PRD documentation available in [`/docs`](./docs):

- **[PRD-Main.md](./docs/PRD-Main.md)** - Product vision, goals, and core features
- **[PRD-TechStack.md](./docs/PRD-TechStack.md)** - Technical architecture and stack decisions
- **[PRD-PointSystem.md](./docs/PRD-PointSystem.md)** - Point economy mechanics and improvements
- **[PRD-Phases.md](./docs/PRD-Phases.md)** - Implementation roadmap and timeline
- **[PRD-Features.md](./docs/PRD-Features.md)** - Feature prioritization and roadmap
- **[PRD-Monetization.md](./docs/PRD-Monetization.md)** - Sustainable revenue strategy
- **[PRD-UXUI.md](./docs/PRD-UXUI.md)** - Design system and UX guidelines

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Expo CLI (for mobile development)

### Setup

**1. Clone the repository**
```bash
git clone <repository-url>
cd BeSure
```

**2. Set up the backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start the server
npm run dev
```

Backend runs at `http://localhost:3000`

**3. Set up the mobile app**
```bash
cd mobile
npm install

# Update API URL in app.json if needed
# Edit app.json: expo.extra.apiUrl

# Start Expo
npm start
```

See detailed setup instructions in:
- [Backend README](./backend/README.md)
- [Mobile README](./mobile/README.md)

## 📱 Features (MVP)

### ✅ Completed

**Authentication**
- User registration and login
- JWT-based authentication
- Secure token storage
- Auto-login

**Point System**
- Starting balance: 10 points
- Earn +2 points per vote
- Question costs: 10-18 points (dynamic)
- Completion rewards based on engagement

**Questions**
- Create questions with 2-6 options
- Set expiration (5min - 7 days)
- Anonymous mode
- Privacy levels (public/friends)

**Voting**
- Vote on questions
- Real-time results
- Vote history
- Earn points instantly

**Feed**
- Browse questions (For You, Urgent, Popular)
- Pull to refresh
- Infinite scroll
- Smart filtering

**Profile**
- View stats and points
- Question history
- Logout

## 🏗️ Architecture

```
BeSure/
├── docs/              # Comprehensive PRD documentation
├── backend/           # Node.js + Express + PostgreSQL API
│   ├── src/
│   │   ├── api/       # Controllers, routes, middleware
│   │   ├── services/  # Business logic
│   │   ├── config/    # Configuration
│   │   └── utils/     # Utilities
│   ├── prisma/        # Database schema
│   └── README.md
├── mobile/            # React Native + Expo app
│   ├── src/
│   │   ├── screens/   # Screen components
│   │   ├── components/# Reusable UI components
│   │   ├── navigation/# Navigation setup
│   │   ├── api/       # API client
│   │   ├── store/     # State management
│   │   └── theme/     # Design system
│   └── README.md
└── README.md          # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 15+ with Prisma ORM
- **Auth:** JWT with bcrypt
- **Validation:** express-validator
- **Logging:** Winston

### Frontend (Mobile)
- **Framework:** React Native 0.73 with Expo ~50.0
- **Language:** TypeScript
- **Navigation:** React Navigation 6
- **State:** Zustand
- **HTTP:** Axios
- **Storage:** Expo SecureStore
- **Icons:** Ionicons

### Hosting (Recommended)
- **Backend:** Railway ($5-20/month)
- **Database:** Railway PostgreSQL
- **Storage:** Cloudflare R2 (free tier)
- **Mobile:** Expo EAS

## 📊 Project Status

**Current Status:** MVP Complete ✅

**Completed:**
- ✅ Complete PRD documentation
- ✅ Backend API with all core features
- ✅ Mobile app with full UI/UX
- ✅ Authentication system
- ✅ Point economy
- ✅ Question creation and voting
- ✅ User profiles

**Next Steps:**
- [ ] Deploy backend to Railway
- [ ] Deploy mobile app to Expo
- [ ] Beta testing with real users
- [ ] Gather feedback and iterate
- [ ] Add image upload support
- [ ] Implement push notifications
- [ ] Add streak system and daily challenges

## 🎨 Design System

Based on PRD-UXUI.md specifications:

**Colors:**
- Primary: #4A90E2 (Blue)
- Success: #51CF66 (Green)
- Error: #FF6B6B (Red)
- Option colors: Coral, Teal, Purple, Orange, Green, Yellow

**Typography:**
- Font: System (SF Pro on iOS, Roboto on Android)
- Scale: 12px - 32px
- Weights: Regular (400), Semi-bold (600), Bold (700)

**Components:**
- Buttons (4 variants)
- Inputs with validation
- Cards with shadows
- Question cards
- Custom navigation

## 📈 Success Metrics

**MVP Goals (First 3 Months):**
- 1,000+ registered users
- 500+ daily active users
- 100+ questions posted per day
- 1,000+ votes per day
- 40%+ D7 retention rate
- 4.0+ star rating on app stores

## 💰 Monetization

**Strategy:** Sustainable, not profit-driven

**Phase 1 (Month 0-6):**
- Free with optional donations
- Keep costs <$100/month

**Phase 2 (Month 6-12):**
- Light native advertising (sponsored questions)
- Premium tier ($2.99/month) - ad-free + unlimited questions

**Phase 3 (Month 12+):**
- Sponsorships
- Affiliate links for product questions
- B2B version for teams

See [PRD-Monetization.md](./docs/PRD-Monetization.md) for details.

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Mobile Testing
Use Expo Go app on your phone:
1. Start backend: `cd backend && npm run dev`
2. Start mobile: `cd mobile && npm start`
3. Scan QR code with Expo Go

### Test Accounts
Create via registration or use:
- Email: `test@besure.com`
- Password: `Test123!`

## 🚢 Deployment

### Backend Deployment (Railway)

1. Create account on Railway.app
2. Create new project
3. Add PostgreSQL database
4. Connect GitHub repository
5. Set environment variables
6. Deploy!

See [backend/README.md](./backend/README.md) for detailed instructions.

### Mobile Deployment (Expo)

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Build for app stores
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

See [mobile/README.md](./mobile/README.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Use TypeScript strictly
- Keep PRs focused and small

## 📝 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with React Native and Expo
- Powered by Node.js and PostgreSQL
- Icons by Ionicons
- Design inspired by modern mobile apps

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/vsemashko/BeSure/issues)
- **Documentation:** See `/docs` folder
- **Questions:** Open a discussion on GitHub

## 🗺️ Roadmap

**Q1 2026:**
- ✅ MVP Development
- [ ] Beta launch with 100 users
- [ ] Gather feedback
- [ ] Iterate on UX

**Q2 2026:**
- [ ] Public launch
- [ ] Image upload support
- [ ] Push notifications
- [ ] Streak system

**Q3 2026:**
- [ ] Daily challenges
- [ ] Topic expertise
- [ ] Badges and achievements
- [ ] Monetization (ads + premium)

**Q4 2026:**
- [ ] Groups feature
- [ ] Advanced recommendations
- [ ] B2B version
- [ ] 10K+ active users

See [PRD-Phases.md](./docs/PRD-Phases.md) for complete timeline.

## 📚 Additional Resources

- [Product Requirements](./docs/PRD-Main.md)
- [Technical Architecture](./docs/PRD-TechStack.md)
- [Backend Documentation](./backend/README.md)
- [Mobile Documentation](./mobile/README.md)
- [Point System Guide](./docs/PRD-PointSystem.md)
- [UX/UI Guidelines](./docs/PRD-UXUI.md)

---

**Built with ❤️ for making decisions easier**

*Version 1.0.0 - MVP*
