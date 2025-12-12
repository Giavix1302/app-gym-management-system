import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

import './global.css';
import { NotificationProvider } from './src/context/NotificationContext';
import { SocketProvider } from './src/context/SocketContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <SocketProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </SocketProvider>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}
