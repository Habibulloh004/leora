import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface VoiceAiModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function VoiceAiModal({ visible, onClose }: VoiceAiModalProps) {
  const [listening, setListening] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Modal show/hide animation
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 10,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      setListening(false); // Reset listening state when modal closes
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Microphone pulse effect
  useEffect(() => {
    if (listening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [listening]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [800, 0],
  });

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setListening((prev) => !prev);

    // TODO: Implement actual voice recognition
    if (!listening) {
      console.log("🎤 Started listening...");
    } else {
      console.log("🛑 Stopped listening");
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setListening(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        {/* Background overlay */}
        <Pressable style={styles.background} onPress={handleClose} />

        {/* Modal content */}
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Voice AI Assistant</Text>
            <Pressable onPress={handleClose} hitSlop={10}>
              <Ionicons name="close" size={28} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {listening ? "I'm listening..." : "Ready to help"}
            </Text>
            <Text style={styles.description}>
              {listening
                ? "Speak naturally. I'll convert your voice into tasks, notes, or expenses."
                : "Tap the microphone and speak your command. I'll understand and help you."}
            </Text>

            {listening && (
              <View style={styles.listeningIndicator}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            )}
          </View>

          {/* Microphone button */}
          <View style={styles.micWrapper}>
            <Animated.View
              style={[
                styles.micOuter,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: listening ? Colors.primary + "33" : Colors.surface,
                },
              ]}
            >
              <Pressable
                onPress={handleMicPress}
                style={[
                  styles.micButton,
                  listening && { backgroundColor: Colors.primary },
                ]}
              >
                <Ionicons
                  name={listening ? "mic" : "mic-outline"}
                  size={42}
                  color={listening ? "#FFFFFF" : Colors.textPrimary}
                />
              </Pressable>
            </Animated.View>
            <Text style={styles.micLabel}>
              {listening ? "Tap to stop" : "Tap to start"}
            </Text>
          </View>

          {/* Quick examples */}
          {!listening && (
            <View style={styles.examples}>
              <Text style={styles.examplesTitle}>Try saying:</Text>
              <Text style={styles.example}>• &quot;Add task: Call mom at 3pm&quot;</Text>
              <Text style={styles.example}>• &ldquo;I spent 50 dollars on groceries&quot;</Text>
              <Text style={styles.example}>• &quot;Start focus mode for 25 minutes&quot;</Text>
            </View>
          )}
        </Animated.View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  background: {
    flex: 1,
  },
  container: {
    height: "90%",
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  listeningIndicator: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  micWrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  micOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  micButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  examples: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  example: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginVertical: 4,
    lineHeight: 20,
  },
});