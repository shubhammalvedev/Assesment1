import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require('../assets/AppBG.jpg')}
      style={styles.background}
    >
      <Text style={styles.title}>Welcome to the Home Screen!</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: "center"
  }
})