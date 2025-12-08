import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { RootStackParamList } from './types';
import { Colors } from '../constants/colors';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Old Screens (keeping for backwards compatibility)
import UserHomeScreen from '../screens/UserHomeScreen';
import PTHomeScreen from '../screens/PTHomeScreen';

// Bottom Tab Navigators
import UserBottomTabNavigator from './UserBottomTabNavigator';
import PTBottomTabNavigator from './PTBottomTabNavigator';

// Other Screens
import NotificationsScreen from '../screens/NotificationsScreen';
import LocationsTestScreen from '../screens/LocationsTestScreen';
import ProfileScreen from '../screens/tabs/shared/ProfileScreen';

// Profile Screens
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import FitnessProgressScreen from '../screens/profile/FitnessProgressScreen';
import CheckInOutHistoryScreen from '../screens/profile/CheckInOutHistoryScreen';
import PaymentHistoryScreen from '../screens/profile/PaymentHistoryScreen';
import RevenueScreen from '../screens/profile/RevenueScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';

// Membership Screens
import MembershipDetailScreen from '../screens/MembershipDetailScreen';
import VNPayWebViewScreen from '../screens/VNPayWebViewScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import PaymentFailedScreen from '../screens/PaymentFailedScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary}
        translucent={false}
      />
      <Stack.Navigator
        initialRouteName="Login"

        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: false,
        }}
      >
        {/* Auth Screens - No Header */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />

        {/* Old Home Screens (keeping for backwards compatibility) */}
        <Stack.Screen
          name="UserHome"
          component={UserHomeScreen}
          options={{ title: 'Trang Chủ', headerShown: false }}
        />
        <Stack.Screen
          name="PTHome"
          component={PTHomeScreen}
          options={{ title: 'Trang Chủ PT', headerShown: false }}
        />

        {/* Bottom Tab Navigators */}
        <Stack.Screen
          name="UserTabs"
          component={UserBottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PTTabs"
          component={PTBottomTabNavigator}
          options={{ headerShown: false }}
        />

        {/* Notifications Screen */}
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            title: 'Thông báo',
            presentation: 'card',
          }}
        />

        {/* Test Screen */}
        <Stack.Screen
          name="LocationsTest"
          component={LocationsTestScreen}
          options={{
            title: 'Test Locations API',
            presentation: 'card',
          }}
        />

        {/* Other Screens */}
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Hồ Sơ',
            presentation: 'card',
          }}
        />

        {/* Profile Related Screens */}
        <Stack.Screen
          name="PersonalInfo"
          component={PersonalInfoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FitnessProgress"
          component={FitnessProgressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CheckInOutHistory"
          component={CheckInOutHistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaymentHistory"
          component={PaymentHistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Revenue"
          component={RevenueScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ headerShown: false }}
        />

        {/* Membership Related Screens */}
        <Stack.Screen
          name="MembershipDetail"
          component={MembershipDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VNPayWebView"
          component={VNPayWebViewScreen}
          options={{ headerShown: false }}
        />

        {/* Payment Result Screens */}
        <Stack.Screen
          name="PaymentSuccess"
          component={PaymentSuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaymentFailed"
          component={PaymentFailedScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>

  );
}
