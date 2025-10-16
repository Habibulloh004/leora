import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    // TODO: Implement API call
    // await authService.register(formData);
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1000);
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={registerStyles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>

        <View style={authStyles.header}>
          <Text style={authStyles.logo}>LEORA</Text>
          <Text style={authStyles.tagline}>Order in Tasks & Money</Text>
        </View>

        <View style={authStyles.form}>
          <Text style={authStyles.title}>Create Account</Text>
          <Text style={authStyles.subtitle}>Sign up to get started</Text>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Full Name</Text>
            <TextInput
              style={authStyles.input}
              placeholder="John Doe"
              placeholderTextColor="#666666"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Email</Text>
            <TextInput
              style={authStyles.input}
              placeholder="your@email.com"
              placeholderTextColor="#666666"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Password</Text>
            <View style={authStyles.passwordContainer}>
              <TextInput
                style={[authStyles.input, authStyles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor="#666666"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
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

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Confirm Password</Text>
            <TextInput
              style={authStyles.input}
              placeholder="••••••••"
              placeholderTextColor="#666666"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={authStyles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[authStyles.footer, { marginTop: 20, marginBottom: 32 }]}>
          <Text style={authStyles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={authStyles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const registerStyles = StyleSheet.create({
  backButton: {
    marginTop: 16,
    marginLeft: 24,
    marginBottom: 20,
  },
});

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


