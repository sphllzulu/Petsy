// import React, { useState, useEffect, useRef } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   Animated,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   Alert
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import BreedSelectionStep from '../PetProfileForm/Step2Breed';

// const { height, width } = Dimensions.get('window');

// export default function MyPetsScreen() {
//   const [drawerVisible, setDrawerVisible] = useState(false);
//   const [isManualEntry, setIsManualEntry] = useState(false);
//   const [serialNumber, setSerialNumber] = useState('');
//   const [petTags, setPetTags] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // Pet profile creation state
//   const [currentStep, setCurrentStep] = useState(0); // 0: tag, 1: name, 2: breed, 3: age, 4: weight, 5: confirmation
//   const [petName, setPetName] = useState('');
//   const [petImage, setPetImage] = useState(null);
//   const [petBreed, setPetBreed] = useState('');
//   const [currentTagId, setCurrentTagId] = useState(null);

  
//   const drawerAnimation = useRef(new Animated.Value(0)).current;
  
//   // Load saved pet tags from AsyncStorage on component mount
//   useEffect(() => {
//     loadPetTags();
//     requestCameraPermission();
//   }, []);
  
//   // Request camera permissions
//   const requestCameraPermission = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission needed', 'Please grant camera permissions to upload pet photos');
//     }
//   };
  
//   // Load pet tags from AsyncStorage
//   const loadPetTags = async () => {
//     try {
//       const savedTags = await AsyncStorage.getItem('petTags');
//       if (savedTags) {
//         setPetTags(JSON.parse(savedTags));
//       }
//     } catch (error) {
//       console.error('Error loading pet tags:', error);
//     }
//   };
  
//   // Save pet tags to AsyncStorage
//   const savePetTags = async (tags) => {
//     try {
//       await AsyncStorage.setItem('petTags', JSON.stringify(tags));
//     } catch (error) {
//       console.error('Error saving pet tags:', error);
//     }
//   };
  
//   // Open drawer
//   const openDrawer = () => {
//     setDrawerVisible(true);
//     Animated.timing(drawerAnimation, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   };
  
//   // Close drawer
//   const closeDrawer = () => {
//     Animated.timing(drawerAnimation, {
//       toValue: 0,
//       duration: 300,
//       useNativeDriver: false,
//     }).start(() => {
//       setDrawerVisible(false);
//       resetDrawerState();
//     });
//   };
  
//   // Reset drawer state
//   const resetDrawerState = () => {
//     setIsManualEntry(false);
//     setSerialNumber('');
//     setCurrentStep(0);
//     setPetName('');
//     setPetImage(null);
//     setPetBreed('');
//     setCurrentTagId(null);
//   };
  
//   // Toggle between QR scan and manual entry
//   const toggleManualEntry = () => {
//     setIsManualEntry(!isManualEntry);
//   };
  
//   // Add new pet tag with manual serial number
//   const addPetTagManually = async () => {
//     if (!serialNumber.trim()) {
//       Alert.alert('Error', 'Please enter a valid serial number');
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       // Create new pet tag object
//       const newTag = {
//         id: Date.now().toString(),
//         serialNumber: serialNumber,
//         addedAt: new Date().toISOString(),
//         method: 'manual',
//       };
      
//       // Add to local state
//       const updatedTags = [...petTags, newTag];
//       setPetTags(updatedTags);
      
//       // Save to AsyncStorage
//       await savePetTags(updatedTags);
      
//       // Set current tag ID for pet profile creation
//       setCurrentTagId(newTag.id);
      
//       // Move to next step (pet name)
//       setCurrentStep(1);
//       setLoading(false);
//     } catch (error) {
//       setLoading(false);
//       console.error('Error adding pet tag:', error);
//       Alert.alert('Error', 'Failed to add pet tag. Please try again.');
//     }
//   };
  
//   // Add new pet tag with QR scan (simulated)
//   const addPetTagQR = async () => {
//     // In a real app, you would integrate a camera/QR scanner here
//     // For now, we'll simulate a successful scan
    
//     const scannedSerialNumber = 'QR' + Math.floor(Math.random() * 1000000).toString();
    
