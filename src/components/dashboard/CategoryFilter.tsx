import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

import { DashboardColors } from '@/constants/dashboard';

type Props = {
  categories: readonly string[];
  selected: string;
  onSelect: (category: string) => void;
};

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {categories.map((category) => {
        const active = selected === category;
        return (
          <Pressable
            key={category}
            onPress={() => onSelect(category)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{category}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
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
  label: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: DashboardColors.accent,
  },
});
