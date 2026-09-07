import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DashboardColors } from '@/constants/dashboard';
import type { ListFilter, ListSort } from '@/context/subscriptions-context';

const FILTERS: { id: ListFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'trials', label: 'Trials' },
  { id: 'unused', label: 'Unused' },
  { id: 'expiry', label: 'Expiring soon' },
];

const SORTS: { id: ListSort; label: string }[] = [
  { id: 'amount', label: 'Highest cost' },
  { id: 'soonest', label: 'Soonest charge' },
  { id: 'name', label: 'A–Z' },
];

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  filter: ListFilter;
  onFilterChange: (value: ListFilter) => void;
  sort: ListSort;
  onSortChange: (value: ListSort) => void;
};

export function SearchFilterBar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search subscriptions"
          placeholderTextColor={DashboardColors.textMuted}
          style={styles.input}
          selectionColor={DashboardColors.accent}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => onQueryChange('')} hitSlop={8}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        {FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onFilterChange(item.id)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort</Text>
        <View style={styles.sortChips}>
          {SORTS.map((item) => {
            const active = sort === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => onSortChange(item.id)}
                style={[styles.sortChip, active && styles.sortChipActive]}>
                <Text style={[styles.sortText, active && styles.sortTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: DashboardColors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  searchIcon: {
    color: DashboardColors.textMuted,
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
  },
  clear: {
    color: DashboardColors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  chips: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  chipActive: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: DashboardColors.accent,
  },
  chipText: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: DashboardColors.accent,
  },
  sortRow: {
    gap: 8,
  },
  sortLabel: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sortChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: DashboardColors.surfaceElevated,
  },
  sortChipActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sortText: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  sortTextActive: {
    color: DashboardColors.text,
  },
});
