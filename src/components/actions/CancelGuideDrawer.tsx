import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceLogo } from '@/components/ServiceLogo';
import { DashboardColors, type Subscription } from '@/constants/dashboard';
import { cancellationApi } from '@/services/cancellation-service';
import type { CancelGuide, CancelGuideProgress } from '@/types/cancellation';
import { usePreferences } from '@/context/preferences-context';
import { difficultyLabel } from '@/utils/cancellation';

type Props = {
  visible: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onMarkedCancelled: (subscriptionId: string) => void | Promise<void>;
  onKept?: (subscriptionId: string) => void | Promise<void>;
};

export function CancelGuideDrawer({
  visible,
  subscription,
  onClose,
  onMarkedCancelled,
  onKept,
}: Props) {
  const insets = useSafeAreaInsets();
  const { formatInCurrency } = usePreferences();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guide, setGuide] = useState<CancelGuide | null>(null);
  const [progress, setProgress] = useState<CancelGuideProgress | null>(null);

  useEffect(() => {
    if (!visible || !subscription) {
      setGuide(null);
      setProgress(null);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [nextGuide, nextProgress] = await Promise.all([
          cancellationApi.getCancelGuide({
            subscriptionId: subscription.id,
            providerKey: subscription.providerKey,
            name: subscription.name,
          }),
          cancellationApi.getGuideProgress(subscription.id),
        ]);
        if (cancelled) return;
        setGuide(nextGuide);
        setProgress(nextProgress);
        if (nextGuide) {
          await cancellationApi.trackEvent({
            type: 'guide_opened',
            subscriptionId: subscription.id,
            guideId: nextGuide.id,
          });
        }
      } catch {
        if (!cancelled) setError("Couldn't load the cancel guide. Try again in a moment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, subscription]);

  const completed = useMemo(
    () => new Set(progress?.completedStepIds ?? []),
    [progress]
  );

  const doneCount = guide ? guide.steps.filter((step) => completed.has(step.id)).length : 0;
  const allDone = guide ? doneCount === guide.steps.length : false;

  const toggleStep = async (stepId: string) => {
    if (!subscription || !guide || completed.has(stepId) || saving) return;
    setSaving(true);
    try {
      const next = await cancellationApi.completeStep({
        subscriptionId: subscription.id,
        guideId: guide.id,
        stepId,
      });
      setProgress(next);
    } catch {
      setError("Couldn't save that step. Check your connection and retry.");
    } finally {
      setSaving(false);
    }
  };

  const openWebCancel = async () => {
    if (!guide?.webCancelUrl) return;
    const can = await Linking.canOpenURL(guide.webCancelUrl);
    if (can) await Linking.openURL(guide.webCancelUrl);
  };

  const markCancelled = async () => {
    if (!subscription) return;
    setSaving(true);
    try {
      await onMarkedCancelled(subscription.id);
      onClose();
    } catch {
      setError("Couldn't mark this as cancelled. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const keep = async () => {
    if (!subscription) return;
    setSaving(true);
    try {
      await onKept?.(subscription.id);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
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
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.handle} />

          {!subscription ? null : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <ServiceLogo
                  name={subscription.name}
                  providerKey={subscription.providerKey}
                  fallbackIcon={subscription.icon}
                  color={subscription.color}
                  size={48}
                />
                <View style={styles.headerCopy}>
                  <Text style={styles.kicker}>Cancel guide</Text>
                  <Text style={styles.title}>{subscription.name}</Text>
                  <Text style={styles.meta}>
                    {formatInCurrency(subscription.amount)} · {subscription.billingCycle}
                    {subscription.isTrial
                      ? ` · trial ends in ${subscription.trialEndsInDays ?? 0}d`
                      : ''}
                  </Text>
                </View>
                <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              {loading ? (
                <View style={styles.center}>
                  <ActivityIndicator color={DashboardColors.accent} />
                  <Text style={styles.loadingText}>Loading cancel steps…</Text>
                </View>
              ) : null}

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {guide && !loading ? (
                <>
                  <Text style={styles.summary}>{guide.summary}</Text>
                  <View style={styles.badges}>
                    <Badge label={difficultyLabel(guide.difficulty)} />
                    <Badge label={`~${guide.estimatedMinutes} min`} />
                    <Badge label={`${doneCount}/${guide.steps.length} done`} accent />
                  </View>

                  {guide.webCancelUrl ? (
                    <Pressable style={styles.linkCard} onPress={openWebCancel}>
                      <View style={styles.linkCopy}>
                        <Text style={styles.linkTitle}>Open cancel page</Text>
                        <Text style={styles.linkBody}>One tap to the provider’s cancel screen</Text>
                      </View>
                      <Text style={styles.linkChevron}>›</Text>
                    </Pressable>
                  ) : null}

                  <Text style={styles.sectionLabel}>Steps</Text>
                  <View style={styles.steps}>
                    {guide.steps.map((step, index) => {
                      const done = completed.has(step.id);
                      return (
                        <Pressable
                          key={step.id}
                          onPress={() => toggleStep(step.id)}
                          style={[styles.step, done && styles.stepDone]}>
                          <View style={[styles.stepIndex, done && styles.stepIndexDone]}>
                            <Text style={[styles.stepIndexText, done && styles.stepIndexTextDone]}>
                              {done ? '✓' : index + 1}
                            </Text>
                          </View>
                          <View style={styles.stepCopy}>
                            <Text style={styles.stepTitle}>{step.title}</Text>
                            <Text style={styles.stepDetail}>{step.detail}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  {guide.tips.length > 0 ? (
                    <View style={styles.tips}>
                      <Text style={styles.sectionLabel}>Tips</Text>
                      {guide.tips.map((tip) => (
                        <Text key={tip} style={styles.tip}>
                          • {tip}
                        </Text>
                      ))}
                    </View>
                  ) : null}

                  <Pressable
                    style={[styles.primaryBtn, saving && styles.disabled]}
                    disabled={saving}
                    onPress={markCancelled}>
                    <Text style={styles.primaryText}>
                      {allDone ? 'I’ve cancelled it' : 'Mark as cancelled'}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.secondaryBtn} disabled={saving} onPress={keep}>
                    <Text style={styles.secondaryText}>Keep this plan</Text>
                  </Pressable>
                </>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Badge({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.badge, accent && styles.badgeAccent]}>
      <Text style={[styles.badgeText, accent && styles.badgeTextAccent]}>{label}</Text>
    </View>
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
  sheet: {
    maxHeight: '92%',
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
    marginBottom: 12,
  },
  content: {
    paddingBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
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
    fontSize: 20,
    fontWeight: '800',
  },
  meta: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
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
  center: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 36,
  },
  loadingText: {
    color: DashboardColors.textMuted,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: DashboardColors.dangerSoft,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.3)',
  },
  errorText: {
    color: DashboardColors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  summary: {
    color: DashboardColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: DashboardColors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  badgeAccent: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: 'rgba(91,158,255,0.35)',
  },
  badgeText: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextAccent: {
    color: DashboardColors.accent,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: DashboardColors.accentSoft,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(91,158,255,0.28)',
  },
  linkCopy: {
    flex: 1,
    gap: 2,
  },
  linkTitle: {
    color: DashboardColors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  linkBody: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
  },
  linkChevron: {
    color: DashboardColors.accent,
    fontSize: 22,
    fontWeight: '600',
  },
  sectionLabel: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  steps: {
    gap: 8,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: DashboardColors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  stepDone: {
    borderColor: 'rgba(52,211,153,0.35)',
    backgroundColor: DashboardColors.microSoft,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DashboardColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexDone: {
    backgroundColor: DashboardColors.micro,
  },
  stepIndexText: {
    color: DashboardColors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  stepIndexTextDone: {
    color: '#04140D',
  },
  stepCopy: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    color: DashboardColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  stepDetail: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  tips: {
    gap: 6,
  },
  tip: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryBtn: {
    marginTop: 6,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
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
    fontWeight: '600',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.7,
  },
});
