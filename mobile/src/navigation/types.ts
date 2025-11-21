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
};

export type MainTabParamList = {
  Feed: undefined;
  Search: undefined;
  Create: undefined;
  Activity: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
