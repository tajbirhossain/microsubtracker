import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceLogo } from '@/components/ServiceLogo';
import { SubscriptionCurrencyPicker } from '@/components/rapid-add/SubscriptionCurrencyPicker';
import { isCurrencyCode, type CurrencyCode } from '@/constants/currency';
import { DashboardColors } from '@/constants/dashboard';
import {
  confirmParserEvent,
  ingestParserEvent,
  rejectParserEvent,
} from '@/services/api';
import { getOrCreateDeviceKey } from '@/services/session';
import type { ParserEventView } from '@/types/api';
import { formatMoney } from '@/utils/subscriptions';

type Step = 'intro' | 'compose' | 'parsing' | 'results' | 'denied';

type CandidateDraft = {
  name: string;
  amount: string;
  currency: CurrencyCode;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
  onAdded: (count: number) => void;
  onManualFallback: () => void;
  onRefreshSubscriptions: () => Promise<void>;
};

function toCurrencyCode(value: string): CurrencyCode {
  const normalized = value.trim().toUpperCase();
  return isCurrencyCode(normalized) ? normalized : 'USD';
}

function draftFromEvent(item: ParserEventView): CandidateDraft {
  const payload =
    typeof item.normalizedPayload === 'object' && item.normalizedPayload
      ? (item.normalizedPayload as Record<string, unknown>)
      : {};
  const cycle =
    payload.defaultBillingCycle === 'weekly' ||
    payload.defaultBillingCycle === 'yearly' ||
    payload.defaultBillingCycle === 'monthly'
      ? payload.defaultBillingCycle
      : 'monthly';

  return {
    name: item.merchant?.trim() || '',
    amount: item.amount != null ? String(item.amount) : '',
    currency: toCurrencyCode(item.currency ?? 'USD'),
    billingCycle: cycle,
  };
}

