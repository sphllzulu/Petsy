import React from "react";
import { StatusBar, SafeAreaView, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';

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
import PetProfileScreen from "./screens/ProfileScreen";
import PrivacyPolicyScreen from "./screens/PrivacyPolicy";
import TermsOfServiceScreen from "./screens/TermsOfService";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingHorizontal: 20,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          
          if (route.name === "MyPets") {
            iconName = "paw-outline";
          } else if (route.name === "Notifications") {
            iconName = "notifications-outline";
          } else if (route.name === "Shop") {
            iconName = "cart-outline";
          } else if (route.name === "Settings") {
            iconName = "settings-outline";
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0a3d62",
        tabBarInactiveTintColor: "gray",
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
      initialRouteName="GetStartedScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="GetStartedScreen" component={GetStartedScreen} />
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <Stack.Screen name="MainApp" component={BottomTabNavigator} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="Profile" component={PetProfileScreen}/>
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </Stack.Navigator>
  );
}

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function App() {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.petsy.app"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </StripeProvider>
  );
}