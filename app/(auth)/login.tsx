import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Mail, Lock } from "lucide-react-native";
import { Input, Button, SocialLoginButtons } from "@/components/auth";
import GlassCard from "@/components/shared/GlassCard";
import { CheckIcon } from "@assets/icons";
import { useAuthStore } from "@/stores/useAuthStore";

const LoginScreen = () => {
  const { login, isLoading, error, clearError, setRememberMe } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMeLocal, setRememberMeLocal] = useState(false);

  const handleLogin = async () => {
    clearError();

    const success = await login({
      emailOrUsername: email,
      password,
      rememberMe: rememberMeLocal,
    });

    if (success) {
      setRememberMe(rememberMeLocal);
      router.replace("/(tabs)");
    } else if (error) {
      Alert.alert("Login Failed", error);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert("Coming Soon", `${provider} login will be available soon!`);
  };

  return (
    <View
      style={styles.container}
    >
      <GlassCard>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.description}>
              Enter your mail and password to log in
            </Text>
          </View>

          {/* Inputs */}
          <View style={styles.form}>
            <Input
              placeholder="Email or Username"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={20} color="#A6A6B9" />}
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              isPassword
              icon={<Lock size={20} color="#A6A6B9" />}
            />

            {/* Options */}
            <View style={styles.options}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMeLocal(!rememberMeLocal)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.checkbox, rememberMeLocal && styles.checkboxChecked]}
                >
                  {rememberMeLocal && <CheckIcon color="#FFFFFF" size={14} />}
                </View>
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login button */}
            <Button
              title={isLoading ? "Logging in..." : "Log In"}
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
            />

            {/* Social buttons */}
            <SocialLoginButtons
              onGooglePress={() => handleSocialLogin("Google")}
              onFacebookPress={() => handleSocialLogin("Facebook")}
              onApplePress={() => handleSocialLogin("Apple")}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GlassCard>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
  },
  card: {
    width: "100%",
    paddingBottom: 32,
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#A6A6B9",
    textAlign: "center",
  },
  form: {
    width: "100%",
    marginTop: 12,
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "rgba(108, 114, 120, 1)", // shaffof checkbox border
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)", // shaffof fon
  },
  checkboxChecked: {
    borderColor: "rgba(108, 114, 120, 1)", // yarim shaffof ko‘k border
    backgroundColor: "rgba(108, 114, 120, 1)", // shisha ko‘k fon
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  rememberMeText: {
    color: "#A6A6B9",
    fontSize: 14,
  },
  forgotPassword: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#A6A6B9",
    fontSize: 14,
  },
  signUpLink: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },
  // 🔹 Shaffof input va button style
  input: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)", // shisha border
    paddingHorizontal: 12,
    color: "#fff",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.08)", // yarim shaffof fon
  },
  button: {
    backgroundColor: "rgba(102,126,234,0.25)", // yarim shaffof ko‘k
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(102,126,234,0.4)", // ko‘k shaffof border
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
