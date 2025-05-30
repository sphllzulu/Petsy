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

// Sample pet breed suggestions with Unsplash pet images
const breedSuggestions = [
  { id: '1', name: 'Golden Retriever', image: { uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop&crop=face' } },
  { id: '2', name: 'Persian Cat', image: { uri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face' } },
  { id: '3', name: 'Beagle', image: { uri: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=200&h=200&fit=crop&crop=face' } },
  { id: '4', name: 'Maine Coon', image: { uri: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&h=200&fit=crop&crop=face' } },
  { id: '5', name: 'French Bulldog', image: { uri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&crop=face' } },
  { id: '6', name: 'Siamese Cat', image: { uri: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=200&h=200&fit=crop&crop=face' } },
  { id: '7', name: 'Border Collie', image: { uri: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=200&h=200&fit=crop&crop=face' } },
  { id: '8', name: 'Rabbit (Holland Lop)', image: { uri: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop&crop=center' } },
  { id: '9', name: 'Parakeet', image: { uri: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&crop=center' } },
  { id: '10', name: 'Hamster', image: { uri: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop&crop=center' } },
];

export default function BreedSelectionStep({ onBack, onNext, selectedBreed, onBreedSelect }) {
  const [breedInput, setBreedInput] = useState(selectedBreed || '');
  
  // Filter breed suggestions based on input text
  const filteredSuggestions = breedInput 
    ? breedSuggestions.filter(breed => 
        breed.name.toLowerCase().includes(breedInput.toLowerCase())
      )
    : breedSuggestions;

  const handleBreedInputChange = (text) => {
    setBreedInput(text);
    onBreedSelect(text);
  };

  const handleSuggestionSelect = (breedName) => {
    setBreedInput(breedName);
    onBreedSelect(breedName);
  };
  
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
      
      <View style={styles.breedInputContainer}>
        <Text style={styles.inputLabel}>What breed is your pet?</Text>
        <TextInput
          style={styles.breedInput}
          placeholder="Type your pet's breed (e.g., Golden Retriever, Persian Cat, etc.)"
          value={breedInput}
          onChangeText={handleBreedInputChange}
          autoCapitalize="words"
        />
      </View>

      {breedInput.length > 0 && (
        <View style={styles.suggestionsHeader}>
          <Text style={styles.suggestionsTitle}>Suggestions</Text>
        </View>
      )}
      
      <ScrollView 
        style={styles.suggestionsList}
        contentContainerStyle={styles.suggestionsGrid}
        showsVerticalScrollIndicator={false}
      >
        {filteredSuggestions.map((breed) => (
          <TouchableOpacity
            key={breed.id}
            style={[
              styles.suggestionItem,
              breedInput === breed.name && styles.selectedSuggestionItem
            ]}
            onPress={() => handleSuggestionSelect(breed.name)}
          >
            <Image source={breed.image} style={styles.suggestionImage} />
            <Text style={styles.suggestionName}>{breed.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.selectedBreedContainer}>
        <Text style={styles.selectedBreedLabel}>Selected Breed:</Text>
        <Text style={styles.selectedBreedText}>{breedInput || 'Enter your pet\'s breed above'}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.nextButton,
          !breedInput.trim() && styles.disabledButton
        ]}
        onPress={onNext}
        disabled={!breedInput.trim()}
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
  breedInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  breedInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionsHeader: {
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  suggestionsList: {
    flex: 1,
    marginBottom: 15,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  suggestionItem: {
    width: width * 0.28,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSuggestionItem: {
    backgroundColor: '#e6f2ff',
    borderWidth: 2,
    borderColor: '#0a3d62',
  },
  suggestionImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  suggestionName: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  selectedBreedContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  selectedBreedLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  selectedBreedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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