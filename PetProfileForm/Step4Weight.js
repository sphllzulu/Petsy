import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WeightSelectionStep({ onBack, onNext, petData, updatePetData }) {
  const [weight, setWeight] = useState(petData.weight || 23);
  
  // Handle weight change
  const handleWeightChange = (value) => {
    const roundedWeight = Math.round(value);
    setWeight(roundedWeight);
    updatePetData({ weight: roundedWeight });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>Add Pet</Text>
          <Text style={styles.stepSubtitle}>Step 4/4 • Pet Weight</Text>
        </View>
      </View>
      
      <View style={styles.stepIndicator}>
        <View style={styles.stepLine}>
          <View style={[styles.stepLineActive, { width: '100%' }]} />
        </View>
      </View>
      
      {petData.imageUrl && (
        <View style={styles.petImageContainer}>
          <Image source={{ uri: petData.imageUrl }} style={styles.petImage} />
        </View>
      )}
      
      <View style={styles.weightContainer}>
        <Text style={styles.weightValue}>{weight}</Text>
        
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={50}
          value={weight}
          onValueChange={handleWeightChange}
          minimumTrackTintColor="#0a3d62"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#0a3d62"
        />
        
        <View style={styles.weightScale}>
          {Array.from({ length: 11 }).map((_, i) => (
            <View key={i} style={styles.scaleLine} />
          ))}
        </View>
        
        <View style={styles.weightLabels}>
          <Text style={styles.weightLabel}>1</Text>
          <Text style={styles.weightLabel}>25</Text>
          <Text style={styles.weightLabel}>50</Text>
        </View>
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
  weightContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  weightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  weightScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: -15,
  },
  scaleLine: {
    width: 1,
    height: 10,
    backgroundColor: '#ccc',
  },
  weightLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  weightLabel: {
    fontSize: 12,
    color: '#666',
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