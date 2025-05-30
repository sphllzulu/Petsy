import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
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
  orderBy,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { styles } from './ProfileScreenStyles';

export default function VaccinationSection({ petData, setPetData }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [vaccinationDetailVisible, setVaccinationDetailVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vaccinationFormVisible, setVaccinationFormVisible] = useState(false);
  const [isEditingVaccination, setIsEditingVaccination] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  useEffect(() => {
    loadVaccinations();
  }, [petData.id]);

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

      let vaccinationId;

      if (isEditingVaccination && selectedVaccination) {
        // Update existing vaccination
        const vaccinationRef = doc(firestore, 'vaccinations', selectedVaccination.id);
        await updateDoc(vaccinationRef, vaccinationData);
        vaccinationId = selectedVaccination.id;
        
        // Remove old vaccination from pet's vaccinations array
        const petRef = doc(firestore, 'pets', petData.id);
        await updateDoc(petRef, {
          vaccinations: arrayRemove(selectedVaccination.id)
        });
        
        Alert.alert('Success', 'Vaccination record updated successfully');
      } else {
        // Add new vaccination
        const docRef = await addDoc(collection(firestore, 'vaccinations'), vaccinationData);
        vaccinationId = docRef.id;
        Alert.alert('Success', 'Vaccination record added successfully');
      }

      // Add vaccination ID to pet's vaccinations array
      const petRef = doc(firestore, 'pets', petData.id);
      await updateDoc(petRef, {
        vaccinations: arrayUnion(vaccinationId)
      });

      // Update local pet data
      const currentVaccinations = petData.vaccinations || [];
      if (isEditingVaccination) {
        const updatedVaccinations = currentVaccinations.filter(id => id !== selectedVaccination.id);
        updatedVaccinations.push(vaccinationId);
        setPetData(prev => ({ ...prev, vaccinations: updatedVaccinations }));
      } else {
        setPetData(prev => ({ 
          ...prev, 
          vaccinations: [...currentVaccinations, vaccinationId] 
        }));
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
              // Delete from vaccinations collection
              await deleteDoc(doc(firestore, 'vaccinations', vaccinationId));
              
              // Remove from pet's vaccinations array
              const petRef = doc(firestore, 'pets', petData.id);
              await updateDoc(petRef, {
                vaccinations: arrayRemove(vaccinationId)
              });

              // Update local pet data
              const updatedVaccinations = (petData.vaccinations || []).filter(id => id !== vaccinationId);
              setPetData(prev => ({ ...prev, vaccinations: updatedVaccinations }));
              
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

  const closeVaccinationDetail = () => {
    setVaccinationDetailVisible(false);
    setSelectedVaccination(null);
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

        {/* Modals */}
        {renderVaccinationDetailModal()}
        {renderVaccinationFormModal()}
      </View>
    );
  };

  return renderHealthDetailsTab();
}