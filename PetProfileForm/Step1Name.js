import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Common step header component
import StepHeader from './StepHeader';

const Step1Name = ({ petData, updatePetData, onNext, onBack, step, totalSteps }) => {
  const [petName, setPetName] = useState(petData.petName || '');

  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        updatePetData({ petImage: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image. Please try again.');
    }
  };

  // Handle next button click
  const handleNext = () => {
    if (!petName.trim()) {
      alert('Please enter your pet\'s name');
      return;
    }
    
    // Update pet data with name
    updatePetData({ petName });
    
    // Move to next step
    onNext();
  };

  return (
    <View style={styles.container}>
      <StepHeader 
        title="Add Pet"
        subtitle={`Step ${step}/${totalSteps} • Pet Name`}
        onBack={onBack}
        progress={step / totalSteps}
      />
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {petData.petImage ? (
            <Image source={{ uri: petData.petImage }} style={styles.petImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={40} color="#ccc" />
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Feather name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What is your pet's name?</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter pet name"
            value={petName}
            onChangeText={setPetName}
            maxLength={30}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    position: 'relative',
    overflow: 'visible',
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0a3d62',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  nameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    fontSize: 16,
    width: '100%',
  },
  nextButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
    marginBottom: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Step1Name;