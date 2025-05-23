import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { firestore } from '../utils/firebaseConfig';
import { 
  doc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

const { height, width } = Dimensions.get('window');

export default function PetProfileScreen({ navigation, route }) {
  const { pet } = route.params;
  const [petData, setPetData] = useState(pet);
  const [activeTab, setActiveTab] = useState('pet');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [vaccinations, setVaccinations] = useState([]);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [vaccinationDetailVisible, setVaccinationDetailVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vaccinationFormVisible, setVaccinationFormVisible] = useState(false);
  const [isEditingVaccination, setIsEditingVaccination] = useState(false);
  const [ownerContactFormVisible, setOwnerContactFormVisible] = useState(false);
  const [newVaccination, setNewVaccination] = useState({
    name: '',
    date: '',
    expiryDate: '',
    lot: '',
    veterinarian: '',
    veterinarianTitle: '',
    address: '',
    notes: ''
  });
  const [ownerContactDetails, setOwnerContactDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = 'dkxkx7cn6';
  const CLOUDINARY_UPLOAD_PRESET = 'absentee';

  useEffect(() => {
    navigation.setOptions({
      title: 'Profile',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });

    loadVaccinations();
    loadOwnerContactDetails();
  }, [navigation]);

  const loadVaccinations = async () => {
    try {
      const vaccinationsRef = collection(firestore, 'vaccinations');
      const q = query(
        vaccinationsRef, 
        where('petId', '==', petData.id),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const vaccinationList = [];
      querySnapshot.forEach((doc) => {
        vaccinationList.push({
          id: doc.id,
          ...doc.data(),
          year: new Date(doc.data().date).getFullYear()
        });
      });
      
      setVaccinations(vaccinationList);
    } catch (error) {
      console.error('Error loading vaccinations:', error);
      Alert.alert('Error', 'Failed to load vaccination records');
    }
  };

  const loadOwnerContactDetails = () => {
    if (petData.ownerContact) {
      try {
        const parsed = JSON.parse(petData.ownerContact);
        setOwnerContactDetails(parsed);
      } catch (error) {
        // If it's a simple string, convert to structured format
        setOwnerContactDetails({
          ...ownerContactDetails,
          notes: petData.ownerContact
        });
      }
    }
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return 'Unknown';
    const today = new Date();
    const birth = new Date(birthdate);
    const ageInYears = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
    return `${ageInYears} ${ageInYears === 1 ? 'yr' : 'yrs'}`;
  };

  const openEditModal = (field) => {
    setEditingField(field);
    switch (field) {
      case 'name':
        setEditValue(petData.name || '');
        break;
      case 'breed':
        setEditValue(petData.breed || '');
        break;
      case 'weight':
        setEditValue(petData.weight?.toString() || '');
        break;
      case 'gender':
        setEditValue(petData.gender || '');
        break;
      case 'size':
        setEditValue(petData.size || '');
        break;
      case 'appearance':
        setEditValue(petData.appearance || '');
        break;
      default:
        setEditValue('');
    }
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingField(null);
    setEditValue('');
  };

  const updatePetField = async () => {
    if (!editValue.trim()) {
      Alert.alert('Error', 'Please enter a valid value');
      return;
    }

    setIsUpdating(true);

    try {
      const updateData = {};

      switch (editingField) {
        case 'name':
          updateData.name = editValue.trim();
          break;
        case 'breed':
          updateData.breed = editValue.trim();
          break;
        case 'weight':
          const weight = parseFloat(editValue);
          if (isNaN(weight) || weight <= 0) {
            Alert.alert('Error', 'Please enter a valid weight');
            setIsUpdating(false);
            return;
          }
          updateData.weight = weight;
          break;
        case 'gender':
          updateData.gender = editValue.trim();
          break;
        case 'size':
          updateData.size = editValue.trim();
          break;
        case 'appearance':
          updateData.appearance = editValue.trim();
          break;
      }

      const petRef = doc(firestore, 'pets', petData.id);
      await updateDoc(petRef, updateData);

      setPetData(prev => ({ ...prev, ...updateData }));
      
      closeEditModal();
      Alert.alert('Success', 'Pet profile updated successfully');
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert('Error', 'Failed to update pet profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

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
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePet = async () => {
  Alert.alert(
    'Delete Pet',
    `Are you sure you want to delete ${petData.name}? This action cannot be undone and will also delete all vaccination records.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsUpdating(true);
            
            // Delete all vaccination records first
            const vaccinationsRef = collection(firestore, 'vaccinations');
            const q = query(vaccinationsRef, where('petId', '==', petData.id));
            const querySnapshot = await getDocs(q);
            
            const deletePromises = [];
            querySnapshot.forEach((doc) => {
              deletePromises.push(deleteDoc(doc.ref));
            });
            
            await Promise.all(deletePromises);
            
            // Delete the pet
            await deleteDoc(doc(firestore, 'pets', petData.id));
            
            Alert.alert('Success', 'Pet deleted successfully', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          } catch (error) {
            console.error('Error deleting pet:', error);
            Alert.alert('Error', 'Failed to delete pet. Please try again.');
          } finally {
            setIsUpdating(false);
          }
        }
      }
    ]
  );
};


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
        const cloudinaryUrl = await uploadToCloudinary(imageUri);
        
        if (cloudinaryUrl) {
          const petRef = doc(firestore, 'pets', petData.id);
          await updateDoc(petRef, { imageUrl: cloudinaryUrl });
          
          setPetData(prev => ({ ...prev, imageUrl: cloudinaryUrl }));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleAddVaccination = async () => {
    if (!newVaccination.name || !newVaccination.date || !newVaccination.expiryDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsUpdating(true);
      
      const vaccinationData = {
        ...newVaccination,
        petId: petData.id,
        createdAt: new Date().toISOString()
      };

      if (isEditingVaccination && selectedVaccination) {
        // Update existing vaccination
        const vaccinationRef = doc(firestore, 'vaccinations', selectedVaccination.id);
        await updateDoc(vaccinationRef, vaccinationData);
        Alert.alert('Success', 'Vaccination record updated successfully');
      } else {
        // Add new vaccination
        await addDoc(collection(firestore, 'vaccinations'), vaccinationData);
        Alert.alert('Success', 'Vaccination record added successfully');
      }
      
      await loadVaccinations();
      setVaccinationFormVisible(false);
      setIsEditingVaccination(false);
      setSelectedVaccination(null);
      setNewVaccination({
        name: '',
        date: '',
        expiryDate: '',
        lot: '',
        veterinarian: '',
        veterinarianTitle: '',
        address: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving vaccination:', error);
      Alert.alert('Error', 'Failed to save vaccination record');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteVaccination = async (vaccinationId) => {
    Alert.alert(
      'Delete Vaccination',
      'Are you sure you want to delete this vaccination record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, 'vaccinations', vaccinationId));
              await loadVaccinations();
              setVaccinationDetailVisible(false);
              Alert.alert('Success', 'Vaccination record deleted successfully');
            } catch (error) {
              console.error('Error deleting vaccination:', error);
              Alert.alert('Error', 'Failed to delete vaccination record');
            }
          }
        }
      ]
    );
  };

  const handleEditVaccination = (vaccination) => {
    setIsEditingVaccination(true);
    setSelectedVaccination(vaccination);
    setNewVaccination({
      name: vaccination.name,
      date: vaccination.date,
      expiryDate: vaccination.expiryDate,
      lot: vaccination.lot,
      veterinarian: vaccination.veterinarian,
      veterinarianTitle: vaccination.veterinarianTitle,
      address: vaccination.address,
      notes: vaccination.notes
    });
    setVaccinationDetailVisible(false);
    setVaccinationFormVisible(true);
  };

  const handleSaveOwnerContact = async () => {
    try {
      setIsUpdating(true);
      
      const ownerContactString = JSON.stringify(ownerContactDetails);
      const petRef = doc(firestore, 'pets', petData.id);
      await updateDoc(petRef, { ownerContact: ownerContactString });
      
      setPetData(prev => ({ ...prev, ownerContact: ownerContactString }));
      setOwnerContactFormVisible(false);
      Alert.alert('Success', 'Owner contact information updated successfully');
    } catch (error) {
      console.error('Error updating owner contact:', error);
      Alert.alert('Error', 'Failed to update owner contact information');
    } finally {
      setIsUpdating(false);
    }
  };

  const closeVaccinationDetail = () => {
    setVaccinationDetailVisible(false);
    setSelectedVaccination(null);
  };

  const renderEditModal = () => {
    const getFieldLabel = () => {
      switch (editingField) {
        case 'name': return 'Pet Name';
        case 'breed': return 'Breed';
        case 'weight': return 'Weight (kg)';
        case 'gender': return 'Gender';
        case 'size': return 'Size';
        case 'appearance': return 'Appearance';
        default: return 'Edit';
      }
    };

    const getPlaceholder = () => {
      switch (editingField) {
        case 'name': return 'Enter pet name';
        case 'breed': return 'Enter breed';
        case 'weight': return 'Enter weight in kg';
        case 'gender': return 'Enter gender';
        case 'size': return 'Enter size (Small, Medium, Large)';
        case 'appearance': return 'Describe your pet\'s appearance';
        default: return 'Enter value';
      }
    };

    const getKeyboardType = () => {
      return editingField === 'weight' ? 'numeric' : 'default';
    };

    return (
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit {getFieldLabel()}</Text>
              <TouchableOpacity onPress={closeEditModal} style={styles.modalCloseButton}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.editInput, editingField === 'appearance' && { height: 100 }]}
              placeholder={getPlaceholder()}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType={getKeyboardType()}
              multiline={editingField === 'appearance'}
              maxLength={editingField === 'name' ? 30 : editingField === 'breed' ? 50 : 1000}
            />

            <View style={styles.editModalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeEditModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, isUpdating && styles.disabledButton]}
                onPress={updatePetField}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderOwnerContactFormModal = () => {
    return (
      <Modal
        visible={ownerContactFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOwnerContactFormVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.ownerContactFormContent}>
            <View style={styles.ownerContactFormHeader}>
              <Text style={styles.ownerContactFormTitle}>Owner Contact Information</Text>
              <TouchableOpacity
                onPress={() => setOwnerContactFormVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.ownerContactFormScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Owner Name*</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter owner's full name"
                  value={ownerContactDetails.name}
                  onChangeText={(text) => setOwnerContactDetails({...ownerContactDetails, name: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number*</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter phone number"
                  value={ownerContactDetails.phone}
                  onChangeText={(text) => setOwnerContactDetails({...ownerContactDetails, phone: text})}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter email address"
                  value={ownerContactDetails.email}
                  onChangeText={(text) => setOwnerContactDetails({...ownerContactDetails, email: text})}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Home Address</Text>
                <TextInput
                  style={[styles.formInput, { height: 80 }]}
                  placeholder="Enter home address"
                  value={ownerContactDetails.address}
                  onChangeText={(text) => setOwnerContactDetails({...ownerContactDetails, address: text})}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Emergency Contact Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter emergency contact name"
                  value={ownerContactDetails.emergencyContact}
                  onChangeText={(text) => setOwnerContactDetails({...ownerContactDetails, emergencyContact: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Emergency Contact Phone</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter emergency contact phone"
                  value={ownerContactDetails.emergencyPhone}
                  onChangeText={(text) => setOwnerContactDetails({...ownerContactDetails, emergencyPhone: text})}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional Notes</Text>
                <TextInput
                  style={[styles.formInput, { height: 80 }]}
                  placeholder="Any additional notes or instructions"
                  value={ownerContactDetails.notes}
                  onChangeText={(text) => setOwnerContactDetails({...ownerContactDetails, notes: text})}
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.ownerContactFormButtons}>
              <TouchableOpacity
                style={[styles.saveButton, isUpdating && styles.disabledButton]}
                onPress={handleSaveOwnerContact}
                disabled={isUpdating || !ownerContactDetails.name || !ownerContactDetails.phone}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Contact Information</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderVaccinationDetailModal = () => {
    if (!selectedVaccination) return null;

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.');
    };

    return (
      <Modal
        visible={vaccinationDetailVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeVaccinationDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.vaccinationDetailContent}>
            <View style={styles.vaccinationDetailHeader}>
              <TouchableOpacity
                onPress={closeVaccinationDetail}
                style={styles.vaccinationBackButton}
              >
                <Feather name="arrow-left" size={20} color="#000" />
              </TouchableOpacity>
              <Text style={styles.vaccinationDetailTitle}>{selectedVaccination.name}</Text>
              <View style={styles.vaccinationActionButtons}>
                <TouchableOpacity
                  onPress={() => handleEditVaccination(selectedVaccination)}
                  style={styles.editVaccinationButton}
                >
                  <Feather name="edit-2" size={18} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteVaccination(selectedVaccination.id)}
                  style={styles.deleteVaccinationButton}
                >
                  <Feather name="trash-2" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView>
              <Text style={styles.vaccinationDetailSectionTitle}>Details</Text>

              <View style={styles.vaccinationDetailRow}>
                <Text style={styles.vaccinationDetailLabel}>Lot</Text>
                <Text style={styles.vaccinationDetailValue}>{selectedVaccination.lot}</Text>
              </View>

              <View style={styles.vaccinationDetailRow}>
                <Text style={styles.vaccinationDetailLabel}>Expiry date</Text>
                <Text style={styles.vaccinationDetailValue}>{formatDate(selectedVaccination.expiryDate)}</Text>
              </View>

              <View style={styles.vaccinationDetailRow}>
                <Text style={styles.vaccinationDetailLabel}>Date</Text>
                <Text style={styles.vaccinationDetailLabel}>Valid until</Text>
              </View>

              <View style={styles.vaccinationDetailRow}>
                <Text style={styles.vaccinationDetailValue}>{formatDate(selectedVaccination.date)}</Text>
                <Text style={styles.vaccinationDetailValue}>{formatDate(selectedVaccination.expiryDate)}</Text>
              </View>

              {selectedVaccination.veterinarian && (
                <>
                  <Text style={[styles.vaccinationDetailSectionTitle, {marginTop: 20}]}>Veterinarian</Text>
                  <View style={styles.veterinarianSection}>
                    <View style={styles.veterinarianAvatar}>
                      <Text style={styles.veterinarianInitials}>
                        {selectedVaccination.veterinarian.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.veterinarianInfo}>
                      <Text style={styles.veterinarianName}>{selectedVaccination.veterinarian}</Text>
                      <Text style={styles.veterinarianTitle}>{selectedVaccination.veterinarianTitle}</Text>
                    </View>
                  </View>
                </>
              )}

              {selectedVaccination.address && (
                <>
                  <Text style={[styles.vaccinationDetailSectionTitle, {marginTop: 20}]}>Address</Text>
                  <Text style={styles.vaccinationAddress}>{selectedVaccination.address}</Text>
                </>
              )}

              {selectedVaccination.notes && (
                <>
                  <Text style={[styles.vaccinationDetailSectionTitle, {marginTop: 20}]}>Notes</Text>
                  <Text style={styles.vaccinationNotes}>{selectedVaccination.notes}</Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderVaccinationFormModal = () => {
    return (
      <Modal
        visible={vaccinationFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setVaccinationFormVisible(false);
          setIsEditingVaccination(false);
          setSelectedVaccination(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.vaccinationFormContent}>
            <View style={styles.vaccinationFormHeader}>
              <Text style={styles.vaccinationFormTitle}>
                {isEditingVaccination ? 'Edit Vaccination Record' : 'Add Vaccination Record'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setVaccinationFormVisible(false);
                  setIsEditingVaccination(false);
                  setSelectedVaccination(null);
                }}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.vaccinationFormScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Vaccine Name*</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter vaccine name"
                  value={newVaccination.name}
                  onChangeText={(text) => setNewVaccination({...newVaccination, name: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date Administered*</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  value={newVaccination.date}
                  onChangeText={(text) => setNewVaccination({...newVaccination, date: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Expiry Date*</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  value={newVaccination.expiryDate}
                  onChangeText={(text) => setNewVaccination({...newVaccination, expiryDate: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Lot Number</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter lot number"
                  value={newVaccination.lot}
                  onChangeText={(text) => setNewVaccination({...newVaccination, lot: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Veterinarian Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter veterinarian name"
                  value={newVaccination.veterinarian}
                  onChangeText={(text) => setNewVaccination({...newVaccination, veterinarian: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Veterinarian Title</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter title/qualification"
                  value={newVaccination.veterinarianTitle}
                  onChangeText={(text) => setNewVaccination({...newVaccination, veterinarianTitle: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Clinic Address</Text>
                <TextInput
                  style={[styles.formInput, { height: 80 }]}
                  placeholder="Enter clinic address"
                  value={newVaccination.address}
                  onChangeText={(text) => setNewVaccination({...newVaccination, address: text})}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes</Text>
                <TextInput
                  style={[styles.formInput, { height: 80 }]}
                  placeholder="Any additional notes"
                  value={newVaccination.notes}
                  onChangeText={(text) => setNewVaccination({...newVaccination, notes: text})}
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.vaccinationFormButtons}>
              <TouchableOpacity
                style={[styles.saveButton, isUpdating && styles.disabledButton]}
                onPress={handleAddVaccination}
                disabled={isUpdating || !newVaccination.name || !newVaccination.date || !newVaccination.expiryDate}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditingVaccination ? 'Update Vaccination' : 'Save Vaccination'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderPetProfileTab = () => {
    const displayOwnerContact = () => {
      if (!petData.ownerContact) return 'Not specified';
      
      try {
        const parsed = JSON.parse(petData.ownerContact);
        return `${parsed.name || 'Unknown'}\n${parsed.phone || ''}\n${parsed.email || ''}`;
      } catch (error) {
        return petData.ownerContact;
      }
    };

    return (
      <ScrollView style={styles.tabContent}>
        {/* Pet Image Section */}
        <TouchableOpacity style={styles.imageSection} onPress={pickImage}>
          <View style={styles.imageContainer}>
            {petData.imageUrl ? (
              <Image 
                source={{ uri: petData.imageUrl }} 
                style={styles.petImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="image" size={48} color="#ccc" />
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.petName}>{petData.name}</Text>
        <Text style={styles.petBreed}>{petData.breed}</Text>

        {/* Appearance Section */}
        <View style={styles.detailSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <TouchableOpacity onPress={() => openEditModal('appearance')}>
              <Feather name="edit-2" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.appearanceText}>{petData.appearance}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Details</Text>
            <TouchableOpacity onPress={() => openEditModal('name')}>
              <Feather name="edit-2" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gender</Text>
            <TouchableOpacity 
              style={styles.detailValueContainer}
              onPress={() => openEditModal('gender')}
            >
              <Text style={styles.detailValue}>{petData.gender}</Text>
              <Feather name="edit-2" size={14} color="#666" style={styles.editIcon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size</Text>
            <TouchableOpacity 
              style={styles.detailValueContainer}
              onPress={() => openEditModal('size')}
            >
              <Text style={styles.detailValue}>{petData.size}</Text>
              <Feather name="edit-2" size={14} color="#666" style={styles.editIcon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight</Text>
            <TouchableOpacity 
              style={styles.detailValueContainer}
              onPress={() => openEditModal('weight')}
            >
              <Text style={styles.detailValue}>{petData.weight} kg</Text>
              <Feather name="edit-2" size={14} color="#666" style={styles.editIcon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Birthday</Text>
            <Text style={styles.detailValue}>
              {new Date(petData.birthdate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })} ({calculateAge(petData.birthdate)})
            </Text>
          </View>
        </View>

        {/* Owner Contact Section */}
        <View style={styles.detailSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Owner Contact</Text>
            <TouchableOpacity onPress={() => setOwnerContactFormVisible(true)}>
              <Feather name="edit-2" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.ownerContactText}>{displayOwnerContact()}</Text>
        </View>

        {/* Delete Pet Section */}
<View style={[styles.detailSection, { marginTop: 40 }]}>
  <TouchableOpacity
    style={styles.deletePetButton}
    onPress={handleDeletePet}
    disabled={isUpdating}
  >
    {isUpdating ? (
      <ActivityIndicator size="small" color="#fff" />
    ) : (
      <>
        <Feather name="trash-2" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.deletePetButtonText}>Delete Pet</Text>
      </>
    )}
  </TouchableOpacity>
</View>
      </ScrollView>
    );
  };

  const renderHealthDetailsTab = () => {
    const filteredVaccinations = vaccinations.filter(vaccination => 
      vaccination.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedVaccinations = filteredVaccinations.reduce((groups, vaccination) => {
      const year = vaccination.year;
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(vaccination);
      return groups;
    }, {});

    return (
      <View style={styles.tabContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by vaccine type"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Vaccinations List */}
        <ScrollView style={styles.vaccinationsList}>
          {Object.keys(groupedVaccinations).length === 0 && !searchQuery ? (
            <View style={styles.emptyState}>
              <Feather name="heart" size={48} color="#ddd" />
              <Text style={styles.emptyStateText}>No vaccination records yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your pet's first vaccination record</Text>
            </View>
          ) : Object.keys(groupedVaccinations).length === 0 && searchQuery ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color="#ddd" />
              <Text style={styles.emptyStateText}>No results found</Text>
              <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
            </View>
          ) : (
            Object.keys(groupedVaccinations)
              .sort((a, b) => b - a)
              .map(year => (
                <View key={year} style={styles.yearSection}>
                  <Text style={styles.yearTitle}>{year}</Text>
                  {groupedVaccinations[year].map(vaccination => (
                    <TouchableOpacity
                      key={vaccination.id}
                      style={styles.vaccinationCard}
                      onPress={() => {
                        setSelectedVaccination(vaccination);
                        setVaccinationDetailVisible(true);
                      }}
                    >
                      <Text style={styles.vaccinationName}>{vaccination.name}</Text>
                      <View style={styles.vaccinationDetails}>
                        <Text style={styles.vaccinationDate}>
                          {new Date(vaccination.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }).replace(/\//g, '.')}
                        </Text>
                        {vaccination.veterinarian && (
                          <Text style={styles.vaccinationVet}>
                            Dr. {vaccination.veterinarian.split(' ')[vaccination.veterinarian.split(' ').length - 1]}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
          )}
        </ScrollView>

        {/* Add Vaccination Button */}
        <TouchableOpacity 
          style={styles.addVaccinationButton} 
          onPress={() => {
            setIsEditingVaccination(false);
            setNewVaccination({
              name: '',
              date: '',
              expiryDate: '',
              lot: '',
              veterinarian: '',
              veterinarianTitle: '',
              address: '',
              notes: ''
            });
            setVaccinationFormVisible(true);
          }}
        >
          <Text style={styles.addVaccinationButtonText}>Add Vaccination Record</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pet' && styles.activeTabButton]}
          onPress={() => setActiveTab('pet')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'pet' && styles.activeTabButtonText]}>
            Pet Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'health' && styles.activeTabButton]}
          onPress={() => setActiveTab('health')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'health' && styles.activeTabButtonText]}>
            Health Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'pet' ? renderPetProfileTab() : renderHealthDetailsTab()}

      {/* Modals */}
      {renderEditModal()}
      {renderOwnerContactFormModal()}
      {renderVaccinationDetailModal()}
      {renderVaccinationFormModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#0a3d62',
    marginTop: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#0a3d62',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#0a3d62',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    border: '2px solid #0a3d62',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  petBreed: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  detailSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  appearanceText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  editIcon: {
    opacity: 0.6,
  },
  ownerContactText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  vaccinationsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  yearSection: {
    marginBottom: 20,
  },
  yearTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  vaccinationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  vaccinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  vaccinationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vaccinationDate: {
    fontSize: 14,
    color: '#666',
  },
  vaccinationVet: {
    fontSize: 14,
    color: '#007AFF',
  },
  addVaccinationButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  addVaccinationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 0.45,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 0.45,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
ownerContactFormContent: {
  backgroundColor: '#fff',
  borderRadius: 20,
  width: width * 0.95,
  height: height * 0.85, 
  paddingBottom: 0, 
},
  ownerContactFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ownerContactFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ownerContactFormScroll: {
    flex: 1,
    padding: 20,
  },
  ownerContactFormButtons: {
    paddingHorizontal: 20,
  },
  vaccinationDetailContent: {
  backgroundColor: '#fff',
  borderRadius: 20,
  width: width * 0.95,
  height: height * 0.85, 
  paddingBottom: 0, 
},
  vaccinationDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vaccinationBackButton: {
    padding: 5,
  },
  vaccinationDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  vaccinationActionButtons: {
    flexDirection: 'row',
  },
  editVaccinationButton: {
    padding: 8,
    marginRight: 10,
  },
  deleteVaccinationButton: {
    padding: 8,
  },
  vaccinationDetailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  vaccinationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  vaccinationDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  vaccinationDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  veterinarianSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  veterinarianAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  veterinarianInitials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  veterinarianInfo: {
    flex: 1,
  },
  veterinarianName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  veterinarianTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  vaccinationAddress: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  vaccinationNotes: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  vaccinationFormContent: {
  backgroundColor: '#fff',
  borderRadius: 20,
  width: width * 0.95,
  height: height * 0.85, // Changed from maxHeight to height
  paddingBottom: 0, // Removed padding
},

deletePetButton: {
  backgroundColor: '#FF3B30',
  borderRadius: 10,
  paddingVertical: 15,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
deletePetButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
  vaccinationFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vaccinationFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  vaccinationFormScroll: {
    flex: 1,
    padding: 20,
  },
  vaccinationFormButtons: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});