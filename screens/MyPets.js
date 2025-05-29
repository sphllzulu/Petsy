import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { firestore,auth } from '../utils/firebaseConfig'; 
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import BreedSelectionStep from '../PetProfileForm/Step2Breed';
import AgeSelectionStep from '../PetProfileForm/Step3Birthday';
import WeightSelectionStep from '../PetProfileForm/Step4Weight';
import ConfirmationStep from '../PetProfileForm/StepHeader';

const { height, width } = Dimensions.get('window');

export default function MyPetsScreen({ navigation }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [petTags, setPetTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petInfoModalVisible, setPetInfoModalVisible] = useState(false);
  
  // Pet profile creation state
  const [currentStep, setCurrentStep] = useState(0);
  const [petData, setPetData] = useState({
    id: Date.now().toString(),
    name: '',
    imageUrl: null,
    breed: '',
    birthdate: new Date(),
    age: 0,
    weight: 23,
    tagId: null,
    serialNumber: null,
    imei: null,
  });

  const drawerAnimation = useRef(new Animated.Value(0)).current;
  
  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = 'dkxkx7cn6';
  const CLOUDINARY_UPLOAD_PRESET = 'absentee';
  const CLOUDINARY_API_KEY = '132915248797529';
  
  // Load saved pet tags from Firebase on component mount
  useEffect(() => {
    
    
    requestCameraPermission();
  }, []);

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, load their pets
      loadPetTags();
    } else {
      // User is signed out, clear pets
      setPetTags([]);
    }
  });

  // Cleanup subscription on unmount
  return () => unsubscribe();
}, []);
  
  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to upload pet photos');
    }
  };
  
  // Load pet tags from Firebase
 const loadPetTags = async () => {
  try {
    setLoading(true);
    
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No authenticated user found');
      setPetTags([]);
      return;
    }
    
    const petsRef = collection(firestore, 'pets');
    // Add where clause to filter by userId
    const q = query(
      petsRef, 
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const pets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      birthdate: doc.data().birthdate?.toDate() || new Date()
    }));
    
    setPetTags(pets);
  } catch (error) {
    console.error('Error loading pets from Firebase:', error);
    Alert.alert('Error', 'Failed to load pets. Please try again.');
  } finally {
    setLoading(false);
  }
};

