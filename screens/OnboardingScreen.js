import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const navigation = useNavigation();
  
  const handleNext = () => {
    navigation.navigate('SignUp'); // Navigate to the next screen
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e9e9e9" />
      
      <View style={styles.content}>
        {/* Dog Image - Takes up most of the screen */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/dog-with-toy.png')} 
            style={styles.mainImage} 
            resizeMode="contain"
          />
        </View>
        
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.heading}>Always a scan away from home</Text>
          <Text style={styles.description}>
            Peace of mind, one scan away. With Petsy, you're never truly separated from your furry friend. 
            Petsy brings them back to you faster, giving you peace of mind every time they leave your side.
          </Text>
        </View>
        
        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Feather name="chevron-right" size={24} color="white" />
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
    position: 'relative', // For absolute positioning of the next button
  },
  imageContainer: {
    height: height * 0.65, // Takes up about 65% of the screen height
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: width * 0.9,
    height: '100%',
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  nextButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#0a3d62',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});