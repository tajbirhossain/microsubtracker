import { Redirect, type Href } from 'expo-router';

/** Legacy phone route — auth is email-based now. */
export default function PhoneRedirect() {
  return <Redirect href={'/(onboarding)/register' as Href} />;
}
