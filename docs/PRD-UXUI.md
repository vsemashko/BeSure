# BeSure: UX/UI Guidelines
## Design Principles & User Experience

**Version:** 1.0
**Last Updated:** November 21, 2025
**Document Owner:** Design Team

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Visual Identity](#visual-identity)
3. [Design System](#design-system)
4. [User Flows](#user-flows)
5. [Screen-by-Screen Guidelines](#screen-by-screen-guidelines)
6. [Interaction Design](#interaction-design)
7. [Accessibility](#accessibility)
8. [Responsive Design](#responsive-design)
9. [Design Principles](#design-principles)

---

## Design Philosophy

### Core Principles

#### 1. Clarity Over Cleverness
- Every element has a clear purpose
- No mystery meat navigation
- Plain language, no jargon
- Obvious next steps

#### 2. Speed & Efficiency
- Fast decisions, fast voting
- Minimal taps to complete actions
- Instant feedback
- No unnecessary steps

#### 3. Delightful but Not Distracting
- Subtle animations and transitions
- Satisfying interactions
- Celebrate achievements
- Don't overwhelm

#### 4. Clean & Minimal
- Focus on content (questions and options)
- Remove visual clutter
- Generous whitespace
- Clear hierarchy

#### 5. Approachable & Friendly
- Warm, welcoming tone
- Encouraging messages
- Positive reinforcement
- Human, not corporate

### Design Goals

- ✅ New users understand app in <30 seconds
- ✅ Voting takes <10 seconds
- ✅ Creating question takes <2 minutes
- ✅ Zero learning curve for basic features
- ✅ Feels modern and polished

---

## Visual Identity

### Brand Personality

**BeSure is:**
- 🎯 **Decisive** - helps people make choices confidently
- 🤝 **Helpful** - community of support
- ⚡ **Fast** - quick decisions, no overthinking
- 🎨 **Colorful** - vibrant but not chaotic
- 😊 **Friendly** - approachable and warm

**BeSure is NOT:**
- ❌ Corporate or formal
- ❌ Chaotic or overwhelming
- ❌ Aggressive or pushy
- ❌ Boring or bland

### Color Palette

#### Primary Colors

**Primary Blue** (#4A90E2)
- Use for: Primary actions, selected states, links
- Purpose: Trust, clarity, action
- RGB: 74, 144, 226
- Accessible contrast on white

**Primary Dark** (#2C3E50)
- Use for: Text, headers, important elements
- Purpose: Readability, hierarchy
- RGB: 44, 62, 80

**Primary Light** (#ECF4FB)
- Use for: Backgrounds, subtle highlights
- Purpose: Visual breathing room
- RGB: 236, 244, 251

#### Secondary Colors (Voting Options)

**Option A - Coral** (#FF6B6B)
- Warm, energetic, passionate
- RGB: 255, 107, 107

**Option B - Teal** (#4ECDC4)
- Fresh, modern, balanced
- RGB: 78, 205, 196

**Option C - Purple** (#A77BCA)
- Creative, unique, thoughtful
- RGB: 167, 123, 202

**Option D - Orange** (#FFA07A)
- Optimistic, friendly, approachable
- RGB: 255, 160, 122

**Option E - Green** (#51CF66)
- Natural, positive, growth
- RGB: 81, 207, 102

**Option F - Yellow** (#FFD93D)
- Happy, energetic, attention-grabbing
- RGB: 255, 217, 61

#### Semantic Colors

**Success** (#51CF66)
- Confirmations, success states, positive actions

**Warning** (#FFB82E)
- Warnings, cautions, important notices

**Error** (#FF6B6B)
- Errors, destructive actions, alerts

**Info** (#4A90E2)
- Information, tips, neutral notifications

#### Neutral Colors

**Black** (#000000) - Rarely used, only for emphasis
**Dark Gray** (#2C3E50) - Primary text
**Medium Gray** (#95A5A6) - Secondary text, icons
**Light Gray** (#E8E8E8) - Borders, dividers
**Background** (#F7F9FB) - App background
**White** (#FFFFFF) - Cards, surfaces

### Typography

#### Primary Font: Inter

**Why Inter:**
- Modern, clean sans-serif
- Excellent readability on screens
- Open-source and free
- Complete character set
- Optimized for UI

#### Type Scale

**Display** (32px / 2rem)
- Weight: Bold (700)
- Use: Page titles, important headings
- Line height: 1.2

**Heading 1** (24px / 1.5rem)
- Weight: Semi-bold (600)
- Use: Section headings, question titles
- Line height: 1.3

**Heading 2** (20px / 1.25rem)
- Weight: Semi-bold (600)
- Use: Card titles, sub-sections
- Line height: 1.4

**Body Large** (18px / 1.125rem)
- Weight: Regular (400)
- Use: Option text, important body
- Line height: 1.5

**Body** (16px / 1rem)
- Weight: Regular (400)
- Use: Main body text, descriptions
- Line height: 1.5

**Body Small** (14px / 0.875rem)
- Weight: Regular (400)
- Use: Secondary text, metadata
- Line height: 1.4

**Caption** (12px / 0.75rem)
- Weight: Regular (400)
- Use: Labels, timestamps, helper text
- Line height: 1.3

### Iconography

**Icon System:** Feather Icons

**Why Feather:**
- Minimal, clean design
- Consistent stroke width
- Comprehensive set
- Open source

**Icon Sizes:**
- Small: 16px (inline with text)
- Medium: 24px (standard buttons, navigation)
- Large: 32px (main actions, empty states)

**Icon Style:**
- Line icons, not filled
- 2px stroke weight
- Rounded corners
- Consistent optical size

---

## Design System

### Components

#### Buttons

**Primary Button**
```
Background: Primary Blue (#4A90E2)
Text: White
Border-radius: 12px
Padding: 16px 24px
Font: Body (16px), Semi-bold
Shadow: 0 2px 8px rgba(74, 144, 226, 0.2)
Hover: Darken 10%
Active: Scale 0.98
```

**Secondary Button**
```
Background: Transparent
Text: Primary Blue
Border: 2px solid Primary Blue
Border-radius: 12px
Padding: 16px 24px
Font: Body (16px), Semi-bold
Hover: Background Primary Light
```

**Destructive Button**
```
Background: Error (#FF6B6B)
Text: White
Border-radius: 12px
Padding: 16px 24px
Font: Body (16px), Semi-bold
```

**Ghost Button**
```
Background: Transparent
Text: Primary Dark
Border: None
Padding: 12px 16px
Font: Body (16px), Regular
Hover: Background Light Gray
```

#### Cards

**Standard Card**
```
Background: White
Border-radius: 16px
Padding: 20px
Shadow: 0 2px 12px rgba(0, 0, 0, 0.08)
Border: 1px solid Light Gray (optional)
```

**Question Card (Feed)**
```
Background: White
Border-radius: 16px
Padding: 16px
Shadow: 0 2px 8px rgba(0, 0, 0, 0.06)
Margin: 12px horizontal
Gap between cards: 16px
```

**Option Card**
```
Background: White
Border-radius: 12px
Border: 2px solid Light Gray
Padding: 16px
Hover: Border color to Primary Blue
Selected: Border color to Primary Blue, Background to Primary Light
```

#### Inputs

**Text Input**
```
Background: White
Border: 2px solid Light Gray
Border-radius: 12px
Padding: 12px 16px
Font: Body (16px)
Placeholder: Medium Gray
Focus: Border color to Primary Blue
Error: Border color to Error Red
```

**Text Area**
```
Same as Text Input
Min-height: 120px
Resize: Vertical only
```

#### Navigation

**Bottom Tab Bar** (Mobile)
```
Background: White
Height: 80px (including safe area)
Shadow: 0 -2px 8px rgba(0, 0, 0, 0.06)
Items: 5 max
Icons: 24px
Text: Caption (12px)
Active: Primary Blue
Inactive: Medium Gray
```

**Top Navigation Bar**
```
Background: White
Height: 56px (+ status bar)
Title: Heading 2 (20px), Semi-bold
Back button: Left
Actions: Right
Shadow: 0 2px 4px rgba(0, 0, 0, 0.04)
```

---

## User Flows

### Core User Flows

#### 1. First-Time User Onboarding

```
1. Splash Screen (2 seconds)
   ↓
2. Welcome Screens (3 swipeable cards)
   - "Make decisions faster with collective wisdom"
   - "Vote on others' questions to earn points"
   - "Create your own questions and get help"
   ↓
3. Sign Up Screen
   - Email, password, username
   - "Continue with Apple" (iOS)
   - "Continue with Google" (both platforms)
   ↓
4. Interest Selection (optional, skip)
   - "What are you interested in?" (8-10 topics)
   - Select 3-5 topics
   ↓
5. Tutorial Question (interactive)
   - Sample question: "Which color looks better?"
   - User votes → sees result → earns +2 points
   - Celebration animation
   ↓
6. Main Feed (ready to use)
   - Coach marks on first visit (optional)
   - "Try voting on a few questions to earn points!"
```

**Time to value:** <60 seconds

#### 2. Voting on a Question

```
1. Feed: User sees question card
   - Image/text options preview
   - Countdown timer
   - Vote count (optional)
   ↓
2. Tap on card → Question Detail
   - Full question title
   - All options clearly displayed
   - Tap to select option
   ↓
3. Option Selected
   - Visual feedback (highlight, animation)
   - "Submit Vote" button appears
   ↓
4. Submit Vote
   - Quick animation
   - "+2 points earned" notification
   ↓
5. Results Screen
   - Percentage breakdown
   - Visual chart
   - User's choice highlighted
   - "Vote on another" button
```

**Time to vote:** 5-10 seconds

#### 3. Creating a Question

```
1. Tap "+" button (center of tab bar)
   ↓
2. Point Check
   - If points < 10: "Vote on 5 more questions to create yours"
   - If points >= 10: Proceed
   ↓
3. Question Creation (Multi-step)

   Step 1: Write Question
   - "What do you need help deciding?"
   - Text input (max 200 chars)
   - AI suggests similar questions (optional)
   ↓

   Step 2: Add Options (2-6)
   - "Add your options"
   - Text or image for each option
   - Minimum 2, maximum 6
   - Reorder by drag-and-drop
   ↓

   Step 3: Settings
   - Expiration time (picker: 5min - 7days)
   - Privacy (public, friends-only)
   - Anonymous toggle
   - Cost shown: "10 points"
   ↓

   Step 4: Preview
   - See how question will look
   - Edit if needed
   - "Post Question" button
   ↓

4. Question Posted
   - Success animation
   - "Your question is live!"
   - "Share" option
   - Go to question page
```

**Time to create:** 1-2 minutes

---

## Screen-by-Screen Guidelines

### Feed Screen (Home)

**Purpose:** Browse and vote on questions

**Layout:**
```
┌─────────────────────────┐
│  BeSure    [100 points] │ ← Header
├─────────────────────────┤
│  [Urgent][Popular][You] │ ← Feed tabs
├─────────────────────────┤
│                         │
│  ┌─── Question Card ───┐│
│  │ "Which outfit?"    │ │
│  │ [img] [img]        │ │
│  │ ⏱ 2h left          │ │
│  │ 👥 45 votes        │ │
│  └───────────────────── │
│                         │
│  ┌─── Question Card ───┐│
│  │ ...                │ │
│  └───────────────────── │
│                         │
├─────────────────────────┤
│ [Feed] [Search] [+]    │ ← Bottom nav
│ [Activity] [Profile]   │
└─────────────────────────┘
```

**Elements:**
- **Point balance** (top right) - always visible
- **Feed tabs** - switch between feed modes
- **Question cards** - infinite scroll, pull to refresh
- **Empty state** - "No questions yet! Be the first to post"

**Question Card Contents:**
- Question text (2 lines max, truncated)
- Option previews (thumbnails or text)
- Countdown timer (prominent)
- Vote count (if not hidden)
- Anonymous indicator (if applicable)

### Question Detail Screen

**Purpose:** View full question and vote

**Layout:**
```
┌─────────────────────────┐
│ [←]  Question  [share] │ ← Header
├─────────────────────────┤
│                         │
│ Which sneakers should   │ ← Question
│ I buy for everyday?     │
│                         │
│ ⏱ Expires in 5h 23m    │ ← Timer
│ 👥 67 votes so far     │
│                         │
│ ┌─── Option A ────────┐│
│ │ [Image]            │ │
│ │ Nike Air Max       │ │
│ │ $120               │ │
│ └────────────────────── │
│                         │
│ ┌─── Option B ────────┐│
│ │ [Image]            │ │
│ │ Adidas Ultraboost  │ │
│ │ $180               │ │
│ └────────────────────── │
│                         │
│ ┌─── Option C ────────┐│
│ │ ...                │ │
│                         │
│  [  Vote (+2 points)  ]│ ← Action button
│                         │
└─────────────────────────┘
```

**Interactions:**
- Tap option card to select (visual highlight)
- Can change selection before voting
- "Vote" button appears when option selected
- Smooth scroll to see all options
- Share button (top right)

### Results Screen

**Purpose:** Show voting results

**Layout:**
```
┌─────────────────────────┐
│ [←]  Results           │
├─────────────────────────┤
│                         │
│ Which sneakers should   │
│ I buy for everyday?     │
│                         │
│ ✅ Closed - 234 votes  │
│                         │
│ ┌─── Your Choice ─────┐│
│ │ ⭐ Option A        │ │
│ │ Nike Air Max       │ │
│ │ 45% (105 votes)    │ │
│ │ [████████░░░░]     │ │ ← Progress bar
│ └────────────────────── │
│                         │
│ ┌─── Option B ────────┐│
│ │ Adidas Ultraboost  │ │
│ │ 35% (82 votes)     │ │
│ │ [███████░░░░░]     │ │
│ └────────────────────── │
│                         │
│ ┌─── Option C ────────┐│
│ │ New Balance        │ │
│ │ 20% (47 votes)     │ │
│ │ [████░░░░░░░░]     │ │
│ └────────────────────── │
│                         │
│ [Share Results] [Vote] │ ← Actions
│                         │
└─────────────────────────┘
```

**Elements:**
- User's choice highlighted with star/checkmark
- Percentage and vote count for each option
- Visual progress bars (use option colors)
- Sorted by vote count (highest first)
- Share results (export as image)
- "Vote on another question" button

### Create Question Screen

**Purpose:** Post a new question

**Multi-step form with progress indicator**

```
Step 1: Question Text
┌─────────────────────────┐
│ [←]  New Question  [1/4]│
├─────────────────────────┤
│                         │
│ What do you need help   │
│ deciding?               │
│                         │
│ ┌───────────────────────┐│
│ │ Which color should  │ │
│ │ I paint my room?    │ │
│ │                     │ │
│ └───────────────────────┘│
│ 42/200 characters       │
│                         │
│                         │
│         [Next]          │
│                         │
└─────────────────────────┘

Step 2: Options
┌─────────────────────────┐
│ [←]  Options       [2/4]│
├─────────────────────────┤
│                         │
│ Add your options        │
│ (2-6 options)           │
│                         │
│ ┌─── Option 1 ────────┐│
│ │ [📷] Light blue    │ │
│ └────────────────────── │
│                         │
│ ┌─── Option 2 ────────┐│
│ │ [📷] Dark green    │ │
│ └────────────────────── │
│                         │
│ [+ Add Option]          │
│                         │
│    [Back]    [Next]     │
│                         │
└─────────────────────────┘
```

**Features:**
- Progress indicator (1/4, 2/4, etc.)
- Character counter for text
- Image upload with preview
- Drag to reorder options
- Validation (min 2 options)
- "Save draft" option

### Profile Screen

**Purpose:** View user stats and settings

**Layout:**
```
┌─────────────────────────┐
│ [←]  Profile  [⚙️]     │
├─────────────────────────┤
│                         │
│      [Avatar]           │
│   @username             │
│   Level 5 • Advisor     │
│                         │
│ ┌───────────────────────┐│
│ │ 1,234 pts  50 days │ │ ← Stats
│ │ Points     Streak   │ │
│ └───────────────────────┘│
│                         │
│ ┌───────────────────────┐│
│ │ 156  votes given    │ │
│ │ 23   questions      │ │
│ │ 87%  win rate       │ │
│ └───────────────────────┘│
│                         │
│ 🎖 Achievements          │
│ [🏅] [⭐] [🔥] [👑]     │
│                         │
│ 📊 My Questions         │
│ ┌─── Question ───┐     │
│ │ "Which..."    │      │
│ └────────────────┘      │
│                         │
└─────────────────────────┘
```

**Sections:**
- Profile header (avatar, username, level)
- Key stats (points, streak, votes, questions)
- Achievements/badges
- Recent questions
- Settings gear (top right)

---

## Interaction Design

### Animations & Transitions

**Principles:**
- **Fast:** 200-300ms for most animations
- **Smooth:** Easing curves (ease-in-out)
- **Purposeful:** Every animation has a reason
- **Subtle:** Don't distract from content

**Key Animations:**

#### Voting Animation
```
1. User taps option
2. Option scales up (1.05x) with spring animation
3. Checkmark fades in
4. Other options fade out slightly
5. "Vote" button slides up from bottom
```

#### Points Earned
```
1. "+2 points" appears above point balance
2. Number animates counting up
3. Particle burst effect (confetti)
4. Fades out after 1.5 seconds
```

#### Card Interactions
```
- Hover (web): Subtle lift (shadow increases)
- Tap: Quick scale down (0.98x)
- Loading: Skeleton screens (no spinners)
```

#### Screen Transitions
```
- Push: Slide from right
- Pop: Slide to right
- Modal: Fade + scale from center
- Tab switch: Crossfade
```

### Micro-interactions

**Countdown Timer:**
- Ticks down every second when <1 hour
- Color shifts to orange when <1 hour
- Color shifts to red when <10 minutes
- Pulses when <1 minute

**Vote Button:**
- Disabled until option selected
- Pulses subtly when enabled
- Haptic feedback on tap (mobile)
- Success animation after vote

**Point Balance:**
- Animates when points earned
- Bounces slightly
- Shows "+X" floating above

**Streak Counter:**
- Fire emoji intensifies with longer streaks
- Particle effects on streak milestones
- Warning when streak about to break

---

## Accessibility

### WCAG Compliance

**Target:** WCAG 2.1 Level AA

**Key Requirements:**
- ✅ Color contrast ratio ≥ 4.5:1 for normal text
- ✅ Color contrast ratio ≥ 3:1 for large text
- ✅ All interactive elements ≥ 44×44 px tap target
- ✅ Screen reader support (semantic HTML/native components)
- ✅ Keyboard navigation support (web)
- ✅ Captions for videos
- ✅ Alt text for images

### Color Blindness

**Considerations:**
- Never rely on color alone to convey information
- Use icons, labels, and patterns in addition to color
- Test with color blindness simulators
- High contrast mode support

**Example:**
- Don't: Red option vs. Green option
- Do: Option A (with icon) vs. Option B (with different icon)

### Screen Readers

**Best Practices:**
- Descriptive labels for all buttons and inputs
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels where needed
- Announce dynamic content changes
- Skip links for navigation

**Example labels:**
```
"Vote on question: Which sneakers should I buy"
"Option A: Nike Air Max, $120"
"Vote button, earns 2 points"
```

### Font Sizing

**Support dynamic type:**
- Respect user's system font size
- Test at 200% zoom
- No fixed pixel heights that truncate text
- Scalable UI components

### Motor Accessibility

**Considerations:**
- Large tap targets (≥44px)
- No time-based interactions required
- Voice control support (iOS)
- Reduce motion option (respect system settings)

---

## Responsive Design

### Mobile First

**Design for mobile, enhance for larger screens**

#### Breakpoints

**Mobile** (320-767px)
- Single column layout
- Full-width cards
- Bottom navigation
- Simplified interactions

**Tablet** (768-1023px)
- 2-column grid for cards
- Side navigation option
- More whitespace
- Larger tap targets

**Desktop** (1024px+)
- 3-column grid for cards
- Side navigation
- Hover states
- Keyboard shortcuts

### Orientation

**Portrait** (Default)
- Optimized for one-handed use
- Key actions at bottom
- Scrollable content

**Landscape**
- Side-by-side comparison view for options
- Compact navigation
- Maximize screen usage

### Platform Considerations

#### iOS
- Follow iOS Human Interface Guidelines
- Native navigation patterns
- iOS-style buttons and controls
- Face ID / Touch ID support
- Haptic feedback

#### Android
- Follow Material Design guidelines
- Android navigation patterns (back button)
- Material components
- Fingerprint support

#### Web (PWA)
- Responsive grid layout
- Mouse hover states
- Keyboard navigation
- Browser back button support
- Progressive enhancement

---

## Design Principles

### 1. Progressive Disclosure

**Show only what's needed, when it's needed**

Example:
- Feed: Show question preview
- Detail: Show full question + all options
- Results: Show vote breakdown + stats

Don't overwhelm with everything at once.

### 2. Forgiving Design

**Make it hard to make mistakes, easy to recover**

Examples:
- Confirm before deleting question
- "Undo" option after voting (within 5 seconds)
- Save drafts automatically
- Clear error messages with solutions

### 3. Feedback & Confirmation

**Every action gets a response**

Examples:
- Vote → "+2 points" animation
- Question posted → Success message
- Error → Clear explanation + solution
- Loading → Progress indicator

### 4. Consistency

**Similar things look similar, work similarly**

Examples:
- All buttons use same styles
- All cards have same structure
- All animations feel cohesive
- All copy uses same tone

### 5. Hierarchy & Focus

**Guide attention to what matters**

Examples:
- Primary action is most prominent
- Important info is larger/bolder
- Secondary actions are subdued
- Destructive actions are red

---

## Component Library Reference

For implementation, build a comprehensive component library with:

**Atoms:**
- Button, IconButton, Badge, Chip
- Input, TextArea, Checkbox, Radio, Switch
- Icon, Avatar, Spinner
- Typography variants

**Molecules:**
- Card, ListItem, MenuItem
- FormField (label + input + error)
- ProgressBar, Timer
- Stat (label + value)

**Organisms:**
- QuestionCard, OptionCard
- BottomNav, TopNav
- Modal, Sheet, Drawer
- EmptyState, ErrorState

**Templates:**
- FeedTemplate, DetailTemplate
- CreateTemplate, ProfileTemplate

**Tools:**
- Storybook for component documentation
- Figma for design handoff
- Design tokens (colors, spacing, typography)

---

## Design Checklist

Before launching each screen:

- [ ] Follows brand visual identity
- [ ] Uses design system components
- [ ] Responsive across all breakpoints
- [ ] Accessible (WCAG AA)
- [ ] Loading and error states designed
- [ ] Empty states designed
- [ ] Animations are smooth and purposeful
- [ ] All text is readable (contrast, size)
- [ ] All touch targets ≥ 44px
- [ ] Works in light and dark mode (if supported)
- [ ] Tested with real content (not just lorem ipsum)
- [ ] Feels fast and responsive

---

## Next Steps

1. **Create design system in Figma**
   - Components, styles, patterns
   - Mobile and web variants

2. **Create high-fidelity mockups**
   - All key screens
   - Multiple states (loading, error, empty)
   - Annotations for developers

3. **Build component library**
   - React Native components
   - Storybook documentation
   - Reusable and consistent

4. **User testing**
   - Test with real users
   - Iterate based on feedback
   - Validate assumptions

5. **Handoff to development**
   - Figma → Code
   - Design tokens
   - Component specs

---

## Conclusion

BeSure's design should be:

✅ **Clean** - Focus on content, minimal clutter
✅ **Fast** - Quick interactions, instant feedback
✅ **Friendly** - Warm, approachable, encouraging
✅ **Accessible** - Works for everyone
✅ **Delightful** - Subtle animations, satisfying interactions

**The best interface is invisible** - users should focus on making decisions, not learning the app.

---

**End of UX/UI Guidelines Document**
