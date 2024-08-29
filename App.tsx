import 'react-native-gesture-handler';
import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase, { ReactNativeFirebase } from '@react-native-firebase/app';
import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ContactFormScreen from './src/screens/ContactFormScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SignupListScreen from './src/screens/SignupListScreen';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen';
import { AuthProvider, AuthContext } from './src/authconfig/AuthProvider';
import { createTable } from './src/db/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBywqR8eBT8ur6bNJuM3GjGc9z_D3lmAs",         // From api_key[0].current_key
  authDomain: "first-5b5a4.firebaseapp.com",                 // Typically constructed as "project_id.firebaseapp.com"
  projectId: "first-5b5a4",                                  // From project_info.project_id
  storageBucket: "first-5b5a4.appspot.com",                  // From project_info.storage_bucket
  messagingSenderId: "442798887176",                         // From project_info.project_number
  appId: "1:442798887176:android:34330938dc54db96df9cbd"     // From client[0].client_info.mobilesdk_app_id
};


const initializeFirebase = (firebaseConfig: ReactNativeFirebase.FirebaseAppOptions, callback: () => void) => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    // Execute callback after initialization
    if (typeof callback === 'function') {
      callback();
    }
  } else {
    // Firebase is already initialized
    if (typeof callback === 'function') {
      callback();
    }
  }
};

// console.log('firebase.apps.length',firebase.apps);

if (!firebase.apps.length) {
  initializeFirebase(firebaseConfig, () => {
    console.log('Firebase initialized!');
    // Your post-initialization logic here
  });
  
}


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: '#ed4c7f' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Dashboard') {
          iconName = 'dashboard';
        } else if (route.name === 'ContactForm') {
          iconName = 'perm-contact-cal';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        } else if (route.name === 'SignupList') {
          iconName = 'person-search';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ed4c7f',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="ContactForm" component={ContactFormScreen} options={{ tabBarLabel: 'Contact Form' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    <Tab.Screen name="SignupList" component={SignupListScreen} options={{ tabBarLabel: 'Signup List' }} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#ed4c7f' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      headerTitleAlign: 'center'
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {user ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {
  useEffect(() => {
    createTable().catch(error => {
      console.error('Error creating table: ', error);
    });
  }, []);

  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#ed4c7f" />
      <RootNavigator />
    </AuthProvider>
  );
};

export default App;
