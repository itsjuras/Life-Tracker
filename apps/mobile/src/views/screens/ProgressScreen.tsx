import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, useWindowDimensions, PanResponder } from 'react-native';
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

// ── Helpers ───────────────────────────────────────────────────────────────

function habitColor(ratio: number | null, isDark: boolean): string {
  if (ratio === null || ratio === 0) return isDark ? '#1f2937' : '#e5e7eb';
  if (ratio <= 0.25) return isDark ? '#14532d' : '#bbf7d0';
  if (ratio <= 0.50) return isDark ? '#166534' : '#4ade80';
  if (ratio <= 0.75) return isDark ? '#15803d' : '#22c55e';
  if (ratio <  1.00) return isDark ? '#16a34a' : '#16a34a';
  return isDark ? '#22c55e' : '#15803d';
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
            <Text style={{ fontSize: 10, color: mutedColor }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar rows */}
      <View style={{ gap: CELL_GAP }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: CELL_GAP }}>
            {row.map((date, ci) => {
              const isToday = date === today;
              const isFuture = !date || date > today;
              const ratio = (!date || isFuture) ? null : (ratioByDate[date] ?? null);

              // Every cell — including empty padding — uses the exact same dimensions.
              // borderWidth is always 2 so the box model never changes size;
              // we just toggle the color between visible and transparent.
              return (
                <View
                  key={ci}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: !date
                      ? 'transparent'
                      : habitColor(ratio, isDark),
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: isToday ? '#22c55e' : 'transparent',
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
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
  const axisColor = isDark ? '#1f2937' : '#e5e7eb';
  const chartLineColor = '#22c55e';
  const chartFillColor = isDark ? '#166634' : '#bbf7d0';

  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [stats, setStats] = useState<StatDefinition[]>([]);
  const [statEntriesMap, setStatEntriesMap] = useState<Record<string, StatEntry[]>>({});

  // Floor to an integer so every cell is identically sized with no sub-pixel rounding
  const cellSize = Math.floor((screenWidth - CELL_GAP * 6 - CALENDAR_PADDING * 2) / 7);
  const chartWidth = screenWidth - 40;
  const calFrom = calendarRangeStart(today);
  const statFrom = (() => {
    const d = new Date(today + 'T00:00:00');
    d.setDate(d.getDate() - 29);
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
          <Text className="text-sm text-gray-400 dark:text-gray-500 px-5 pb-4">
            No habits set up yet.
          </Text>
        ) : (
          <View {...calendarPanResponder.panHandlers}>
            {/* Month navigation */}
            <View className="flex-row items-center justify-between px-5 mb-3">
              <TouchableOpacity onPress={() => setMonthOffset(o => o - 1)} hitSlop={8}>
                <Ionicons name="chevron-back" size={20} color={iconColor} />
              </TouchableOpacity>

              <Text className="text-sm font-medium text-gray-900 dark:text-white">
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
            {stats.map(stat => {
              const entries = statEntriesMap[stat.id] ?? [];
              const chartData = entries.map(e => ({
                x: new Date(e.date + 'T12:00:00').getTime(),
                y: e.value,
              }));
              const latest = entries[entries.length - 1];

              return (
                <View key={stat.id} className="border-b border-gray-100 dark:border-gray-800 pb-2">
                  <View className="flex-row items-baseline justify-between px-5 pt-2 pb-1">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {stat.label}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                      {latest ? `${latest.value}${stat.unit ? ` ${stat.unit}` : ''}` : '—'}
                    </Text>
                  </View>

                  {chartData.length < 2 ? (
                    <View className="px-5 pb-3">
                      <Text className="text-xs text-gray-400 dark:text-gray-500">
                        {chartData.length === 0 ? 'No data yet.' : 'Add more entries to see the trend.'}
                      </Text>
                    </View>
                  ) : (
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
                  )}
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
