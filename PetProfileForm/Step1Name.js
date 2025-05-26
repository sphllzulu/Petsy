import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Common step header component
import StepHeader from './StepHeader';

const Step1Name = ({ petData, updatePetData, onNext, onBack, step, totalSteps }) => {
  const [petName, setPetName] = useState(petData.petName || '');
  const [isUploading, setIsUploading] = useState(false);

  // Cloudinary configuration - Replace with your actual values
  const CLOUDINARY_CLOUD_NAME = 'dkxkx7cn6'; // Replace with your cloud name
  const CLOUDINARY_UPLOAD_PRESET = 'absentee'; // Replace with your upload preset
  

  // Upload image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    try {
      setIsUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'pet_image.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      
      // Optional: Add folder (allowed in unsigned uploads)
      formData.append('folder', 'pet_images');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.secure_url) {
        // Update pet data with Cloudinary URL
        updatePetData({ petImage: data.secure_url });
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Alert.alert(
        'Upload Failed', 
        'Failed to upload image. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

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
        const imageUri = result.assets[0].uri;
        
        // First, show the local image for immediate feedback
        updatePetData({ petImage: imageUri, isLocalImage: true });
        
        // Then upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(imageUri);
        
        if (cloudinaryUrl) {
          // Update with Cloudinary URL
          updatePetData({ petImage: cloudinaryUrl, isLocalImage: false });
        } else {
          // Revert to no image if upload failed
          updatePetData({ petImage: null, isLocalImage: false });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error', 
        'Failed to pick image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle next button click
  const handleNext = () => {
    if (!petName.trim()) {
      Alert.alert('Missing Information', 'Please enter your pet\'s name');
      return;
    }

    if (isUploading) {
      Alert.alert('Please Wait', 'Image is still uploading. Please wait a moment.');
      return;
    }
    
    // Update pet data with name
    updatePetData({ petName });
    
    // Move to next step
    onNext();
  };

  const renderImageContainer = () => {
    if (isUploading) {
      return (
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="large" color="#0a3d62" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
          <View style={styles.cameraIconContainer}>
            <Feather name="camera" size={16} color="#fff" />
          </View>
        </View>
      );
    }

    if (petData.petImage) {
      return (
        <View style={styles.imageContainer}>
          <Image source={{ uri: petData.petImage }} style={styles.petImage} />
          <View style={styles.cameraIconContainer}>
            <Feather name="camera" size={16} color="#fff" />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Feather name="image" size={40} color="#ccc" />
        </View>
        <View style={styles.cameraIconContainer}>
          <Feather name="camera" size={16} color="#fff" />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StepHeader 
        title="Add Pet"
        subtitle={`Step ${step}/${totalSteps} • Pet Name`}
        onBack={onBack}
        progress={step / totalSteps}
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={[styles.imageContainerWrapper, isUploading && styles.disabled]} 
          onPress={isUploading ? null : pickImage}
          disabled={isUploading}
        >
          {renderImageContainer()}
        </TouchableOpacity>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What is your pet's name?</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter pet name"
            value={petName}
            onChangeText={setPetName}
            maxLength={30}
            editable={!isUploading}
          />
        </View>
      </ScrollView>
      
      {/* Button outside ScrollView to ensure it's always visible */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.nextButton, isUploading && styles.disabledButton]}
          onPress={handleNext}
          disabled={isUploading}
        >
          <Text style={styles.nextButtonText}>
            {isUploading ? 'Uploading...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white', // Ensure background is visible
  },
  imageContainerWrapper: {
    marginBottom: 30,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#0a3d62',
    textAlign: 'center',
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
    marginBottom:20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.7,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
});

export default Step1Name;