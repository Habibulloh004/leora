import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // TODO: Implement API call
    // await authService.login(email, password);
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1000);
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={authStyles.content}
      >
        <View style={authStyles.header}>
          <Text style={authStyles.logo}>LEORA</Text>
          <Text style={authStyles.tagline}>Order in Tasks & Money</Text>
        </View>

        <View style={authStyles.form}>
          <Text style={authStyles.title}>Welcome Back</Text>
          <Text style={authStyles.subtitle}>Sign in to continue</Text>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Email</Text>
            <TextInput
              style={authStyles.input}
              placeholder="your@email.com"
              placeholderTextColor="#666666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Password</Text>
            <View style={authStyles.passwordContainer}>
              <TextInput
                style={[authStyles.input, authStyles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={authStyles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye color="#666666" size={20} />
                ) : (
                  <EyeOff color="#666666" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.navigate('/(auth)/forgot-password')}>
            <Text style={authStyles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={authStyles.buttonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={authStyles.biometricButton}
            onPress={() => router.navigate('/(auth)/biometric')}
          >
            <Text style={authStyles.biometricText}>Use Face ID</Text>
          </TouchableOpacity>
        </View>

        <View style={authStyles.footer}>
          <Text style={authStyles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.navigate('/(auth)/register')}>
            <Text style={authStyles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 8,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: 2,
  },
  form: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#31313A',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'right',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  biometricButton: {
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  footerLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
