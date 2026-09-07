import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceLogo } from '@/components/ServiceLogo';
import { DashboardColors, type BillingCycle, type Subscription } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';

type Props = {
  visible: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onSave: (
    subscriptionId: string,
    updates: {
      name: string;
      amount: number;
      billingCycle: BillingCycle;
      isTrial: boolean;
      trialEndsInDays?: number;
    }
  ) => void;
  onOpenCancelGuide: (subscriptionId: string) => void;
};

const CYCLES: BillingCycle[] = ['monthly', 'yearly', 'weekly'];

export function EditSubscriptionSheet({
  visible,
  subscription,
  onClose,
  onSave,
  onOpenCancelGuide,
}: Props) {
  const insets = useSafeAreaInsets();
  const { formatInCurrency } = usePreferences();
  const [name, setName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [isTrial, setIsTrial] = useState(false);
  const [trialDaysText, setTrialDaysText] = useState('7');

  useEffect(() => {
    if (!visible || !subscription) return;
    setName(subscription.name);
    setAmountText(String(subscription.amount));
    setCycle(subscription.billingCycle);
    setIsTrial(Boolean(subscription.isTrial));
    setTrialDaysText(String(subscription.trialEndsInDays ?? 7));
  }, [visible, subscription]);

  const amount = Number.parseFloat(amountText);
  const trialDays = Number.parseInt(trialDaysText, 10);
  const trialValid = !isTrial || (trialDays > 0 && !Number.isNaN(trialDays));
  const canSave = name.trim().length > 1 && amount > 0 && !Number.isNaN(amount) && trialValid;

  const save = () => {
    if (!subscription || !canSave) return;
    onSave(subscription.id, {
      name: name.trim(),
      amount,
      billingCycle: cycle,
      isTrial,
      trialEndsInDays: isTrial ? trialDays : undefined,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.overlay} onPress={onClose} accessibilityRole="button" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View>
                <Text style={styles.kicker}>Edit plan</Text>
                <Text style={styles.title}>Update details</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            {!subscription ? null : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.content}>
                <View style={styles.identity}>
                  <ServiceLogo
                    name={subscription.name}
                    providerKey={subscription.providerKey}
                    fallbackIcon={subscription.icon}
                    color={subscription.color}
                    size={48}
                  />
                  <Text style={styles.identityMeta}>
                    Currently {formatInCurrency(subscription.amount)}
                    {subscription.billingCycle === 'yearly'
                      ? '/yr'
                      : subscription.billingCycle === 'weekly'
                        ? '/wk'
                        : '/mo'}
                  </Text>
                </View>

                <Text style={styles.label}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Subscription name"
                  placeholderTextColor={DashboardColors.textMuted}
                  style={styles.input}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Price (USD)</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.currency}>$</Text>
                  <TextInput
                    value={amountText}
                    onChangeText={setAmountText}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={DashboardColors.textMuted}
                    style={styles.amountInput}
                  />
                </View>

                <Text style={styles.label}>Billing cycle</Text>
                <View style={styles.cycleRow}>
                  {CYCLES.map((value) => {
                    const active = cycle === value;
                    return (
                      <Pressable
                        key={value}
                        onPress={() => setCycle(value)}
                        style={[styles.cycleChip, active && styles.cycleChipActive]}>
                        <Text style={[styles.cycleText, active && styles.cycleTextActive]}>
                          {value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  onPress={() => setIsTrial((prev) => !prev)}
                  style={[styles.trialToggle, isTrial && styles.trialToggleOn]}>
                  <View style={styles.trialCopy}>
                    <Text style={styles.trialTitle}>Free trial</Text>
                    <Text style={styles.trialHint}>Track days left before it converts</Text>
                  </View>
                  <View style={[styles.switchTrack, isTrial && styles.switchTrackOn]}>
                    <View style={[styles.switchKnob, isTrial && styles.switchKnobOn]} />
                  </View>
                </Pressable>

                {isTrial ? (
                  <>
                    <Text style={styles.label}>Trial period (days left)</Text>
                    <TextInput
                      value={trialDaysText}
                      onChangeText={(text) => setTrialDaysText(text.replace(/[^\d]/g, '').slice(0, 3))}
                      keyboardType="number-pad"
                      placeholder="7"
                      placeholderTextColor={DashboardColors.textMuted}
                      style={styles.input}
                    />
                    <View style={styles.presetRow}>
                      {[7, 14, 30].map((days) => (
                        <Pressable
                          key={days}
                          onPress={() => setTrialDaysText(String(days))}
                          style={[
                            styles.presetChip,
                            trialDaysText === String(days) && styles.presetChipActive,
                          ]}>
                          <Text
                            style={[
                              styles.presetText,
                              trialDaysText === String(days) && styles.presetTextActive,
                            ]}>
                            {days}d
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                ) : null}

                <Pressable
                  style={[styles.saveBtn, !canSave && styles.saveDisabled]}
                  disabled={!canSave}
                  onPress={save}>
                  <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
                    Save changes
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelLink}
                  onPress={() => {
                    onClose();
                    onOpenCancelGuide(subscription.id);
                  }}>
                  <Text style={styles.cancelLinkText}>Open cancel guide</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheetWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0B0B0D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kicker: {
    color: DashboardColors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    color: DashboardColors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DashboardColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: DashboardColors.textSecondary,
    fontSize: 14,
  },
  content: {
    gap: 10,
    paddingBottom: 12,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  identityMeta: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
  },
  label: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 6,
  },
  input: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    color: DashboardColors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: DashboardColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    paddingHorizontal: 14,
  },
  currency: {
    color: DashboardColors.textMuted,
    fontSize: 18,
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    color: DashboardColors.text,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 14,
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cycleChip: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  cycleChipActive: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: 'rgba(91,158,255,0.4)',
  },
  cycleText: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cycleTextActive: {
    color: DashboardColors.accent,
  },
  trialToggle: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  trialToggleOn: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: 'rgba(91,158,255,0.35)',
  },
  trialCopy: {
    flex: 1,
    gap: 2,
  },
  trialTitle: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  trialHint: {
    color: DashboardColors.textMuted,
    fontSize: 12,
  },
  switchTrack: {
    width: 46,
    height: 28,
    borderRadius: 14,
    backgroundColor: DashboardColors.surfaceMuted,
    padding: 3,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: DashboardColors.accent,
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  switchKnobOn: {
    alignSelf: 'flex-end',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  presetChipActive: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: 'rgba(91,158,255,0.4)',
  },
  presetText: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  presetTextActive: {
    color: DashboardColors.accent,
  },
  saveBtn: {
    marginTop: 10,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: {
    backgroundColor: DashboardColors.surfaceElevated,
  },
  saveText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  saveTextDisabled: {
    color: DashboardColors.textMuted,
  },
  cancelLink: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLinkText: {
    color: DashboardColors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});
