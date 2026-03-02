import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useToday } from '../../hooks/useToday';
import { fetchHabits, createHabit, deleteHabit } from '../../controllers/HabitController';
import {
  fetchStatDefinitions,
  createStatDefinition,
  deleteStatDefinition,
  toggleStatEnabled,
} from '../../controllers/StatController';
import { fetchTasksForDate, createTask, deleteTask } from '../../controllers/TaskController';
import { Habit } from '../../models/Habit';
import { StatDefinition } from '../../models/Stat';
import { Task } from '../../models/Task';
import { ICON_KEYS, ICON_MAP, IconKey } from '../../constants/icons';

function toStatKey(label: string): string {
  return label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

const divider = 'border-b border-gray-100 dark:border-gray-800';

function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 pt-6 pb-2">
      {label}
    </Text>
  );
}

interface Props {
  onBack: () => void;
}

export default function TrackingManagerScreen({ onBack }: Props) {
  const today = useToday();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mutedColor = '#9ca3af';

  const label = {
    fontSize: 11, fontWeight: '600' as const,
    color: isDark ? '#f9fafb' : '#111827',
    textTransform: 'uppercase' as const, letterSpacing: 1.5,
  };
  const muted = {
    fontSize: 11, color: mutedColor,
    textTransform: 'uppercase' as const, letterSpacing: 1.5,
  };

  // ── Habits ──────────────────────────────────────────
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsLoading, setHabitsLoading] = useState(true);
  const [addingHabit, setAddingHabit] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitIcon, setHabitIcon] = useState<IconKey>('star');
  const [savingHabit, setSavingHabit] = useState(false);

  // ── Stats ────────────────────────────────────────────
  const [stats, setStats] = useState<StatDefinition[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [addingStat, setAddingStat] = useState(false);
  const [statLabel, setStatLabel] = useState('');
  const [statUnit, setStatUnit] = useState('');
  const [savingStat, setSavingStat] = useState(false);

  // ── Tasks ────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  useEffect(() => {
    loadHabits();
    loadStats();
    loadTasks();
  }, []);

  async function loadHabits() {
    try { setHabits(await fetchHabits()); } catch { /* silent */ } finally { setHabitsLoading(false); }
  }
  async function loadStats() {
    try { setStats(await fetchStatDefinitions()); } catch { /* silent */ } finally { setStatsLoading(false); }
  }
  async function loadTasks() {
    try { setTasks(await fetchTasksForDate(today)); } catch { /* silent */ } finally { setTasksLoading(false); }
  }

  // ── Habit actions ────────────────────────────────────
  async function handleAddHabit() {
    if (!habitName.trim()) return;
    setSavingHabit(true);
    try {
      const h = await createHabit(habitName.trim(), habitIcon);
      setHabits(prev => [...prev, h]);
      setHabitName('');
      setHabitIcon('star');
      setAddingHabit(false);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to add habit.');
    } finally {
      setSavingHabit(false);
    }
  }

  async function handleDeleteHabit(id: string) {
    Alert.alert('Delete habit?', 'This will remove all its entries too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteHabit(id);
            setHabits(prev => prev.filter(h => h.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err.message ?? 'Failed to delete.');
          }
        },
      },
    ]);
  }

  // ── Stat actions ─────────────────────────────────────
  async function handleAddStat() {
    if (!statLabel.trim()) return;
    setSavingStat(true);
    try {
      const s = await createStatDefinition(toStatKey(statLabel), statLabel.trim(), statUnit.trim());
      setStats(prev => [...prev, s]);
      setStatLabel('');
      setStatUnit('');
      setAddingStat(false);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to add stat.');
    } finally {
      setSavingStat(false);
    }
  }

  async function handleDeleteStat(id: string) {
    Alert.alert('Delete stat?', 'This will remove all its entries too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteStatDefinition(id);
            setStats(prev => prev.filter(s => s.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err.message ?? 'Failed to delete.');
          }
        },
      },
    ]);
  }

  async function handleToggleStat(stat: StatDefinition) {
    try {
      const updated = await toggleStatEnabled(stat.id, !stat.enabled);
      setStats(prev => prev.map(s => s.id === stat.id ? updated : s));
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update.');
    }
  }

  // ── Task actions ─────────────────────────────────────
  async function handleAddTask() {
    if (!taskTitle.trim()) return;
    setSavingTask(true);
    try {
      const t = await createTask(today, taskTitle.trim(), tasks.length);
      setTasks(prev => [...prev, t]);
      setTaskTitle('');
      setAddingTask(false);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to add task.');
    } finally {
      setSavingTask(false);
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to delete.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" style={isDark ? { backgroundColor: '#000000' } : undefined}>

      {/* Header */}
      <TouchableOpacity
        onPress={onBack}
        className={`flex-row items-center px-5 py-4 ${divider}`}
      >
        <Ionicons name="arrow-back" size={16} color={mutedColor} />
        <Text style={{ ...muted, marginLeft: 8 }}>Settings</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HABITS ── */}
        <SectionHeader label="Habits" />
        <View className={`border-t ${divider}`}>

          {habitsLoading ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={mutedColor} />
            </View>
          ) : habits.length === 0 && !addingHabit ? (
            <View className={`px-5 py-4 ${divider}`}>
              <Text style={muted}>No habits yet.</Text>
            </View>
          ) : habits.map(h => (
            <View key={h.id} className={`px-5 py-4 flex-row items-center justify-between ${divider}`}>
              <View className="flex-row items-center" style={{ gap: 10 }}>
                <Ionicons
                  name={ICON_MAP[h.iconKey as IconKey] ?? 'ellipse-outline'}
                  size={16}
                  color={mutedColor}
                />
                <Text style={label}>{h.name}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteHabit(h.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color={mutedColor} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add habit inline form */}
          {addingHabit ? (
            <View className={`px-5 py-4 ${divider}`} style={{ gap: 12 }}>
              <TextInput
                value={habitName}
                onChangeText={setHabitName}
                placeholder="HABIT NAME"
                placeholderTextColor={mutedColor}
                autoFocus
                returnKeyType="done"
                style={{
                  fontSize: 11, fontWeight: '600',
                  color: isDark ? '#f9fafb' : '#111827',
                  textTransform: 'uppercase', letterSpacing: 1.5,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#1f2937' : '#f3f4f6',
                }}
              />
              {/* Icon picker */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row" style={{ gap: 8 }}>
                  {ICON_KEYS.map(key => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setHabitIcon(key)}
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: habitIcon === key
                          ? (isDark ? '#374151' : '#e5e7eb')
                          : 'transparent',
                      }}
                    >
                      <Ionicons
                        name={ICON_MAP[key] ?? 'ellipse-outline'}
                        size={18}
                        color={habitIcon === key ? (isDark ? '#f9fafb' : '#111827') : mutedColor}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View className="flex-row justify-end" style={{ gap: 20 }}>
                <TouchableOpacity onPress={() => { setAddingHabit(false); setHabitName(''); setHabitIcon('star'); }}>
                  <Text style={muted}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddHabit} disabled={savingHabit}>
                  {savingHabit
                    ? <ActivityIndicator size="small" color={mutedColor} />
                    : <Text style={label}>Save</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className={`px-5 py-4 flex-row items-center ${divider}`}
              style={{ gap: 8 }}
              onPress={() => setAddingHabit(true)}
            >
              <Ionicons name="add" size={16} color={mutedColor} />
              <Text style={muted}>Add habit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── STATS ── */}
        <SectionHeader label="Stats" />
        <View className={`border-t ${divider}`}>

          {statsLoading ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={mutedColor} />
            </View>
          ) : stats.length === 0 && !addingStat ? (
            <View className={`px-5 py-4 ${divider}`}>
              <Text style={muted}>No stats yet.</Text>
            </View>
          ) : stats.map(s => (
            <View key={s.id} className={`px-5 py-4 flex-row items-center justify-between ${divider}`}>
              <View>
                <Text style={label}>{s.label}</Text>
                {s.unit ? (
                  <Text style={{ ...muted, fontSize: 9, marginTop: 2 }}>{s.unit}</Text>
                ) : null}
              </View>
              <View className="flex-row items-center" style={{ gap: 16 }}>
                <TouchableOpacity onPress={() => handleToggleStat(s)} hitSlop={8}>
                  <Ionicons
                    name={s.enabled ? 'toggle' : 'toggle-outline'}
                    size={26}
                    color={s.enabled ? (isDark ? '#f9fafb' : '#111827') : mutedColor}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteStat(s.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color={mutedColor} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add stat inline form */}
          {addingStat ? (
            <View className={`px-5 py-4 ${divider}`} style={{ gap: 12 }}>
              <TextInput
                value={statLabel}
                onChangeText={setStatLabel}
                placeholder="LABEL (E.G. WEIGHT)"
                placeholderTextColor={mutedColor}
                autoFocus
                style={{
                  fontSize: 11, fontWeight: '600',
                  color: isDark ? '#f9fafb' : '#111827',
                  textTransform: 'uppercase', letterSpacing: 1.5,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#1f2937' : '#f3f4f6',
                }}
              />
              <TextInput
                value={statUnit}
                onChangeText={setStatUnit}
                placeholder="UNIT (E.G. KG) — OPTIONAL"
                placeholderTextColor={mutedColor}
                style={{
                  fontSize: 11, fontWeight: '600',
                  color: isDark ? '#f9fafb' : '#111827',
                  textTransform: 'uppercase', letterSpacing: 1.5,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#1f2937' : '#f3f4f6',
                }}
              />
              <View className="flex-row justify-end" style={{ gap: 20 }}>
                <TouchableOpacity onPress={() => { setAddingStat(false); setStatLabel(''); setStatUnit(''); }}>
                  <Text style={muted}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddStat} disabled={savingStat}>
                  {savingStat
                    ? <ActivityIndicator size="small" color={mutedColor} />
                    : <Text style={label}>Save</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className={`px-5 py-4 flex-row items-center ${divider}`}
              style={{ gap: 8 }}
              onPress={() => setAddingStat(true)}
            >
              <Ionicons name="add" size={16} color={mutedColor} />
              <Text style={muted}>Add stat</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── TASKS (Today) ── */}
        <SectionHeader label="Today's Tasks" />
        <View className={`border-t ${divider}`}>

          {tasksLoading ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={mutedColor} />
            </View>
          ) : tasks.length === 0 && !addingTask ? (
            <View className={`px-5 py-4 ${divider}`}>
              <Text style={muted}>No tasks for today.</Text>
            </View>
          ) : tasks.map(t => (
            <View key={t.id} className={`px-5 py-4 flex-row items-center justify-between ${divider}`}>
              <Text style={{ ...label, flex: 1, marginRight: 16, color: t.completed ? mutedColor : (isDark ? '#f9fafb' : '#111827'), textDecorationLine: t.completed ? 'line-through' : 'none' }}>
                {t.title}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteTask(t.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color={mutedColor} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add task inline form */}
          {addingTask ? (
            <View className={`px-5 py-4 ${divider}`} style={{ gap: 12 }}>
              <TextInput
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="TASK TITLE"
                placeholderTextColor={mutedColor}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddTask}
                style={{
                  fontSize: 11, fontWeight: '600',
                  color: isDark ? '#f9fafb' : '#111827',
                  textTransform: 'uppercase', letterSpacing: 1.5,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#1f2937' : '#f3f4f6',
                }}
              />
              <View className="flex-row justify-end" style={{ gap: 20 }}>
                <TouchableOpacity onPress={() => { setAddingTask(false); setTaskTitle(''); }}>
                  <Text style={muted}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddTask} disabled={savingTask}>
                  {savingTask
                    ? <ActivityIndicator size="small" color={mutedColor} />
                    : <Text style={label}>Save</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className={`px-5 py-4 flex-row items-center ${divider}`}
              style={{ gap: 8 }}
              onPress={() => setAddingTask(true)}
            >
              <Ionicons name="add" size={16} color={mutedColor} />
              <Text style={muted}>Add task</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
