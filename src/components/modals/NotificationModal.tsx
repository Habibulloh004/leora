import { Colors } from "@/constants/Colors";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Dumbbell, Bell, PartyPopper } from "lucide-react-native"; // ✅ Lucide icons

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  image?: any; // optional image
  icon?: any;
}

export default function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) openModal();
  }, [visible]);

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

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [800, 0],
  });

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // 🔹 Mock notification data
  const notifications: NotificationItem[] = [
    {
      id: "1",
      title: "Time to do some SPORT",
      message: "Arnold Schwarzenegger",
      time: "34m ago",
      image: require("@assets/images/notifImage.jpg"),
      icon: Dumbbell,
    },
    {
      id: "2",
      title: "Payment Successful",
      message: "Your monthly subscription is active.",
      time: "1h ago",
      icon: Bell,
    },
    {
      id: "3",
      title: "Goal achieved 🎯",
      message: "Weekly progress complete — keep it up!",
      time: "Yesterday",
      image: require("@assets/images/notifImage.jpg"),
      icon: PartyPopper,
    },
    {
      id: "4",
      title: "Goal achieved 🎯",
      message: "Weekly progress complete — keep it up!",
      time: "Yesterday",
      image: require("@assets/images/notifImage.jpg"),
      icon: PartyPopper,
    },
    {
      id: "5",
      title: "Goal achieved 🎯",
      message: "Weekly progress complete — keep it up!",
      time: "Yesterday",
      image: require("@assets/images/notifImage.jpg"),
      icon: PartyPopper,
    },
    {
      id: "6",
      title: "Goal achieved 🎯",
      message: "Weekly progress complete — keep it up!",
      time: "Yesterday",
      image: require("@assets/images/notifImage.jpg"),
      icon: PartyPopper,
    },
  ];

  const handleSelect = (item: NotificationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log("Notification opened:", item.title);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={closeModal}
    >
      {/* 🔹 Background blur + gradient */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: backdropOpacity, zIndex: 1 }]}
      >
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.3)",
            "rgba(20,20,30,0.4)",
            "rgba(30,30,40,0.3)",
          ]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Close by tapping outside */}
      <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Animated.View
          style={[styles.container, { transform: [{ translateY }], zIndex: 2 }]}
        >
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            intensity={70} tint="dark" style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              bottom: 0
            }} />


          <View style={styles.contentWrapper}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Notifications</Text>
              <Pressable onPress={closeModal} hitSlop={10}>
                <Ionicons name="close" size={26} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {/* Notification List */}
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80 }}
              renderItem={({ item }) => {
                const IconComponent = item.icon || Bell;

                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={({ pressed }) => [
                      styles.notificationItem,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <View style={styles.card}>
                      {/* Top section: icon + text + time */}
                      <View style={styles.notificationHeader}>
                        <View style={styles.iconBox}>
                          <IconComponent size={20} color="white" strokeWidth={2} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.notificationTitle}>{item.title}</Text>
                          <Text style={styles.notificationMessage}>{item.message}</Text>
                        </View>
                        <Text style={styles.notificationTime}>{item.time}</Text>
                      </View>

                      {/* Optional image */}
                      {item.image && (
                        <Image
                          source={item.image}
                          style={styles.notificationImage}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.noResults}>No new notifications</Text>
              }
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    overflow: "hidden",
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  // 🔹 ✅ yangi qo‘shilgan style
  notificationItem: {
    borderRadius: 16,
    overflow: "hidden",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  notificationTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  notificationMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  notificationTime: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
  notificationImage: {
    width: "100%",
    height: 160,
  },
  noResults: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: 40,
    fontSize: 15,
  },
});
