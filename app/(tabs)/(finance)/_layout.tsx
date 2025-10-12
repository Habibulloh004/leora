import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const FinanceLayout = () => {
  return (
    <Stack screenOptions={{
      headerShadowVisible: false
    }}>
      <Stack.Screen
        name={"(tabs)"
       }
      />
    </Stack>
  )
}

export default FinanceLayout