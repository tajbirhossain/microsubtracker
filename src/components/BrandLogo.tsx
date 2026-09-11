import { Image } from 'expo-image';
import { StyleSheet, type StyleProp, type ImageStyle, View, type ViewStyle } from 'react-native';

import { BRAND_LOGO } from '@/constants/brand';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function BrandLogo({ size = 40, style, imageStyle }: Props) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image
        source={BRAND_LOGO}
        style={[styles.image, { width: size, height: size, borderRadius: size * 0.22 }, imageStyle]}
        contentFit="contain"
        accessibilityLabel="Micro Sub Tracker"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
});
