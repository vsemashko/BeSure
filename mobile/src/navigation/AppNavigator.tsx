import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import type { RootStackParamList, MainTabParamList } from './types';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateQuestionScreen from '../screens/CreateQuestionScreen';
import QuestionDetailScreen from '../screens/QuestionDetailScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { FollowersScreen } from '../screens/FollowersScreen';
import { FollowingScreen } from '../screens/FollowingScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationPreferencesScreen } from '../screens/NotificationPreferencesScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { TemplatesScreen } from '../screens/TemplatesScreen';
import { QuestionInsightsScreen } from '../screens/QuestionInsightsScreen';
import { InviteFriendsScreen } from '../screens/InviteFriendsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mediumGray,
        tabBarStyle: {
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateQuestionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size + 8} color={color} />
          ),
          tabBarLabel: '',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="QuestionDetail"
              component={QuestionDetailScreen}
              options={{
                headerShown: true,
                headerTitle: 'Question',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Followers"
              component={FollowersScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Following"
              component={FollowingScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="NotificationPreferences"
              component={NotificationPreferencesScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Templates"
              component={TemplatesScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="QuestionInsights"
              component={QuestionInsightsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Question Insights',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="InviteFriends"
              component={InviteFriendsScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