//     try {
//       // Create new pet tag object
//       const newTag = {
//         id: Date.now().toString(),
//         serialNumber: scannedSerialNumber,
//         addedAt: new Date().toISOString(),
//         method: 'qr',
//       };
      
//       // Add to local state
//       const updatedTags = [...petTags, newTag];
//       setPetTags(updatedTags);
      
//       // Save to AsyncStorage
//       await savePetTags(updatedTags);
      
//       // Set current tag ID for pet profile creation
//       setCurrentTagId(newTag.id);
      
//       // Move to next step (pet name)
//       setCurrentStep(1);
      
//       Alert.alert('Success', 'QR code scanned successfully');
//     } catch (error) {
//       console.error('Error adding pet tag:', error);
//       Alert.alert('Error', 'Failed to add pet tag. Please try again.');
//     }
//   };
  
//   // Pick image from library
//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//       });
      
//       if (!result.canceled) {
//         setPetImage(result.assets[0].uri);
//       }
//     } catch (error) {
//       console.error('Error picking image:', error);
//       Alert.alert('Error', 'Failed to pick image. Please try again.');
//     }
//   };
  
//   // Save image to local storage
//   const saveImageToStorage = async (imageUri, tagId) => {
//     try {
//       // In a real app, you might want to copy the image to app documents directory
//       // Here we'll just store the URI in AsyncStorage
//       const imagesData = await AsyncStorage.getItem('petImages') || '{}';
//       const images = JSON.parse(imagesData);
      
//       images[tagId] = imageUri;
//       await AsyncStorage.setItem('petImages', JSON.stringify(images));
      
//       return imageUri;
//     } catch (error) {
//       console.error('Error saving image:', error);
//       return null;
//     }
//   };
  
//   // Handle next button press in pet name step
//   const handleNameNext = async () => {
//     if (!petName.trim()) {
//       Alert.alert('Error', 'Please enter your pet\'s name');
//       return;
//     }
    
//     // Move to breed selection step
//     setCurrentStep(2);
//   };
  
//   // Handle next button press in breed selection step
//   const handleBreedNext = async () => {
//     if (!petBreed) {
//       Alert.alert('Error', 'Please select a breed for your pet');
//       return;
//     }
    
//     // In a real app, you would move to the next step (age)
//     // For now, we'll save the pet with the information we have
//     setLoading(true);
    
//     try {
//       // Find the current tag
//       const tagIndex = petTags.findIndex(tag => tag.id === currentTagId);
//       if (tagIndex === -1) {
//         throw new Error('Tag not found');
//       }
      
//       // Save image if available
//       let imageUrl = null;
//       if (petImage) {
//         imageUrl = await saveImageToStorage(petImage, currentTagId);
//       }
      
//       // Update tag with pet info
//       const updatedTag = {
//         ...petTags[tagIndex],
//         petName: petName,
//         petImage: imageUrl,
//         petBreed: petBreed,
//         updatedAt: new Date().toISOString(),
//       };
      
//       // Update local state
//       const updatedTags = [...petTags];
//       updatedTags[tagIndex] = updatedTag;
//       setPetTags(updatedTags);
      
//       // Save to AsyncStorage
//       await savePetTags(updatedTags);
      
//       // Reset and close drawer
//       setLoading(false);
//       closeDrawer();
      
//       Alert.alert('Success', `${petName} has been added to your pets!`);
//     } catch (error) {
//       setLoading(false);
//       console.error('Error saving pet profile:', error);
//       Alert.alert('Error', 'Failed to save pet profile. Please try again.');
//     }
//   };
  
//   // Go back to previous step
//   const handleBack = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     } else {
//       closeDrawer();
//     }
//   };
  
//   // Calculate drawer height based on animation value
//   const drawerHeight = drawerAnimation.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, height * 0.8], // Increased height for pet profile steps
//   });
  
//   // Calculate drawer opacity based on animation value
//   const drawerOpacity = drawerAnimation.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 1],
//   });
  
