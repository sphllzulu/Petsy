import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Animated
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

export default function QRScannerScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [torch, setTorch] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const { onScanSuccess } = route.params || {};

  useEffect(() => {
    startScanAnimation();
  }, []);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestCameraPermission();
    }
  }, [permission]);

  // Request camera permissions
  const requestCameraPermission = async () => {
    try {
      const result = await requestPermission();
      
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to scan QR codes. Please enable camera permissions in your device settings.',
          [
            { text: 'Cancel', onPress: () => navigation.goBack() },
            { text: 'Settings', onPress: () => {/* Open settings if needed */} }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  // Start scan line animation
  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  // Handle barcode scanned
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isLoading) return;
    
    setScanned(true);
    setIsLoading(true);

    try {
      // Validate QR code format
      if (!isValidPetsyQR(data)) {
        Alert.alert(
          'Invalid QR Code',
          'This doesn\'t appear to be a valid Petsy tag QR code. Please scan the QR code on your Petsy tag.',
          [
            { 
              text: 'Try Again', 
              onPress: () => {
                setScanned(false);
                setIsLoading(false);
              }
            },
            { text: 'Cancel', onPress: () => navigation.goBack() }
          ]
        );
        return;
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the success callback
      if (onScanSuccess) {
        await onScanSuccess(data);
      }

      // Navigate back
      navigation.goBack();

    } catch (error) {
      console.error('Error processing QR scan:', error);
      Alert.alert(
        'Scan Error',
        'Failed to process the QR code. Please try again.',
        [
          { 
            text: 'Try Again', 
            onPress: () => {
              setScanned(false);
              setIsLoading(false);
            }
          },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  // Validate if QR code is a valid Petsy QR
  const isValidPetsyQR = (data) => {
    try {
      // Check if it's a URL format like: https://petfinder.com/found/PET123456-351926110010452
      if (typeof data !== 'string') return false;
      
      // Should contain petfinder.com and have the right format
      const urlPattern = /https?:\/\/.*petfinder\.com\/found\/[A-Z0-9]+-[0-9]+/i;
      return urlPattern.test(data);
    } catch (error) {
      return false;
    }
  };

  // Toggle flashlight
  const toggleTorch = () => {
    setTorch(!torch);
  };

  // Render camera permissions loading
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a3d62" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render no permission message
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noPermissionContainer}>
          <Feather name="camera-off" size={64} color="#ccc" />
          <Text style={styles.noPermissionTitle}>Camera Access Required</Text>
          <Text style={styles.noPermissionText}>
            Please enable camera permissions to scan QR codes
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestCameraPermission}
          >
            <Text style={styles.permissionButtonText}>Request Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const scanLinePosition = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, height * 0.6 - 60],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={toggleTorch}
        >
          <Feather 
            name={torch ? "zap" : "zap-off"} 
            size={24} 
            color={torch ? "#ffd700" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          enableTorch={torch}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onCameraReady={() => setCameraReady(true)}
        />

        {/* Scan Overlay */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop} />
          
          {/* Middle section with scan area */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            
            {/* Scan area */}
            <View style={styles.scanArea}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Animated scan line */}
              {!scanned && !isLoading && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    { top: scanLinePosition }
                  ]}
                />
              )}
              
              {/* Loading indicator when processing */}
              {isLoading && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              )}
            </View>
            
            <View style={styles.overlaySide} />
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.overlayBottom} />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          {isLoading ? 'Processing QR Code...' : 'Point camera at QR code'}
        </Text>
        <Text style={styles.instructionsText}>
          {isLoading 
            ? 'Please wait while we verify your tag'
            : 'Position the QR code on your Petsy tag within the frame above'
          }
        </Text>
        
        {/* Manual entry option */}
        {!isLoading && (
          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={() => {
              navigation.goBack();
              // You might want to trigger manual entry mode here
            }}
          >
            <Text style={styles.manualEntryText}>Enter serial number manually</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f8f9fa',
  },
  noPermissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  noPermissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: width - 80,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: width - 80,
    height: width - 80,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#0a3d62',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#0a3d62',
    shadowColor: '#0a3d62',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  processingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  manualEntryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  manualEntryText: {
    color: '#0a3d62',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});