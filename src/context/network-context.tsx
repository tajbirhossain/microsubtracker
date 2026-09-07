import NetInfo from '@react-native-community/netinfo';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

type NetworkContextValue = {
  isOnline: boolean;
  isHydrated: boolean;
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

function connectedFromState(isConnected: boolean | null, isInternetReachable: boolean | null) {
  if (isConnected === false) return false;
  if (isInternetReachable === false) return false;
  return true;
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    NetInfo.fetch().then((state) => {
      if (!mounted) return;
      setIsOnline(connectedFromState(state.isConnected, state.isInternetReachable));
      setIsHydrated(true);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(connectedFromState(state.isConnected, state.isInternetReachable));
      setIsHydrated(true);
    });

    const onAppState = (status: AppStateStatus) => {
      if (status !== 'active') return;
      NetInfo.fetch().then((state) => {
        setIsOnline(connectedFromState(state.isConnected, state.isInternetReachable));
      });
    };

    const appSub = AppState.addEventListener('change', onAppState);

    return () => {
      mounted = false;
      unsubscribe();
      appSub.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      isOnline,
      isHydrated,
    }),
    [isOnline, isHydrated]
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return ctx;
}
