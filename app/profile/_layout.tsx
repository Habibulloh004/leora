import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#FFFFFF',
        headerStyle: { backgroundColor: '#1E1E24' },
        contentStyle: { backgroundColor: '#25252B' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          title: 'Security',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
