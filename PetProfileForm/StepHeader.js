import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ConfirmationStep({ onComplete, petData }) {
  return (
    <View style={styles.container}>
      <Text style={styles.confirmationTitle}>Add Pet Confirmation</Text>
      
      {petData.imageUrl && (
        <View style={styles.petImageContainer}>
          <Image source={{ uri: petData.imageUrl }} style={styles.petImage} />
        </View>
      )}
      
      <Text style={styles.congratsText}>
        Congratulations! New pet added.
      </Text>
      
      <TouchableOpacity 
        style={styles.completeButton}
        onPress={onComplete}
      >
        <Text style={styles.completeButtonText}>Complete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    alignSelf: 'center',
  },
  petImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    overflow: 'hidden',
  },
  petImage: {
    width: 120,
    height: 120,
  },
  congratsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  completeButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});