import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { Colors } from "@/constants/Colors";

interface DateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate?: (date: string) => void;
}

export default function DateChangeModal({
  visible,
  onClose,
  onSelectDate,
}: DateModalProps) {
  const slideAnim = useRef(new Animated.Value(-600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (visible) openModal();
  }, [visible]);

  const openModal = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
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

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -600,
        duration: 300,
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

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleDayPress = (day: any) => {
    setSelected(day.dateString);
    onSelectDate?.(day.dateString);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={closeModal}
    >
      {/* ✅ TouchableWithoutFeedback bosilganda yopiladi */}
      <TouchableWithoutFeedback onPress={closeModal}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: backdropOpacity, zIndex: 1 },
          ]}
        >
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            intensity={70}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.4)",
              "rgba(20,20,30,0.5)",
              "rgba(30,30,40,0.4)",
            ]}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* 🔹 Content (touchable parent ustiga chiqmasligi uchun zIndex pastroq emas) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-start" }}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
              zIndex: 2,
            },
          ]}
        >


          <View style={styles.header}>
            <Text style={styles.title}>Select Date</Text>
            <Pressable onPress={closeModal} hitSlop={10}>
              <Ionicons name="close" size={26} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Calendar */}
          <Calendar
            onDayPress={handleDayPress}
            markedDates={
              selected
                ? { [selected]: { selected: true, selectedColor: Colors.primary } }
                : {}
            }
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: Colors.textSecondary,
              dayTextColor: Colors.textPrimary,
              monthTextColor: Colors.textPrimary,
              arrowColor: Colors.textPrimary,
              selectedDayTextColor: "#fff",
              todayTextColor: Colors.primary,
            }}
            style={styles.calendar}
          />

          {selected && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Selected: {selected}</Text>
              <Pressable onPress={closeModal} style={styles.confirmButton}>
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: "50%",
    height:"auto",
    width: "100%",
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom:10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  calendar: {
    borderRadius: 12,
    marginHorizontal: 16,
    backgroundColor: Colors.surface + "AA",
    marginTop: 10,
  },
  footer: {
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 10,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
