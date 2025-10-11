import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur"; // ✅ to‘g‘ri import

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SearchModal({ visible, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

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

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 1) {
      const mockData = [
        "How to improve focus",
        "Create a new task",
        "Budget tips 2025",
        "Plan my goals",
        "AI suggestions for finance",
        "Quick expenses list",
      ].filter((item) => item.toLowerCase().includes(text.toLowerCase()));
      setResults(mockData);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log("Selected:", item);
    closeModal();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={closeModal}
    >
      {/* 🔹 Background with blur + gradient */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: backdropOpacity, zIndex: 1 },
        ]}
      >
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

      <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
              zIndex: 2,
            },
          ]}
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
            {/* Header with Search Input */}
            <View style={styles.header}>
              <View style={styles.searchBar}>
                <Ionicons
                  name="search"
                  size={22}
                  color={Colors.textSecondary}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={query}
                  onChangeText={handleSearch}
                  placeholder="Search..."
                  placeholderTextColor={Colors.textSecondary + "99"}
                  autoFocus
                  style={styles.input}
                />
                {query.length > 0 && (
                  <Pressable onPress={() => setQuery("")}>
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </Pressable>
                )}
              </View>
              <Pressable onPress={closeModal} hitSlop={10}>
                <Ionicons name="close" size={26} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {/* Search Results */}
            <View style={styles.resultsWrapper}>
              {results.length > 0 ? (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        styles.resultItem,
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color={Colors.textSecondary}
                        style={{ marginRight: 12 }}
                      />
                      <Text style={styles.resultText}>{item}</Text>
                    </Pressable>
                  )}
                />
              ) : query.length > 1 ? (
                <Text style={styles.noResults}>No results found</Text>
              ) : (
                <Text style={styles.hintText}>
                  Start typing to see search results
                </Text>
              )}
            </View>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingVertical:6
  },
  resultsWrapper: {
    flex: 1,
    marginTop: 10,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomColor: Colors.textSecondary + "22",
    borderBottomWidth: 1,
  },
  resultText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  noResults: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: 20,
    fontSize: 15,
  },
  hintText: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: 20,
    fontSize: 15,
  },
});
