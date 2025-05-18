import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  Platform,
  Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AgeSelectionStep({ onBack, onNext, petData, updatePetData }) {
  const [birthdate, setBirthdate] = useState(petData.birthdate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Calculate age in years
  const calculateAge = (date) => {
    const ageDifMs = Date.now() - date.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  
  // Format date as string
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };
  
  // Handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthdate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthdate(currentDate);
    
    // Update pet data with new birthdate and calculated age
    updatePetData({
      birthdate: currentDate,
      age: calculateAge(currentDate)
    });
  };
  
  // Show date picker
  const showDatepicker = () => {
    setShowDatePicker(true);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>Add Pet</Text>
          <Text style={styles.stepSubtitle}>Step 3/4 • Pet Age</Text>
        </View>
      </View>
      
      <View style={styles.stepIndicator}>
        <View style={styles.stepLine}>
          <View style={[styles.stepLineActive, { width: '75%' }]} />
        </View>
      </View>
      
      {petData.imageUrl && (
        <View style={styles.petImageContainer}>
          <Image source={{ uri: petData.imageUrl }} style={styles.petImage} />
        </View>
      )}
      
      <View style={styles.birthdayContainer}>
        <TouchableOpacity style={styles.datePickerButton} onPress={showDatepicker}>
          <View style={styles.dateInfo}>
            <Feather name="calendar" size={20} color="#666" style={styles.calendarIcon} />
            <Text style={styles.birthdayText}>{formatDate(birthdate)}</Text>
          </View>
          <View style={styles.ageContainer}>
            <Text style={styles.ageText}>{calculateAge(birthdate)} y</Text>
          </View>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={birthdate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={onNext}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  petImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 30,
    overflow: 'hidden',
  },
  petImage: {
    width: 120,
    height: 120,
  },
  birthdayContainer: {
    width: '100%',
    marginBottom: 30,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 10,
  },
  birthdayText: {
    fontSize: 16,
  },
  ageContainer: {
    backgroundColor: '#e6e6e6',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  ageText: {
    fontSize: 14,
    fontWeight: 'bold',
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