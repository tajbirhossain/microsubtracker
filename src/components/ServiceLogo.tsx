import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { getServiceLogoSource } from '@/constants/service-logos';

type Props = {
  name: string;
  providerKey?: string | null;
  fallbackIcon: string;
  color: string;
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function ServiceLogo({
  name,
  providerKey,
  fallbackIcon,
  color,
  size = 44,
  radius = 14,
  style,
}: Props) {
  const source = getServiceLogoSource(providerKey, name);
  const fontSize = size >= 48 ? 18 : size >= 40 ? 16 : 13;

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: source ? '#FFFFFF' : color,
        },
        style,
      ]}>
      {source ? (
        <Image source={source} style={{ width: size * 0.62, height: size * 0.62 }} contentFit="contain" />
      ) : (
        <Text style={[styles.fallback, { fontSize }]}>{fallbackIcon}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
