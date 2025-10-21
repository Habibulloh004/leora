import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bell, Dumbbell, PartyPopper } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Theme, useAppTheme } from '@/constants/theme';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  image?: any;
  icon?: any;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Time to do some SPORT',
    message: 'Arnold Schwarzenegger',
    time: '34m ago',
    image: require('@assets/images/notifImage.jpg'),
    icon: Dumbbell,
  },
  {
    id: '2',
    title: 'Payment Successful',
    message: 'Your monthly subscription is active.',
    time: '1h ago',
    icon: Bell,
  },
  {
    id: '3',
    title: 'Goal achieved',
    message: 'Weekly progress complete — keep it up!',
    time: 'Yesterday',
    image: require('@assets/images/notifImage.jpg'),
    icon: PartyPopper,
  },
  {
    id: '4',
    title: 'Goal achieved',
    message: 'Weekly progress complete — keep it up!',
    time: 'Yesterday',
    image: require('@assets/images/notifImage.jpg'),
    icon: PartyPopper,
  },
];

export default function NotificationsModalScreen() {
  const router = useRouter();
  const notifications = useMemo(() => MOCK_NOTIFICATIONS, []);
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleClose = () => {
    router.back();
  };

  const handleSelect = (item: NotificationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Notification opened:', item.title);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const IconComponent = item.icon || Bell;
          return (
            <Pressable
              onPress={() => handleSelect(item)}
              style={({ pressed }) => [styles.notificationItem, pressed && { opacity: 0.6 }]}
            >
              <View style={styles.card}>
                <View style={styles.notificationHeader}>
                <View style={styles.iconBox}>
                  <IconComponent size={20} color={colors.onPrimary} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                  </View>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>

                {item.image && (
                  <Image source={item.image} style={styles.notificationImage} resizeMode="cover" />
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.noResults}>No new notifications</Text>}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingTop: Platform.OS === 'ios' ? 12 : 40,
      backgroundColor: theme.colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.textSecondary + '33',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    notificationItem: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    iconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    notificationTitle: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    notificationMessage: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    notificationTime: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginLeft: 8,
    },
    notificationImage: {
      width: '100%',
      height: 160,
    },
    noResults: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      marginTop: 32,
      fontSize: 15,
    },
  });