export function ParserConsentSheet({
  visible,
  onClose,
  onAllow,
  onDeny,
  onAdded,
  onManualFallback,
  onRefreshSubscriptions,
}: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('intro');
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<'image/jpeg' | 'image/png' | 'image/webp'>(
    'image/jpeg'
  );
  const [candidates, setCandidates] = useState<ParserEventView[]>([]);
  const [drafts, setDrafts] = useState<Record<string, CandidateDraft>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!visible) {
      setStep('intro');
      setText('');
      setImageUri(null);
      setImageBase64(null);
      setCandidates([]);
      setDrafts({});
      setSelected({});
      setError(null);
      setSubmitting(false);
    }
  }, [visible]);

  useEffect(() => {
    if (step !== 'results') return;
    const nextSelected: Record<string, boolean> = {};
    const nextDrafts: Record<string, CandidateDraft> = {};
    for (const item of candidates) {
      nextSelected[item.id] = item.status === 'classified' || Boolean(item.amount);
      nextDrafts[item.id] = draftFromEvent(item);
    }
    setSelected(nextSelected);
    setDrafts(nextDrafts);
  }, [step, candidates]);

  const canParse = useMemo(
    () => text.trim().length > 0 || Boolean(imageBase64),
    [text, imageBase64]
  );

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const selectedReady = useMemo(() => {
    return candidates
      .filter((item) => selected[item.id])
      .every((item) => {
        const draft = drafts[item.id];
        const amount = Number(draft?.amount);
        return Boolean(draft?.name.trim()) && Number.isFinite(amount) && amount > 0;
      });
  }, [candidates, drafts, selected]);

  const updateDraft = (id: string, patch: Partial<CandidateDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch } as CandidateDraft,
    }));
  };

  const startCompose = () => {
    onAllow();
    setStep('compose');
  };

  const deny = () => {
    onDeny();
    setStep('denied');
  };

  const pickImage = async (fromCamera: boolean) => {
    setError(null);
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(
        fromCamera
          ? 'Camera permission is required to capture a receipt.'
          : 'Photo library permission is required to upload a receipt.'
      );
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.55,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.55,
          base64: true,
        });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      setError('Could not read that image. Try another photo or paste the text instead.');
      return;
    }

    const mime =
      asset.mimeType === 'image/png' || asset.mimeType === 'image/webp'
        ? asset.mimeType
        : 'image/jpeg';
    setImageUri(asset.uri);
    setImageBase64(asset.base64);
    setImageMimeType(mime);
  };

  const clearImage = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  const runParse = async () => {
    if (!canParse) return;
    setError(null);
    setStep('parsing');
    try {
      const deviceKey = await getOrCreateDeviceKey();
      const hasImage = Boolean(imageBase64);
      const result = await ingestParserEvent({
        sourceType: hasImage ? 'receipt_image' : 'paste',
        rawPayload: text.trim() || undefined,
        imageBase64: imageBase64 ?? undefined,
        imageMimeType: hasImage ? imageMimeType : undefined,
        deviceKey,
      });
      const usable = result.events.filter((event) => event.status !== 'failed');
      setCandidates(usable.length > 0 ? usable : result.events);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not parse that receipt.');
      setStep('compose');
    }
  };

  const addSelected = async () => {
    const chosen = candidates.filter((item) => selected[item.id]);
    if (chosen.length === 0) return;

    for (const item of chosen) {
      const draft = drafts[item.id];
      const amount = Number(draft?.amount);
      if (!draft?.name.trim() || !Number.isFinite(amount) || amount <= 0) {
        setError('Fill in name and amount for each selected plan before adding.');
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      let added = 0;
      for (const item of chosen) {
        const draft = drafts[item.id]!;
        await confirmParserEvent(item.id, {
          name: draft.name.trim(),
          amount: Number(draft.amount),
          currency: draft.currency,
          billingCycle: draft.billingCycle,
        });
        added += 1;
      }
      const skipped = candidates.filter((item) => !selected[item.id]);
      await Promise.allSettled(skipped.map((item) => rejectParserEvent(item.id)));
      await onRefreshSubscriptions();
      onAdded(added);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add those plans.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.handle} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {step === 'intro' ? (
            <View style={styles.content}>
              <View style={styles.heroIcon}>
                <Text style={styles.heroMark}>⌁</Text>
              </View>
              <Text style={styles.title}>Scan a receipt</Text>
              <Text style={styles.body}>
                Paste invoice text or snap a receipt photo. We suggest subscription plans — you confirm
                what gets added. Only content you choose is sent.
              </Text>

              <View style={styles.bullets}>
                <Bullet text="Paste text or upload / capture an image" />
                <Bullet text="Review suggestions before anything is saved" />
                <Bullet text="Skip anytime and add plans manually" />
              </View>

              <Pressable style={styles.primaryBtn} onPress={startCompose}>
                <Text style={styles.primaryText}>Scan a receipt</Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={deny}>
                <Text style={styles.secondaryText}>Not now</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'compose' ? (
            <View style={styles.content}>
              <Text style={styles.title}>Add receipt details</Text>
              <Text style={styles.body}>
                Paste the charge text, attach a photo, or both — then we’ll suggest a plan.
              </Text>

              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Paste invoice / receipt / bank alert text…"
                placeholderTextColor={DashboardColors.textMuted}
                multiline
                textAlignVertical="top"
                style={styles.input}
              />

              {imageUri ? (
                <View style={styles.previewWrap}>
                  <Image source={{ uri: imageUri }} style={styles.preview} />
                  <Pressable style={styles.clearImage} onPress={clearImage}>
                    <Text style={styles.clearImageText}>Remove photo</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.imageRow}>
                  <Pressable style={styles.imageBtn} onPress={() => void pickImage(true)}>
                    <Text style={styles.imageBtnText}>Capture</Text>
                  </Pressable>
                  <Pressable style={styles.imageBtn} onPress={() => void pickImage(false)}>
                    <Text style={styles.imageBtnText}>Upload</Text>
                  </Pressable>
                </View>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.primaryBtn, !canParse && styles.disabled]}
                disabled={!canParse}
                onPress={() => void runParse()}>
                <Text style={[styles.primaryText, !canParse && styles.disabledText]}>
                  Suggest plans
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={onClose}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'parsing' ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={DashboardColors.accent} size="large" />
              <Text style={styles.title}>Reading your receipt…</Text>
              <Text style={styles.body}>Extracting merchant, amount, and billing details</Text>
            </View>
          ) : null}

          {step === 'results' ? (
            <View style={styles.content}>
              <Text style={styles.title}>
                {candidates.some((c) => c.merchant || c.amount != null)
                  ? 'Suggested plans'
                  : 'No subscription found'}
              </Text>
              <Text style={styles.body}>
                {candidates.some((c) => c.merchant || c.amount != null)
                  ? 'Edit anything that’s wrong, then add. Name and amount are required.'
                  : candidates[0]?.errorMessage ??
                    'This receipt didn’t look like a trackable service charge. Try a clearer photo, paste the text too, or add manually.'}
              </Text>

              <View style={styles.list}>
                {candidates.map((item) => {
                  const active = Boolean(selected[item.id]);
                  const draft = drafts[item.id] ?? draftFromEvent(item);
                  const payload =
                    typeof item.normalizedPayload === 'object' && item.normalizedPayload
                      ? (item.normalizedPayload as Record<string, unknown>)
                      : {};
                  const oneTime = payload.recurring === false;
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.detectRow,
                        active && styles.detectRowActive,
                        !active && styles.detectRowMuted,
                      ]}>
                      <Pressable
                        onPress={() =>
                          setSelected((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                        }
                        style={styles.detectHeader}>
                        <ServiceLogo
                          name={draft.name || 'Unknown'}
                          providerKey={
                            typeof payload.merchantKey === 'string'
                              ? payload.merchantKey
                              : undefined
                          }
                          fallbackIcon={typeof payload.icon === 'string' ? payload.icon : '?'}
                          color={typeof payload.color === 'string' ? payload.color : '#555'}
                          size={42}
                          radius={12}
                        />
                        <View style={styles.meta}>
                          <Text style={styles.name}>{draft.name || 'Unknown merchant'}</Text>
                          <Text style={styles.sub}>
                            {draft.amount
                              ? oneTime
                                ? `${formatMoney(Number(draft.amount) || 0, draft.currency)} · one-time`
                                : `${formatMoney(Number(draft.amount) || 0, draft.currency)}/${draft.billingCycle.slice(0, 2)}`
                              : 'Amount unclear'}
                            {' · tap to select'}
                          </Text>
                        </View>
                        <View style={[styles.check, active && styles.checkOn]}>
                          <Text style={styles.checkMark}>{active ? '✓' : ''}</Text>
                        </View>
                      </Pressable>

                      {active ? (
                        <View style={styles.editBlock}>
                          <Text style={styles.editLabel}>Name</Text>
                          <TextInput
                            value={draft.name}
                            onChangeText={(value) => updateDraft(item.id, { name: value })}
                            placeholder="e.g. Google"
                            placeholderTextColor={DashboardColors.textMuted}
                            style={styles.editInput}
                          />
                          <View style={styles.editRow}>
                            <View style={styles.editHalf}>
                              <Text style={styles.editLabel}>Amount</Text>
                              <TextInput
                                value={draft.amount}
                                onChangeText={(value) =>
                                  updateDraft(item.id, {
                                    amount: value.replace(/[^0-9.]/g, ''),
                                  })
                                }
                                keyboardType="decimal-pad"
                                placeholder="25.00"
                                placeholderTextColor={DashboardColors.textMuted}
                                style={styles.editInput}
                              />
                            </View>
                            <View style={styles.editHalf}>
                              <SubscriptionCurrencyPicker
                                value={draft.currency}
                                onChange={(code) => updateDraft(item.id, { currency: code })}
                              />
                            </View>
                          </View>
                          <Text style={styles.editLabel}>Billing cycle</Text>
                          <View style={styles.cycleRow}>
                            {(['weekly', 'monthly', 'yearly'] as const).map((cycle) => {
                              const on = draft.billingCycle === cycle;
                              return (
                                <Pressable
                                  key={cycle}
                                  onPress={() => updateDraft(item.id, { billingCycle: cycle })}
                                  style={[styles.cycleChip, on && styles.cycleChipOn]}>
                                  <Text style={[styles.cycleChipText, on && styles.cycleChipTextOn]}>
                                    {cycle}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              {selectedCount > 0 ? (
                <Pressable
                  style={[
                    styles.primaryBtn,
                    (!selectedReady || submitting) && styles.disabled,
                  ]}
                  disabled={!selectedReady || submitting}
                  onPress={() => void addSelected()}>
                  <Text
                    style={[
                      styles.primaryText,
                      (!selectedReady || submitting) && styles.disabledText,
                    ]}>
                    {submitting
                      ? 'Adding…'
                      : selectedReady
                        ? `Add ${selectedCount} plan${selectedCount === 1 ? '' : 's'}`
                        : 'Fill name & amount'}
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
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => {
                  setStep('compose');
                  setError(null);
                }}>
                <Text style={styles.secondaryText}>Try again</Text>
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
                Receipt scan stays off for now. You can still add any plan in a few taps, and open scan
                later when you want suggestions from an invoice.
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
        </ScrollView>
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
    marginBottom: 14,
  },
  scrollContent: {
    paddingBottom: 8,
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
    flex: 1,
  },
  input: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    backgroundColor: DashboardColors.surface,
    color: DashboardColors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  imageBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: DashboardColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  imageBtnText: {
    color: DashboardColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  previewWrap: {
    gap: 8,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    backgroundColor: DashboardColors.surface,
  },
  clearImage: {
    alignSelf: 'flex-start',
  },
  clearImageText: {
    color: DashboardColors.accent,
    fontWeight: '600',
    fontSize: 13,
  },
  error: {
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  detectRow: {
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  detectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detectRowActive: {
    borderColor: DashboardColors.accent,
    backgroundColor: DashboardColors.accentSoft,
  },
  detectRowMuted: {
    opacity: 0.7,
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
  editBlock: {
    gap: 8,
    paddingTop: 4,
  },
  editLabel: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  editInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    backgroundColor: DashboardColors.surfaceElevated,
    color: DashboardColors.text,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  editRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editHalf: {
    flex: 1,
    gap: 8,
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cycleChip: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DashboardColors.surfaceElevated,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  cycleChipOn: {
    backgroundColor: DashboardColors.accent,
    borderColor: DashboardColors.accent,
  },
  cycleChipText: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cycleChipTextOn: {
    color: '#fff',
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
