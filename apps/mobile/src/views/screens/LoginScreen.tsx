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
import { useColorScheme } from 'nativewind';
import { signIn, signUp } from '../../controllers/AuthController';

type Mode = 'signin' | 'signup';

export default function LoginScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [mode, setMode] = useState<Mode>('signin');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const labelColor = isDark ? '#f9fafb' : '#111827';
  const mutedColor = '#9ca3af';
  const inputBg = isDark ? '#1a1a1a' : '#f3f4f6';
  const dividerColor = isDark ? '#1f2937' : '#f3f4f6';

  const labelStyle = {
    fontSize: 11, fontWeight: '600' as const,
    color: labelColor,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  };
  const mutedStyle = {
    fontSize: 11, color: mutedColor,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  };
  const inputTextStyle = {
    flex: 1,
    fontSize: 11, fontWeight: '600' as const,
    color: labelColor,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  };

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (mode === 'signin') {
      if (!identifier.trim() || !password) { setError('Please fill in all fields.'); return; }
    } else {
      if (!email.trim() || !username.trim() || !password) { setError('Please fill in all fields.'); return; }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError('Username can only contain letters, numbers, and underscores.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

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
    <SafeAreaView className="flex-1 bg-white" style={isDark ? { backgroundColor: '#000000' } : undefined}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 64, paddingBottom: 40 }}>

            {/* Header */}
            <View style={{ marginBottom: 48 }}>
              <Text style={{ fontSize: 22, fontWeight: '600', color: labelColor, textTransform: 'uppercase', letterSpacing: 6 }}>
                Life Tracker
              </Text>
              <Text style={{ ...mutedStyle, marginTop: 6 }}>
                Track your daily life, simply.
              </Text>
            </View>

            {/* Mode toggle */}
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              {(['signin', 'signup'] as Mode[]).map((m) => (
                <TouchableOpacity key={m} onPress={() => switchMode(m)} style={{ marginRight: 24, paddingBottom: 6 }}>
                  <Text style={{ ...labelStyle, color: mode === m ? labelColor : mutedColor }}>
                    {m === 'signin' ? 'Sign In' : 'Create Account'}
                  </Text>
                  {mode === m && (
                    <View style={{ height: 1.5, backgroundColor: labelColor, marginTop: 4 }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Inputs */}
            <View style={{ marginBottom: 32, gap: 10 }}>
              {mode === 'signin' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                  <TextInput
                    value={identifier}
                    onChangeText={setIdentifier}
                    placeholder="EMAIL OR USERNAME"
                    placeholderTextColor={mutedColor}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={inputTextStyle}
                  />
                </View>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="EMAIL"
                      placeholderTextColor={mutedColor}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      style={inputTextStyle}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      placeholder="USERNAME"
                      placeholderTextColor={mutedColor}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={inputTextStyle}
                    />
                  </View>
                </>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="PASSWORD"
                  placeholderTextColor={mutedColor}
                  secureTextEntry={!showPassword}
                  style={inputTextStyle}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={mutedColor} />
                </TouchableOpacity>
              </View>
              {mode === 'signup' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                  <TextInput
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="CONFIRM PASSWORD"
                    placeholderTextColor={mutedColor}
                    secureTextEntry={!showConfirm}
                    style={inputTextStyle}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={mutedColor} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Feedback */}
            {error && (
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>
                {error}
              </Text>
            )}
            {info && (
              <Text style={{ ...mutedStyle, marginBottom: 20 }}>
                {info}
              </Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: labelColor, borderRadius: 12, alignItems: 'center', paddingVertical: 15, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#111827' : '#ffffff', textTransform: 'uppercase', letterSpacing: 1.5 }}>
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
