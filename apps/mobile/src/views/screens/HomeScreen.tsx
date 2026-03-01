import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useToday } from '../../hooks/useToday';
import { fetchHabits, fetchEntriesForDate, toggleHabitEntry } from '../../controllers/HabitController';
import { fetchTasksForDate, toggleTask } from '../../controllers/TaskController';
import { fetchStatDefinitions, logStatEntry, fetchAllStatEntriesForDate } from '../../controllers/StatController';
import { fetchReflection, saveReflection } from '../../controllers/ReflectionController';
import { Habit, HabitEntry } from '../../models/Habit';
import { Task } from '../../models/Task';
import { StatDefinition } from '../../models/Stat';
import { ICON_MAP } from '../../constants/icons';

type Step = 'loading' | 'tasks' | 'habits' | 'stats' | 'reflection' | 'done';

const STEP_ORDER: Step[] = ['tasks', 'habits', 'stats', 'reflection', 'done'];

const STEP_LABEL: Partial<Record<Step, string>> = {
  tasks: 'Tasks',
  habits: 'Habits',
  stats: 'Stats',
  reflection: 'Reflection',
};

const divider = 'border-b border-gray-100 dark:border-gray-800';

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

interface Props {
  onEdit: () => void;
}

export default function HomeScreen({ onEdit }: Props) {
  const today = useToday();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#ffffff' : '#111111';
  const mutedColor = '#9ca3af';

  const [step, setStep] = useState<Step>('loading');
  const [showCompleted, setShowCompleted] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [stats, setStats] = useState<StatDefinition[]>([]);
  const [statInputs, setStatInputs] = useState<Record<string, string>>({});
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);

  useEffect(() => {
    loadAll();
  }, [today]);

  async function loadAll() {
    setStep('loading');
    try {
      const [t, h, e, s, se, r] = await Promise.all([
        fetchTasksForDate(today),
        fetchHabits(),
        fetchEntriesForDate(today),
        fetchStatDefinitions(),
        fetchAllStatEntriesForDate(today),
        fetchReflection(today),
      ]);

      const enabledStats = s.filter(st => st.enabled);
      const inputMap: Record<string, string> = {};
      for (const entry of se) {
        inputMap[entry.statDefinitionId] = String(entry.value);
      }

      setTasks(t);
      setHabits(h);
      setEntries(e);
      setStats(enabledStats);
      setStatInputs(inputMap);
      setReflection(r?.text ?? '');
      const saved = !!r;
      setReflectionSaved(saved);

      // Determine starting step from freshly fetched data
      const allTasksDone = t.length === 0 || t.every(task => task.completed);
      const allHabitsDone = h.length === 0 || h.every(habit =>
        e.find(entry => entry.habitId === habit.id)?.completed
      );
      const allStatsDone = enabledStats.length === 0 || enabledStats.every(st => !!inputMap[st.id]?.trim());

      if (!allTasksDone) setStep('tasks');
      else if (!allHabitsDone) setStep('habits');
      else if (!allStatsDone) setStep('stats');
      else if (!saved) setStep('reflection');
      else setStep('done');
    } catch {
      setStep('tasks');
    }
  }

  // Returns true if the given step has nothing left to do
  function isStepComplete(s: Step): boolean {
    if (s === 'tasks') return tasks.length === 0 || tasks.every(t => t.completed);
    if (s === 'habits') return habits.length === 0 || habits.every(h =>
      entries.find(e => e.habitId === h.id)?.completed
    );
    if (s === 'stats') return stats.length === 0 || stats.every(st => !!statInputs[st.id]?.trim());
    if (s === 'reflection') return reflectionSaved;
    return true;
  }

  function goPrev() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }

  // Advance to the next incomplete step, skipping any that are already done
  function goNext() {
    const idx = STEP_ORDER.indexOf(step);
    for (let i = idx + 1; i < STEP_ORDER.length; i++) {
      const next = STEP_ORDER[i];
      if (next === 'done' || !isStepComplete(next)) {
        setStep(next);
        return;
      }
    }
    setStep('done');
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async function handleToggleTask(task: Task) {
    const nowCompleted = !task.completed;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: nowCompleted } : t));
    try {
      const updated = await toggleTask(task.id, nowCompleted);
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t)); // revert
    }
  }

  async function handleToggleHabit(habit: Habit) {
    const existing = entries.find(e => e.habitId === habit.id);
    const nowCompleted = !(existing?.completed ?? false);
    // Optimistic update
    const optimistic: HabitEntry = { id: existing?.id ?? '', habitId: habit.id, date: today, completed: nowCompleted };
    setEntries(prev => {
      const idx = prev.findIndex(e => e.habitId === habit.id);
      if (idx >= 0) return prev.map((e, i) => i === idx ? optimistic : e);
      return [...prev, optimistic];
    });
    try {
      const updated = await toggleHabitEntry(habit.id, today, nowCompleted);
      setEntries(prev => prev.map(e => e.habitId === habit.id ? updated : e));
    } catch {
      setEntries(prev => {
        if (existing) return prev.map(e => e.habitId === habit.id ? existing : e);
        return prev.filter(e => e.habitId !== habit.id);
      });
    }
  }

  async function handleStatBlur(statId: string) {
    const raw = statInputs[statId]?.trim();
    if (!raw) return;
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    try { await logStatEntry(statId, today, val); } catch { /* silent */ }
  }

  async function handleStatsNext() {
    // Flush any unsaved stat inputs before advancing
    await Promise.all(
      stats.map(stat => {
        const raw = statInputs[stat.id]?.trim();
        if (!raw) return Promise.resolve();
        const val = parseFloat(raw);
        if (isNaN(val)) return Promise.resolve();
        return logStatEntry(stat.id, today, val).catch(() => { /* silent */ });
      })
    );
    goNext();
  }

  async function handleSaveReflection() {
    const trimmed = reflection.trim();
    if (!trimmed || countWords(trimmed) > 10) return;
    setSavingReflection(true);
    try {
      await saveReflection(today, trimmed);
      setReflectionSaved(true);
      goNext();
    } catch { /* silent */ } finally {
      setSavingReflection(false);
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const wordCount = countWords(reflection);
  const wordCountOver = wordCount > 10;
  const reflectionValid = !wordCountOver && reflection.trim() !== '';

  // ── Render ───────────────────────────────────────────────────────────────

  if (step === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator color={mutedColor} />
      </SafeAreaView>
    );
  }

  if (step === 'done') {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <View className={`px-5 py-4 flex-row items-center justify-between ${divider}`}>
          <TouchableOpacity onPress={() => setStep('reflection')} hitSlop={8}>
            <Text className="text-sm text-gray-400 dark:text-gray-500">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} hitSlop={8}>
            <Ionicons name="create-outline" size={18} color={mutedColor} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="checkmark-circle-outline" size={40} color={mutedColor} />
          <Text className="text-base text-gray-900 dark:text-white mt-5 text-center">
            All done for today.
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
            {formatDate(today)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Step header */}
        <View className={`px-5 py-4 flex-row items-center justify-between ${divider}`}>
          <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {STEP_LABEL[step]}
          </Text>
          <TouchableOpacity onPress={onEdit} hitSlop={8}>
            <Ionicons name="create-outline" size={18} color={mutedColor} />
          </TouchableOpacity>
        </View>

        {/* Step content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── TASKS ── */}
          {step === 'tasks' && (
            <View className="border-t border-gray-100 dark:border-gray-800">
              {tasks.length === 0 ? (
                <View className={`px-5 py-4 ${divider}`}>
                  <Text className="text-sm text-gray-400 dark:text-gray-500">No tasks for today.</Text>
                </View>
              ) : (
                <>
                  {activeTasks.map(task => (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() => handleToggleTask(task)}
                      className={`px-5 py-4 flex-row items-center ${divider}`}
                      style={{ gap: 14 }}
                    >
                      <View style={{
                        width: 18, height: 18, borderRadius: 9,
                        borderWidth: 1.5, borderColor: mutedColor,
                      }} />
                      <Text className="text-base text-gray-900 dark:text-white flex-1">
                        {task.title}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {completedTasks.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setShowCompleted(v => !v)}
                      className={`px-5 py-3 ${divider}`}
                    >
                      <Text className="text-xs text-gray-400 dark:text-gray-500">
                        {showCompleted ? 'Hide completed' : `${completedTasks.length} completed`}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {showCompleted && completedTasks.map(task => (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() => handleToggleTask(task)}
                      className={`px-5 py-4 flex-row items-center ${divider}`}
                      style={{ gap: 14 }}
                    >
                      <Ionicons name="checkmark-circle" size={18} color={mutedColor} />
                      <Text className="text-base text-gray-400 dark:text-gray-600 flex-1 line-through">
                        {task.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}

          {/* ── HABITS ── */}
          {step === 'habits' && (
            <View className="border-t border-gray-100 dark:border-gray-800">
              {habits.length === 0 ? (
                <View className={`px-5 py-4 ${divider}`}>
                  <Text className="text-sm text-gray-400 dark:text-gray-500">No habits yet.</Text>
                </View>
              ) : habits.map(habit => {
                const entry = entries.find(e => e.habitId === habit.id);
                const done = entry?.completed ?? false;
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => handleToggleHabit(habit)}
                    className={`px-5 py-4 flex-row items-center justify-between ${divider}`}
                  >
                    <View className="flex-row items-center" style={{ gap: 12 }}>
                      <Ionicons
                        name={ICON_MAP[habit.iconKey as any] ?? 'ellipse-outline'}
                        size={18}
                        color={done ? iconColor : mutedColor}
                      />
                      <Text className={`text-base ${done ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {habit.name}
                      </Text>
                    </View>
                    <Ionicons
                      name={done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={done ? iconColor : mutedColor}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ── STATS ── */}
          {step === 'stats' && (
            <View className="border-t border-gray-100 dark:border-gray-800">
              {stats.length === 0 ? (
                <View className={`px-5 py-4 ${divider}`}>
                  <Text className="text-sm text-gray-400 dark:text-gray-500">No stats enabled.</Text>
                </View>
              ) : stats.map(stat => (
                <View
                  key={stat.id}
                  className={`px-5 py-4 flex-row items-center justify-between ${divider}`}
                >
                  <View>
                    <Text className="text-base text-gray-900 dark:text-white">{stat.label}</Text>
                    {stat.unit ? (
                      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.unit}</Text>
                    ) : null}
                  </View>
                  <TextInput
                    value={statInputs[stat.id] ?? ''}
                    onChangeText={text => setStatInputs(prev => ({ ...prev, [stat.id]: text }))}
                    onBlur={() => handleStatBlur(stat.id)}
                    onSubmitEditing={() => handleStatBlur(stat.id)}
                    placeholder="—"
                    placeholderTextColor={mutedColor}
                    keyboardType="numeric"
                    returnKeyType="done"
                    className="text-base text-gray-900 dark:text-white text-right"
                    style={{ minWidth: 60 }}
                  />
                </View>
              ))}
            </View>
          )}

          {/* ── REFLECTION ── */}
          {step === 'reflection' && (
            <View className="px-5 pt-8">
              <TextInput
                value={reflection}
                onChangeText={setReflection}
                placeholder="One key moment from today…"
                placeholderTextColor={mutedColor}
                multiline
                autoFocus
                className="text-base text-gray-900 dark:text-white"
                style={{ lineHeight: 24, minHeight: 80 }}
              />
              <Text className={`text-xs mt-4 ${wordCountOver ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {wordCount} / 10 words
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Step footer */}
        <View className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 flex-row items-center justify-between">
          {/* Back button — hidden on the first step */}
          {STEP_ORDER.indexOf(step) > 0 ? (
            <TouchableOpacity onPress={goPrev} hitSlop={8}>
              <Text className="text-sm text-gray-400 dark:text-gray-500">Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {/* Forward button */}
          {step === 'reflection' ? (
            <TouchableOpacity
              onPress={handleSaveReflection}
              disabled={savingReflection || !reflectionValid}
              hitSlop={8}
            >
              {savingReflection ? (
                <ActivityIndicator size="small" color={mutedColor} />
              ) : (
                <Text className={`text-sm ${reflectionValid ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-700'}`}>
                  Done
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={step === 'stats' ? handleStatsNext : goNext}
              hitSlop={8}
            >
              <Text className="text-sm text-gray-400 dark:text-gray-500">Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
