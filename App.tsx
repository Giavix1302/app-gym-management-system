import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

import './global.css';
import { NotificationProvider } from './src/context/NotificationContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
    <NotificationProvider>

      <AppNavigator />
      <StatusBar style="auto" />
    </NotificationProvider>
    </SafeAreaProvider>
  );
}
