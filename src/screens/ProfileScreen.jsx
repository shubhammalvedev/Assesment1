import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ImageBackground } from 'react-native';
import auth from '@react-native-firebase/auth';
import { getUsers } from '../db/database';
import firestore from '@react-native-firebase/firestore';
export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [newContact, setNewContact] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [Loading, setIsLoading] = useState(false)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    const currentUser = auth().currentUser;
    
    if (currentUser) {
      getUsers(users => {
        const userData = users.find(u => 
          u.Email.toLocaleLowerCase() === currentUser.email.toLocaleLowerCase()
        );
        
        if (userData) {
          setUser(userData);
          setContact(userData.Contact);
        }
      });
    }})
   return unsubscribe;
}, [navigation]);

  const handleUpdateContact = useCallback(async (newContact) => {
    if (!newContact) {
      setErrorMessage('Please enter a new contact number');
      return;
    }
  
    setIsLoading(true); // Set loading indicator to true
  
    try {
      const currentUser = auth().currentUser;
  
      if (!currentUser) {
        setErrorMessage('You are not logged in');
        setIsLoading(false);
        return;
      }
  
      const db = firestore();
      const userRef = db.collection('users').doc(currentUser.uid);
  
      // Update contact directly using userRef
      await userRef.update({
        contact: newContact,
      });
  
      setSuccessMessage('Contact number updated successfully');
  
      // Optionally, fetch and update the user object in your app state
      // const updatedUser = await userRef.get();
      // updateUserState(updatedUser.data());
    } catch (error) {
      setIsLoading(false); // Set loading indicator to false after error
      setErrorMessage(error.message);
    }
  }, [auth, firestore, setErrorMessage, setIsLoading, setSuccessMessage]);
  

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/AppBG.jpg')}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        {user ? (
          <>
            <Text style={styles.label}>{user?.Name}</Text>
            <Text style={styles.infoText}>Email : {user.Email}</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={newContact}
              onChangeText={setNewContact}
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
            <View style={styles.buttonContainer}>
              <Button title="Update" onPress={()=>{handleUpdateContact(newContact)}} color="#FFA500" />
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Logout" onPress={handleLogout} color="#FF4500" />
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
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
    padding: 16,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
  },
  input: {
    width: '80%',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  success: {
    color: 'green',
    marginBottom: 10,
  },
});
