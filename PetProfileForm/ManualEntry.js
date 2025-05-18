import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';

const ManualEntryView = ({ onTagAdded, onToggleMethod, loading }) => {
  const [serialNumber, setSerialNumber] = useState('');

  const handleAddTag = () => {
    if (!serialNumber.trim()) {
      alert('Please enter a valid serial number');
      return;
    }
    onTagAdded(serialNumber.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Serial Number</Text>
      <Text style={styles.subtitle}>
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
        style={styles.addButton}
        onPress={handleAddTag}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>Add Tag</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.toggleLink}
        onPress={onToggleMethod}
      >
        <Text style={styles.toggleText}>Scan QR code instead</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
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
  addButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleLink: {
    alignItems: 'center',
    padding: 10,
  },
  toggleText: {
    color: '#0a3d62',
    fontSize: 14,
  },
});

export default ManualEntryView;