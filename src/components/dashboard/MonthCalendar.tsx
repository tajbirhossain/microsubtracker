import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DashboardColors, type Subscription } from '@/constants/dashboard';
import { monthMatrix, toDateKey } from '@/utils/subscriptions';

type Props = {
  year: number;
  month: number;
  subscriptions: Subscription[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function MonthCalendar({
  year,
  month,
  subscriptions,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const weeks = monthMatrix(year, month);
  const title = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const todayKey = toDateKey(new Date());

  const chargesByDay = new Map<string, Subscription[]>();
  for (const sub of subscriptions) {
    const list = chargesByDay.get(sub.nextBillingDate) ?? [];
    list.push(sub);
    chargesByDay.set(sub.nextBillingDate, list);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} hitSlop={12} style={styles.navBtn}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onNextMonth} hitSlop={12} style={styles.navBtn}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((date, dayIndex) => {
            if (!date) {
              return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.dayCell} />;
            }

            const key = toDateKey(date);
            const charges = chargesByDay.get(key) ?? [];
            const selected = selectedDate === key;
            const isToday = todayKey === key;

            return (
              <Pressable
                key={key}
                onPress={() => onSelectDate(key)}
                style={[styles.dayCell, selected && styles.daySelected, isToday && !selected && styles.dayToday]}>
                <Text
                  style={[
                    styles.dayNumber,
                    selected && styles.dayNumberSelected,
                    isToday && !selected && styles.dayNumberToday,
                  ]}>
                  {date.getDate()}
                </Text>
                {charges.length > 0 ? (
                  <View style={styles.dots}>
                    {charges.slice(0, 3).map((sub) => (
                      <View key={sub.id} style={[styles.dot, { backgroundColor: sub.color }]} />
                    ))}
                  </View>
                ) : (
                  <View style={styles.dotsPlaceholder} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: DashboardColors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DashboardColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: DashboardColors.text,
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: DashboardColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 4,
  },
  daySelected: {
    backgroundColor: DashboardColors.accentSoft,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  dayNumber: {
    color: DashboardColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  dayNumberSelected: {
    color: DashboardColors.accent,
  },
  dayNumberToday: {
    color: DashboardColors.text,
  },
  dots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 3,
    minHeight: 6,
  },
  dotsPlaceholder: {
    minHeight: 6,
    marginTop: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
