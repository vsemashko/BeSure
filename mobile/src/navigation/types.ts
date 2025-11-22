/**
 * Navigation types for type-safe navigation
 */

export type RootStackParamList = {
  // Auth stack
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;

  // Main app
  MainTabs: undefined;
  QuestionDetail: { questionId: string };
  CreateQuestion: undefined;
  Results: { questionId: string };
  EditProfile: undefined;
  ChangePassword: undefined;
  Followers: { userId: string; username?: string };
  Following: { userId: string; username?: string };
  Notifications: undefined;
  NotificationPreferences: undefined;
  Templates: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Search: undefined;
  Create: undefined;
  Activity: undefined;
  Profile: undefined;
};

// Augment @react-navigation types for type-safe navigation
declare module '@react-navigation/native' {
  export function useNavigation<T = RootStackParamList>(): any;
}
