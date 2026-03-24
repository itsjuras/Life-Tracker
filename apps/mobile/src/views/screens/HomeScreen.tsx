import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Animated, LayoutAnimation, useWindowDimensions, Keyboard,
  Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useTheme, hexToRgba } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToday } from '../../hooks/useToday';
import { useNavigation } from '@react-navigation/native';
import { fetchHabits, fetchEntriesForDate, toggleHabitEntry, createHabit } from '../../controllers/HabitController';
import { fetchTasksForDate, createTask, toggleTask } from '../../controllers/TaskController';
import { fetchStatDefinitions, logStatEntry, fetchAllStatEntriesForDate, createStatDefinition } from '../../controllers/StatController';
import { fetchReflection, saveReflection } from '../../controllers/ReflectionController';
import { Habit } from '../../models/Habit';
import { Task } from '../../models/Task';
import { StatDefinition } from '../../models/Stat';
import { ICON_MAP, ICON_KEYS, IconKey } from '../../constants/icons';

// ── Glass card base style ─────────────────────────────────────────────────────
function glassCard(isDark: boolean) {
  return {
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#f9fafb',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.11)' : 'rgba(209,213,219,0.7)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.22 : 0.06,
    shadowRadius: 6,
    elevation: 2,
  };
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 pt-6 pb-3">
      {label}
    </Text>
  );
}

// ── Shared modal sheet wrapper ────────────────────────────────────────────────
function ModalSheet({
  visible, isDark, onClose, title, children,
}: {
  visible: boolean; isDark: boolean; onClose: () => void;
  title: string; children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
          onPress={onClose}
        >
          <Pressable
            style={{
              width: 320,
              backgroundColor: isDark ? '#111111' : '#ffffff',
              borderRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 28,
            }}
            onPress={() => {}}
          >
            <Text style={{
              fontSize: 11, fontWeight: '600',
              color: isDark ? '#f9fafb' : '#111827',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              textAlign: 'center',
              marginBottom: 20,
            }}>
              {title}
            </Text>
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <Text style={{
      fontSize: 11, fontWeight: '600',
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 8,
    }}>
      {text}
    </Text>
  );
}

