import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, useWindowDimensions, PanResponder, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VictoryArea, VictoryChart, VictoryAxis } from 'victory-native';
import { useColorScheme } from 'nativewind';
import { useToday } from '../../hooks/useToday';
import { fetchHabits, fetchEntriesForDateRange } from '../../controllers/HabitController';
import { fetchStatDefinitions, fetchStatEntries } from '../../controllers/StatController';
import { Habit, HabitEntry } from '../../models/Habit';
import { StatDefinition, StatEntry } from '../../models/Stat';

// ── Constants ─────────────────────────────────────────────────────────────
const CELL_GAP = 3;
const CALENDAR_PADDING = 16;
const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RANGE_OPTIONS = [
  { key: 'week',   label: '1W', days: 7   },
  { key: 'month',  label: '1M', days: 30  },
  { key: '3month', label: '3M', days: 90  },
  { key: '6month', label: '6M', days: 180 },
  { key: 'year',   label: '1Y', days: 365 },
] as const;
type RangeKey = typeof RANGE_OPTIONS[number]['key'];

// ── Helpers ───────────────────────────────────────────────────────────────

function habitColor(ratio: number | null, isDark: boolean): string {
  if (ratio === null || ratio === 0) return isDark ? '#1f2937' : '#e5e7eb';
  return `rgba(34, 197, 94, ${ratio.toFixed(2)})`;
}


// Returns the year/month for a given offset from the current month (0 = current, -1 = previous, etc.)
function getDisplayMonth(todayStr: string, offset: number): { year: number; month: number } {
  const d = new Date(todayStr + 'T00:00:00');
  const date = new Date(d.getFullYear(), d.getMonth() + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

// First day of the month 11 months ago (covers a full year of navigation)
function calendarRangeStart(todayStr: string): string {
  const d = new Date(todayStr + 'T00:00:00');
  const start = new Date(d.getFullYear(), d.getMonth() - 11, 1);
  return start.toISOString().split('T')[0];
}

function buildMonthGrid(year: number, month: number): (string | null)[][] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dow = firstDay.getDay();
  const startPad = dow === 0 ? 6 : dow - 1; // Monday-start

  const rows: (string | null)[][] = [];
  let row: (string | null)[] = Array(startPad).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    row.push(dateStr);
    if (row.length === 7) { rows.push(row); row = []; }
  }
  if (row.length > 0) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }
  return rows;
}

function formatAxisDate(ts: number): string {
  const d = new Date(ts);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

// ── Section header ────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 pt-6 pb-3">
      {label}
    </Text>
  );
}

// ── Animated calendar cell ────────────────────────────────────────────────
function CalendarCell({
  date, cellSize, ratio, isDark,
}: {
  date: string | null; cellSize: number;
  ratio: number | null; isDark: boolean;
}) {
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = () => {
    // Glare sweep
    swipeAnim.setValue(0);
    Animated.timing(swipeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Percentage: fade in → hold 3 s → fade out
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(textOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    timerRef.current = setTimeout(() => {
      Animated.timing(textOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }, 3000);
  };

  // Padding cells: invisible placeholder, no interaction
  if (!date) {
    return (
      <View style={{ width: cellSize, height: cellSize, borderRadius: 4 }} />
    );
  }

  const glareX = swipeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-cellSize * 0.8, cellSize * 1.4],
  });

  const percentText = ratio !== null ? `${Math.round(ratio * 100)}%` : null;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <View
        style={{
          width: cellSize,
          height: cellSize,
          backgroundColor: habitColor(ratio, isDark),
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Diagonal glare sweep */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -cellSize,
            width: cellSize * 0.45,
            height: cellSize * 3,
            backgroundColor: 'rgba(255,255,255,0.5)',
            transform: [{ translateX: glareX }, { rotate: '-25deg' }],
          }}
        />

        {/* Percentage label */}
        {percentText !== null && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: textOpacity,
            }}
          >
            <Text style={{
              fontSize: Math.max(7, Math.floor(cellSize * 0.22)),
              color: '#fff',
              fontWeight: '700',
            }}>
              {percentText}
            </Text>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Month calendar grid (no title — handled by nav header) ────────────────
