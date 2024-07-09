import React, { useEffect, useState, } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ImageBackground } from 'react-native';
import { fetchData } from '../db/database';
import { useNavigation } from '@react-navigation/native';

export default function SignupListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // Access navigation object using hook

  useEffect(() => {
    const fetchDataAsync = async () => {
      setLoading(true); // Set loading to true before fetching data
      try {
        const fetchedUsers = await fetchData('users');
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching (success or error)
      }
    };

    fetchDataAsync(); // Call the function on component mount

    // Re-fetch data on focus (navigation back to screen)
    const unsubscribe = navigation.addListener('focus', fetchDataAsync);

    return unsubscribe; // Cleanup function to remove listener on unmount
  }, [navigation]); // Dependency array: trigger re-fetch on navigation changes


  return (
    <ImageBackground
      source={require('../assets/AppBG.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Signup List</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <View style={styles.userDetails}>
                  <Text>{item.contact}</Text>
                  <Text style={styles.userName}>{item.email}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <Text>No users found!</Text>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  userItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
