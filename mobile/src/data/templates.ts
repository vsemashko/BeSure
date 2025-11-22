/**
 * Question template types and data
 */

export interface QuestionTemplate {
  id: string;
  category: TemplateCategory;
  title: string;
  description: string;
  icon: string;
  options: string[];
  expiresInMinutes: number;
  tips?: string;
}

export type TemplateCategory =
  | 'career'
  | 'lifestyle'
  | 'purchases'
  | 'food'
  | 'travel'
  | 'relationships'
  | 'entertainment'
  | 'health'
  | 'finance';

export const TEMPLATE_CATEGORIES: {
  key: TemplateCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: 'career', label: 'Career', icon: '💼', color: '#4A90E2' },
  { key: 'lifestyle', label: 'Lifestyle', icon: '🌟', color: '#A77BCA' },
  { key: 'purchases', label: 'Shopping', icon: '🛍️', color: '#FF6B6B' },
  { key: 'food', label: 'Food & Dining', icon: '🍕', color: '#FFA07A' },
  { key: 'travel', label: 'Travel', icon: '✈️', color: '#4ECDC4' },
  { key: 'relationships', label: 'Relationships', icon: '❤️', color: '#FF6B6B' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#A77BCA' },
  { key: 'health', label: 'Health & Fitness', icon: '💪', color: '#51CF66' },
  { key: 'finance', label: 'Finance', icon: '💰', color: '#FFD93D' },
];

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // Career Templates
  {
    id: 'career-job-offer',
    category: 'career',
    title: 'Should I accept this job offer?',
    description: 'Get advice on evaluating a new job opportunity',
    icon: '💼',
    options: [
      'Accept the offer',
      'Negotiate for better terms',
      'Decline and keep looking',
      'Ask for more time to decide',
    ],
    expiresInMinutes: 4320, // 3 days
    tips: 'Consider: salary, benefits, growth opportunities, work-life balance, company culture',
  },
  {
    id: 'career-career-change',
    category: 'career',
    title: 'Should I change careers?',
    description: 'Thinking about switching to a new field',
    icon: '🔄',
    options: [
      'Make the change now',
      'Take courses first',
      'Start as a side project',
      'Stay in current field',
    ],
    expiresInMinutes: 10080, // 1 week
    tips: 'Think about: financial stability, transferable skills, market demand, passion vs practicality',
  },
  {
    id: 'career-promotion',
    category: 'career',
    title: 'Should I apply for this promotion?',
    description: 'Deciding whether to pursue a higher position',
    icon: '📈',
    options: [
      'Apply immediately',
      'Wait for more experience',
      'Talk to my manager first',
      'Look elsewhere for growth',
    ],
    expiresInMinutes: 2880, // 2 days
  },

  // Lifestyle Templates
  {
    id: 'lifestyle-move',
    category: 'lifestyle',
    title: 'Should I move to a new city?',
    description: 'Considering relocating for a fresh start',
    icon: '🏙️',
    options: [
      'Make the move',
      'Visit first before deciding',
      'Move temporarily to try it',
      'Stay where I am',
    ],
    expiresInMinutes: 10080, // 1 week
    tips: 'Consider: cost of living, job market, social connections, climate, lifestyle',
  },
  {
    id: 'lifestyle-pet',
    category: 'lifestyle',
    title: 'Should I get a pet?',
    description: 'Thinking about adding a furry friend to the family',
    icon: '🐕',
    options: [
      'Get a dog',
      'Get a cat',
      'Get a smaller pet',
      'Wait for better timing',
    ],
    expiresInMinutes: 4320, // 3 days
    tips: 'Think about: time commitment, expenses, living space, allergies, lifestyle',
  },
  {
    id: 'lifestyle-routine',
    category: 'lifestyle',
    title: 'What morning routine should I start?',
    description: 'Building better morning habits',
    icon: '🌅',
    options: [
      'Exercise first thing',
      'Meditation and journaling',
      'Quick breakfast routine',
      'Review daily goals',
    ],
    expiresInMinutes: 1440, // 1 day
  },

  // Purchase Templates
  {
    id: 'purchase-phone',
    category: 'purchases',
    title: 'Which phone should I buy?',
    description: 'Choosing between smartphone options',
    icon: '📱',
    options: ['iPhone', 'Samsung Galaxy', 'Google Pixel', 'Wait for new releases'],
    expiresInMinutes: 2880, // 2 days
    tips: 'Compare: price, camera quality, battery life, ecosystem, features you need',
  },
  {
    id: 'purchase-laptop',
    category: 'purchases',
    title: 'Which laptop is right for me?',
    description: 'Finding the perfect laptop for your needs',
    icon: '💻',
    options: ['MacBook', 'Windows laptop', 'Gaming laptop', 'Chromebook'],
    expiresInMinutes: 4320, // 3 days
    tips: 'Consider: intended use, budget, portability, performance needs, operating system preference',
  },
  {
    id: 'purchase-expensive',
    category: 'purchases',
    title: 'Should I make this big purchase?',
    description: 'Deciding on a significant expense',
    icon: '💳',
    options: [
      'Buy it now',
      'Save up and buy later',
      'Look for alternatives',
      "Don't buy it",
    ],
    expiresInMinutes: 4320, // 3 days
  },

  // Food Templates
  {
    id: 'food-dinner',
    category: 'food',
    title: "What's for dinner tonight?",
    description: 'Quick decision for tonight\'s meal',
    icon: '🍽️',
    options: ['Cook at home', 'Order delivery', 'Go out to eat', 'Meal prep leftovers'],
    expiresInMinutes: 180, // 3 hours
  },
  {
    id: 'food-diet',
    category: 'food',
    title: 'Which diet should I try?',
    description: 'Exploring healthy eating options',
    icon: '🥗',
    options: ['Mediterranean', 'Keto', 'Vegetarian/Vegan', 'Balanced/Flexible'],
    expiresInMinutes: 4320, // 3 days
    tips: 'Research: sustainability, nutritional balance, personal goals, lifestyle compatibility',
  },
  {
    id: 'food-restaurant',
    category: 'food',
    title: 'Where should we eat?',
    description: 'Choosing a restaurant for the group',
    icon: '🍴',
    options: ['Italian', 'Asian cuisine', 'Mexican', 'American/Burgers'],
    expiresInMinutes: 120, // 2 hours
  },

  // Travel Templates
  {
    id: 'travel-vacation',
    category: 'travel',
    title: 'Where should I go on vacation?',
    description: 'Planning your next getaway',
    icon: '🏖️',
    options: ['Beach resort', 'City exploration', 'Mountain retreat', 'Adventure travel'],
    expiresInMinutes: 10080, // 1 week
    tips: 'Consider: budget, season, activities, travel time, group preferences',
  },
  {
    id: 'travel-weekend',
    category: 'travel',
    title: 'Weekend trip destination?',
    description: 'Quick weekend getaway ideas',
    icon: '🚗',
    options: ['Nearby city', 'Nature/camping', 'Beach town', 'Stay home and relax'],
    expiresInMinutes: 2880, // 2 days
  },
  {
    id: 'travel-booking',
    category: 'travel',
    title: 'How should I book my trip?',
    description: 'Choosing booking options',
    icon: '🎫',
    options: [
      'Book package deal',
      'Book separately for flexibility',
      'Use travel agent',
      'Last-minute deals',
    ],
    expiresInMinutes: 4320, // 3 days
  },

  // Relationships Templates
  {
    id: 'relationships-date',
    category: 'relationships',
    title: 'First date activity ideas?',
    description: 'Planning a memorable first date',
    icon: '💝',
    options: ['Coffee/drinks', 'Dinner and movie', 'Activity date', 'Casual walk/park'],
    expiresInMinutes: 1440, // 1 day
  },
  {
    id: 'relationships-conflict',
    category: 'relationships',
    title: 'How should I handle this disagreement?',
    description: 'Resolving relationship conflicts',
    icon: '💬',
    options: [
      'Talk it out now',
      'Give space then discuss',
      'Seek counseling',
      'Ask friend for advice',
    ],
    expiresInMinutes: 1440, // 1 day
    tips: 'Approach with: empathy, active listening, honesty, willingness to compromise',
  },

  // Entertainment Templates
  {
    id: 'entertainment-movie',
    category: 'entertainment',
    title: 'What should we watch tonight?',
    description: 'Movie or show selection',
    icon: '🎬',
    options: ['Action/Thriller', 'Comedy', 'Drama', 'Documentary'],
    expiresInMinutes: 120, // 2 hours
  },
  {
    id: 'entertainment-hobby',
    category: 'entertainment',
    title: 'Which hobby should I start?',
    description: 'Finding a new pastime',
    icon: '🎨',
    options: ['Creative (art, music)', 'Sports/Fitness', 'Learning (language, skill)', 'Gaming'],
    expiresInMinutes: 4320, // 3 days
  },

  // Health Templates
  {
    id: 'health-workout',
    category: 'health',
    title: 'What workout routine should I follow?',
    description: 'Starting a fitness journey',
    icon: '🏋️',
    options: ['Gym strength training', 'Home workouts', 'Running/Cardio', 'Yoga/Pilates'],
    expiresInMinutes: 2880, // 2 days
    tips: 'Consider: fitness level, goals, time available, preferences, any limitations',
  },
  {
    id: 'health-sleep',
    category: 'health',
    title: 'How can I improve my sleep?',
    description: 'Better sleep strategies',
    icon: '😴',
    options: [
      'Earlier bedtime routine',
      'Limit screen time',
      'Try supplements',
      'See a specialist',
    ],
    expiresInMinutes: 1440, // 1 day
  },

  // Finance Templates
  {
    id: 'finance-save',
    category: 'finance',
    title: 'What should I do with extra money?',
    description: 'Making smart financial decisions',
    icon: '💵',
    options: [
      'Emergency fund',
      'Invest in stocks/funds',
      'Pay off debt',
      'Save for specific goal',
    ],
    expiresInMinutes: 4320, // 3 days
    tips: 'Prioritize: emergency fund, high-interest debt, retirement, other goals',
  },
  {
    id: 'finance-budget',
    category: 'finance',
    title: 'How should I budget this month?',
    description: 'Monthly budget planning',
    icon: '📊',
    options: [
      '50/30/20 rule',
      'Zero-based budget',
      'Envelope method',
      'Flexible spending',
    ],
    expiresInMinutes: 2880, // 2 days
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter((template) => template.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): QuestionTemplate | undefined {
  return QUESTION_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get random templates for quick start
 */
export function getRandomTemplates(count: number = 5): QuestionTemplate[] {
  const shuffled = [...QUESTION_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
