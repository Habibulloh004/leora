import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

interface VoiceAiModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function VoiceAiModal({ visible, onClose }: VoiceAiModalProps) {
  const [listening, setListening] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Open modal
  const openModal = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 10,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close modal
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  // Run animation when visible changes
  if (visible) openModal();

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [800, 0],
  });

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setListening(!listening);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={closeModal}
    >
      {/* Animated gradient background */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
      >
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.85)",
            "rgba(20,20,30,0.7)",
            "rgba(30,30,40,0.6)",
          ]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Close on background press */}
      <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />

      {/* Modal content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Voice AI Assistant</Text>
            <Pressable onPress={closeModal} hitSlop={10}>
              <Ionicons name="close" size={28} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {listening ? "I'm listening..." : "Ready to help"}
            </Text>
            <Text style={styles.description}>
              {listening
                ? "Speak naturally. I'll convert your voice into tasks, notes, or expenses."
                : "Tap the microphone and speak your command. I'll understand and help you."}
            </Text>
          </View>

          <View style={styles.micWrapper}>
            <Animated.View
              style={[
                styles.micOuter,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: listening
                    ? Colors.primary + "33"
                    : Colors.surface,
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
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "88%",
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
});