//   // Render drawer content based on current step
//   const renderDrawerContent = () => {
//     switch (currentStep) {
//       case 0:
//         // Tag scanning/manual entry step
//         return isManualEntry ? (
//           // Manual Entry View
//           <View style={styles.drawerContent}>
//             <Text style={styles.drawerTitle}>Enter Serial Number</Text>
//             <Text style={styles.drawerSubtitle}>
//               Please enter the serial number printed on your Petsy tag
//             </Text>
            
//             <TextInput
//               style={styles.serialInput}
//               placeholder="Enter serial number"
//               value={serialNumber}
//               onChangeText={setSerialNumber}
//               keyboardType="default"
//               autoCapitalize="characters"
//             />
            
//             <TouchableOpacity 
//               style={styles.addTagButton}
//               onPress={addPetTagManually}
//               disabled={loading}
//             >
//               <Text style={styles.addTagButtonText}>
//                 {loading ? 'Adding...' : 'Add Tag'}
//               </Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.manualEntryLink}
//               onPress={toggleManualEntry}
//             >
//               <Text style={styles.manualEntryText}>Scan QR code instead</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           // QR Scan View
//           <View style={styles.drawerContent}>
//             <Text style={styles.drawerTitle}>Pet tags</Text>
//             <Text style={styles.drawerSubtitle}>
//               Scan the QR code on the tag using your camera. All your pet tags will appear here.
//             </Text>
            
//             <View style={styles.tagsImageContainer}>
//               <Image 
//                 source={require('../assets/pet-tags.png')} 
//                 style={styles.tagsImage}
//                 resizeMode="contain"
//               />
//             </View>
            
//             <TouchableOpacity 
//               style={styles.addTagButton}
//               onPress={addPetTagQR}
//             >
//               <Text style={styles.addTagButtonText}>Add New Petsy Tag</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.manualEntryLink}
//               onPress={toggleManualEntry}
//             >
//               <Text style={styles.manualEntryText}>Manually type serial number</Text>
//             </TouchableOpacity>
//           </View>
//         );
        
//       case 1:
//         // Pet name and image step
//         return (
//           <View style={styles.drawerContent}>
//             <View style={styles.stepHeader}>
//               <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//                 <Feather name="arrow-left" size={24} color="#000" />
//               </TouchableOpacity>
//               <View style={styles.stepTitleContainer}>
//                 <Text style={styles.stepTitle}>Add Pet</Text>
//                 <Text style={styles.stepSubtitle}>Step 1/4 • Pet Name</Text>
//               </View>
//             </View>
            
//             <View style={styles.stepIndicator}>
//               <View style={styles.stepLine}>
//                 <View style={[styles.stepLineActive, { width: '25%' }]} />
//               </View>
//             </View>
            
//             <View style={styles.petProfileContent}>
//               <TouchableOpacity style={styles.petImageContainer} onPress={pickImage}>
//                 {petImage ? (
//                   <Image source={{ uri: petImage }} style={styles.petImage} />
//                 ) : (
//                   <View style={styles.petImagePlaceholder}>
//                     <Feather name="image" size={40} color="#ccc" />
//                   </View>
//                 )}
//                 <View style={styles.cameraIconContainer}>
//                   <Feather name="camera" size={16} color="#fff" />
//                 </View>
//               </TouchableOpacity>
              
//               <View style={styles.inputContainer}>
//                 <Text style={styles.inputLabel}>What is your pet's name?</Text>
//                 <TextInput
//                   style={styles.petNameInput}
//                   placeholder="Enter pet name"
//                   value={petName}
//                   onChangeText={setPetName}
//                 />
//               </View>
              
//               <TouchableOpacity 
//                 style={styles.nextButton}
//                 onPress={handleNameNext}
//                 disabled={loading}
//               >
//                 <Text style={styles.nextButtonText}>
//                   {loading ? 'Saving...' : 'Next'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         );
        
//       case 2:
//         // Pet breed selection step
//         return (
//           <BreedSelectionStep
//             onBack={handleBack}
//             onNext={handleBreedNext}
//             selectedBreed={petBreed}
//             onBreedSelect={setPetBreed}
//           />
//         );
        