function MonthCalendar({
  year, month, today, ratioByDate, isDark, mutedColor, cellSize,
}: {
  year: number; month: number; today: string;
  ratioByDate: Record<string, number>; isDark: boolean; mutedColor: string;
  cellSize: number;
}) {
  const rows = buildMonthGrid(year, month);

  return (
    <View>
      {/* Day-of-week headers — same width as cells for perfect alignment */}
      <View style={{ flexDirection: 'row', gap: CELL_GAP, marginBottom: CELL_GAP }}>
        {DAY_HEADERS.map(d => (
          <View key={d} style={{ width: cellSize, alignItems: 'center', paddingVertical: 3 }}>
            <Text style={{ fontSize: 9, color: mutedColor, textTransform: 'uppercase', letterSpacing: 0.8 }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar rows */}
      <View style={{ gap: CELL_GAP }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: CELL_GAP }}>
            {row.map((date, ci) => {
              const isFuture = date ? date > today : true;
              const ratio = (!date || isFuture) ? null : (ratioByDate[date] ?? null);
              return (
                <CalendarCell
                  key={ci}
                  date={date}
                  cellSize={cellSize}
                  ratio={ratio}
                  isDark={isDark}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Stat chart with range selector and swipe navigation ───────────────────
function StatChart({
  stat, allEntries, today,
}: {
  stat: StatDefinition; allEntries: StatEntry[]; today: string;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mutedColor = '#9ca3af';
  const axisColor = isDark ? '#1f2937' : '#e5e7eb';
  const chartLineColor = '#22c55e';
  const chartFillColor = isDark ? '#166634' : '#bbf7d0';
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth;

  const [rangeKey, setRangeKey] = useState<RangeKey>('month');
  const [offset, setOffset] = useState(0);

  const rangeDays = RANGE_OPTIONS.find(r => r.key === rangeKey)!.days;

  // Compute display window
  const endDate = new Date(today + 'T00:00:00');
  endDate.setDate(endDate.getDate() - offset * rangeDays);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - rangeDays + 1);
  const endStr = endDate.toISOString().split('T')[0];
  const startStr = startDate.toISOString().split('T')[0];

  const windowEntries = allEntries.filter(e => e.date >= startStr && e.date <= endStr);

  // Zero-fill every past day in the window so the line returns to 0 on missing days.
  // The average only counts days that have actual entries.
  const entryByDate = new Map(windowEntries.map(e => [e.date, e.value]));
  const chartData: { x: number; y: number }[] = [];
  const cur = new Date(startStr + 'T12:00:00');
  const stop = new Date((endStr < today ? endStr : today) + 'T12:00:00');
  while (cur <= stop) {
    const ds = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    chartData.push({ x: cur.getTime(), y: entryByDate.get(ds) ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }

  const average = windowEntries.length > 0
    ? windowEntries.reduce((sum, e) => sum + e.value, 0) / windowEntries.length
    : null;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 50) {
          setOffset(o => o + 1);          // swipe right = go back in time
        } else if (gs.dx < -50) {
          setOffset(o => Math.max(o - 1, 0)); // swipe left = forward (cap at today)
        }
      },
    })
  ).current;

  return (
    <View className="border-b border-gray-100 dark:border-gray-800 pb-2">
      {/* Stat label — same style as section header */}
      <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 pt-4 pb-1">
        {stat.label}
      </Text>

      {/* Range tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 6, marginBottom: 4, justifyContent: 'center' }}>
        {RANGE_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => { setRangeKey(opt.key); setOffset(0); }}
            style={{
              paddingHorizontal: 9,
              paddingVertical: 3,
              borderRadius: 12,
              backgroundColor: rangeKey === opt.key
                ? '#22c55e'
                : (isDark ? '#1f2937' : '#f3f4f6'),
            }}
          >
            <Text style={{
              fontSize: 11, fontWeight: '600', letterSpacing: 1.5,
              color: rangeKey === opt.key ? '#fff' : mutedColor,
            }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      {chartData.length < 2 ? (
        <View className="px-5 pb-3">
          <Text style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            {allEntries.length === 0 ? 'No data yet.' : 'No data in this period.'}
          </Text>
        </View>
      ) : (
        <View {...panResponder.panHandlers}>
          <VictoryChart
            width={chartWidth}
            height={130}
            padding={{ top: 8, bottom: 28, left: 40, right: 16 }}
            domainPadding={{ x: [8, 8], y: [10, 10] }}
            style={{ parent: { backgroundColor: 'transparent' } }}
          >
            <VictoryAxis
              style={{
                axis: { stroke: axisColor },
                ticks: { stroke: 'transparent' },
                tickLabels: { fontSize: 9, fill: mutedColor, padding: 4 },
                grid: { stroke: 'transparent' },
              }}
              tickCount={4}
              tickFormat={(t: number) => formatAxisDate(t)}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: 'transparent' },
                ticks: { stroke: 'transparent' },
                tickLabels: { fontSize: 9, fill: mutedColor, padding: 4 },
                grid: { stroke: axisColor, strokeDasharray: '3,3' },
              }}
              tickCount={3}
            />
            <VictoryArea
              data={chartData}
              interpolation="monotoneX"
              style={{
                data: {
                  stroke: chartLineColor,
                  strokeWidth: 1.5,
                  fill: chartFillColor,
                  fillOpacity: 0.25,
                },
              }}
            />
          </VictoryChart>
        </View>
      )}

      {/* Average */}
      {average !== null && (
        <Text style={{ fontSize: 11, color: mutedColor, textAlign: 'center', paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          avg {Number.isInteger(average) ? average : average.toFixed(1)}{stat.unit ? ` ${stat.unit}` : ''}
        </Text>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────
export default function ProgressScreen() {
  const today = useToday();
  const { width: screenWidth } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#ffffff' : '#111111';
  const mutedColor = '#9ca3af';

  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [stats, setStats] = useState<StatDefinition[]>([]);
  const [statEntriesMap, setStatEntriesMap] = useState<Record<string, StatEntry[]>>({});

  // Floor to an integer so every cell is identically sized with no sub-pixel rounding
  const cellSize = Math.floor((screenWidth - CELL_GAP * 6 - CALENDAR_PADDING * 2) / 7);
  const calFrom = calendarRangeStart(today);
  const statFrom = (() => {
    const d = new Date(today + 'T00:00:00');
    d.setDate(d.getDate() - 364); // 365 days inclusive; covers the full 1Y chart range
    return d.toISOString().split('T')[0];
  })();

  const displayMonth = getDisplayMonth(today, monthOffset);

  // Max forward offset = months remaining in the current calendar year
  const maxMonthOffset = 11 - new Date(today + 'T00:00:00').getMonth();
  const maxMonthOffsetRef = useRef(maxMonthOffset);
  maxMonthOffsetRef.current = maxMonthOffset;

  const calendarPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 50) {
          setMonthOffset(o => o - 1);
        } else if (gs.dx < -50) {
          setMonthOffset(o => Math.min(o + 1, maxMonthOffsetRef.current));
        }
      },
    })
  ).current;

  useEffect(() => { loadAll(); }, [today]);

  async function loadAll() {
    setLoading(true);
    try {
      const [h, e, s] = await Promise.all([
        fetchHabits(),
        fetchEntriesForDateRange(calFrom, today),
        fetchStatDefinitions(),
      ]);

      const enabledStats = s.filter(st => st.enabled);
      const statEntryArrays = await Promise.all(
        enabledStats.map(st => fetchStatEntries(st.id, statFrom, today))
      );
      const entryMap: Record<string, StatEntry[]> = {};
      enabledStats.forEach((st, i) => { entryMap[st.id] = statEntryArrays[i]; });

      setHabits(h);
      setHabitEntries(e);
      setStats(enabledStats);
      setStatEntriesMap(entryMap);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  // ── Derived: completion ratio per date ────────────────────────────────────
  const ratioByDate: Record<string, number> = {};
  if (habits.length > 0) {
    const completedByDate: Record<string, number> = {};
    for (const entry of habitEntries) {
      if (entry.completed) {
        completedByDate[entry.date] = (completedByDate[entry.date] ?? 0) + 1;
      }
    }
    for (const [date, count] of Object.entries(completedByDate)) {
      ratioByDate[date] = count / habits.length;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator color={mutedColor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HABIT CALENDAR ── */}
        <SectionHeader label="Habits" />

        {habits.length === 0 ? (
          <Text style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, paddingHorizontal: 20, paddingBottom: 16 }}>
            No habits yet.
          </Text>
        ) : (
          <View {...calendarPanResponder.panHandlers}>
            {/* Month navigation */}
            <View className="flex-row items-center justify-between px-5 mb-3">
              <TouchableOpacity onPress={() => setMonthOffset(o => o - 1)} hitSlop={8}>
                <Ionicons name="chevron-back" size={20} color={iconColor} />
              </TouchableOpacity>

              <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#f9fafb' : '#111827', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                {MONTH_NAMES[displayMonth.month]} {displayMonth.year}
              </Text>

              <TouchableOpacity
                onPress={() => setMonthOffset(o => o + 1)}
                disabled={monthOffset >= maxMonthOffset}
                hitSlop={8}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={monthOffset >= maxMonthOffset ? mutedColor : iconColor}
                />
              </TouchableOpacity>
            </View>

            {/* Calendar grid with side padding */}
            <View style={{ paddingHorizontal: CALENDAR_PADDING }}>
              <MonthCalendar
                year={displayMonth.year}
                month={displayMonth.month}
                today={today}
                ratioByDate={ratioByDate}
                isDark={isDark}
                mutedColor={mutedColor}
                cellSize={cellSize}
              />
            </View>
          </View>
        )}

        {/* ── STAT CHARTS ── */}
        {stats.length > 0 && (
          <>
            <View className="border-t border-gray-100 dark:border-gray-800 mt-6" />
            <SectionHeader label="Stats" />
            {stats.map(stat => (
              <StatChart
                key={stat.id}
                stat={stat}
                allEntries={statEntriesMap[stat.id] ?? []}
                today={today}
              />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
