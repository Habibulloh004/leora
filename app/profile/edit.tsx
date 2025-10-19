import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#6F6F80"
      keyboardType={keyboardType}
      style={styles.input}
      autoCapitalize="none"
    />
  </View>
);

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setUsername(user?.username ?? '');
    setPhoneNumber(user?.phoneNumber ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      fullName.trim() !== (user.fullName ?? '') ||
      username.trim() !== (user.username ?? '') ||
      (phoneNumber || '').trim() !== (user.phoneNumber ?? '') ||
      (email || '').trim() !== (user.email ?? '')
    );
  }, [user, fullName, username, phoneNumber, email]);

  const handleSave = () => {
    if (!user) {
      Alert.alert('No user found', 'Please log in again.');
      router.replace('/(auth)/login');
      return;
    }

    if (!fullName.trim()) {
      Alert.alert('Validation', 'Full name is required.');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Validation', 'Username is required.');
      return;
    }

    updateUser({
      fullName: fullName.trim(),
      username: username.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      email: email.trim(),
    });

    Alert.alert('Profile updated', 'Your changes have been saved.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Update your details</Text>
        <Text style={styles.subtitle}>
          Keep your profile information up to date so we can personalise your experience.
        </Text>

        <View style={styles.card}>
          <InputField
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />
          <InputField
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="your_username"
          />
          <InputField
            label="Phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1 555 555 55 55"
            keyboardType="phone-pad"
          />
          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.helperText}>
          You can update your password from Settings → Security. Phone number is optional, but it
          helps us verify your account.
        </Text>

        <View style={styles.actions}>
          <View style={[styles.button, styles.cancelButton]}>
            <Text style={styles.cancelText} onPress={() => router.back()}>
              Cancel
            </Text>
          </View>
          <View
            style={[styles.button, styles.saveButton, !hasChanges && styles.disabledButton]}
            pointerEvents={hasChanges ? 'auto' : 'none'}
          >
            <Text style={styles.saveText} onPress={handleSave}>
              Save changes
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#A6A6B9',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#31313A',
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#A6A6B9',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(166,166,185,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  helperText: {
    color: '#6F6F80',
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(166,166,185,0.12)',
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  disabledButton: {
    opacity: 0.4,
  },
  cancelText: {
    color: '#A6A6B9',
    fontSize: 15,
    fontWeight: '600',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
