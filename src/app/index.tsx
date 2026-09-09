import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useOnboarding } from '@/context/onboarding-context';

export default function Index() {
  const { isAuthReady, isAuthenticated } = useOnboarding();

  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#5B9EFF" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
