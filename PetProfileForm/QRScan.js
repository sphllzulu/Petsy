import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

const QRScanView = ({ onTagAdded, onToggleMethod }) => {
  // Simulate QR scan (in a real app, we would use camera/QR scanner)
  const handleScanQR = () => {
    // Generate random serial number to simulate a scan
    const scannedSerialNumber = 'QR' + Math.floor(Math.random() * 1000000).toString();
    onTagAdded(scannedSerialNumber);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pet tags</Text>
      <Text style={styles.subtitle}>
        Scan the QR code on the tag using your camera. All your pet tags will appear here.
      </Text>
      
      <View style={styles.imageContainer}>
        <Image 
          source={require('../assets/pet-tags.png')} // Replace with your image path
          style={styles.tagsImage}
          resizeMode="contain"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={handleScanQR}
      >
        <Text style={styles.scanButtonText}>Add New Petsy Tag</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.toggleLink}
        onPress={onToggleMethod}
      >
        <Text style={styles.toggleText}>Manually type serial number</Text>
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 20,
  },
  tagsImage: {
    width: 200,
    height: 100,
  },
  scanButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  scanButtonText: {
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

export default QRScanView;