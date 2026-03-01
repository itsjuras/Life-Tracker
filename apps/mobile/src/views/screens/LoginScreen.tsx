import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signIn, signUp } from '../../controllers/AuthController';

type Mode = 'signin' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [identifier, setIdentifier] = useState(''); // email or username (sign in)
  const [email, setEmail] = useState('');            // email (sign up)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (mode === 'signin') {
      if (!identifier.trim() || !password) {
        setError('Please fill in all fields.');
        return;
      }
    } else {
      if (!email.trim() || !username.trim() || !password) {
        setError('Please fill in all fields.');
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        setError('Username can only contain letters, numbers, and underscores.');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(identifier.trim(), password);
      } else {
        await signUp(email.trim(), password, username.trim());
        setInfo('Account created! Sign in below.');
        switchMode('signin');
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-8 pt-16 pb-10">

            {/* Header */}
            <View className="mb-12">
              <Text className="text-3xl font-semibold tracking-tight text-gray-900">
                Life Tracker
              </Text>
              <Text className="text-sm text-gray-400 mt-1">
                Track your daily life, simply.
              </Text>
            </View>

            {/* Mode toggle */}
            <View className="flex-row mb-8">
              {(['signin', 'signup'] as Mode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => switchMode(m)}
                  className="mr-6 pb-2"
                >
                  <Text
                    className={`text-sm font-medium ${
                      mode === m ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {m === 'signin' ? 'Sign In' : 'Create Account'}
                  </Text>
                  {mode === m && (
                    <View className="h-px bg-gray-900 mt-1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Inputs */}
            <View className="mb-5" style={{ gap: 12 }}>
              {mode === 'signin' ? (
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="Email or Username"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
                  style={{ paddingVertical: 14 }}
                />
              ) : (
                <>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
                    style={{ paddingVertical: 14 }}
                  />
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base"
                    style={{ paddingVertical: 14 }}
                  />
                </>
              )}
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4" style={{ paddingVertical: 14 }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-gray-900 text-base"
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {mode === 'signup' && (
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4" style={{ paddingVertical: 14 }}>
                  <TextInput
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showConfirm}
                    className="flex-1 text-gray-900 text-base"
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Feedback */}
            {error && (
              <Text className="text-red-500 text-sm mb-4">{error}</Text>
            )}
            {info && (
              <Text className="text-gray-500 text-sm mb-4">{info}</Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="bg-gray-900 rounded-xl items-center"
              style={{ paddingVertical: 15 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-medium text-base">
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