function ModalButtons({
  isDark, onCancel, onConfirm, confirmLabel, confirmEnabled, saving,
}: {
  isDark: boolean; onCancel: () => void; onConfirm: () => void;
  confirmLabel: string; confirmEnabled: boolean; saving: boolean;
}) {
  const { accentColor } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
      <TouchableOpacity
        onPress={onCancel}
        style={{
          flex: 1, paddingVertical: 14, borderRadius: 12,
          alignItems: 'center',
          backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '500', color: isDark ? 'rgba(255,255,255,0.55)' : '#6b7280' }}>
          Cancel
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onConfirm}
        disabled={!confirmEnabled || saving}
        style={{
          flex: 1, paddingVertical: 14, borderRadius: 12,
          alignItems: 'center',
          backgroundColor: confirmEnabled ? accentColor : (isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'),
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Text style={{
          fontSize: 15, fontWeight: '600',
          color: confirmEnabled ? '#fff' : (isDark ? 'rgba(255,255,255,0.25)' : '#9ca3af'),
        }}>
          {saving ? 'Creating…' : confirmLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── CreateHabitModal ──────────────────────────────────────────────────────────
function CreateHabitModal({
  isDark, visible, onClose, onCreate,
}: {
  isDark: boolean; visible: boolean;
  onClose: () => void; onCreate: (h: Habit) => void;
}) {
  const { accentColor } = useTheme();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconKey>('heart');
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setName(''); setSelectedIcon('heart'); setSaving(false);
    Keyboard.dismiss();
    onClose();
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const habit = await createHabit(trimmed, selectedIcon);
      onCreate(habit);
      setName(''); setSelectedIcon('heart');
      onClose();
    } catch { /* silent */ } finally { setSaving(false); }
  };

  return (
    <ModalSheet visible={visible} isDark={isDark} onClose={handleClose} title="New Habit">
      <FieldLabel text="Name" />
      <TextInput
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleCreate}
        placeholder="e.g. Morning run"
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'}
        autoFocus
        returnKeyType="done"
        blurOnSubmit={false}
        style={{
          ...glassCard(isDark),
          paddingVertical: 12,
          paddingHorizontal: 14,
          fontSize: 15,
          color: isDark ? '#f9fafb' : '#111827',
          marginBottom: 20,
        }}
      />
      <FieldLabel text="Icon" />
      <ScrollView style={{ maxHeight: 168 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 4, justifyContent: 'center' }}>
          {ICON_KEYS.map(key => {
            const isSelected = key === selectedIcon;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedIcon(key)}
                style={{
                  width: 42, height: 42, borderRadius: 10,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isSelected
                    ? hexToRgba(accentColor, 0.18)
                    : (isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'),
                  borderWidth: 1.5,
                  borderColor: isSelected ? hexToRgba(accentColor, 0.5) : 'transparent',
                }}
              >
                <Ionicons
                  name={ICON_MAP[key]}
                  size={20}
                  color={isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)')}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <ModalButtons
        isDark={isDark}
        onCancel={handleClose}
        onConfirm={handleCreate}
        confirmLabel="Create"
        confirmEnabled={!!name.trim()}
        saving={saving}
      />
    </ModalSheet>
  );
}

// ── CreateTaskModal ───────────────────────────────────────────────────────────
function CreateTaskModal({
  isDark, visible, today, sortOrder, onClose, onCreate,
}: {
  isDark: boolean; visible: boolean; today: string; sortOrder: number;
  onClose: () => void; onCreate: (t: Task) => void;
}) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setTitle(''); setSaving(false);
    Keyboard.dismiss();
    onClose();
  };

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const task = await createTask(today, trimmed, sortOrder);
      onCreate(task);
      setTitle('');
      onClose();
    } catch { /* silent */ } finally { setSaving(false); }
  };

  return (
    <ModalSheet visible={visible} isDark={isDark} onClose={handleClose} title="New Task">
      <FieldLabel text="Title" />
      <TextInput
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleCreate}
        placeholder="What needs to get done?"
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'}
        autoFocus
        returnKeyType="done"
        blurOnSubmit={false}
        style={{
          ...glassCard(isDark),
          paddingVertical: 12,
          paddingHorizontal: 14,
          fontSize: 15,
          color: isDark ? '#f9fafb' : '#111827',
        }}
      />
      <ModalButtons
        isDark={isDark}
        onCancel={handleClose}
        onConfirm={handleCreate}
        confirmLabel="Create"
        confirmEnabled={!!title.trim()}
        saving={saving}
      />
    </ModalSheet>
  );
}

// ── CreateStatModal ───────────────────────────────────────────────────────────
function CreateStatModal({
  isDark, visible, onClose, onCreate,
}: {
  isDark: boolean; visible: boolean;
  onClose: () => void; onCreate: (s: StatDefinition) => void;
}) {
  const [label, setLabel] = useState('');
  const [unit, setUnit] = useState('');
  const [saving, setSaving] = useState(false);
  const unitRef = useRef<TextInput>(null);

  const handleClose = () => {
    setLabel(''); setUnit(''); setSaving(false);
    Keyboard.dismiss();
    onClose();
  };

  const handleCreate = async () => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel || saving) return;
    const key = trimmedLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setSaving(true);
    try {
      const stat = await createStatDefinition(key, trimmedLabel, unit.trim());
      onCreate(stat);
      setLabel(''); setUnit('');
      onClose();
    } catch { /* silent */ } finally { setSaving(false); }
  };

  return (
    <ModalSheet visible={visible} isDark={isDark} onClose={handleClose} title="New Stat">
      <FieldLabel text="Label" />
      <TextInput
        value={label}
        onChangeText={setLabel}
        onSubmitEditing={() => unitRef.current?.focus()}
        placeholder="e.g. Weight"
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'}
        autoFocus
        returnKeyType="next"
        blurOnSubmit={false}
        style={{
          ...glassCard(isDark),
          paddingVertical: 12,
          paddingHorizontal: 14,
          fontSize: 15,
          color: isDark ? '#f9fafb' : '#111827',
          marginBottom: 16,
        }}
      />
      <FieldLabel text="Unit (optional)" />
      <TextInput
        ref={unitRef}
        value={unit}
        onChangeText={setUnit}
        onSubmitEditing={handleCreate}
        placeholder="e.g. kg, min, hours"
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'}
        returnKeyType="done"
        blurOnSubmit={false}
        style={{
          ...glassCard(isDark),
          paddingVertical: 12,
          paddingHorizontal: 14,
          fontSize: 15,
          color: isDark ? '#f9fafb' : '#111827',
        }}
      />
      <ModalButtons
        isDark={isDark}
        onCancel={handleClose}
        onConfirm={handleCreate}
        confirmLabel="Create"
        confirmEnabled={!!label.trim()}
        saving={saving}
      />
    </ModalSheet>
  );
}

