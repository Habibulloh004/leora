import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { Colors } from '@/constants/Colors';
import { useLockStore } from '@/stores/useLockStore';
import { useAuthStore } from '@/stores/useAuthStore';

const keypadLayout: Array<Array<string | null>> = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['bio', '0', 'back'],
]; 

const ANIMATION_DURATION = 220;
const RECOVERY_CODE_LENGTH = 6;
const RECOVERY_CODE_EXPIRY_MS = 5 * 60 * 1000;
const RECOVERY_RESEND_DELAY = 60;

type RecoveryContactType = 'email' | 'phone';

interface RecoveryContactOption {
  type: RecoveryContactType;
  value: string;
  masked: string;
}

const sanitizePasscode = (value: string) => value.replace(/\D/g, '').slice(0, 4);

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  if (!localPart) return `***@${domain}`;
  if (localPart.length <= 2) {
    return `${localPart[0] ?? ''}***@${domain}`;
  }
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
};

const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) {
    return `***${digits.slice(-2)}`;
  }
  const lastFour = digits.slice(-4);
  const prefix = phone.startsWith('+') ? '+' : '';
  return `${prefix}***${lastFour}`;
};

const generateRecoveryCode = () => {
  const min = Math.pow(10, RECOVERY_CODE_LENGTH - 1);
  const max = Math.pow(10, RECOVERY_CODE_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
};

export default function LockScreen() {
  const isLocked = useLockStore((state) => state.isLocked);
  const setLocked = useLockStore((state) => state.setLocked);
  const updateLastActive = useLockStore((state) => state.updateLastActive);
  const verifyPin = useLockStore((state) => state.verifyPin);
  const biometricsEnabled = useLockStore((state) => state.biometricsEnabled);
  const updateLockPin = useLockStore((state) => state.setPin);
  const updateLockEnabled = useLockStore((state) => state.setLockEnabled);

  const user = useAuthStore((state) => state.user);

  const [visible, setVisible] = useState(isLocked);
  const [pin, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState<string>('Biometric');
  const [checkingBiometric, setCheckingBiometric] = useState(false);

  const [recoveryVisible, setRecoveryVisible] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'select' | 'verify' | 'new-pin'>('select');
  const [selectedContact, setSelectedContact] = useState<RecoveryContactOption | null>(null);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryNewPin, setRecoveryNewPin] = useState('');
  const [recoveryConfirmPin, setRecoveryConfirmPin] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryInfo, setRecoveryInfo] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const fadeAnim = useRef(new Animated.Value(isLocked ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isLocked ? 1 : 0.96)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const attemptedBiometricRef = useRef(false);
  const recoveryCodeRef = useRef<string | null>(null);
  const recoveryExpiryRef = useRef<number | null>(null);

  const contactOptions = useMemo<RecoveryContactOption[]>(() => {
    const options: RecoveryContactOption[] = [];
    if (user?.email) {
      options.push({ type: 'email', value: user.email, masked: maskEmail(user.email) });
    }
    if (user?.phoneNumber) {
      options.push({ type: 'phone', value: user.phoneNumber, masked: maskPhone(user.phoneNumber) });
    }
    return options;
  }, [user]);

  useEffect(() => {
    if (!recoveryVisible) return;
    if (resendCountdown <= 0) return;

    const timer = setTimeout(
      () => setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );

    return () => clearTimeout(timer);
  }, [recoveryVisible, resendCountdown]);

  const resetRecoveryState = () => {
    setRecoveryStep('select');
    setSelectedContact(null);
    setRecoveryCodeInput('');
    setRecoveryNewPin('');
    setRecoveryConfirmPin('');
    setRecoveryError('');
    setRecoveryInfo('');
    setResendCountdown(0);
    recoveryCodeRef.current = null;
    recoveryExpiryRef.current = null;
  };

  const openRecoveryFlow = () => {
    resetRecoveryState();
    if (contactOptions.length === 1) {
      setSelectedContact(contactOptions[0]);
    }
    setRecoveryVisible(true);
  };

  const closeRecoveryFlow = () => {
    setRecoveryVisible(false);
    resetRecoveryState();
  };

  const handleSendRecoveryCode = () => {
    const contact = selectedContact ?? contactOptions[0] ?? null;
    if (!contact) {
      setRecoveryError('No contact method available. Update your profile to add one.');
      return;
    }

    setSelectedContact(contact);

    const code = generateRecoveryCode();
    recoveryCodeRef.current = code;
    recoveryExpiryRef.current = Date.now() + RECOVERY_CODE_EXPIRY_MS;
    setRecoveryStep('verify');
    setRecoveryError('');
    setRecoveryCodeInput('');
    setRecoveryInfo(
      `Enter the ${RECOVERY_CODE_LENGTH}-digit code sent to ${
        contact.type === 'email' ? 'your email' : 'your phone'
      } (${contact.masked}).`
    );
    setResendCountdown(RECOVERY_RESEND_DELAY);
    console.log(`[AppLock] Recovery code for ${contact.type}: ${code}`);
  };

  const handleVerifyRecoveryCode = () => {
    const sanitizedInput = recoveryCodeInput.replace(/\D/g, '');
    if (sanitizedInput.length !== RECOVERY_CODE_LENGTH) {
      setRecoveryError(`Enter the full ${RECOVERY_CODE_LENGTH}-digit code.`);
      return;
    }

    if (!recoveryCodeRef.current) {
      setRecoveryError('Request a new code to continue.');
      return;
    }

    if (recoveryExpiryRef.current && Date.now() > recoveryExpiryRef.current) {
      setRecoveryError('Code expired. Request a new one.');
      return;
    }

    if (sanitizedInput !== recoveryCodeRef.current) {
      setRecoveryError('Incorrect code. Try again.');
      return;
    }

    setRecoveryStep('new-pin');
    setRecoveryError('');
    setRecoveryInfo('Create a new 4-digit passcode for App Lock.');
    setRecoveryCodeInput('');
    recoveryCodeRef.current = null;
    recoveryExpiryRef.current = null;
  };

  const handleResendRecoveryCode = () => {
    if (resendCountdown > 0) return;
    handleSendRecoveryCode();
  };

  const handleSubmitRecoveryPasscode = () => {
    const sanitizedNew = sanitizePasscode(recoveryNewPin);
    const sanitizedConfirm = sanitizePasscode(recoveryConfirmPin);

    if (sanitizedNew.length !== 4) {
      setRecoveryError('Passcode must be 4 digits.');
      return;
    }

    if (sanitizedNew !== sanitizedConfirm) {
      setRecoveryError('Passcodes do not match.');
      return;
    }

    updateLockPin(sanitizedNew);
    updateLockEnabled(true);
    setRecoveryError('');
    closeRecoveryFlow();
    handleUnlock();
    Alert.alert('Passcode updated', 'Your App Lock passcode has been reset.');
  };

  useEffect(() => {
    if (isLocked) {
      setVisible(true);
      animateIn();
      attemptedBiometricRef.current = false;
      setPinInput('');
      if (biometricsEnabled) {
        prepareBiometric();
      } else {
        setBiometricAvailable(false);
        setCheckingBiometric(false);
      }
    } else {
      animateOut();
    }
  }, [biometricsEnabled, isLocked]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 6,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setPinInput('');
      setError(false);
    });
  };

  const handleUnlock = () => {
    setLocked(false);
    updateLastActive();
    setPinInput('');
  };

  const triggerError = () => {
    setError(true);
    Vibration.vibrate(120);

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: -14,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 14,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setError(false);
      setPinInput('');
    });
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length >= 4 || !isLocked) {
      return;
    }

    const nextPin = `${pin}${digit}`;
    setPinInput(nextPin);

    if (nextPin.length === 4) {
      requestAnimationFrame(() => {
        const ok = verifyPin(nextPin);
        if (ok) {
          handleUnlock();
        } else {
          triggerError();
        }
      });
    }
  };

  const handleBackspace = () => {
    if (pin.length === 0 || !isLocked) {
      return;
    }
    setPinInput((prev) => prev.slice(0, -1));
  };

  const prepareBiometric = async () => {
    if (!biometricsEnabled) {
      setBiometricAvailable(false);
      setCheckingBiometric(false);
      return;
    }

    setCheckingBiometric(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setBiometricAvailable(false);
        return;
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricLabel('Face ID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricLabel('Fingerprint');
      } else {
        setBiometricLabel('Biometric');
      }

      setBiometricAvailable(true);

      if (!attemptedBiometricRef.current) {
        attemptedBiometricRef.current = true;
        attemptBiometric();
      }
    } finally {
      setCheckingBiometric(false);
    }
  };

  const attemptBiometric = async () => {
    if (!biometricsEnabled || !biometricAvailable || !isLocked) {
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Leora',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        handleUnlock();
      }
    } catch (error) {
      // Silent fail – user can use PIN instead
    }
  };

  const renderCircle = (index: number) => {
    const filled = index < pin.length;
    const style = [
      styles.pinDot,
      filled && styles.pinDotFilled,
      error && styles.pinDotError,
    ];

    return <View key={index} style={style} />;
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
            },
          ]}
        >
          <Image source={require('@assets/images/icon.png')} style={styles.logo} />

          <Text style={styles.prompt}>Enter passcode</Text>

          <View style={styles.pinRow}>{[0, 1, 2, 3].map(renderCircle)}</View>

          <View style={styles.keypad}>
            {keypadLayout.map((row, rowIndex) => (
              <View key={String(rowIndex)} style={styles.keypadRow}>
                {row.map((key, columnIndex) => {
                  const cellKey = `${rowIndex}-${columnIndex}`;

                  if (key === null) {
                    return <View key={cellKey} style={styles.keypadButtonPlaceholder} />;
                  }

                  if (key === 'bio') {
                    if (!biometricAvailable) {
                      return <View key={cellKey} style={styles.keypadButtonPlaceholder} />;
                    }

                    return (
                      <TouchableOpacity
                        key={cellKey}
                        style={styles.keypadButton}
                        onPress={attemptBiometric}
                        disabled={checkingBiometric}
                      >
                        <Text style={styles.keypadButtonText}>{biometricLabel}</Text>
                      </TouchableOpacity>
                    );
                  }

                  if (key === 'back') {
                    return (
                      <TouchableOpacity
                        key={cellKey}
                        style={styles.keypadButton}
                        onPress={handleBackspace}
                      >
                        <Text style={styles.keypadButtonText}>⌫</Text>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={cellKey}
                      style={styles.keypadButton}
                      onPress={() => handleDigitPress(key)}
                    >
                      <Text style={styles.keypadButtonText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {biometricAvailable && (
            <TouchableOpacity style={styles.biometricHint} onPress={attemptBiometric}>
              <Text style={styles.biometricHintText}>Use {biometricLabel}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.forgotButton} onPress={openRecoveryFlow}>
            <Text style={styles.forgotButtonText}>Forgot passcode?</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Modal
        visible={recoveryVisible}
        animationType="fade"
        transparent
        onRequestClose={closeRecoveryFlow}
      >
        <View style={styles.recoveryOverlay}>
          <View style={styles.recoveryContainer}>
            <View style={styles.recoveryHeader}>
              <Text style={styles.recoveryTitle}>
                {recoveryStep === 'select'
                  ? 'Reset app lock'
                  : recoveryStep === 'verify'
                  ? 'Verify code'
                  : 'Create new passcode'}
              </Text>
              <TouchableOpacity style={styles.recoveryClose} onPress={closeRecoveryFlow}>
                <Text style={styles.recoveryCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.recoverySubtitle}>
              {recoveryStep === 'select'
                ? 'Choose where we should send a verification code.'
                : recoveryInfo || 'Follow the steps to reset your passcode.'}
            </Text>

            {recoveryStep === 'select' && (
              <>
                <View style={styles.recoveryOptions}>
                  {contactOptions.length === 0 ? (
                    <Text style={styles.recoveryEmptyText}>
                      Add an email address or phone number in your profile to reset the passcode remotely.
                    </Text>
                  ) : (
                    contactOptions.map((option) => (
                      <Pressable
                        key={option.type}
                        style={[
                          styles.recoveryOption,
                          selectedContact?.type === option.type && styles.recoveryOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedContact(option);
                          setRecoveryError('');
                        }}
                      >
                        <Text style={styles.recoveryOptionLabel}>
                          {option.type === 'email' ? 'Email' : 'Phone'}
                        </Text>
                        <Text style={styles.recoveryOptionValue}>{option.masked}</Text>
                      </Pressable>
                    ))
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.recoveryPrimaryButton,
                    contactOptions.length === 0 && styles.recoveryPrimaryButtonDisabled,
                  ]}
                  onPress={handleSendRecoveryCode}
                  disabled={contactOptions.length === 0}
                >
                  <Text style={styles.recoveryPrimaryButtonText}>Send code</Text>
                </TouchableOpacity>
              </>
            )}

            {recoveryStep === 'verify' && (
              <>
                <TextInput
                  value={recoveryCodeInput}
                  onChangeText={(value) => {
                    setRecoveryCodeInput(value.replace(/\D/g, '').slice(0, RECOVERY_CODE_LENGTH));
                    setRecoveryError('');
                  }}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={RECOVERY_CODE_LENGTH}
                  style={styles.recoveryInput}
                  placeholder="Enter verification code"
                  placeholderTextColor={Colors.textTertiary}
                />

                <View style={styles.recoveryActionsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setRecoveryStep('select');
                      setRecoveryError('');
                      setRecoveryInfo('');
                      setRecoveryCodeInput('');
                      setResendCountdown(0);
                      recoveryCodeRef.current = null;
                      recoveryExpiryRef.current = null;
                    }}
                  >
                    <Text style={styles.recoverySecondaryAction}>Change method</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleResendRecoveryCode}
                    disabled={resendCountdown > 0}
                  >
                    <Text
                      style={[
                        styles.recoverySecondaryAction,
                        resendCountdown > 0 && styles.recoverySecondaryActionDisabled,
                      ]}
                    >
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.recoveryPrimaryButton} onPress={handleVerifyRecoveryCode}>
                  <Text style={styles.recoveryPrimaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </>
            )}

            {recoveryStep === 'new-pin' && (
              <>
                <TextInput
                  value={sanitizePasscode(recoveryNewPin)}
                  onChangeText={(value) => {
                    setRecoveryNewPin(sanitizePasscode(value));
                    setRecoveryError('');
                  }}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={4}
                  style={styles.recoveryInput}
                  placeholder="New passcode"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry
                />
                <TextInput
                  value={sanitizePasscode(recoveryConfirmPin)}
                  onChangeText={(value) => {
                    setRecoveryConfirmPin(sanitizePasscode(value));
                    setRecoveryError('');
                  }}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={4}
                  style={styles.recoveryInput}
                  placeholder="Confirm passcode"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={styles.recoveryPrimaryButton}
                  onPress={handleSubmitRecoveryPasscode}
                >
                  <Text style={styles.recoveryPrimaryButtonText}>Save new passcode</Text>
                </TouchableOpacity>
              </>
            )}

            {recoveryError ? <Text style={styles.recoveryErrorText}>{recoveryError}</Text> : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '84%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 24,
  },
  logo: {
    width: 96,
    height: 128,
    resizeMode: 'contain',
  },
  prompt: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 18,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
  },
  pinDotFilled: {
    backgroundColor: Colors.textPrimary,
  },
  pinDotError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
  keypad: {
    width: '100%',
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  keypadButton: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f1f1f',
  },
  keypadButtonPlaceholder: {
    flex: 1,
  },
  keypadButtonText: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  biometricHint: {
    marginTop: 8,
  },
  biometricHintText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  forgotButton: {
    marginTop: 16,
  },
  forgotButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  recoveryOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay.heavy,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  recoveryContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  recoveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recoveryTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  recoveryClose: {
    padding: 8,
  },
  recoveryCloseText: {
    color: Colors.textSecondary,
    fontSize: 18,
  },
  recoverySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  recoveryOptions: {
    gap: 12,
  },
  recoveryOption: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    gap: 4,
  },
  recoveryOptionSelected: {
    borderColor: Colors.primary,
  },
  recoveryOptionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  recoveryOptionValue: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  recoveryPrimaryButton: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryPrimaryButtonDisabled: {
    backgroundColor: '#3a3a42',
  },
  recoveryPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recoveryInput: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  recoveryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recoverySecondaryAction: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  recoverySecondaryActionDisabled: {
    color: Colors.textTertiary,
  },
  recoveryErrorText: {
    color: Colors.danger,
    fontSize: 13,
  },
  recoveryEmptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
