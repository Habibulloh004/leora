import { Slot, useRouter } from 'expo-router';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Redirect authenticated users to main app
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <ImageBackground
      source={require("@assets/images/authBackground.png")}
      style={styles.background}
      resizeMode="cover" // or "contain" / "stretch" / "repeat" / "center"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authContainer}>
            <Image source={require("@assets/images/icon.png")} style={styles.logo} />
            <View>
              <Text style={styles.logoDesc}>
                MANAGE YOUR LIFE WITH
              </Text>
              <Text style={styles.logoTitle}>
                LEORA
              </Text>
            </View>
          </View>
          <Slot />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flexDirection: "row",
    height: "auto",
    justifyContent:"flex-start",
    paddingTop:32
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor:"#25252B"
  },
  container: {
    flex: 1,
    width:"100%",
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    width: "100%"
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingBottom: 32
  },
  logo: {
    width: 80,
    height: 100
  },
  logoTitle: {
    paddingLeft: 10,
    color: "#A6A6B9",
    fontWeight: "200",
    fontSize: 65,
    letterSpacing: 3
  },
  logoDesc: {
    fontSize: 18,
    color: "#A6A6B9"
  }
});
