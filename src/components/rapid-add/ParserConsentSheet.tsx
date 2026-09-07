import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceLogo } from '@/components/ServiceLogo';
import { DashboardColors } from '@/constants/dashboard';
import {
  getCatalogById,
  MOCK_DETECTED_CHARGES,
  type CatalogService,
} from '@/constants/service-catalog';
import { formatMoney } from '@/utils/subscriptions';

type Step = 'consent' | 'scanning' | 'results' | 'denied';

type Props = {
  visible: boolean;
  onClose: () => void;
  existingNames: string[];
  onAllow: () => void;
  onDeny: () => void;
  onAddDetected: (services: CatalogService[]) => void;
  onManualFallback: () => void;
};

export function ParserConsentSheet({
  visible,
  onClose,
  existingNames,
  onAllow,
  onDeny,
  onAddDetected,
  onManualFallback,
}: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('consent');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!visible) {
      setStep('consent');
      setSelected({});
    }
  }, [visible]);

  const detections = useMemo(() => {
    const owned = new Set(existingNames.map((name) => name.toLowerCase()));
    return MOCK_DETECTED_CHARGES.map((item) => ({
      ...item,
      service: getCatalogById(item.serviceId),
    })).filter(
      (item) => item.service && !owned.has(item.service.name.toLowerCase())
    ) as Array<(typeof MOCK_DETECTED_CHARGES)[number] & { service: CatalogService }>;
  }, [existingNames]);

  useEffect(() => {
    if (step !== 'results') return;
    const initial: Record<string, boolean> = {};
    detections.forEach((item) => {
      initial[item.id] = true;
    });
    setSelected(initial);
  }, [step, detections]);

  const startScan = () => {
    onAllow();
    setStep('scanning');
    setTimeout(() => setStep('results'), 1400);
  };

  const deny = () => {
    onDeny();
    setStep('denied');
  };

  const addSelected = () => {
    const services = detections.filter((item) => selected[item.id]).map((item) => item.service);
    onAddDetected(services);
    onClose();
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.handle} />

        {step === 'consent' ? (
          <View style={styles.content}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroMark}>✦</Text>
            </View>
            <Text style={styles.title}>Find subscriptions for you</Text>
            <Text style={styles.body}>
              With your OK, we can look at notification text and receipts on this device to suggest plans
              you might be paying for. Nothing leaves your phone without your control.
            </Text>

            <View style={styles.bullets}>
              <Bullet text="You choose what gets added" />
              <Bullet text="Turn it off anytime in settings" />
              <Bullet text="Skip and add plans manually instead" />
            </View>

            <Pressable style={styles.primaryBtn} onPress={startScan}>
              <Text style={styles.primaryText}>Allow smart detection</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={deny}>
              <Text style={styles.secondaryText}>Not now</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 'scanning' ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={DashboardColors.accent} size="large" />
            <Text style={styles.title}>Looking for plans…</Text>
            <Text style={styles.body}>Checking recent notifications and receipts</Text>
          </View>
        ) : null}

        {step === 'results' ? (
          <View style={styles.content}>
            <Text style={styles.title}>We found a few</Text>
            <Text style={styles.body}>
              {detections.length === 0
                ? 'Nothing new right now. You can always add plans manually.'
                : 'Deselect anything that isn’t yours, then add the rest.'}
            </Text>

            <View style={styles.list}>
              {detections.map((item) => {
                const active = Boolean(selected[item.id]);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelected((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                    style={[styles.detectRow, active && styles.detectRowActive]}>
                    <ServiceLogo
                      name={item.service.name}
                      providerKey={item.service.id}
                      fallbackIcon={item.service.icon}
                      color={item.service.color}
                      size={42}
                      radius={12}
                    />
                    <View style={styles.meta}>
                      <Text style={styles.name}>{item.service.name}</Text>
                      <Text style={styles.sub}>
                        {formatMoney(item.service.amount)}/{item.service.billingCycle.slice(0, 2)} ·{' '}
                        {item.sourceLabel}
                      </Text>
                    </View>
                    <View style={[styles.check, active && styles.checkOn]}>
                      <Text style={styles.checkMark}>{active ? '✓' : ''}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {detections.length > 0 ? (
              <Pressable
                style={[styles.primaryBtn, selectedCount === 0 && styles.disabled]}
                disabled={selectedCount === 0}
                onPress={addSelected}>
                <Text style={[styles.primaryText, selectedCount === 0 && styles.disabledText]}>
                  Add {selectedCount} plan{selectedCount === 1 ? '' : 's'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.primaryBtn}
                onPress={() => {
                  onClose();
                  onManualFallback();
                }}>
                <Text style={styles.primaryText}>Add manually</Text>
              </Pressable>
            )}
            <Pressable style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryText}>Done</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 'denied' ? (
          <View style={styles.content}>
            <View style={[styles.heroIcon, styles.heroMuted]}>
              <Text style={styles.heroMark}>✎</Text>
            </View>
            <Text style={styles.title}>No problem — add manually</Text>
            <Text style={styles.body}>
              Smart detection stays off. You can still add any plan in a few taps, and turn detection on
              later if you change your mind.
            </Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                onClose();
                onManualFallback();
              }}>
              <Text style={styles.primaryText}>Add a plan manually</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryText}>Close</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B0B0D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 14,
  },
  content: {
    gap: 12,
    paddingBottom: 4,
  },
  centerState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: DashboardColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroMuted: {
    backgroundColor: DashboardColors.surfaceElevated,
  },
  heroMark: {
    color: DashboardColors.accent,
    fontSize: 24,
  },
  title: {
    color: DashboardColors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  body: {
    color: DashboardColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  bullets: {
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: DashboardColors.accent,
  },
  bulletText: {
    color: DashboardColors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  detectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  detectRowActive: {
    borderColor: DashboardColors.accent,
    backgroundColor: DashboardColors.accentSoft,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: DashboardColors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  sub: {
    color: DashboardColors.textMuted,
    fontSize: 12,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DashboardColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: DashboardColors.accent,
    borderColor: DashboardColors.accent,
  },
  checkMark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: DashboardColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    backgroundColor: DashboardColors.surfaceMuted,
  },
  disabledText: {
    color: DashboardColors.textMuted,
  },
});
