import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../controllers/AuthController';
import { updateUsername, uploadAvatar } from '../../controllers/ProfileController';
import Avatar from '../components/Avatar';

export default function ProfileScreen() {
  const { session, profile, refreshProfile } = useAuth();

  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  function cancelUsernameEdit() {
    setEditingUsername(false);
    setUsernameInput(profile?.username ?? '');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* Avatar + username */}
      <View className="flex-1 items-center pt-20 px-8">

        {/* Avatar */}
        <TouchableOpacity
          onPress={handleAvatarPress}
          disabled={uploadingAvatar}
          className="items-center mb-6"
        >
          {uploadingAvatar ? (
            <View
              className="bg-gray-100 items-center justify-center"
              style={{ width: 80, height: 80, borderRadius: 40 }}
            >
              <ActivityIndicator color="#9ca3af" />
            </View>
          ) : (
            <Avatar url={profile?.avatar_url} size={80} />
          )}
          <Text className="text-xs text-gray-400 mt-2">tap to change photo</Text>
        </TouchableOpacity>

        {/* Username */}
        {editingUsername ? (
          <View className="items-center" style={{ gap: 10 }}>
            <TextInput
              value={usernameInput}
              onChangeText={setUsernameInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleUsernameSave}
              className="text-xl font-semibold text-gray-900 text-center border-b border-gray-300 pb-1"
              style={{ minWidth: 140 }}
            />
            <View className="flex-row" style={{ gap: 20 }}>
              <TouchableOpacity onPress={cancelUsernameEdit}>
                <Text className="text-gray-400 text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUsernameSave} disabled={savingUsername}>
                {savingUsername ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : (
                  <Text className="text-gray-900 font-medium text-sm">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setEditingUsername(true)}
            className="items-center"
          >
            <Text className="text-xl font-semibold text-gray-900">
              {profile?.username ?? 'Set username'}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">tap to edit</Text>
          </TouchableOpacity>
        )}

      </View>

      {/* Sign out */}
      <View className="px-8 pb-6">
        <TouchableOpacity
          onPress={() => signOut()}
          className="border border-gray-200 rounded-xl items-center"
          style={{ paddingVertical: 14 }}
        >
          <Text className="text-gray-500 text-sm font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