// ── HabitCell — glass icon that pops green then fades away on press ───────────
function HabitCell({
  habit, isDark, cellSize, completed, onComplete, onUndo,
}: {
  habit: Habit; isDark: boolean; cellSize: number;
  completed?: boolean;
  onComplete: (id: string) => void;
  onUndo?: (id: string) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [activated, setActivated] = useState(false);

  const { accentColor } = useTheme();
  const iconName = ICON_MAP[habit.iconKey as keyof typeof ICON_MAP] ?? 'ellipse-outline';
  const isGreen = completed || activated;

  const handlePress = () => {
    if (completed) { onUndo?.(habit.id); return; }
    setActivated(true);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(scale, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]),
    ]).start(() => onComplete(habit.id));
  };

  return (
    <Animated.View style={{ width: cellSize, alignItems: 'center', transform: [{ scale }], opacity }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={{
          width: cellSize,
          height: cellSize,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isGreen
            ? hexToRgba(accentColor, 0.18)
            : (isDark ? 'rgba(255,255,255,0.07)' : '#f9fafb'),
          borderWidth: 1,
          borderColor: isGreen
            ? hexToRgba(accentColor, 0.4)
            : (isDark ? 'rgba(255,255,255,0.11)' : 'rgba(209,213,219,0.7)'),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.22 : 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <Ionicons
          name={iconName}
          size={Math.floor(cellSize * 0.38)}
          color={isGreen ? accentColor : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.38)')}
        />
      </TouchableOpacity>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 9,
          marginTop: 5,
          color: isGreen ? hexToRgba(accentColor, 0.6) : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'),
          maxWidth: cellSize,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {habit.name}
      </Text>
    </Animated.View>
  );
}

// ── TaskCard — glass rectangle that pops and disappears on press ──────────────
function TaskCard({
  task, isDark, completed, onComplete, onUndo,
}: {
  task: Task; isDark: boolean;
  completed?: boolean;
  onComplete: (id: string) => void;
  onUndo?: (id: string) => void;
}) {
  const { accentColor } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [activated, setActivated] = useState(false);
  const isGreen = completed || activated;

  const handlePress = () => {
    if (completed) { onUndo?.(task.id); return; }
    setActivated(true);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.04, duration: 90, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.88, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => onComplete(task.id));
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={{
          ...glassCard(isDark),
          height: 50,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          ...(isGreen ? {
            backgroundColor: hexToRgba(accentColor, 0.12),
            borderColor: hexToRgba(accentColor, 0.35),
          } : {}),
        }}
      >
        <View style={{
          width: 18, height: 18, borderRadius: 9,
          borderWidth: 1.5,
          borderColor: isGreen ? accentColor : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'),
          backgroundColor: isGreen ? hexToRgba(accentColor, 0.2) : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isGreen && <Ionicons name="checkmark" size={11} color={accentColor} />}
        </View>
        <Text style={{
          flex: 1, fontSize: 11,
          color: isGreen ? hexToRgba(accentColor, 0.85) : (isDark ? '#f9fafb' : '#111827'),
          textDecorationLine: completed ? 'line-through' : 'none',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          fontWeight: '600',
        }}>
          {task.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── StatCard — glass input card that pops and disappears on value submit ──────
function StatCard({
  stat, isDark, today, completed, completedValue, onSubmitted, onUndo, initialValue,
}: {
  stat: StatDefinition; isDark: boolean; today: string;
  completed?: boolean;
  completedValue?: number;
  onSubmitted: (id: string, value: number) => void;
  onUndo?: (id: string) => void;
  initialValue?: number;
}) {
  const { accentColor } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [value, setValue] = useState(initialValue !== undefined ? String(initialValue) : '');
  const submittedRef = useRef(false);

  const handleSubmit = () => {
    if (submittedRef.current) return;
    const val = parseFloat(value.trim());
    if (isNaN(val)) return;
    submittedRef.current = true;
    logStatEntry(stat.id, today, val).catch(() => { /* silent */ });
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.03, duration: 90, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.88, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => onSubmitted(stat.id, val));
  };

  if (completed) {
    return (
      <TouchableOpacity onPress={() => onUndo?.(stat.id)} activeOpacity={0.7} disabled={!onUndo}>
        <View style={{
          ...glassCard(isDark),
          backgroundColor: hexToRgba(accentColor, 0.07),
          borderColor: hexToRgba(accentColor, 0.25),
          height: 50,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: hexToRgba(accentColor, 0.7), textDecorationLine: 'line-through', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {stat.label}
            </Text>
            {stat.unit ? (
              <Text style={{ fontSize: 9, color: '#9ca3af', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 }}>{stat.unit}</Text>
            ) : null}
          </View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: hexToRgba(accentColor, 0.8) }}>
            {completedValue !== undefined ? String(completedValue) : '✓'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <View style={{
        ...glassCard(isDark),
        height: 50,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#f9fafb' : '#111827', textTransform: 'uppercase', letterSpacing: 1.5 }}>{stat.label}</Text>
          {stat.unit ? (
            <Text style={{ fontSize: 9, color: '#9ca3af', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 }}>{stat.unit}</Text>
          ) : null}
        </View>
        <TextInput
          value={value}
          onChangeText={setValue}
          onSubmitEditing={handleSubmit}
          placeholder="—"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          returnKeyType="done"
          style={{
            fontSize: 15,
            color: isDark ? '#f9fafb' : '#111827',
            textAlign: 'right',
            minWidth: 60,
          }}
        />
      </View>
    </Animated.View>
  );
}

// ── ReflectionPage — full-screen solo entry ───────────────────────────────────
function ReflectionPage({
  isDark, today, initialText, onSaved, onDismiss,
}: {
  isDark: boolean; today: string; initialText?: string; onSaved: (text: string) => void; onDismiss: () => void;
}) {
  const { accentColor } = useTheme();
  const [text, setText] = useState(initialText ?? '');
  const [saving, setSaving] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const MAX_WORDS = 10;

  const handleChange = (val: string) => {
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length > MAX_WORDS) return;
    setText(val);
  };

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await saveReflection(today, trimmed);
      onSaved(trimmed);
    } catch { /* silent */ } finally { setSaving(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <TouchableOpacity onPress={onDismiss} hitSlop={8}>
          <Ionicons name="close" size={20} color={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
        <TextInput
          value={text}
          onChangeText={handleChange}
          placeholder="TODAY'S HIGHLIGHT"
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
          multiline
          autoFocus
          blurOnSubmit
          onSubmitEditing={handleSave}
          style={{
            fontSize: 20,
            fontWeight: '500',
            color: isDark ? '#f9fafb' : '#111827',
            textAlignVertical: 'top',
            paddingVertical: 4,
          }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.3)' }}>
            {wordCount} / {MAX_WORDS}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!text.trim() || saving}
            style={{
              paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
              backgroundColor: text.trim() ? accentColor : (isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'),
            }}
          >
            <Text style={{
              fontSize: 15, fontWeight: '600',
              color: text.trim() ? '#fff' : (isDark ? 'rgba(255,255,255,0.25)' : '#9ca3af'),
            }}>
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const today = useToday();
  const { width: screenWidth } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const { accentColor } = useTheme();
  const { session } = useAuth();
  const navigation = useNavigation<any>();
  const isDark = colorScheme === 'dark';
  const mutedColor = '#9ca3af';

  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabitIds, setCompletedHabitIds] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<StatDefinition[]>([]);
  const [submittedStatIds, setSubmittedStatIds] = useState<Set<string>>(new Set());
  const [statEntryValues, setStatEntryValues] = useState<Map<string, number>>(new Map());
  const [modalOpen, setModalOpen] = useState<'habit' | 'task' | 'stat' | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [hasReflection, setHasReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflectionEditOpen, setReflectionEditOpen] = useState(false);
  const [reflectionDismissed, setReflectionDismissed] = useState(false);

  const HABIT_GAP = 12;
  const HABIT_PADDING = 20;
  const HABIT_COLS = 4;
  const cellSize = Math.floor(
    (screenWidth - HABIT_PADDING * 2 - HABIT_GAP * (HABIT_COLS - 1)) / HABIT_COLS
  );

  useEffect(() => { loadAll(); }, [today]);

  async function loadAll() {
    setLoading(true);
    try {
      const [h, e, t, s, se, reflection] = await Promise.all([
        fetchHabits(),
        fetchEntriesForDate(today),
        fetchTasksForDate(today),
        fetchStatDefinitions(),
        fetchAllStatEntriesForDate(today),
        fetchReflection(today),
      ]);
      setHabits(h);
      setCompletedHabitIds(new Set(e.filter(en => en.completed).map(en => en.habitId)));
      setTasks(t);
      setCompletedTaskIds(new Set(t.filter(tk => tk.completed).map(tk => tk.id)));
      setStats(s.filter(st => st.enabled));
      setSubmittedStatIds(new Set(se.map(en => en.statDefinitionId)));
      const valueMap = new Map<string, number>();
      se.forEach(en => valueMap.set(en.statDefinitionId, en.value));
      setStatEntryValues(valueMap);
      setHasReflection(!!reflection);
      setReflectionText(reflection?.text ?? '');
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  const pendingHabits = habits.filter(h => !completedHabitIds.has(h.id));
  const pendingTasks = tasks.filter(t => !completedTaskIds.has(t.id));
  const pendingStats = stats.filter(s => !submittedStatIds.has(s.id));

  async function handleHabitComplete(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCompletedHabitIds(prev => new Set([...prev, id]));
    try { await toggleHabitEntry(id, today, true); } catch {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCompletedHabitIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  async function handleHabitUndo(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCompletedHabitIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    try { await toggleHabitEntry(id, today, false); } catch {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCompletedHabitIds(prev => new Set([...prev, id]));
    }
  }

  async function handleTaskComplete(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCompletedTaskIds(prev => new Set([...prev, id]));
    try { await toggleTask(id, true); } catch {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCompletedTaskIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  async function handleTaskUndo(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCompletedTaskIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    try { await toggleTask(id, false); } catch {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCompletedTaskIds(prev => new Set([...prev, id]));
    }
  }

  function handleStatSubmitted(id: string, value: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSubmittedStatIds(prev => new Set([...prev, id]));
    setStatEntryValues(prev => new Map([...prev, [id, value]]));
  }

  function handleStatUndo(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSubmittedStatIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  function handleHabitCreated(habit: Habit) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHabits(prev => [...prev, habit]);
  }

  function handleTaskCreated(task: Task) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks(prev => [...prev, task]);
  }

  function handleStatCreated(stat: StatDefinition) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStats(prev => [...prev, stat]);
  }

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white" style={isDark ? { backgroundColor: '#000000' } : undefined}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 88 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.6}>
            <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center" style={isDark ? { backgroundColor: '#000000' } : undefined}>
        <ActivityIndicator color={mutedColor} />
      </SafeAreaView>
    );
  }

  // Shared dashed "+" button style for full-width cards
  const plusCardStyle = {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderStyle: 'dashed' as const,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
  };

  const plusTextStyle = {
    fontSize: 22,
    lineHeight: 24,
    color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
  };

  const allHabitsTasksDone = pendingHabits.length === 0 && pendingTasks.length === 0;
  const hasItemsToComplete = habits.length > 0 || tasks.length > 0;
  const showReflectionCard = !editMode && !hasReflection && !reflectionDismissed && (reflectionOpen || (allHabitsTasksDone && hasItemsToComplete));
  const showDone = !editMode && hasReflection;
  const showEndDay = !editMode && !hasReflection && !showReflectionCard;

  return (
    <SafeAreaView className="flex-1 bg-white" style={isDark ? { backgroundColor: '#000000' } : undefined}>
      {(showReflectionCard || reflectionEditOpen) ? (
        <ReflectionPage
          isDark={isDark}
          today={today}
          initialText={reflectionEditOpen ? reflectionText : undefined}
          onSaved={(text) => { setHasReflection(true); setReflectionText(text); setReflectionOpen(false); setReflectionDismissed(false); setReflectionEditOpen(false); }}
          onDismiss={() => { setReflectionOpen(false); setReflectionDismissed(true); setReflectionEditOpen(false); }}
        />
      ) : (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          {showDone ? (
            <TouchableOpacity
              onPress={() => { setHasReflection(false); setReflectionText(''); setReflectionDismissed(false); }}
              hitSlop={12}
              activeOpacity={0.5}
            >
              <Ionicons name="chevron-back" size={22} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {!showDone && (
            <TouchableOpacity onPress={() => setEditMode(e => !e)} hitSlop={8}>
              <Ionicons
                name={editMode ? 'create' : 'create-outline'}
                size={18}
                color={editMode ? accentColor : mutedColor}
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 112, flexGrow: 1 }}
        >
          <>
              {/* ── HABITS ── */}
              {!showDone && (pendingHabits.length > 0 || editMode) && (
                <View>
                  <SectionHeader label="Habits" />
                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    paddingHorizontal: HABIT_PADDING,
                    gap: HABIT_GAP,
                    paddingBottom: 4,
                  }}>
                    {pendingHabits.map(habit => (
                      <HabitCell
                        key={habit.id}
                        habit={habit}
                        isDark={isDark}
                        cellSize={cellSize}
                        onComplete={handleHabitComplete}
                      />
                    ))}
                    {editMode && habits.filter(h => completedHabitIds.has(h.id)).map(habit => (
                      <HabitCell
                        key={`done-${habit.id}`}
                        habit={habit}
                        isDark={isDark}
                        cellSize={cellSize}
                        completed
                        onComplete={handleHabitComplete}
                        onUndo={handleHabitUndo}
                      />
                    ))}
                    {editMode && (
                      <TouchableOpacity
                        onPress={() => setModalOpen('habit')}
                        activeOpacity={0.7}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          borderRadius: 16,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderStyle: 'dashed',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
                        }}
                      >
                        <Text style={{
                          fontSize: Math.floor(cellSize * 0.35),
                          lineHeight: Math.floor(cellSize * 0.38),
                          color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                        }}>
                          +
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* ── TASKS ── */}
              {!showDone && (pendingTasks.length > 0 || editMode) && (
                <View>
                  <SectionHeader label="Tasks" />
                  <View style={{ paddingHorizontal: 16, gap: 10 }}>
                    {pendingTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isDark={isDark}
                        onComplete={handleTaskComplete}
                      />
                    ))}
                    {editMode && tasks.filter(t => completedTaskIds.has(t.id)).map(task => (
                      <TaskCard
                        key={`done-${task.id}`}
                        task={task}
                        isDark={isDark}
                        completed
                        onComplete={handleTaskComplete}
                        onUndo={handleTaskUndo}
                      />
                    ))}
                    {editMode && (
                      <TouchableOpacity onPress={() => setModalOpen('task')} activeOpacity={0.7} style={plusCardStyle}>
                        <Text style={plusTextStyle}>+</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* ── STATS ── */}
              {!showDone && (pendingStats.length > 0 || editMode) && (
                <View>
                  <SectionHeader label="Stats" />
                  <View style={{ paddingHorizontal: 16, gap: 10 }}>
                    {pendingStats.map(stat => (
                      <StatCard
                        key={stat.id}
                        stat={stat}
                        isDark={isDark}
                        today={today}
                        onSubmitted={handleStatSubmitted}
                        initialValue={statEntryValues.get(stat.id)}
                      />
                    ))}
                    {editMode && stats.filter(s => submittedStatIds.has(s.id)).map(stat => (
                      <StatCard
                        key={`done-${stat.id}`}
                        stat={stat}
                        isDark={isDark}
                        today={today}
                        completed
                        completedValue={statEntryValues.get(stat.id)}
                        onSubmitted={handleStatSubmitted}
                        onUndo={handleStatUndo}
                      />
                    ))}
                    {editMode && (
                      <TouchableOpacity onPress={() => setModalOpen('stat')} activeOpacity={0.7} style={plusCardStyle}>
                        <Text style={plusTextStyle}>+</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
              {/* ── REFLECTION (edit mode) ── */}
              {editMode && hasReflection && (
                <View>
                  <SectionHeader label="Reflection" />
                  <View style={{ paddingHorizontal: 16 }}>
                    <TouchableOpacity onPress={() => setReflectionEditOpen(true)} activeOpacity={0.7}>
                      <View style={{
                        ...glassCard(isDark),
                        backgroundColor: hexToRgba(accentColor, 0.07),
                        borderColor: hexToRgba(accentColor, 0.25),
                        height: 50,
                        paddingHorizontal: 18,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: hexToRgba(accentColor, 0.7), textTransform: 'uppercase', letterSpacing: 1.5 }}>
                          {reflectionText}
                        </Text>
                        <Ionicons name="create-outline" size={14} color={hexToRgba(accentColor, 0.6)} style={{ marginLeft: 10 }} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {/* ── END DAY ── */}
              {showEndDay && (
                <TouchableOpacity
                  onPress={() => { setReflectionOpen(true); setReflectionDismissed(false); }}
                  style={{ alignSelf: 'center', marginTop: 28, marginBottom: 8 }}
                  activeOpacity={0.6}
                >
                  <Text style={{
                    fontSize: 11, letterSpacing: 3, fontWeight: '600',
                    textTransform: 'uppercase',
                    color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                  }}>
                    end day
                  </Text>
                </TouchableOpacity>
              )}

              {/* ── DONE ── */}
              {showDone && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 32, fontWeight: '700', color: isDark ? '#f9fafb' : '#111827', letterSpacing: 8, textTransform: 'uppercase' }}>
                    done.
                  </Text>
                </View>
              )}
            </>
        </ScrollView>
      </KeyboardAvoidingView>
      )}

      {/* Creation modals */}
      <CreateHabitModal
        isDark={isDark}
        visible={modalOpen === 'habit'}
        onClose={() => setModalOpen(null)}
        onCreate={handleHabitCreated}
      />
      <CreateTaskModal
        isDark={isDark}
        visible={modalOpen === 'task'}
        today={today}
        sortOrder={tasks.length}
        onClose={() => setModalOpen(null)}
        onCreate={handleTaskCreated}
      />
      <CreateStatModal
        isDark={isDark}
        visible={modalOpen === 'stat'}
        onClose={() => setModalOpen(null)}
        onCreate={handleStatCreated}
      />
    </SafeAreaView>
  );
}
