import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from 'react-native';

// Screen imports
import GetStartedScreen from "./screens/GetStartedScreen";
import MyPets from "./screens/MyPets";
import NotificationsScreen from "./screens/NotificationsScreen";
import ShopScreen from "./screens/ShopScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ScannerScreen from "./screens/ScannerScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import OtpVerificationScreen from "./screens/OtpVerificationScreen";
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 20,
          right: 20,
          elevation: 4,
          height: 60,
          backgroundColor: '#fff',
          paddingBottom: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          
          // Fix: Proper icon names for each tab
          if (route.name === "MyPets") {
            iconName = "paw-outline";
          } else if (route.name === "Notifications") {
            iconName = "notifications-outline";
          } else if (route.name === "Shop") {
            iconName = "cart-outline";
          } else if (route.name === "Settings") {
            iconName = "settings-outline";
          } else if (route.name === "Scanner") {
            iconName = "qr-code-outline";
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0a3d62",
        tabBarInactiveTintColor: "gray",
        tabBarButton: (props) => {
          // Special styling for the Scanner button
          if (route.name === 'Scanner') {
            return (
              <TouchableOpacity
                {...props}
                style={{
                  top: -10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: '#8CD136',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="qr-code-outline" size={35} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          }
          return <TouchableOpacity {...props} />;
        },
      })}
    >
      <Tab.Screen name="MyPets" component={MyPets} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
     
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="GetStartedScreen" // Changed initial route to MainApp so tabs show immediately
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="GetStartedScreen" component={GetStartedScreen} />
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <Stack.Screen name="MainApp" component={BottomTabNavigator} />
      {/* Individual screens for deep linking or direct navigation */}
      <Stack.Screen name="MyPets" component={MyPets} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppNavigator />
    </NavigationContainer>
  );
}