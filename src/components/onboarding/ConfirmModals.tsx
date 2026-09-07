import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

type ConfirmProps = {
  visible: boolean;
  phoneDisplay: string;
  flag: string;
  onConfirm: () => void;
  onGoBack: () => void;
};

export function ConfirmPhoneModal({ visible, phoneDisplay, flag, onConfirm, onGoBack }: ConfirmProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onGoBack}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.phone}>
            {flag} {phoneDisplay}
          </Text>
          <Text style={styles.copy}>Is this number correct? We&apos;ll send you a confirmation code there.</Text>
          <PrimaryButton label="Confirm" onPress={onConfirm} style={styles.btn} />
          <PrimaryButton label="Go back" variant="secondary" onPress={onGoBack} />
        </View>
      </View>
    </Modal>
  );
}

type ErrorProps = {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
};

export function ErrorSheet({ visible, title, message, onDismiss }: ErrorProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.sheetOverlay} onPress={onDismiss}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.errorIcon}>✕</Text>
          <Text style={styles.errorTitle}>{title}</Text>
          <Text style={styles.errorMessage}>{message}</Text>
          <PrimaryButton label="Got it" onPress={onDismiss} style={styles.btn} />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: OnboardingColors.surfaceElevated,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  phone: {
    color: OnboardingColors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  copy: {
    color: OnboardingColors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  btn: {
    marginTop: 4,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: OnboardingColors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: OnboardingColors.textMuted,
    marginBottom: 16,
  },
  errorIcon: {
    color: OnboardingColors.error,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorTitle: {
    color: OnboardingColors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  errorMessage: {
    color: OnboardingColors.textSecondary,
    fontSize: 15,
    marginBottom: 16,
  },
});