const checkUserAuthentication = () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    Alert.alert(
      'Authentication Required', 
      'Please log in to manage your pets.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to login screen if you have one
            // navigation.navigate('Login');
          }
        }
      ]
    );
    return false;
  }
  return true;
};


  // Handle pet card press - show more info modal
  const handlePetCardPress = (pet) => {
    setSelectedPet(pet);
    setPetInfoModalVisible(true);
  };

  // Navigate to pet profile
  const navigateToPetProfile = (pet) => {
    setPetInfoModalVisible(false);
    navigation.navigate('Profile', { pet });
  };

  // Navigate to camera scanner
  const navigateToScanner = () => {
    navigation.navigate('Scanner', {
      onScanSuccess: handleScanSuccess
    });
  };

  // Handle successful QR scan
  const handleScanSuccess = async (scannedData) => {
    try {
      setLoading(true);
      
      // Extract serial number from scanned data
      const extractedSerial = extractSerialFromQR(scannedData);
      
      // Check if tag is already taken
      const availability = await checkTagAvailability(extractedSerial);
      
      if (!availability.available) {
        Alert.alert(
          'Tag Already Taken', 
          `This tag is already associated with "${availability.takenBy}". Please use a different tag.`,
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      // Find the QR code data
      const qrCodeData = await findQRCodeData(extractedSerial);
      
      if (!qrCodeData) {
        Alert.alert('Invalid QR Code', 'This QR code is not registered in the system.');
        setLoading(false);
        return;
      }
      
      // Update pet data with tag info
      updatePetData({ 
        tagId: Date.now().toString(),
        serialNumber: qrCodeData.serialNumber,
        imei: qrCodeData.imei,
        websiteUrl: qrCodeData.websiteUrl,
        tagMethod: 'qr' 
      });
      
      // Open drawer and move to next step (pet name)
      openDrawer();
      setCurrentStep(1);
      setLoading(false);
      
      Alert.alert('Success', 'QR code scanned and verified successfully!');
    } catch (error) {
      setLoading(false);
      console.error('Error processing QR scan:', error);
      Alert.alert('Error', 'Failed to process QR scan. Please try again.');
    }
  };
  
  // Check if tag/serial number is already taken
  const checkTagAvailability = async (serialOrImei) => {
    try {
      const petsRef = collection(firestore, 'pets');
      const q1 = query(petsRef, where('serialNumber', '==', serialOrImei));
      const q2 = query(petsRef, where('imei', '==', serialOrImei));
      
      const [serialSnapshot, imeiSnapshot] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);
      
      if (!serialSnapshot.empty || !imeiSnapshot.empty) {
        const existingPet = !serialSnapshot.empty ? 
          serialSnapshot.docs[0].data() : 
          imeiSnapshot.docs[0].data();
        
        return {
          available: false,
          takenBy: existingPet.name || 'Unknown Pet'
        };
      }
      
      return { available: true };
    } catch (error) {
      console.error('Error checking tag availability:', error);
      throw error;
    }
  };
  
  // Find QR code data by serial number or IMEI
  const findQRCodeData = async (serialOrImei) => {
    try {
      const qrCodesRef = collection(firestore, 'qrCodes');
      
      const serialQuery = query(qrCodesRef, where('serialNumber', '==', serialOrImei));
      const serialSnapshot = await getDocs(serialQuery);
      
      if (!serialSnapshot.empty) {
        return serialSnapshot.docs[0].data();
      }
      
      const imeiQuery = query(qrCodesRef, where('imei', '==', serialOrImei));
      const imeiSnapshot = await getDocs(imeiQuery);
      
      if (!imeiSnapshot.empty) {
        return imeiSnapshot.docs[0].data();
      }
      
      return null;
    } catch (error) {
      console.error('Error finding QR code data:', error);
      throw error;
    }
  };
  
  // Upload image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'pet_image.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
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
  
  // Open drawer
 const openDrawer = () => {
  if (!checkUserAuthentication()) {
    return;
  }
  
  setDrawerVisible(true);
  Animated.timing(drawerAnimation, {
    toValue: 1,
    duration: 300,
    useNativeDriver: false,
  }).start();
};

  
  // Close drawer
  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setDrawerVisible(false);
      resetDrawerState();
    });
  };
  
  // Reset drawer state
  const resetDrawerState = () => {
    setIsManualEntry(false);
    setSerialNumber('');
    setCurrentStep(0);
    setIsUploading(false);
    setPetData({
      id: Date.now().toString(),
      name: '',
      imageUrl: null,
      breed: '',
      birthdate: new Date(),
      age: 0,
      weight: 23,
      tagId: null,
      serialNumber: null,
      imei: null,
    });
  };
  
  // Toggle between QR scan and manual entry
  const toggleManualEntry = () => {
    setIsManualEntry(!isManualEntry);
  };

  // Update pet data
  const updatePetData = (newData) => {
    setPetData(prevData => ({ ...prevData, ...newData }));
  };
  
  // Add new pet tag with manual serial number
  const addPetTagManually = async () => {
    if (!serialNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid serial number or IMEI');
      return;
    }
    
    setLoading(true);
    
    try {
      const availability = await checkTagAvailability(serialNumber.trim());
      
      if (!availability.available) {
        Alert.alert(
          'Tag Already Taken', 
          `This tag is already associated with "${availability.takenBy}". Please use a different tag.`,
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      const qrCodeData = await findQRCodeData(serialNumber.trim());
      
      if (!qrCodeData) {
        Alert.alert(
          'Tag Not Found',
          'This serial number or IMEI is not registered in the system. Please contact support or verify the number.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      updatePetData({ 
        tagId: Date.now().toString(),
        serialNumber: qrCodeData.serialNumber,
        imei: qrCodeData.imei,
        websiteUrl: qrCodeData.websiteUrl,
        tagMethod: 'manual' 
      });
      
      setCurrentStep(1);
      setLoading(false);
      
      Alert.alert('Success', 'Tag verified and linked successfully!');
    } catch (error) {
      setLoading(false);
      console.error('Error adding pet tag:', error);
      Alert.alert('Error', 'Failed to verify tag. Please try again.');
    }
  };
  
  // Extract serial number from QR code data
  const extractSerialFromQR = (qrData) => {
    try {
      const urlParts = qrData.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const [serial, imei] = lastPart.split('-');
      return serial;
    } catch (error) {
      console.error('Error extracting serial from QR:', error);
      return qrData;
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
        updatePetData({ imageUrl: imageUri, isLocalImage: true });
        
        const cloudinaryUrl = await uploadToCloudinary(imageUri);
        
        if (cloudinaryUrl) {
          updatePetData({ imageUrl: cloudinaryUrl, isLocalImage: false });
        } else {
          updatePetData({ imageUrl: null, isLocalImage: false });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  // Handle next button in first step (pet name)
  const handleNameNext = () => {
    if (!petData.name) {
      Alert.alert('Error', 'Please enter your pet\'s name');
      return;
    }
    
    if (isUploading) {
      Alert.alert('Please Wait', 'Image is still uploading. Please wait a moment.');
      return;
    }
    
    setCurrentStep(2);
  };
  
  // Handle next button in breed step
  const handleBreedNext = () => {
    if (!petData.breed) {
      Alert.alert('Error', 'Please select a breed for your pet');
      return;
    }
    
    setCurrentStep(3);
  };
  
  // Handle next button in age step
  const handleAgeNext = () => {
    setCurrentStep(4);
  };
  
  // Handle next button in weight step
  const handleWeightNext = () => {
    setCurrentStep(5);
  };
  
  // Complete pet addition
  const handleComplete = async () => {
  setLoading(true);
  
  try {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to add a pet.');
      setLoading(false);
      return;
    }
    
    const newPet = {
      name: petData.name,
      imageUrl: petData.imageUrl,
      breed: petData.breed,
      birthdate: Timestamp.fromDate(petData.birthdate),
      age: petData.age,
      weight: petData.weight,
      serialNumber: petData.serialNumber,
      imei: petData.imei,
      tagId: petData.tagId,
      websiteUrl: petData.websiteUrl,
      tagMethod: petData.tagMethod,
      userId: currentUser.uid, // Add this line
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const petsRef = collection(firestore, 'pets');
    const docRef = await addDoc(petsRef, newPet);
    
    if (petData.serialNumber) {
      await updateQRCodeStatus(petData.serialNumber, {
        status: 'assigned',
        assignedToPet: docRef.id,
        assignedToPetName: petData.name,
        assignedToPetImage: petData.imageUrl,
        assignedToUser: currentUser.uid, // Also track which user owns this tag
        assignedAt: Timestamp.now()
      });
    }
    
    await loadPetTags();
    
    setLoading(false);
    closeDrawer();
    
    Alert.alert('Success', `${petData.name} has been added to your pets!`);
  } catch (error) {
    setLoading(false);
    console.error('Error saving pet profile:', error);
    Alert.alert('Error', 'Failed to save pet profile. Please try again.');
  }
};
  
  // Update QR code status when assigned to a pet
  const updateQRCodeStatus = async (serialNumber, updateData) => {
    try {
      const qrCodesRef = collection(firestore, 'qrCodes');
      const q = query(qrCodesRef, where('serialNumber', '==', serialNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const qrDoc = querySnapshot.docs[0];
        await updateDoc(doc(firestore, 'qrCodes', qrDoc.id), updateData);
      }
    } catch (error) {
      console.error('Error updating QR code status:', error);
    }
  };
  
  // Go back to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      closeDrawer();
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
  
  // Render image container with upload state
  const renderImageContainer = () => {
    if (isUploading) {
      return (
        <View style={styles.petImageContainer}>
          <View style={styles.petImagePlaceholder}>
            <ActivityIndicator size="large" color="#0a3d62" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
          <View style={styles.cameraIconContainer}>
            <Feather name="camera" size={16} color="#fff" />
          </View>
        </View>
      );
    }

    if (petData.imageUrl) {
      return (
        <View style={styles.petImageContainer}>
          <Image source={{ uri: petData.imageUrl }} style={styles.petImage} />
          <View style={styles.cameraIconContainer}>
            <Feather name="camera" size={16} color="#fff" />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.petImageContainer}>
        <View style={styles.petImagePlaceholder}>
          <Feather name="image" size={40} color="#ccc" />
        </View>
        <View style={styles.cameraIconContainer}>
          <Feather name="camera" size={16} color="#fff" />
        </View>
      </View>
    );
  };

  // Render pet info modal
  const renderPetInfoModal = () => {
    if (!selectedPet) return null;

    const age = selectedPet.age || Math.floor((new Date() - selectedPet.birthdate) / (365.25 * 24 * 60 * 60 * 1000));

    return (
      <Modal
        visible={petInfoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPetInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setPetInfoModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalPetInfo}>
              <View style={styles.modalImageContainer}>
                {selectedPet.imageUrl ? (
                  <Image 
                    source={{ uri: selectedPet.imageUrl }} 
                    style={styles.modalPetImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.modalImagePlaceholder}>
                    <Feather name="image" size={40} color="#ccc" />
                  </View>
                )}
              </View>

              <Text style={styles.modalPetName}>{selectedPet.name}</Text>
              
              <View style={styles.modalPetDetails}>
                {selectedPet.breed && (
                  <View style={styles.modalDetailRow}>
                    <Feather name="award" size={16} color="#666" />
                    <Text style={styles.modalDetailText}>Breed: {selectedPet.breed}</Text>
                  </View>
                )}
                
                <View style={styles.modalDetailRow}>
                  <Feather name="calendar" size={16} color="#666" />
                  <Text style={styles.modalDetailText}>Age: {age} years old</Text>
                </View>
                
                {selectedPet.weight && (
                  <View style={styles.modalDetailRow}>
                    <Feather name="activity" size={16} color="#666" />
                    <Text style={styles.modalDetailText}>Weight: {selectedPet.weight} kg</Text>
                  </View>
                )}
                
                {selectedPet.serialNumber && (
                  <View style={styles.modalDetailRow}>
                    <Feather name="tag" size={16} color="#666" />
                    <Text style={styles.modalDetailText}>Tag: {selectedPet.serialNumber}</Text>
                  </View>
                )}
                
                {selectedPet.imei && (
                  <View style={styles.modalDetailRow}>
                    <Feather name="smartphone" size={16} color="#666" />
                    <Text style={styles.modalDetailText}>IMEI: {selectedPet.imei}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={() => navigateToPetProfile(selectedPet)}
              >
                <Text style={styles.viewProfileButtonText}>View Full Profile</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  // Render drawer content based on current step
  const renderDrawerContent = () => {
    switch (currentStep) {
      case 0:
        return isManualEntry ? (
          <View style={styles.drawerContent}>
            <Text style={styles.drawerTitle}>Enter Serial Number or IMEI</Text>
            <Text style={styles.drawerSubtitle}>
              Please enter the serial number or IMEI from your Petsy tag
            </Text>
            
            <TextInput
              style={styles.serialInput}
              placeholder="Enter serial number or IMEI"
              value={serialNumber}
              onChangeText={setSerialNumber}
              keyboardType="default"
              autoCapitalize="characters"
            />
            
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={addPetTagManually}
              disabled={loading}
            >
              <Text style={styles.addTagButtonText}>
                {loading ? 'Verifying...' : 'Verify Tag'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.manualEntryLink}
              onPress={toggleManualEntry}
            >
              <Text style={styles.manualEntryText}>Scan QR code instead</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.drawerContent}>
            <Text style={styles.drawerTitle}>Pet tags</Text>
            <Text style={styles.drawerSubtitle}>
              Scan the QR code on the tag using your camera. All your pet tags will appear here.
            </Text>
            
            <View style={styles.tagsImageContainer}>
              <Image 
                source={require('../assets/pet-tag.png')} 
                style={styles.tagsImage}
                resizeMode="contain"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={navigateToScanner}
              disabled={loading}
            >
              <Text style={styles.addTagButtonText}>
                {loading ? 'Processing...' : 'Scan Petsy Tag'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.manualEntryLink}
              onPress={toggleManualEntry}
            >
              <Text style={styles.manualEntryText}>Manually type serial number</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 1:
  return (
    <View style={styles.drawerContent}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>Add Pet</Text>
          <Text style={styles.stepSubtitle}>Step 1/4 • Pet Name</Text>
        </View>
      </View>
      
      <View style={styles.stepIndicator}>
        <View style={styles.stepLine}>
          <View style={[styles.stepLineActive, { width: '25%' }]} />
        </View>
      </View>
      
      {/* Wrap content in ScrollView */}
      <ScrollView 
        style={styles.petProfileScrollView}
        contentContainerStyle={styles.petProfileScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={[styles.petImageContainer, isUploading && styles.disabled]} 
          onPress={isUploading ? null : pickImage}
          disabled={isUploading}
        >
          {renderImageContainer()}
        </TouchableOpacity>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What is your pet's name?</Text>
          <TextInput
            style={styles.petNameInput}
            placeholder="Enter pet name"
            value={petData.name}
            onChangeText={(text) => updatePetData({ name: text })}
            maxLength={30}
            editable={!isUploading}
          />
        </View>
        
        {petData.serialNumber && (
          <View style={styles.tagInfoContainer}>
            <Text style={styles.tagInfoLabel}>Tag Information:</Text>
            <Text style={styles.tagInfoText}>Serial: {petData.serialNumber}</Text>
            {petData.imei && <Text style={styles.tagInfoText}>IMEI: {petData.imei}</Text>}
          </View>
        )}
      </ScrollView>
      
      {/* Button outside ScrollView */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.nextButton, (isUploading || !petData.name) && styles.disabledButton]}
          onPress={handleNameNext}
          disabled={isUploading || !petData.name}
        >
          <Text style={styles.nextButtonText}>
            {isUploading ? 'Uploading...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
        
      case 2:
        return (
          <BreedSelectionStep
            petData={petData}
            selectedBreed={petData.breed}
            onBreedSelect={(breed) => updatePetData({ breed })}
            onBack={handleBack}
            onNext={handleBreedNext}
          />
        );
        
      case 3:
        return (
          <AgeSelectionStep
            petData={petData}
            onBack={handleBack}
            onNext={handleAgeNext}
            updatePetData={updatePetData}
          />
        );
        
      case 4:
        return (
          <WeightSelectionStep
            petData={petData}
            onBack={handleBack}
            onNext={handleWeightNext}
            updatePetData={updatePetData}
          />
        );
        
      case 5:
        return (
          <ConfirmationStep
            petData={petData}
            onComplete={handleComplete}
            loading={loading}
          />
        );
        
      default:
        return null;
    }
  };
  
  // Render pet cards in the main screen
 const renderPetCards = () => {
  return petTags.map((pet) => (
    <TouchableOpacity
      key={pet.id}
      style={styles.petCard}
      onPress={() => handlePetCardPress(pet)}
      activeOpacity={0.7}
    >
      <View style={styles.petCardImageContainer}>
        {pet.imageUrl ? (
          <Image 
            source={{ uri: pet.imageUrl }} 
            style={styles.petCardImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.petCardImagePlaceholder}>
            <Feather name="image" size={20} color="#ccc" />
          </View>
        )}
      </View>
      <View style={styles.petCardInfo}>
        <Text style={styles.petCardName}>{pet.name}</Text>
        {pet.breed && <Text style={styles.petCardBreed}>{pet.breed}</Text>}
        {pet.serialNumber && <Text style={styles.petCardTag}>#{pet.serialNumber}</Text>}
      </View>
      <View style={styles.petCardArrow}>
        <Feather name="chevron-right" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  ));
};
  
  return (
    <SafeAreaView style={styles.container}>
    
      
      {/* Main Content */}
      <View style={styles.content}>
        {loading && petTags.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#0a3d62" />
            <Text style={styles.loadingText}>Loading your pets...</Text>
          </View>
        ) : petTags.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="heart" size={48} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No pets yet</Text>
            <Text style={styles.emptyStateText}>Add your first pet to get started</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.petScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.petScrollContent}
          >
            <View style={styles.petList}>
              {renderPetCards()}
            </View>
          </ScrollView>
        )}
        
        {/* Add Pet Button */}
        <TouchableOpacity style={styles.addButton} onPress={openDrawer}>
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Pet</Text>
        </TouchableOpacity>
      </View>
      

      {/* Pet Info Modal */}
      {renderPetInfoModal()}
      
      {/* Drawer Overlay */}
      {drawerVisible && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={closeDrawer}
        />
      )}
      
      {/* Drawer */}
      {drawerVisible && (
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
            {renderDrawerContent()}
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  petScrollView: {
    flex: 1,
  },
  petScrollContent: {
    paddingBottom: 100,
  },
  petList: {
  padding: 16,
  paddingTop: 24,
  marginTop: 16,
},
 petCard: {
  backgroundColor: '#fff',
  borderRadius: 16,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
  overflow: 'hidden',
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  height: 80,
},
  petCardImageContainer: {
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '#f8f9fa',
  overflow: 'hidden',
  marginRight: 16,
},
petCardImage: {
  width: '100%',
  height: '100%',
},
petCardImagePlaceholder: {
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f8f9fa',
},
 petCardInfo: {
  flex: 1,
  justifyContent: 'center',
},
petCardName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#212529',
  marginBottom: 2,
},
petCardBreed: {
  fontSize: 13,
  color: '#666',
  marginBottom: 2,
},
  petCardTag: {
  fontSize: 11,
  color: '#0a3d62',
  fontWeight: '500',
  opacity: 0.8,
},
petCardArrow: {
  paddingLeft: 8,
},
  petCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tapToViewText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#0a3d62',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalPetInfo: {
    paddingHorizontal: 20,
  },
  modalImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  modalPetImage: {
    width: '100%',
    height: '100%',
  },
  modalImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPetName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalPetDetails: {
    marginBottom: 32,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailText: {
    fontSize: 16,
    color: '#495057',
    marginLeft: 12,
  },
  viewProfileButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  // Drawer Styles
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  drawerSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  tagsImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  tagsImage: {
    width: 200,
    height: 150,
  },
  addTagButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addTagButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  manualEntryLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  manualEntryText: {
    color: '#0a3d62',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  serialInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
  },
  // Pet Profile Form Styles
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  stepIndicator: {
    marginBottom: 32,
  },
  stepLine: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
  },
  stepLineActive: {
    height: '100%',
    backgroundColor: '#0a3d62',
    borderRadius: 2,
  },
  petProfileContent: {
    flex: 1,
  },
  petImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  petImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#0a3d62',
    borderRadius: 12,
    padding: 6,
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  disabled: {
    opacity: 0.6,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  petNameInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  tagInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tagInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  tagInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  petProfileScrollView: {
    flex: 1,
  },
  petProfileScrollContent: {
    paddingBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 0,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  // Update the existing nextButton style:
  nextButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    // Remove marginTop: 'auto'
    // Keep marginBottom: 20 only if needed
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});