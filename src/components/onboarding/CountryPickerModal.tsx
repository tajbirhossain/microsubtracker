import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Country } from '@/constants/onboarding';
import { COUNTRIES, OnboardingColors } from '@/constants/onboarding';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCode?: string;
};

export function CountryPickerModal({ visible, onClose, onSelect, selectedCode }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country / region"
              placeholderTextColor={OnboardingColors.textMuted}
              style={styles.searchInput}
              autoFocus
            />
          </View>
          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const selected = item.code === selectedCode;
            return (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onSelect(item);
                  onClose();
                  setQuery('');
                }}>
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.dial}>{item.dialCode}</Text>
                <Text style={[styles.name, selected && styles.nameSelected]}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OnboardingColors.surfaceSolid,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchIcon: {
    color: OnboardingColors.textMuted,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: OnboardingColors.text,
    fontSize: 16,
    padding: 0,
  },
  cancel: {
    color: OnboardingColors.link,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  flag: {
    fontSize: 22,
  },
  dial: {
    color: OnboardingColors.textSecondary,
    fontSize: 16,
    minWidth: 48,
  },
  name: {
    color: OnboardingColors.text,
    fontSize: 16,
    flex: 1,
  },
  nameSelected: {
    fontWeight: '600',
  },
});
