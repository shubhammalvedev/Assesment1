import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ImageBackground } from 'react-native';
import { updateUserInSql } from '../db/database';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function ContactFormScreen() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    if (!name || !contact) {
      setErrorMessage('All fields are required');
      return;
    }

    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userRef = firestore().collection('users').doc(currentUser.uid);
        const {uid, email} =currentUser
        await userRef.set({
          name,
          contact,
          uid,
          email
        });
        await updateUserInSql(currentUser.uid, name, contact)
        setSuccessMessage('User added successfully');
        setErrorMessage('');
        setName('');
        setContact('');
      } else {
        setErrorMessage('Please sign in to add details');
      }
    } catch (error) {
      setErrorMessage('Error adding details: ' + error.message);
      setSuccessMessage('');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/AppBG.jpg')}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={text => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact"
          value={contact}
          onChangeText={text => setContact(text)}
          keyboardType="phone-pad"
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
        <Button title="Submit" onPress={handleSubmit} color="#FFA500" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 20,
  },
  input: {
    height: 40,
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
});
