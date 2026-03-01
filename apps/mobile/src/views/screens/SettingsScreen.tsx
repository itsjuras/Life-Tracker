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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View className="items-center pt-6 pb-2">
          <TouchableOpacity onPress={handleAvatarPress} disabled={uploadingAvatar} className="mb-2">
            {uploadingAvatar ? (
              <View
                className="bg-gray-100 dark:bg-gray-800 items-center justify-center"
                style={{ width: 120, height: 120, borderRadius: 60 }}
              >
                <ActivityIndicator color="#9ca3af" />
              </View>
            ) : (
              <Avatar url={profile?.avatar_url} size={120} />
            )}
          </TouchableOpacity>
          <Text className="text-xs text-gray-400 dark:text-gray-500">tap to change photo</Text>
        </View>

        {/* Account */}
        <SectionHeader label="Account" />
        <View className={`border-t ${divider}`}>

          {/* Username */}
          <View className={`px-5 py-4 ${divider}`}>
            {editingUsername ? (
              <View style={{ gap: 10 }}>
                <TextInput
                  value={usernameInput}
                  onChangeText={setUsernameInput}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleUsernameSave}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="text-base text-gray-900 dark:text-white"
                />
                <View className="flex-row" style={{ gap: 20 }}>
                  <TouchableOpacity onPress={() => { setEditingUsername(false); setUsernameInput(profile?.username ?? ''); }}>
                    <Text className="text-gray-400 dark:text-gray-500 text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleUsernameSave} disabled={savingUsername}>
                    {savingUsername
                      ? <ActivityIndicator size="small" color="#9ca3af" />
                      : <Text className="text-gray-900 dark:text-white font-medium text-sm">Save</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-row items-center justify-between"
                onPress={() => setEditingUsername(true)}
              >
                <Text className="text-sm text-gray-500 dark:text-gray-400">Username</Text>
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  <Text className="text-base text-gray-900 dark:text-white">
                    {profile?.username ?? '—'}
                  </Text>
                  <Ionicons name="pencil-outline" size={14} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Email (read-only) */}
          <View className="px-5 py-4 flex-row items-center justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Email</Text>
            <Text className="text-base text-gray-400 dark:text-gray-500">
              {session?.user.email ?? '—'}
            </Text>
          </View>

        </View>

        {/* Appearance */}
        <SectionHeader label="Appearance" />
        <View className={`border-t ${divider}`}>
          <View className="px-5 py-4 flex-row items-center justify-between">
            <Text className="text-base text-gray-900 dark:text-white">Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: '#374151' }}
              thumbColor="#ffffff"
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
              <Text className="text-base text-gray-900 dark:text-white">Change Password</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : (
            <View className="px-5 py-4" style={{ gap: 12 }}>
              <View
                className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4"
                style={{ paddingVertical: 12 }}
              >
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showNewPw}
                  className="flex-1 text-gray-900 dark:text-white text-base"
                />
                <TouchableOpacity onPress={() => setShowNewPw(v => !v)} hitSlop={8}>
                  <Ionicons name={showNewPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <View
                className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4"
                style={{ paddingVertical: 12 }}
              >
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPw}
                  className="flex-1 text-gray-900 dark:text-white text-base"
                />
                <TouchableOpacity onPress={() => setShowConfirmPw(v => !v)} hitSlop={8}>
                  <Ionicons name={showConfirmPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-end" style={{ gap: 20 }}>
                <TouchableOpacity onPress={cancelPasswordEdit}>
                  <Text className="text-gray-400 dark:text-gray-500 text-sm">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePasswordSave} disabled={savingPassword}>
                  {savingPassword
                    ? <ActivityIndicator size="small" color="#9ca3af" />
                    : <Text className="text-gray-900 dark:text-white font-medium text-sm">Save</Text>
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
            <Text className="text-base text-gray-900 dark:text-white">Edit Daily Tracking</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <View className="px-5 pt-8 pb-10">
          <TouchableOpacity
            onPress={() => signOut()}
            className="border border-gray-200 dark:border-gray-700 rounded-xl items-center"
            style={{ paddingVertical: 14 }}
          >
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
