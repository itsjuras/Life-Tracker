import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { signOut, changePassword } from '../../controllers/AuthController';
import { updateUsername, uploadAvatar } from '../../controllers/ProfileController';
import Avatar from '../components/Avatar';

function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 pt-5 pb-2">
      {label}
    </Text>
  );
}

const divider = 'border-b border-gray-100 dark:border-gray-800';

interface Props {
  onEditTracking: () => void;
}

export default function SettingsScreen({ onEditTracking }: Props) {
  const { session, profile, refreshProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (profile?.username) setUsernameInput(profile.username);
  }, [profile?.username]);

  async function handleAvatarPress() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !session) return;

    setUploadingAvatar(true);
    try {
      await uploadAvatar(session.user.id, result.assets[0].uri);
      await refreshProfile();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleUsernameSave() {
    if (!session || !usernameInput.trim()) return;
    setSavingUsername(true);
    try {
      await updateUsername(session.user.id, usernameInput.trim());
      await refreshProfile();
      setEditingUsername(false);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update username.');
    } finally {
      setSavingUsername(false);
    }
  }

  async function handlePasswordSave() {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(newPassword);
      setChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  }

  function cancelPasswordEdit() {
    setChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
  }

  const label = () => ({
    fontSize: 11, fontWeight: '600' as const,
    color: isDark ? '#f9fafb' : '#111827',
    textTransform: 'uppercase' as const, letterSpacing: 1.5,
  });
  const muted = {
    fontSize: 11, color: '#9ca3af',
    textTransform: 'uppercase' as const, letterSpacing: 1.5,
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={isDark ? { backgroundColor: '#000000' } : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View className="items-center pt-6 pb-2">
          <TouchableOpacity onPress={handleAvatarPress} disabled={uploadingAvatar} className="mb-2">
            {uploadingAvatar ? (
              <View
                style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
              >
                <ActivityIndicator color="#9ca3af" />
              </View>
            ) : (
              <Avatar url={profile?.avatar_url} size={120} />
            )}
          </TouchableOpacity>
          <Text style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8 }}>tap to change photo</Text>
        </View>

        {/* Account */}
        <SectionHeader label="Account" />
        <View className={`border-t ${divider}`}>

          {/* Username */}
          <View className={`px-5 py-4 flex-row items-center justify-between ${divider}`}>
            <Text style={label()}>Username</Text>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              {editingUsername ? (
                <>
                  <TextInput
                    value={usernameInput}
                    onChangeText={setUsernameInput}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleUsernameSave}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{ fontSize: 14, color: '#9ca3af', textAlign: 'right', minWidth: 80 }}
                  />
                  <TouchableOpacity onPress={() => { setEditingUsername(false); setUsernameInput(profile?.username ?? ''); }} hitSlop={8}>
                    <Ionicons name="close-outline" size={16} color="#9ca3af" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleUsernameSave} disabled={savingUsername} hitSlop={8}>
                    {savingUsername
                      ? <ActivityIndicator size="small" color="#9ca3af" />
                      : <Ionicons name="checkmark-outline" size={16} color="#9ca3af" />
                    }
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity className="flex-row items-center" style={{ gap: 8 }} onPress={() => setEditingUsername(true)}>
                  <Text style={muted}>{profile?.username ?? '—'}</Text>
                  <Ionicons name="create-outline" size={14} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Email (read-only) */}
          <View className="px-5 py-4 flex-row items-center justify-between">
            <Text style={label()}>Email</Text>
            <Text style={muted}>
              {session?.user.email ?? '—'}
            </Text>
          </View>

        </View>

        {/* Appearance */}
        <SectionHeader label="Appearance" />
        <View className={`border-t ${divider}`}>
          <View className="px-5 py-4 flex-row items-center justify-between">
            <Text style={label()}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: '#374151' }}
              thumbColor="#ffffff"
              style={{ transform: [{ scale: 0.8 }] }}
            />
          </View>
        </View>

        {/* Security */}
        <SectionHeader label="Security" />
        <View className={`border-t ${divider}`}>
          {!changingPassword ? (
            <TouchableOpacity
              className="px-5 py-4 flex-row items-center justify-between"
              onPress={() => setChangingPassword(true)}
            >
              <Text style={label()}>Change Password</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : (
            <View className="px-5 py-4" style={{ gap: 12 }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="NEW PASSWORD"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showNewPw}
                  style={{ flex: 1, fontSize: 11, color: isDark ? '#f9fafb' : '#111827', letterSpacing: 1.5 }}
                />
                <TouchableOpacity onPress={() => setShowNewPw(v => !v)} hitSlop={8}>
                  <Ionicons name={showNewPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="CONFIRM NEW PASSWORD"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPw}
                  style={{ flex: 1, fontSize: 11, color: isDark ? '#f9fafb' : '#111827', letterSpacing: 1.5 }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPw(v => !v)} hitSlop={8}>
                  <Ionicons name={showConfirmPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-end" style={{ gap: 20 }}>
                <TouchableOpacity onPress={cancelPasswordEdit}>
                  <Text style={muted}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePasswordSave} disabled={savingPassword}>
                  {savingPassword
                    ? <ActivityIndicator size="small" color="#9ca3af" />
                    : <Text style={label()}>Save</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Tracking */}
        <SectionHeader label="Tracking" />
        <View className={`border-t ${divider}`}>
          <TouchableOpacity
            className="px-5 py-4 flex-row items-center justify-between"
            onPress={onEditTracking}
          >
            <Text style={label()}>Edit Daily Tracking</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          onPress={() => signOut()}
          activeOpacity={0.6}
          style={{ alignSelf: 'center', marginTop: 28, marginBottom: 40 }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}>
            Sign Out
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
