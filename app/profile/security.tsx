import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';

import { Colors } from '@/constants/Colors';
import { useLockStore } from '@/stores/useLockStore';

interface BiometricStatus {
  supported: boolean;
  enrolled: boolean;
  label: string | null;
}

export default function SecurityScreen() {
  const lockEnabled = useLockStore((state) => state.lockEnabled);
  const pin = useLockStore((state) => state.pin);
  const setLockEnabled = useLockStore((state) => state.setLockEnabled);
  const setPin = useLockStore((state) => state.setPin);
  const resetPinStore = useLockStore((state) => state.resetPin);
  const verifyPin = useLockStore((state) => state.verifyPin);
  const setLocked = useLockStore((state) => state.setLocked);
  const biometricsEnabled = useLockStore((state) => state.biometricsEnabled);
  const setBiometricsEnabled = useLockStore((state) => state.setBiometricsEnabled);

  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus>({
    supported: false,
    enrolled: false,
    label: null,
  });
  const [checkingBiometricSupport, setCheckingBiometricSupport] = useState(true);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadBiometricSupport = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!isMounted) return;

        if (!hasHardware) {
          setBiometricStatus({ supported: false, enrolled: false, label: null });
          return;
        }

        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (!isMounted) return;

        let label: string | null = null;
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          label = 'Face ID';
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          label = 'Fingerprint';
        } else if (supportedTypes.length > 0) {
          label = 'Biometric';
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isMounted) return;

        setBiometricStatus({
          supported: true,
          enrolled,
          label,
        });
      } catch (error) {
        if (isMounted) {
          setBiometricStatus({ supported: false, enrolled: false, label: null });
        }
      } finally {
        if (isMounted) {
          setCheckingBiometricSupport(false);
        }
      }
    };

    loadBiometricSupport();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if ((!lockEnabled || !biometricStatus.supported || !biometricStatus.enrolled) && biometricsEnabled) {
      setBiometricsEnabled(false);
    }
  }, [biometricStatus.enrolled, biometricStatus.supported, biometricsEnabled, lockEnabled, setBiometricsEnabled]);

  const biometricHelper = useMemo(() => {
    if (checkingBiometricSupport) {
      return 'Checking device capabilities...';
    }
    if (!biometricStatus.supported) {
      return 'This device does not support biometric authentication.';
    }
    if (!biometricStatus.enrolled) {
      return 'Set up Face ID or fingerprint in your device settings to enable this feature.';
    }
    if (!lockEnabled) {
      return 'Turn on App Lock to use biometric unlock.';
    }
    return 'Use your biometrics to unlock the app faster.';
  }, [biometricStatus.enrolled, biometricStatus.supported, checkingBiometricSupport, lockEnabled]);

  const biometricLabel = biometricStatus.label ?? 'Biometric';
  const biometricToggleDisabled =
    checkingBiometricSupport || !biometricStatus.supported || !biometricStatus.enrolled || !lockEnabled;

  const sanitizePasscode = useCallback((value: string) => value.replace(/\D/g, '').slice(0, 4), []);

  const closeModal = () => {
    setShowCreateModal(false);
    setShowChangeModal(false);
    setNewPasscode('');
    setConfirmPasscode('');
    setCurrentPasscode('');
    setModalError('');
  };

  const handleLockToggle = useCallback(
    (value: boolean) => {
      if (value) {
        if (!pin) {
          setShowCreateModal(true);
          return;
        }

        setLockEnabled(true);
        setLocked(false);
      } else {
        setLockEnabled(false);
        setLocked(false);
      }
    },
    [pin, setLockEnabled, setLocked]
  );

  const handleCreatePasscode = () => {
    const cleanedNew = sanitizePasscode(newPasscode);
    const cleanedConfirm = sanitizePasscode(confirmPasscode);

    if (cleanedNew.length !== 4) {
      setModalError('Passcode must be 4 digits.');
      return;
    }

    if (cleanedNew !== cleanedConfirm) {
      setModalError('Passcodes do not match.');
      return;
    }

    setPin(cleanedNew);
    setLockEnabled(true);
    setLocked(false);
    closeModal();
    Alert.alert('App Lock Enabled', 'Your new passcode is set.');
  };

  const handleChangePasscode = () => {
    const cleanedCurrent = sanitizePasscode(currentPasscode);
    const cleanedNew = sanitizePasscode(newPasscode);
    const cleanedConfirm = sanitizePasscode(confirmPasscode);

    if (cleanedCurrent.length !== 4 || !verifyPin(cleanedCurrent)) {
      setModalError('Current passcode is incorrect.');
      return;
    }

    if (cleanedNew.length !== 4) {
      setModalError('New passcode must be 4 digits.');
      return;
    }

    if (cleanedNew !== cleanedConfirm) {
      setModalError('Passcodes do not match.');
      return;
    }

    setPin(cleanedNew);
    setLocked(false);
    closeModal();
    Alert.alert('Passcode Updated', 'Your passcode has been changed.');
  };

  const handleResetPasscode = () => {
    Alert.alert(
      'Reset passcode?',
      'This will remove your current passcode and disable App Lock.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetPinStore();
            setLocked(false);
            Alert.alert('Passcode Reset', 'App Lock has been turned off.');
          },
        },
      ]
    );
  };

  const handleToggleBiometrics = useCallback(
    async (value: boolean) => {
      if (value) {
        if (biometricToggleDisabled) {
          return;
        }

        if (!pin) {
          Alert.alert('Set Passcode', 'Create an app passcode before enabling biometric unlock.');
          return;
        }

        setBiometricLoading(true);
        try {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: `Enable ${biometricLabel}`,
            cancelLabel: 'Cancel',
            fallbackLabel: 'Use Passcode',
          });

          if (result.success) {
            setBiometricsEnabled(true);
          } else {
            setBiometricsEnabled(false);
          }
        } catch (error) {
          Alert.alert('Biometric Error', 'Something went wrong while enabling biometrics.');
          setBiometricsEnabled(false);
        } finally {
          setBiometricLoading(false);
        }
      } else {
        setBiometricsEnabled(false);
      }
    },
    [biometricLabel, biometricToggleDisabled, pin, setBiometricsEnabled]
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>App Lock</Text>
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              <Text style={styles.rowTitle}>Enable App Lock</Text>
              <Text style={styles.rowSubtitle}>Require a passcode when reopening the app after inactivity.</Text>
            </View>
            <Switch
              value={lockEnabled}
              onValueChange={handleLockToggle}
              trackColor={{ false: '#3e3e3e', true: Colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          {pin ? (
            <>
              <TouchableOpacity style={styles.actionRow} onPress={() => setShowChangeModal(true)}>
                <Text style={styles.actionPrimary}>Change passcode</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionRow} onPress={handleResetPasscode}>
                <Text style={styles.actionDanger}>Reset passcode</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Biometric Unlock</Text>
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              <Text style={styles.rowTitle}>Use {biometricLabel}</Text>
              <Text style={styles.rowSubtitle}>{biometricHelper}</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#3e3e3e', true: Colors.primary }}
              thumbColor="#ffffff"
              disabled={biometricToggleDisabled || biometricLoading}
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={showCreateModal} animationType="fade" transparent onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create passcode</Text>
            <Text style={styles.modalSubtitle}>Enter a 4-digit passcode to secure the app.</Text>
            <TextInput
              value={sanitizePasscode(newPasscode)}
              onChangeText={(value) => {
                setNewPasscode(sanitizePasscode(value));
                setModalError('');
              }}
              inputMode="numeric"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              style={styles.input}
              placeholder="New passcode"
              placeholderTextColor={Colors.textTertiary}
            />
            <TextInput
              value={sanitizePasscode(confirmPasscode)}
              onChangeText={(value) => {
                setConfirmPasscode(sanitizePasscode(value));
                setModalError('');
              }}
              inputMode="numeric"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              style={styles.input}
              placeholder="Confirm passcode"
              placeholderTextColor={Colors.textTertiary}
            />
            {modalError ? <Text style={styles.modalError}>{modalError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonTertiary]} onPress={closeModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleCreatePasscode}>
                <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showChangeModal} animationType="fade" transparent onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change passcode</Text>
            <Text style={styles.modalSubtitle}>Enter your current passcode and a new one.</Text>
            <TextInput
              value={sanitizePasscode(currentPasscode)}
              onChangeText={(value) => {
                setCurrentPasscode(sanitizePasscode(value));
                setModalError('');
              }}
              inputMode="numeric"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              style={styles.input}
              placeholder="Current passcode"
              placeholderTextColor={Colors.textTertiary}
            />
            <TextInput
              value={sanitizePasscode(newPasscode)}
              onChangeText={(value) => {
                setNewPasscode(sanitizePasscode(value));
                setModalError('');
              }}
              inputMode="numeric"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              style={styles.input}
              placeholder="New passcode"
              placeholderTextColor={Colors.textTertiary}
            />
            <TextInput
              value={sanitizePasscode(confirmPasscode)}
              onChangeText={(value) => {
                setConfirmPasscode(sanitizePasscode(value));
                setModalError('');
              }}
              inputMode="numeric"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              style={styles.input}
              placeholder="Confirm new passcode"
              placeholderTextColor={Colors.textTertiary}
            />
            {modalError ? <Text style={styles.modalError}>{modalError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonTertiary]} onPress={closeModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleChangePasscode}>
                <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rowLabelContainer: {
    flex: 1,
  },
  rowTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  rowSubtitle: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    paddingVertical: 4,
  },
  actionPrimary: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  actionDanger: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay.heavy,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  modalError: {
    color: Colors.danger,
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalButtonTertiary: {
    backgroundColor: Colors.backgroundElevated,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonPrimaryText: {
    color: '#ffffff',
  },
});
