import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, ImageBackground, ActivityIndicator } from 'react-native';
import { Input, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { fetchData, insertMultiUsers } from '../db/database';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [successMessage, setSuccessMessage] = useState(''); // Success message state

  const handleSignup = useCallback(async () => {
    if (!email || !password || !contact) {
      setErrorMessage('All fields are required');
      return;
    }

    setIsLoading(true); 
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const db = firestore();

      // Use userCredential.user.uid for the document ID
      const userRef = db.collection('users').doc(userCredential.user.uid);

      await userRef.set({
        contact,
        email,
        uid: userCredential.user.uid, // Add the UID to the user data
      });

      fetchData('users')
        .then(async (fetchedUsers) => {
          insertMultiUsers(fetchedUsers, () => {
            setIsLoading(false); // Set loading indicator to false after successful signup
            setSuccessMessage('User added successfully');
            setErrorMessage('');
          }, (error) => {
            console.error('Error inserting users:', error.message);
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } catch (error) {
      setIsLoading(false); // Set loading indicator to false after error
      setErrorMessage(error.message);
    }
  }, [email, password, contact, navigation]);

  useEffect(() => {
    // Clear error message on screen navigation (optional)
    return () => setErrorMessage('');
  }, [navigation]);

  return (
    <ImageBackground source={require('../assets/AppBG.jpg')} style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          leftIcon={<Icon name="email" size={24} color="white" />}
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          placeholderTextColor="#ddd"
        />
        <Input
          placeholder="Password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          leftIcon={<Icon name="lock" size={24} color="white" />}
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          placeholderTextColor="#ddd"
        />
        <Input
          placeholder="Contact Number"
          value={contact}
          onChangeText={setContact}
          leftIcon={<Icon name="phone" size={24} color="white" />}
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          placeholderTextColor="#ddd"
        />
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF6347" style={styles.loadingIndicator} />
        ) : (
          <Button
            title="Sign Up"
            onPress={handleSignup}
            buttonStyle={styles.signupButton}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.buttonTitle}
            disabled={isLoading} // Disable button while loading
          />
        )}
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
  loadingIndicator: {
    marginTop: 16,
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
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    color: 'white',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 16,
  },
  signupButton: {
    backgroundColor: '#FF6347',
    borderRadius: 25,
    paddingVertical: 10,
  },
  buttonContainer: {
    marginTop: 16,
  },
  buttonTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
