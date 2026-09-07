import { Redirect } from 'expo-router';

/**
 * Entry redirect — later swap this for a real session / onboarding-complete check.
 * For now always start at the Revolut-style welcome flow.
 */
export default function Index() {
  return <Redirect href="/(onboarding)/welcome" />;
}
