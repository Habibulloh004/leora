import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'

const InactiveModal = () => {
  return (
    <View style={styles.container}>
      <View>
        <Image source={require('@assets/images/icon.png')} style={styles.logo} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: "#000"
  },
  logo: {
    width: 96,
    height: 128,
    resizeMode: 'contain',
  },
})

export default InactiveModal