//       default:
//         return null;
//     }
//   };
  
//   // Render pet cards in the main screen
//   const renderPetCards = () => {
//     return petTags.filter(tag => tag.petName).map((pet) => (
//       <View key={pet.id} style={styles.petCard}>
//         <View style={styles.petCardImageContainer}>
//           {pet.petImage ? (
//             <Image 
//               source={{ uri: pet.petImage }} 
//               style={styles.petCardImage} 
//               resizeMode="cover"
//             />
//           ) : (
//             <View style={styles.petCardImagePlaceholder}>
//               <Feather name="image" size={30} color="#ccc" />
//             </View>
//           )}
//         </View>
//         <View style={styles.petCardInfo}>
//           <Text style={styles.petCardName}>{pet.petName}</Text>
//           {pet.petBreed && <Text style={styles.petCardBreed}>{pet.petBreed}</Text>}
//           <Text style={styles.petCardTag}>Tag: {pet.serialNumber}</Text>
//         </View>
//       </View>
//     ));
//   };
  
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>My Pets</Text>
//       </View>
      
//       {/* Main Content */}
//       <View style={styles.content}>
//         {petTags.filter(tag => tag.petName).length === 0 ? (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyStateText}>You haven't added any pets yet</Text>
//           </View>
//         ) : (
//           <View style={styles.petList}>
//             {renderPetCards()}
//           </View>
//         )}
        
//         {/* Add Pet Button */}
//         <TouchableOpacity style={styles.addButton} onPress={openDrawer}>
//           <Text style={styles.addButtonText}>Add Pet</Text>
//         </TouchableOpacity>
//       </View>
      
//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity style={styles.navItem}>
//           <Feather name="home" size={24} color="#0a3d62" />
//           <Text style={styles.navText}>My Pets</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.navItem}>
//           <Feather name="bell" size={24} color="#666" />
//           <Text style={styles.navText}>Notifications</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.navItem}>
//           <Feather name="user" size={24} color="#666" />
//           <Text style={styles.navText}>Profile</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.navItem}>
//           <Feather name="settings" size={24} color="#666" />
//           <Text style={styles.navText}>Settings</Text>
//         </TouchableOpacity>
//       </View>
      
//       {/* Drawer Overlay */}
//       {drawerVisible && (
//         <TouchableOpacity 
//           style={styles.overlay} 
//           activeOpacity={1} 
//           onPress={closeDrawer}
//         />
//       )}
      
