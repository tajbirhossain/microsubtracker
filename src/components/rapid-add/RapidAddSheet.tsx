import { useEffect, useMemo, useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceLogo } from '@/components/ServiceLogo';
import { SubscriptionCurrencyPicker } from '@/components/rapid-add/SubscriptionCurrencyPicker';
import {
  DashboardColors,
  SUBSCRIPTION_CATEGORIES,
  type BillingCycle,
} from '@/constants/dashboard';
import { getCurrency, isCurrencyCode, type CurrencyCode } from '@/constants/currency';
import { searchCatalog, type CatalogService } from '@/constants/service-catalog';
import type { DraftSubscription } from '@/context/subscriptions-context';
import { usePreferences } from '@/context/preferences-context';
import {
  formatMoney,
  formatShortDate,
  nextBillingFromStart,
  parseDateKey,
  toDateKey,
} from '@/utils/subscriptions';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdded: (name: string) => void;
  onRequestParser: () => void;
  existingNames: string[];
  addFromCatalog: (service: CatalogService, overrides?: Partial<DraftSubscription>) => void;
  addCustom: (draft: DraftSubscription) => void;
};

const CYCLES: BillingCycle[] = ['monthly', 'yearly', 'weekly'];

export function RapidAddSheet({
  visible,
  onClose,
  onAdded,
  onRequestParser,
  existingNames,
  addFromCatalog,
  addCustom,
}: Props) {
  const insets = useSafeAreaInsets();
  const { currencyCode: displayCurrency } = usePreferences();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CatalogService | null>(null);
  const [amountText, setAmountText] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(
    isCurrencyCode(displayCurrency) ? displayCurrency : 'USD'
  );
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState('Productivity');
  const [customMode, setCustomMode] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [trialDaysText, setTrialDaysText] = useState('7');
  const [startMode, setStartMode] = useState<'today' | 'custom'>('today');
  const [startDate, setStartDate] = useState(() => toDateKey(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setSelected(null);
      setAmountText('');
      setCurrency(isCurrencyCode(displayCurrency) ? displayCurrency : 'USD');
      setCycle('monthly');
      setCategory('Productivity');
      setCustomMode(false);
      setIsTrial(false);
      setTrialDaysText('7');
      setStartMode('today');
      setStartDate(toDateKey(new Date()));
      setShowDatePicker(false);
    }
  }, [visible, displayCurrency]);

  const amountSymbol = getCurrency(currency).symbol;

  const suggestions = useMemo(() => {
    const owned = new Set(existingNames.map((name) => name.toLowerCase()));
    return searchCatalog(query, 8).filter((service) => !owned.has(service.name.toLowerCase()));
  }, [query, existingNames]);

  const applySuggestion = (service: CatalogService) => {
    setSelected(service);
    setQuery(service.name);
    setAmountText(String(service.amount));
    setCurrency(isCurrencyCode(service.currency) ? service.currency : 'USD');
    setCycle(service.billingCycle);
    setCategory(service.category);
    setCustomMode(false);
  };

  const resolvedStartDate = startMode === 'today' ? toDateKey(new Date()) : startDate;
  const previewNextBilling = isTrial ? null : nextBillingFromStart(cycle, resolvedStartDate);

  const trialDays = Number.parseInt(trialDaysText, 10);
  const trialValid = !isTrial || (trialDays > 0 && !Number.isNaN(trialDays));
  const canSave =
    query.trim().length > 1 &&
    Number.parseFloat(amountText) > 0 &&
    !Number.isNaN(Number.parseFloat(amountText)) &&
    trialValid;

  const onPickDate = (_event: unknown, date?: Date) => {
    if (!date) return;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setStartDate(toDateKey(date));
  };

  const onDismissPicker = () => {
    setShowDatePicker(false);
  };

  const save = () => {
    if (!canSave) return;
    const amount = Number.parseFloat(amountText);
    const startFields = {
      startDate: resolvedStartDate,
      ...(isTrial
        ? { isTrial: true as const, trialEndsInDays: trialDays }
        : {
            isTrial: false as const,
            trialEndsInDays: undefined,
            nextBillingDate: nextBillingFromStart(cycle, resolvedStartDate),
          }),
    };

    if (selected && selected.name.toLowerCase() === query.trim().toLowerCase()) {
      addFromCatalog(selected, {
        amount,
        currency,
        billingCycle: cycle,
        category,
        ...startFields,
      });
      onAdded(selected.name);
    } else {
      addCustom({
        name: query.trim(),
        amount,
        currency,
        billingCycle: cycle,
        category,
        color: '#5B9EFF',
        icon: query.trim().slice(0, 1).toUpperCase(),
        ...startFields,
      });
      onAdded(query.trim());
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add in seconds</Text>
              <Text style={styles.subtitle}>Type a name — we&apos;ll suggest the rest</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.searchField}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              autoFocus
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setSelected(null);
                setCustomMode(text.trim().length > 0);
              }}
              placeholder="Netflix, Spotify, Claude…"
              placeholderTextColor={DashboardColors.textMuted}
              style={styles.searchInput}
              selectionColor={DashboardColors.accent}
              autoCorrect={false}
              autoCapitalize="words"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => {
                  setQuery('');
                  setSelected(null);
                  setAmountText('');
                }}
                hitSlop={8}>
                <Text style={styles.clear}>Clear</Text>
              </Pressable>
            ) : null}
          </View>

          {!selected && query.length === 0 ? (
            <Pressable style={styles.detectCard} onPress={onRequestParser}>
              <View style={styles.detectIcon}>
                <Text style={styles.detectIconText}>⌁</Text>
              </View>
              <View style={styles.detectCopy}>
                <Text style={styles.detectTitle}>Scan a receipt</Text>
                <Text style={styles.detectBody}>Paste invoice text or capture a photo to suggest a plan</Text>
              </View>
              <Text style={styles.detectChevron}>›</Text>
            </Pressable>
          ) : null}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}>
            {!selected ? (
              <View style={styles.suggestBlock}>
                <Text style={styles.sectionLabel}>
                  {query.trim() ? 'Suggestions' : 'Popular to add'}
                </Text>
                {suggestions.length === 0 ? (
                  <View style={styles.emptySuggest}>
                    <Text style={styles.emptyTitle}>No matches</Text>
                    <Text style={styles.emptyBody}>
                      Keep typing — you can still save a custom plan below.
                    </Text>
                  </View>
                ) : (
                  suggestions.map((service) => (
                    <Pressable
                      key={service.id}
                      style={({ pressed }) => [styles.suggestRow, pressed && styles.pressed]}
                      onPress={() => applySuggestion(service)}>
                      <ServiceLogo
                        name={service.name}
                        providerKey={service.id}
                        fallbackIcon={service.icon}
                        color={service.color}
                        size={44}
                      />
                      <View style={styles.suggestMeta}>
                        <Text style={styles.suggestName}>{service.name}</Text>
                        <Text style={styles.suggestSub}>
                          {formatMoney(service.amount)} · {service.billingCycle} · {service.category}
                        </Text>
                      </View>
                      <Text style={styles.fillHint}>Autofill</Text>
                    </Pressable>
                  ))
                )}
              </View>
            ) : null}

            {(selected || customMode) && query.trim().length > 1 ? (
              <View style={styles.form}>
                <Text style={styles.sectionLabel}>
                  {selected ? `Ready: ${selected.name}` : 'Custom plan details'}
                </Text>

                {selected ? (
                  <View style={styles.selectedPill}>
                    <ServiceLogo
                      name={selected.name}
                      providerKey={selected.id}
                      fallbackIcon={selected.icon}
                      color={selected.color}
                      size={32}
                      radius={10}
                    />
                    <Text style={styles.selectedName}>{selected.name}</Text>
                    <Text style={styles.selectedTag}>{selected.category}</Text>
                  </View>
                ) : null}

                <Text style={styles.fieldLabel}>Price</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.currency}>{amountSymbol}</Text>
                  <TextInput
                    value={amountText}
                    onChangeText={setAmountText}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={DashboardColors.textMuted}
                    style={styles.amountInput}
                    selectionColor={DashboardColors.accent}
                  />
                </View>

                <SubscriptionCurrencyPicker value={currency} onChange={setCurrency} />

                <Text style={styles.fieldLabel}>Billing</Text>
                <View style={styles.cycleRow}>
                  {CYCLES.map((value) => {
                    const active = cycle === value;
                    return (
                      <Pressable
                        key={value}
                        onPress={() => setCycle(value)}
                        style={[styles.cycleChip, active && styles.cycleChipActive]}>
                        <Text style={[styles.cycleText, active && styles.cycleTextActive]}>
                          {value[0].toUpperCase() + value.slice(1)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.fieldLabel}>Category</Text>
                <View style={styles.categoryRow}>
                  {SUBSCRIPTION_CATEGORIES.filter((value) => value !== 'All').map((value) => {
                    const active = category === value;
                    return (
                      <Pressable
                        key={value}
                        onPress={() => setCategory(value)}
                        style={[styles.categoryChip, active && styles.categoryChipActive]}>
                        <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                          {value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.fieldLabel}>Started</Text>
                <View style={styles.cycleRow}>
                  <Pressable
                    onPress={() => {
                      setStartMode('today');
                      setShowDatePicker(false);
                      setStartDate(toDateKey(new Date()));
                    }}
                    style={[styles.cycleChip, startMode === 'today' && styles.cycleChipActive]}>
                    <Text style={[styles.cycleText, startMode === 'today' && styles.cycleTextActive]}>
                      Today
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setStartMode('custom');
                      setShowDatePicker(true);
                    }}
                    style={[styles.cycleChip, startMode === 'custom' && styles.cycleChipActive]}>
                    <Text
                      style={[styles.cycleText, startMode === 'custom' && styles.cycleTextActive]}>
                      {startMode === 'custom' ? formatShortDate(startDate) : 'Another date'}
                    </Text>
                  </Pressable>
                </View>

                {startMode === 'custom' && showDatePicker ? (
                  <View style={styles.pickerWrap}>
                    <DateTimePicker
                      value={parseDateKey(startDate)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onValueChange={onPickDate}
                      onDismiss={onDismissPicker}
                      themeVariant="dark"
                    />
                    {Platform.OS === 'ios' ? (
                      <Pressable onPress={() => setShowDatePicker(false)} style={styles.pickerDone}>
                        <Text style={styles.pickerDoneText}>Done</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}

                {!isTrial && previewNextBilling ? (
                  <Text style={styles.nextHint}>
                    Next charge {formatShortDate(previewNextBilling)}
                  </Text>
                ) : null}

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
                    <Text style={styles.fieldLabel}>Trial period (days left)</Text>
                    <TextInput
                      value={trialDaysText}
                      onChangeText={(text) =>
                        setTrialDaysText(text.replace(/[^\d]/g, '').slice(0, 3))
                      }
                      keyboardType="number-pad"
                      placeholder="7"
                      placeholderTextColor={DashboardColors.textMuted}
                      style={styles.trialInput}
                      selectionColor={DashboardColors.accent}
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
                  onPress={save}
                  disabled={!canSave}
                  style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}>
                  <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
                    Add subscription
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  sheetWrap: {
    flex: 1,
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
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    color: DashboardColors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: DashboardColors.textMuted,
    fontSize: 14,
    marginTop: 4,
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
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: DashboardColors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  searchIcon: {
    color: DashboardColors.textMuted,
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    color: DashboardColors.text,
    fontSize: 17,
    fontWeight: '600',
    padding: 0,
  },
  clear: {
    color: DashboardColors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  detectCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: DashboardColors.accentSoft,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(91,158,255,0.28)',
  },
  detectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(91,158,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectIconText: {
    color: DashboardColors.accent,
    fontSize: 18,
  },
  detectCopy: {
    flex: 1,
    gap: 2,
  },
  detectTitle: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  detectBody: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  detectChevron: {
    color: DashboardColors.accent,
    fontSize: 22,
    fontWeight: '600',
  },
  scroll: {
    marginTop: 14,
  },
  scrollContent: {
    paddingBottom: 12,
    gap: 18,
  },
  suggestBlock: {
    gap: 8,
  },
  sectionLabel: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  suggestMeta: {
    flex: 1,
    gap: 2,
  },
  suggestName: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  suggestSub: {
    color: DashboardColors.textMuted,
    fontSize: 12,
  },
  fillHint: {
    color: DashboardColors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  emptySuggest: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    gap: 4,
  },
  emptyTitle: {
    color: DashboardColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyBody: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    gap: 10,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: DashboardColors.surfaceElevated,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  selectedName: {
    flex: 1,
    color: DashboardColors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  selectedTag: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  fieldLabel: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DashboardColors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  currency: {
    color: DashboardColors.textMuted,
    fontSize: 22,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: DashboardColors.text,
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 12,
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  categoryChipActive: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: DashboardColors.accent,
  },
  categoryText: {
    color: DashboardColors.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  categoryTextActive: {
    color: DashboardColors.accent,
  },
  cycleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    alignItems: 'center',
  },
  cycleChipActive: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: DashboardColors.accent,
  },
  cycleText: {
    color: DashboardColors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  cycleTextActive: {
    color: DashboardColors.accent,
  },
  pickerWrap: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pickerDone: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DashboardColors.border,
  },
  pickerDoneText: {
    color: DashboardColors.accent,
    fontWeight: '700',
    fontSize: 15,
  },
  nextHint: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    marginTop: -2,
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
  trialInput: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    color: DashboardColors.text,
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    marginTop: 8,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: DashboardColors.surfaceMuted,
  },
  saveText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  saveTextDisabled: {
    color: DashboardColors.textMuted,
  },
});
