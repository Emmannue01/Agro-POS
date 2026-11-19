import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from './app/index';

export default function App() {
  return (
    <SafeAreaProvider>
      <Home />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
