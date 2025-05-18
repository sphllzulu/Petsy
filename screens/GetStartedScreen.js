import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function GetStartedScreen() {
  const navigation = useNavigation();
  
  const handleGetStarted = () => {
    navigation.navigate('OnboardingScreen');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e9e9e9" />
      
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIconContainer}>
            <MaterialCommunityIcons name="paw" size={30} color="#0a3d62" style={styles.pawIcon} />
           
          </View>
          <Text style={styles.logoText}>Petsy</Text>
        </View>
        
        {/* Main Image - Enlarged to touch the button */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/dog-with-toy.png')} 
            style={styles.mainImage} 
            resizeMode="contain"
          />
        </View>
        
        {/* Get Started Button */}
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9e9e9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  logoIconContainer: {
    alignItems: 'center',
    marginRight: 5,
  },
  pawIcon: {
    marginBottom: -5, // Overlap slightly with location icon
  },
  locationIcon: {
    marginTop: -2, // Adjust position relative to paw icon
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a3d62',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  mainImage: {
    width: width * 0.9,
    height: height * 0.7, // Enlarged to take most of the screen space
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#0a3d62',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 10, // Reduced margin to allow image to get closer
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});