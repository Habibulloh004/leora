import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { Input, Button, SocialLoginButtons } from '@/components/auth';
import GlassCard from '@/components/shared/GlassCard';
import { useAuthStore } from '@/stores/useAuthStore';
import { validateEmail, validateName, validatePassword, validateConfirmPassword } from '@/utils/validation';

const RegisterScreen = () => {
  const { register, isLoading, error, clearError } = useAuthStore();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const hasFocusedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedRef.current) {
        setEmailOrPhone('');
        setFullName('');
        setPassword('');
        setConfirmPassword('');
      }

      setEmailError(undefined);
      setNameError(undefined);
      setPasswordError(undefined);
      setConfirmPasswordError(undefined);
      clearError();
      hasFocusedRef.current = true;
    }, [clearError])
  );

  const handleRegister = async () => {
    clearError();

    // Validate all inputs
    const emailValidationError = validateEmail(emailOrPhone);
    const nameValidationError = validateName(fullName);
    const passwordValidationError = validatePassword(password);
    const confirmPasswordValidationError = validateConfirmPassword(password, confirmPassword);

    setEmailError(emailValidationError);
    setNameError(nameValidationError);
    setPasswordError(passwordValidationError);
    setConfirmPasswordError(confirmPasswordValidationError);

    // If any validation fails, don't proceed
    if (emailValidationError || nameValidationError || passwordValidationError || confirmPasswordValidationError) {
      return;
    }

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
            label="Email"
            placeholder="name@example.com"
            value={emailOrPhone}
            onChangeText={(text) => {
              setEmailOrPhone(text);
              if (error) {
                clearError();
              }
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            icon={Mail}
            iconSize={22}
            error={emailError}
            onClearError={() => setEmailError(undefined)}
          />

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (error) {
                clearError();
              }
            }}
            icon={User}
            iconSize={22}
            error={nameError}
            onClearError={() => setNameError(undefined)}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) {
                clearError();
              }
            }}
            isPassword
            icon={Lock}
            iconSize={22}
            error={passwordError}
            onClearError={() => setPasswordError(undefined)}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (error) {
                clearError();
              }
            }}
            isPassword
            icon={Lock}
            iconSize={22}
            error={confirmPasswordError}
            onClearError={() => setConfirmPasswordError(undefined)}
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
            disabled={isLoading}
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
    marginBottom: 16,
    paddingTop:8  },
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
