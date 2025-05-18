import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const PetCard = ({ pet }) => {
  // Calculate age from birthday if available
  const calculateAge = (birthday) => {
    if (!birthday) return 'Age unknown';
    
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years < 1) {
      return `${months} months old`;
    } else if (years === 1 && months === 0) {
      return '1 year old';
    } else if (months === 0) {
      return `${years} years old`;
    } else {
      return `${years} years, ${months} months old`;
    }
  };

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {pet.petImage ? (
            <Image source={{ uri: pet.petImage }} style={styles.petImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={30} color="#ccc" />
            </View>
          )}
        </View>
        
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.petName}</Text>
          {pet.breed && <Text style={styles.petBreed}>{pet.breed}</Text>}
          {pet.birthday && <Text style={styles.petAge}>{calculateAge(pet.birthday)}</Text>}
          {pet.weight && <Text style={styles.petWeight}>{pet.weight} kg</Text>}
        </View>
        
        <View style={styles.actionContainer}>
          <Feather name="chevron-right" size={24} color="#ccc" />
        </View>
      </View>
      
      <View style={styles.tagInfo}>
        <Feather name="tag" size={14} color="#666" />
        <Text style={styles.tagText}>Tag: {pet.serialNumber}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 15,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  petAge: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  petWeight: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    marginLeft: 'auto',
  },
  tagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
});

export default PetCard;