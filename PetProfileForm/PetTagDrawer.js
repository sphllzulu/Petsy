import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';

// Components
import QRScanView from './QRScan';
import ManualEntryView from './ManualEntry';
import Step1Name from './Step1Name';
import Step2Breed from './Step2Breed';
import Step3Birthday from './Step3Birthday';
import Step4Weight from './Step4Weight';
// import ReviewStep from './ReviewStep';

// Services
// import { saveTag } from '../../services/tagService';
// import { savePet } from '../../services/petService';
// import { uploadPetImage } from '../../services/storageService';

const { height } = Dimensions.get('window');

const PetTagDrawer = ({ visible, onClose, onPetAdded }) => {
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Pet data state
  const [petData, setPetData] = useState({
    tagId: null,
    serialNumber: '',
    petName: '',
    petImage: null, 
    breed: '',
    birthday: null,
    weight: '',
  });
  
  const drawerAnimation = useRef(new Animated.Value(0)).current;
  
  // Handle drawer visibility effects
  React.useEffect(() => {
    if (visible) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [visible]);
  
  // Open drawer animation
  const openDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  // Close drawer animation
  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // Reset state on completely closed
      if (!visible) {
        resetState();
      }
    });
  };
  
  // Reset all state when drawer is closed
  const resetState = () => {
    setIsManualEntry(false);
    setCurrentStep(0);
    setPetData({
      tagId: null,
      serialNumber: '',
      petName: '',
      petImage: null,
      breed: '',
      birthday: null,
      weight: '',
    });
    setLoading(false);
  };
  
  // Toggle between QR scan and manual entry
  const toggleEntryMethod = () => {
    setIsManualEntry(!isManualEntry);
  };
  
  // Handle tag addition (from either QR or manual entry)
  const handleTagAdded = async (serialNumber) => {
    try {
      // Create new tag ID
      const tagId = Date.now().toString();
      
      // Save tag locally
      await saveTag({
        id: tagId,
        serialNumber,
        addedAt: new Date().toISOString(),
      });
      
      // Update pet data
      setPetData({
        ...petData,
        tagId,
        serialNumber,
      });
      
      // Move to next step
      setCurrentStep(1);
    } catch (error) {
      console.error('Error adding tag:', error);
      Alert.alert('Error', 'Failed to add tag. Please try again.');
    }
  };
  
  // Update pet data for each step
  const updatePetData = (data) => {
    setPetData(prevData => ({
      ...prevData,
      ...data
    }));
  };
  
  // Handle next step navigation
  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };
  
  // Final submit - save pet to Firebase
  const handleSavePet = async () => {
    try {
      setLoading(true);
      
      // Upload image to Cloudinary if exists
      let imageUrl = null;
      if (petData.petImage) {
        imageUrl = await uploadPetImage(petData.petImage);
      }
      
      // Prepare pet data
      const completePetData = {
        ...petData,
        petImage: imageUrl,
        createdAt: new Date().toISOString(),
      };
      
      // Save to Firebase
      await savePet(completePetData);
      
      // Close drawer and notify parent about new pet
      setLoading(false);
      onPetAdded();
      
      Alert.alert('Success', `${petData.petName} has been added to your pets!`);
    } catch (error) {
      setLoading(false);
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Failed to save pet. Please try again.');
    }
  };
  
  // Calculate drawer height based on animation value
  const drawerHeight = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.8],
  });
  
  // Calculate drawer opacity based on animation value
  const drawerOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  // Render correct step content based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return isManualEntry ? (
          <ManualEntryView 
            onTagAdded={handleTagAdded}
            onToggleMethod={toggleEntryMethod}
            loading={loading}
          />
        ) : (
          <QRScanView 
            onTagAdded={handleTagAdded}
            onToggleMethod={toggleEntryMethod}
          />
        );
      case 1:
        return (
          <Step1Name
            petData={petData}
            updatePetData={updatePetData}
            onNext={handleNext}
            onBack={handleBack}
            step={1}
            totalSteps={5}
          />
        );
      case 2:
        return (
          <Step2Breed
            petData={petData}
            updatePetData={updatePetData}
            onNext={handleNext}
            onBack={handleBack}
            step={2}
            totalSteps={5}
          />
        );
      case 3:
        return (
          <Step3Birthday
            petData={petData}
            updatePetData={updatePetData}
            onNext={handleNext}
            onBack={handleBack}
            step={3}
            totalSteps={5}
          />
        );
      case 4:
        return (
          <Step4Weight
            petData={petData}
            updatePetData={updatePetData}
            onNext={handleNext}
            onBack={handleBack}
            step={4}
            totalSteps={5}
          />
        );
    //   case 5:
    //     return (
    //       <ReviewStep
    //         petData={petData}
    //         onBack={handleBack}
    //         onSubmit={handleSavePet}
    //         loading={loading}
    //       />
    //     );
      default:
        return null;
    }
  };
  
  return (
    <>
      {/* Overlay */}
      {visible && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onClose}
        />
      )}
      
      {/* Drawer */}
      {visible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <Animated.View 
            style={[
              styles.drawer, 
              { 
                height: drawerHeight,
                opacity: drawerOpacity 
              }
            ]}
          >
            {renderStepContent()}
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
});

export default PetTagDrawer;