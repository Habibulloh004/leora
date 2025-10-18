import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { Input, Button, SocialLoginButtons } from '@/components/auth';
import GlassCard from '@/components/shared/GlassCard';
import { useAuthStore } from '@/stores/useAuthStore';

const RegisterScreen = () => {
  const { register, isLoading, error, clearError } = useAuthStore();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    clearError();

    const success = await register({
      emailOrPhone,
      fullName,
      password,
      confirmPassword,
    });

    if (success) {
      Alert.alert(
        'Registration Successful',
        'Welcome to Leora! Your account has been created.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } else if (error) {
      Alert.alert('Registration Failed', error);
    }
  };

  const handleSocialRegister = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} registration will be available soon!`);
  };

  return (
    <GlassCard>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Register</Text>
          <Text style={styles.description}>
            Create an account to continue!
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Email or Phone or Username"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            autoCapitalize="none"
            icon={<Mail size={20} color="#A6A6B9" />}
          />

          <Input
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            icon={<User size={20} color="#A6A6B9" />}
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
            icon={<Lock size={20} color="#A6A6B9" />}
          />

          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            icon={<Lock size={20} color="#A6A6B9" />}
          />

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title={isLoading ? "Creating Account..." : "Sign Up"}
            onPress={handleRegister}
            disabled={isLoading || !emailOrPhone || !fullName || !password || !confirmPassword}
          />

          <SocialLoginButtons
            onGooglePress={() => handleSocialRegister('Google')}
            onFacebookPress={() => handleSocialRegister('Facebook')}
            onApplePress={() => handleSocialRegister('Apple')}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 32,
    paddingVertical: 12,
    paddingHorizontal: 20 
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#A6A6B9',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#A6A6B9',
    fontSize: 14,
  },
  signInLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RegisterScreen;