//       {/* Drawer */}
//       {drawerVisible && (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.keyboardAvoid}
//         >
//           <Animated.View 
//             style={[
//               styles.drawer, 
//               { 
//                 height: drawerHeight,
//                 opacity: drawerOpacity 
//               }
//             ]}
//           >
//             {renderDrawerContent()}
//           </Animated.View>
//         </KeyboardAvoidingView>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     backgroundColor: '#fff',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: '#666',
//   },
//   petList: {
//     flex: 1,
//   },
//   petCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 15,
//     padding: 15,
//     flexDirection: 'row',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   petCardImageContainer: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     overflow: 'hidden',
//     marginRight: 15,
//   },
//   petCardImage: {
//     width: '100%',
//     height: '100%',
//   },
//   petCardImagePlaceholder: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 35,
//   },
//   petCardInfo: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   petCardName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   petCardBreed: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 5,
//   },
//   petCardTag: {
//     fontSize: 14,
//     color: '#666',
//   },
//   addButton: {
//     backgroundColor: '#0a3d62',
//     borderRadius: 25,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   addButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   bottomNav: {
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     backgroundColor: '#fff',
//     paddingVertical: 10,
//   },
//   navItem: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   navText: {
//     fontSize: 12,
//     marginTop: 5,
//     color: '#666',
//   },
//   overlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   keyboardAvoid: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//   },
//   drawer: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingTop: 20,
//     paddingBottom: Platform.OS === 'ios' ? 40 : 20,
//   },
//   drawerContent: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   drawerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   drawerSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 20,
//   },
//   tagsImageContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   tagsImage: {
//     width: 200,
//     height: 100,
//   },
//   addTagButton: {
//     backgroundColor: '#0a3d62',
//     borderRadius: 25,
//     paddingVertical: 15,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   addTagButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   manualEntryLink: {
//     alignItems: 'center',
//     padding: 10,
//   },
//   manualEntryText: {
//     color: '#0a3d62',
//     fontSize: 14,
//   },
//   serialInput: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     fontSize: 16,
//     marginBottom: 20,
//   },
//   // Pet profile step styles
//   stepHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   backButton: {
//     padding: 5,
//   },
//   stepTitleContainer: {
//     marginLeft: 10,
//   },
//   stepTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   stepSubtitle: {
//     fontSize: 14,
//     color: '#666',
//   },
//   stepIndicator: {
//     marginBottom: 20,
//   },
//   stepLine: {
//     height: 4,
//     backgroundColor: '#eee',
//     borderRadius: 2,
//   },
//   stepLineActive: {
//     height: 4,
//     backgroundColor: '#0a3d62',
//     borderRadius: 2,
//   },
//   petProfileContent: {
//     flex: 1,
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   petImageContainer: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     marginBottom: 30,
//     position: 'relative',
//     overflow: 'visible',
//   },
//   petImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//   },
//   petImagePlaceholder: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   cameraIconContainer: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: '#0a3d62',
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   inputContainer: {
//     width: '100%',
//     marginBottom: 30,
//   },
//   inputLabel: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   petNameInput: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     paddingVertical: 10,
//     fontSize: 16,
//     width: '100%',
//   },
//   nextButton: {
//     backgroundColor: '#0a3d62',
//     borderRadius: 25,
//     paddingVertical: 15,
//     alignItems: 'center',
//     width: '100%',
//     marginTop: 'auto',
//   },
//   nextButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });


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
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import BreedSelectionStep from '../PetProfileForm/Step2Breed';
import AgeSelectionStep from '../PetProfileForm/Step3Birthday';
import WeightSelectionStep from '../PetProfileForm/Step4Weight';
import ConfirmationStep from '../PetProfileForm/StepHeader';

const { height, width } = Dimensions.get('window');

export default function MyPetsScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [petTags, setPetTags] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pet profile creation state
  const [currentStep, setCurrentStep] = useState(0); // 0: tag, 1: name, 2: breed, 3: age, 4: weight, 5: confirmation
  const [petData, setPetData] = useState({
    id: Date.now().toString(),
    name: '',
    imageUrl: null,
    breed: '',
    birthdate: new Date(),
    age: 0,
    weight: 23,
    tagId: null,
  });

  const drawerAnimation = useRef(new Animated.Value(0)).current;
  
  // Load saved pet tags from AsyncStorage on component mount
  useEffect(() => {
    loadPetTags();
    requestCameraPermission();
  }, []);
  
  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to upload pet photos');
    }
  };
  
  // Load pet tags from AsyncStorage
  const loadPetTags = async () => {
    try {
      const savedTags = await AsyncStorage.getItem('petTags');
      if (savedTags) {
        setPetTags(JSON.parse(savedTags));
      }
    } catch (error) {
      console.error('Error loading pet tags:', error);
    }
  };
  
  // Save pet tags to AsyncStorage
  const savePetTags = async (tags) => {
    try {
      await AsyncStorage.setItem('petTags', JSON.stringify(tags));
    } catch (error) {
      console.error('Error saving pet tags:', error);
    }
  };
  
  // Open drawer
  const openDrawer = () => {
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
    setPetData({
      id: Date.now().toString(),
      name: '',
      imageUrl: null,
      breed: '',
      birthdate: new Date(),
      age: 0,
      weight: 23,
      tagId: null,
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
      Alert.alert('Error', 'Please enter a valid serial number');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create new tag ID
      const tagId = Date.now().toString();
      
      // Update pet data with tag info
      updatePetData({ 
        tagId: tagId,
        tagSerial: serialNumber,
        tagMethod: 'manual' 
      });
      
      // Move to next step (pet name)
      setCurrentStep(1);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error adding pet tag:', error);
      Alert.alert('Error', 'Failed to add pet tag. Please try again.');
    }
  };
  
  // Add new pet tag with QR scan (simulated)
  const addPetTagQR = async () => {
    // In a real app, you would integrate a camera/QR scanner here
    // For now, we'll simulate a successful scan
    
    const scannedSerialNumber = 'QR' + Math.floor(Math.random() * 1000000).toString();
    
    try {
      // Create new tag ID
      const tagId = Date.now().toString();
      
      // Update pet data with tag info
      updatePetData({ 
        tagId: tagId,
        tagSerial: scannedSerialNumber,
        tagMethod: 'qr' 
      });
      
      // Move to next step (pet name)
      setCurrentStep(1);
      
      Alert.alert('Success', 'QR code scanned successfully');
    } catch (error) {
      console.error('Error adding pet tag:', error);
      Alert.alert('Error', 'Failed to add pet tag. Please try again.');
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
        updatePetData({ imageUrl: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  // Save image to local storage
  const saveImageToStorage = async (imageUri, tagId) => {
    try {
      // In a real app, you might want to copy the image to app documents directory
      // Here we'll just store the URI in AsyncStorage
      const imagesData = await AsyncStorage.getItem('petImages') || '{}';
      const images = JSON.parse(imagesData);
      
      images[tagId] = imageUri;
      await AsyncStorage.setItem('petImages', JSON.stringify(images));
      
      return imageUri;
    } catch (error) {
      console.error('Error saving image:', error);
      return null;
    }
  };
  
  // Handle next button in first step (pet name)
  const handleNameNext = () => {
    if (!petData.name) {
      Alert.alert('Error', 'Please enter your pet\'s name');
      return;
    }
    
    // Move to breed selection step
    setCurrentStep(2);
  };
  
  // Handle next button in breed step
  const handleBreedNext = () => {
    if (!petData.breed) {
      Alert.alert('Error', 'Please select a breed for your pet');
      return;
    }
    
    // Move to age selection step
    setCurrentStep(3);
  };
  
  // Handle next button in age step
  const handleAgeNext = () => {
    // Move to weight selection step
    setCurrentStep(4);
  };
  
  // Handle next button in weight step
  const handleWeightNext = () => {
    // Move to confirmation step
    setCurrentStep(5);
  };
  
  // Complete pet addition
  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Save image if available
      let imageUrl = petData.imageUrl;
      if (imageUrl) {
        imageUrl = await saveImageToStorage(imageUrl, petData.tagId);
      }
      
      // Create pet object
      const newPet = {
        id: petData.id,
        tagId: petData.tagId,
        tagSerial: petData.tagSerial,
        name: petData.name,
        imageUrl: imageUrl,
        breed: petData.breed,
        birthdate: petData.birthdate,
        age: petData.age,
        weight: petData.weight,
        createdAt: new Date().toISOString()
      };
      
      // Add to local state
      const updatedTags = [...petTags, newPet];
      setPetTags(updatedTags);
      
      // Save to AsyncStorage
      await savePetTags(updatedTags);
      
      // Reset and close drawer
      setLoading(false);
      closeDrawer();
      
      Alert.alert('Success', `${petData.name} has been added to your pets!`);
    } catch (error) {
      setLoading(false);
      console.error('Error saving pet profile:', error);
      Alert.alert('Error', 'Failed to save pet profile. Please try again.');
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
    outputRange: [0, height * 0.8], // Increased height for pet profile steps
  });
  
  // Calculate drawer opacity based on animation value
  const drawerOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  // Render drawer content based on current step
  const renderDrawerContent = () => {
    switch (currentStep) {
      case 0:
        // Tag scanning/manual entry step
        return isManualEntry ? (
          // Manual Entry View
          <View style={styles.drawerContent}>
            <Text style={styles.drawerTitle}>Enter Serial Number</Text>
            <Text style={styles.drawerSubtitle}>
              Please enter the serial number printed on your Petsy tag
            </Text>
            
            <TextInput
              style={styles.serialInput}
              placeholder="Enter serial number"
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
                {loading ? 'Adding...' : 'Add Tag'}
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
          // QR Scan View
          <View style={styles.drawerContent}>
            <Text style={styles.drawerTitle}>Pet tags</Text>
            <Text style={styles.drawerSubtitle}>
              Scan the QR code on the tag using your camera. All your pet tags will appear here.
            </Text>
            
            <View style={styles.tagsImageContainer}>
              <Image 
                source={require('../assets/pet-tags.png')} 
                style={styles.tagsImage}
                resizeMode="contain"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={addPetTagQR}
            >
              <Text style={styles.addTagButtonText}>Add New Petsy Tag</Text>
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
        // Pet name and image step
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
            
            <View style={styles.petProfileContent}>
              <TouchableOpacity style={styles.petImageContainer} onPress={pickImage}>
                {petData.imageUrl ? (
                  <Image source={{ uri: petData.imageUrl }} style={styles.petImage} />
                ) : (
                  <View style={styles.petImagePlaceholder}>
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
                  style={styles.petNameInput}
                  placeholder="Enter pet name"
                  value={petData.name}
                  onChangeText={(text) => updatePetData({ name: text })}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleNameNext}
                disabled={loading || !petData.name}
              >
                <Text style={styles.nextButtonText}>
                  {loading ? 'Saving...' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 2:
        // Breed selection step
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
        // Age selection step
        return (
          <AgeSelectionStep
            petData={petData}
            onBack={handleBack}
            onNext={handleAgeNext}
            updatePetData={updatePetData}
          />
        );
        
      case 4:
        // Weight selection step
        return (
          <WeightSelectionStep
            petData={petData}
            onBack={handleBack}
            onNext={handleWeightNext}
            updatePetData={updatePetData}
          />
        );
        
      case 5:
        // Confirmation step
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
    return petTags.filter(tag => tag.name).map((pet) => (
      <View key={pet.id} style={styles.petCard}>
        <View style={styles.petCardImageContainer}>
          {pet.imageUrl ? (
            <Image 
              source={{ uri: pet.imageUrl }} 
              style={styles.petCardImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.petCardImagePlaceholder}>
              <Feather name="image" size={30} color="#ccc" />
            </View>
          )}
        </View>
        <View style={styles.petCardInfo}>
          <Text style={styles.petCardName}>{pet.name}</Text>
          {pet.breed && <Text style={styles.petCardBreed}>{pet.breed}</Text>}
          <Text style={styles.petCardTag}>Tag: {pet.tagSerial}</Text>
        </View>
      </View>
    ));
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Pets</Text>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        {petTags.filter(tag => tag.name).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>You haven't added any pets yet</Text>
          </View>
        ) : (
          <View style={styles.petList}>
            {renderPetCards()}
          </View>
        )}
        
        {/* Add Pet Button */}
        <TouchableOpacity style={styles.addButton} onPress={openDrawer}>
          <Text style={styles.addButtonText}>Add Pet</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#0a3d62" />
          <Text style={styles.navText}>My Pets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Feather name="bell" size={24} color="#666" />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Feather name="settings" size={24} color="#666" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
      
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
  // ... your existing styles ...
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  petList: {
    flex: 1,
  },
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petCardImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginRight: 15,
  },
  petCardImage: {
    width: '100%',
    height: '100%',
  },
  petCardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
  },
  petCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  petCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  petCardBreed: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  petCardTag: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  tagsImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tagsImage: {
    width: 200,
    height: 100,
  },
  addTagButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  addTagButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualEntryLink: {
    alignItems: 'center',
    padding: 10,
  },
  manualEntryText: {
    color: '#0a3d62',
    fontSize: 14,
  },
  serialInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  // Pet profile step styles
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  stepTitleContainer: {
    marginLeft: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  stepIndicator: {
    marginBottom: 20,
  },
  stepLine: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  stepLineActive: {
    height: 4,
    backgroundColor: '#0a3d62',
    borderRadius: 2,
  },
  petProfileContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  petImageContainer: {
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
  petImagePlaceholder: {
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
  petNameInput: {
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
    marginBottom: 30,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});