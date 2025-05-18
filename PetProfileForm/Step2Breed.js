import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  TextInput,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Sample breed data with images
const breeds = [
  { id: '1', name: 'Terrier', image: require('../assets/dog-with-toy.png') },
  { id: '2', name: 'Poodle', image: require('../assets/dog-with-toy.png') },
  { id: '3', name: 'Beagle', image: require('../assets/dog-with-toy.png') },
  { id: '4', name: 'Akita', image: require('../assets/dog-with-toy.png') },
  { id: '5', name: 'French Bulldog', image: require('../assets/dog-with-toy.png') },
  { id: '6', name: 'Maltese', image: require('../assets/dog-with-toy.png') },
  { id: '7', name: 'Border Collie', image: require('../assets/dog-with-toy.png') },
  { id: '8', name: 'Labrador', image: require('../assets/dog-with-toy.png') },
];

export default function BreedSelectionStep({ onBack, onNext, selectedBreed, onBreedSelect }) {
  const [searchText, setSearchText] = useState('');
  
  // Filter breeds based on search text
  const filteredBreeds = searchText 
    ? breeds.filter(breed => 
        breed.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : breeds;
  
  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>Add Pet</Text>
          <Text style={styles.stepSubtitle}>Step 2/4 • Pet Breed</Text>
        </View>
      </View>
      
      <View style={styles.stepIndicator}>
        <View style={styles.stepLine}>
          <View style={[styles.stepLineActive, { width: '50%' }]} />
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search breeds"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      
      <ScrollView 
        style={styles.breedList}
        contentContainerStyle={styles.breedGrid}
        showsVerticalScrollIndicator={false}
      >
        {filteredBreeds.map((breed) => (
          <TouchableOpacity
            key={breed.id}
            style={[
              styles.breedItem,
              selectedBreed === breed.name && styles.selectedBreedItem
            ]}
            onPress={() => onBreedSelect(breed.name)}
          >
            <Image source={breed.image} style={styles.breedImage} />
            <Text style={styles.breedName}>{breed.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.selectedBreedContainer}>
        <Text style={styles.selectedBreedLabel}>What breed is your pet?</Text>
        <Text style={styles.selectedBreedText}>{selectedBreed || 'Select a breed'}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.nextButton,
          !selectedBreed && styles.disabledButton
        ]}
        onPress={onNext}
        disabled={!selectedBreed}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  breedList: {
    flex: 1,
    marginBottom: 15,
  },
  breedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  breedItem: {
    width: width * 0.28,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedBreedItem: {
    backgroundColor: '#e6f2ff',
    borderWidth: 1,
    borderColor: '#0a3d62',
  },
  breedImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  breedName: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedBreedContainer: {
    marginBottom: 20,
  },
  selectedBreedLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  selectedBreedText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});