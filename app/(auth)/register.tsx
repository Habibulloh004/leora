import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import {
  Input,
  Button,
  SocialLoginButtons,
  AuthScreenContainer,
} from '@/components/screens/auth';
import GlassCard from '@/components/shared/GlassCard';
import { useAuthStore } from '@/stores/useAuthStore';
import { validateEmail, validateName, validatePassword, validateConfirmPassword } from '@/utils/validation';
import { useLockStore } from '@/stores/useLockStore';
import {
  FINANCE_REGION_PRESETS,
  type FinanceRegion,
  getFinanceRegionPreset,
} from '@/stores/useFinancePreferencesStore';

const DEFAULT_FINANCE_REGION = FINANCE_REGION_PRESETS[0].id as FinanceRegion;

const RegisterScreen = () => {
  const { register, isLoading, error, clearError } = useAuthStore();
  const setLoggedIn = useLockStore((state) => state.setLoggedIn);
  const setLocked = useLockStore((state) => state.setLocked);
  const updateLastActive = useLockStore((state) => state.updateLastActive);

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<FinanceRegion>(DEFAULT_FINANCE_REGION);

  const [emailError, setEmailError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const hasFocusedRef = useRef(false);

  const selectedRegionPreset = useMemo(
    () => getFinanceRegionPreset(selectedRegion),
    [selectedRegion],
  );

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedRef.current) {
        setEmailOrPhone('');
        setFullName('');
        setPassword('');
        setConfirmPassword('');
        setSelectedRegion(DEFAULT_FINANCE_REGION);
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
      region: selectedRegion,
    });

    if (success) {
      setLoggedIn(true);
      setLocked(false);
      updateLastActive();
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

  const handleGoToLogin = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(auth)/login');
  };

  return (
    <AuthScreenContainer>
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
              onChangeText={(text: string) => {
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
              onChangeText={(text: string) => {
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
              onChangeText={(text: string) => {
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
              onChangeText={(text: string) => {
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

            <View style={styles.regionSection}>
              <View style={styles.regionHeader}>
                <Text style={styles.regionTitle}>Region & currency</Text>
                <Text style={styles.regionHelper}>
                  Main currency will be set to {selectedRegionPreset.currency}
                </Text>
              </View>
              <View style={styles.regionList}>
                {FINANCE_REGION_PRESETS.map((region) => {
                  const isActive = region.id === selectedRegion;
                  return (
                    <TouchableOpacity
                      key={region.id}
                      style={[
                        styles.regionOption,
                        isActive && styles.regionOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedRegion(region.id as FinanceRegion);
                        if (error) {
                          clearError();
                        }
                      }}
                    >
                      <View style={styles.regionOptionText}>
                        <Text style={styles.regionOptionLabel}>{region.label}</Text>
                        <Text style={styles.regionOptionDescription}>{region.description}</Text>
                      </View>
                      <View style={styles.regionCurrencyBadge}>
                        <Text style={styles.regionCurrencyText}>{region.currency}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title={isLoading ? 'Creating Account...' : 'Sign Up'}
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
              <TouchableOpacity onPress={handleGoToLogin}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GlassCard>
    </AuthScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 32,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 16,
    paddingTop: 8,
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
  regionSection: {
    marginTop: 20,
    marginBottom: 12,
    gap: 12,
  },
  regionHeader: {
    gap: 4,
  },
  regionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  regionHelper: {
    fontSize: 13,
    color: '#A6A6B9',
  },
  regionList: {
    gap: 10,
  },
  regionOption: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(12,12,20,0.45)',
  },
  regionOptionActive: {
    borderColor: '#7C83FF',
    backgroundColor: 'rgba(124,131,255,0.12)',
  },
  regionOptionText: {
    flex: 1,
    marginRight: 12,
  },
  regionOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  regionOptionDescription: {
    fontSize: 13,
    color: '#A6A6B9',
    marginTop: 2,
  },
  regionCurrencyBadge: {
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  regionCurrencyText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
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
