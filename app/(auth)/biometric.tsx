import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint, Scan } from 'lucide-react-native';
import { Button } from '@/components/auth';

const BiometricScreen = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<'idle' | 'authenticating' | 'success' | 'failed'>('idle');
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    checkBiometricSupport();
    startPulseAnimation();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);

    if (compatible) {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (enrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('Biometric');
        }
      }
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBiometricAuth = async () => {
    setAuthStatus('authenticating');

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setAuthStatus('success');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setAuthStatus('failed');
        setTimeout(() => setAuthStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setAuthStatus('failed');
      setTimeout(() => setAuthStatus('idle'), 2000);
    }
  };

  const getBiometricIcon = () => {
    if (biometricType === 'Face ID') {
      return <Scan size={80} color="#fff" strokeWidth={1.5} />;
    }
    return <Fingerprint size={80} color="#fff" strokeWidth={1.5} />;
  };

  const getStatusColor = () => {
    switch (authStatus) {
      case 'success':
        return '#4ade80';
      case 'failed':
        return '#ef4444';
      case 'authenticating':
        return '#667eea';
      default:
        return '#667eea';
    }
  };

  const getStatusText = () => {
    switch (authStatus) {
      case 'authenticating':
        return 'Authenticating...';
      case 'success':
        return 'Authentication Successful!';
      case 'failed':
        return 'Authentication Failed';
      default:
        return `Touch ${biometricType || 'Biometric'} to Login`;
    }
  };

  if (!isBiometricSupported) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Biometric Not Supported</Text>
          <Text style={styles.description}>
            Your device doesn&apos;t support biometric authentication
          </Text>
        </View>
        <Button title="Use Password" onPress={() => router.push('/login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.description}>
          Use {biometricType || 'biometric authentication'} for quick access
        </Text>
      </View>

      <View style={styles.biometricContainer}>
        <TouchableOpacity
          onPress={handleBiometricAuth}
          activeOpacity={0.8}
          disabled={authStatus === 'authenticating'}
        >
          <Animated.View
            style={[
              styles.biometricCircle,
              {
                backgroundColor: getStatusColor(),
                transform: [{ scale: authStatus === 'idle' ? pulseAnim : 1 }],
              },
            ]}
          >
            {getBiometricIcon()}
          </Animated.View>
        </TouchableOpacity>

        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.alternativeText}>Use Password Instead</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
    paddingHorizontal: 20,
  },
  biometricContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  biometricCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  statusText: {
    marginTop: 32,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: 16,
  },
  alternativeText: {
    color: '#A6A6B9',
    fontSize: 16,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#A6A6B9',
    fontSize: 14,
  },
  signUpLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BiometricScreen;