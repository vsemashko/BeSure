/**
 * FAQ and Help Content for BeSure
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'points' | 'questions' | 'social' | 'account' | 'privacy';
}

export const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 'gs-1',
    question: 'What is BeSure?',
    answer:
      'BeSure is a decision-making app that helps you get quick, honest feedback from the community. Create questions with multiple options, get votes, and make better decisions!',
    category: 'getting-started',
  },
  {
    id: 'gs-2',
    question: 'How do I create my first question?',
    answer:
      'Tap the + icon in the navigation bar, add your question title, provide 2-6 options, and optionally add images. You can also use our pre-made templates for quick questions!',
    category: 'getting-started',
  },
  {
    id: 'gs-3',
    question: 'Can I see examples of good questions?',
    answer:
      'Yes! Check out the Templates tab when creating a question. We have 27+ pre-made templates across 9 categories to inspire you.',
    category: 'getting-started',
  },

  // Points System
  {
    id: 'pts-1',
    question: 'How do I earn points?',
    answer:
      'You earn 2 points for every vote you cast. Keep your daily streak going to earn up to 2.5x bonus points! Complete daily challenges for extra points, and earn 10 points when friends you invite create their first question.',
    category: 'points',
  },
  {
    id: 'pts-2',
    question: 'What do points cost?',
    answer:
      'Creating a question costs 10 points. This helps maintain quality and prevents spam. New users start with 20 points to create their first 2 questions!',
    category: 'points',
  },
  {
    id: 'pts-3',
    question: 'What are streaks?',
    answer:
      'Vote at least once per day to maintain your streak! Your streak multiplier increases your points: 3-6 days = 1.25x, 7-13 days = 1.5x, 14-29 days = 2x, 30+ days = 2.5x bonus points.',
    category: 'points',
  },
  {
    id: 'pts-4',
    question: 'What are daily challenges?',
    answer:
      'Daily challenges are tasks you can complete to earn bonus points, such as voting on 5 questions, creating a question, or voting on trending topics. Check your Profile to see today\'s challenges!',
    category: 'points',
  },

  // Questions
  {
    id: 'q-1',
    question: 'How many options can I add to a question?',
    answer:
      'You can add between 2 and 6 options to each question. This range keeps questions focused while giving enough choices.',
    category: 'questions',
  },
  {
    id: 'q-2',
    question: 'Can I add images to my questions?',
    answer:
      'Yes! You can add a main image to your question and individual images to each option. This is perfect for visual decisions like outfit choices or design feedback.',
    category: 'questions',
  },
  {
    id: 'q-3',
    question: 'When do questions expire?',
    answer:
      'You can set questions to expire in 1 hour, 6 hours, 24 hours, 3 days, or 7 days. After expiration, no new votes can be cast, but you can still view the results.',
    category: 'questions',
  },
  {
    id: 'q-4',
    question: 'Can I make a question private?',
    answer:
      'Yes! When creating a question, you can set it to "Friends Only" so only people you follow can see and vote on it.',
    category: 'questions',
  },
  {
    id: 'q-5',
    question: 'Can I see detailed analytics for my questions?',
    answer:
      'Absolutely! Tap on any of your questions to view insights including vote distribution, voter demographics, time-based trends, and engagement rates.',
    category: 'questions',
  },

  // Social Features
  {
    id: 'soc-1',
    question: 'How do I find and follow other users?',
    answer:
      'Use the Search tab to find users by username. You can also discover suggested users and see who\'s popular in your topics of interest.',
    category: 'social',
  },
  {
    id: 'soc-2',
    question: 'What\'s the Friends feed?',
    answer:
      'The Friends feed shows questions from people you follow. Toggle between "For You" (personalized), "Friends" (from people you follow), and "Urgent" (expiring soon) in the Feed tab.',
    category: 'social',
  },
  {
    id: 'soc-3',
    question: 'How does the referral program work?',
    answer:
      'Share your unique referral code with friends. When they sign up using your code and create their first question, you earn 10 points! Find your code in Profile → Invite Friends.',
    category: 'social',
  },
  {
    id: 'soc-4',
    question: 'What are topic expertise levels?',
    answer:
      'As you vote on questions in specific topics (fashion, tech, food, etc.), you build expertise. Your level increases from Novice → Intermediate → Advanced → Expert → Master based on your vote count.',
    category: 'social',
  },

  // Account
  {
    id: 'acc-1',
    question: 'How do I change my password?',
    answer:
      'Go to Profile → Edit Profile → Change Password. You\'ll need to enter your current password and a new password.',
    category: 'account',
  },
  {
    id: 'acc-2',
    question: 'Can I change my username?',
    answer:
      'Yes! Go to Profile → Edit Profile and update your username, display name, or bio. Your username must be unique.',
    category: 'account',
  },
  {
    id: 'acc-3',
    question: 'How do I upload a profile picture?',
    answer:
      'Go to Profile → Edit Profile and tap on your avatar. You can choose a photo from your gallery or take a new one.',
    category: 'account',
  },
  {
    id: 'acc-4',
    question: 'How do I manage notifications?',
    answer:
      'Go to Profile → Notification Settings to customize what notifications you receive. You can control notifications for new followers, question responses, and friend activity.',
    category: 'account',
  },

  // Privacy & Safety
  {
    id: 'priv-1',
    question: 'Is my data safe?',
    answer:
      'Yes! We use industry-standard encryption for all data. Your password is hashed, and we never share your personal information with third parties. Read our Privacy Policy for full details.',
    category: 'privacy',
  },
  {
    id: 'priv-2',
    question: 'Can I delete my account?',
    answer:
      'Yes. Contact our support team at support@besure.app to request account deletion. All your data will be permanently removed within 30 days.',
    category: 'privacy',
  },
  {
    id: 'priv-3',
    question: 'Who can see my questions?',
    answer:
      'Public questions are visible to all users. "Friends Only" questions are only visible to users you follow. You can set privacy when creating each question.',
    category: 'privacy',
  },
  {
    id: 'priv-4',
    question: 'How do I report inappropriate content?',
    answer:
      'We have zero tolerance for harassment, spam, or inappropriate content. Please contact support@besure.app with details, and we\'ll investigate immediately.',
    category: 'privacy',
  },
];

export const categoryNames = {
  'getting-started': 'Getting Started',
  points: 'Points & Rewards',
  questions: 'Questions',
  social: 'Social Features',
  account: 'Account Settings',
  privacy: 'Privacy & Safety',
};

export const categoryIcons = {
  'getting-started': 'rocket-outline',
  points: 'star-outline',
  questions: 'help-circle-outline',
  social: 'people-outline',
  account: 'person-outline',
  privacy: 'shield-checkmark-outline',
};
