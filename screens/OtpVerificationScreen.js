// import React, { useState, useRef, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   SafeAreaView,
//   Dimensions,
//   Keyboard,
//   Platform
// } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// const { width } = Dimensions.get('window');
// const OTP_LENGTH = 6;

// export default function OtpVerificationScreen() {
//   const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
//   const [activeInput, setActiveInput] = useState(0);
//   const navigation = useNavigation();
  
//   // Handle number press on custom keyboard
//   const handleNumberPress = (number) => {
//     if (activeInput < OTP_LENGTH) {
//       const newOtp = [...otp];
//       newOtp[activeInput] = number;
//       setOtp(newOtp);
      
//       // Move to next input if not at the end
//       if (activeInput < OTP_LENGTH - 1) {
//         setActiveInput(activeInput + 1);
//       }
//     }
//   };
  
//   // Handle backspace press
//   const handleBackspace = () => {
//     if (activeInput > 0) {
//       const newOtp = [...otp];
//       newOtp[activeInput - 1] = '';
//       setOtp(newOtp);
//       setActiveInput(activeInput - 1);
//     } else if (activeInput === 0) {
//       const newOtp = [...otp];
//       newOtp[activeInput] = '';
//       setOtp(newOtp);
//     }
//   };
  
//   // Handle verify button press
//   const handleVerify = () => {
//     const otpCode = otp.join('');
//     if (otpCode.length === OTP_LENGTH) {
//       // Here you would typically verify the OTP with your backend
//       console.log('Verifying OTP:', otpCode);
//       // Navigate to next screen or show success message
//       alert('OTP verification would happen here');
//     } else {
//       alert('Please enter the complete OTP');
//     }
//   };
  
//   // Handle input box press to focus on specific input
//   const handleInputPress = (index) => {
//     setActiveInput(index);
//   };
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         {/* Header */}
//         <Text style={styles.title}>One-Time Pin</Text>
//         <Text style={styles.subtitle}>
//           We have sent an OTP to your inbox. Enter the code here
//         </Text>
        
//         {/* OTP Input Boxes */}
//         <View style={styles.otpContainer}>
//           {otp.map((digit, index) => (
//             <TouchableOpacity
//               key={index}
//               style={[
//                 styles.otpInput,
//                 activeInput === index && styles.activeOtpInput
//               ]}
//               onPress={() => handleInputPress(index)}
//             >
//               <Text style={styles.otpText}>{digit}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
        
//         {/* Verify Button */}
//         <TouchableOpacity 
//           style={styles.verifyButton}
//           onPress={handleVerify}
//         >
//           <Text style={styles.verifyButtonText}>Verify</Text>
//         </TouchableOpacity>
        
//         {/* Custom Numeric Keypad */}
//         <View style={styles.keypadContainer}>
//           <View style={styles.keypadRow}>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('1')}
//             >
//               <Text style={styles.keypadButtonText}>1</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('2')}
//             >
//               <Text style={styles.keypadButtonText}>2</Text>
//               <Text style={styles.keypadSubText}>ABC</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('3')}
//             >
//               <Text style={styles.keypadButtonText}>3</Text>
//               <Text style={styles.keypadSubText}>DEF</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.keypadRow}>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('4')}
//             >
//               <Text style={styles.keypadButtonText}>4</Text>
//               <Text style={styles.keypadSubText}>GHI</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('5')}
//             >
//               <Text style={styles.keypadButtonText}>5</Text>
//               <Text style={styles.keypadSubText}>JKL</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('6')}
//             >
//               <Text style={styles.keypadButtonText}>6</Text>
//               <Text style={styles.keypadSubText}>MNO</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.keypadRow}>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('7')}
//             >
//               <Text style={styles.keypadButtonText}>7</Text>
//               <Text style={styles.keypadSubText}>PQRS</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('8')}
//             >
//               <Text style={styles.keypadButtonText}>8</Text>
//               <Text style={styles.keypadSubText}>TUV</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('9')}
//             >
//               <Text style={styles.keypadButtonText}>9</Text>
//               <Text style={styles.keypadSubText}>WXYZ</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.keypadRow}>
//             <View style={styles.emptyKey}></View>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={() => handleNumberPress('0')}
//             >
//               <Text style={styles.keypadButtonText}>0</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.keypadButton} 
//               onPress={handleBackspace}
//             >
//               <Feather name="delete" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 40,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 30,
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 30,
//   },
//   otpInput: {
//     width: (width - 70) / 6, // Distribute 6 boxes evenly with some spacing
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   activeOtpInput: {
//     borderColor: '#0a3d62',
//     backgroundColor: '#fff',
//   },
//   otpText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   verifyButton: {
//     backgroundColor: '#0a3d62',
//     borderRadius: 25,
//     paddingVertical: 15,
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   verifyButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   keypadContainer: {
//     marginTop: 'auto', // Push to bottom
//     backgroundColor: '#f0f0f0',
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//     paddingVertical: 10,
//   },
//   keypadRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 10,
//   },
//   keypadButton: {
//     width: width / 3 - 20,
//     height: 60,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   keypadButtonText: {
//     fontSize: 24,
//     fontWeight: '500',
//   },
//   keypadSubText: {
//     fontSize: 10,
//     color: '#666',
//   },
//   emptyKey: {
//     width: width / 3 - 20,
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../utils/firebaseConfig'; // Import from your firebase config

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;

export default function OtpVerificationScreen() {
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes timer
  const [resendDisabled, setResendDisabled] = useState(true);
  
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get params from navigation
  const { email, userId } = route.params || {};
  
  // Timer for cool-down on resend button
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          setResendDisabled(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        // User has verified their email
        updateUserVerificationStatus(user.uid);
      }
    });
    
    // Set up deep link handling
    const handleDeepLink = async (event) => {
      const url = event.url;
      if (url.includes('__/auth/action')) {
        // This is a Firebase auth action link
        try {
          setVerifying(true);
          // Extract the OOB code from the URL
          const actionCode = url.split('oobCode=')[1].split('&')[0];
          
          // Check the action code
          const actionInfo = await checkActionCode(auth, actionCode);
          
          // If it's for email verification, apply it
          if (actionInfo.operation === 'VERIFY_EMAIL') {
            await applyActionCode(auth, actionCode);
            
            // Update user verification status in Firestore
            if (auth.currentUser) {
              await updateUserVerificationStatus(auth.currentUser.uid);
            }
            
            setVerifying(false);
            Alert.alert(
              'Success',
              'Email verified successfully!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('Home'); // Adjust based on your app's navigation
                  }
                }
              ]
            );
          }
        } catch (error) {
          setVerifying(false);
          Alert.alert('Error', 'Failed to verify email. Please try again.');
        }
      }
    };
    
    // Add listeners for deep linking
    Linking.addEventListener('url', handleDeepLink);
    
    // Check for initial URL (app opened via link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    
    return () => {
      clearInterval(countdown);
      unsubscribe();
      // Clean up deep link listener
    };
  }, []);
  
  // Function to update user verification status in Firestore
  const updateUserVerificationStatus = async (uid) => {
    try {
      const userRef = doc(firestore, "users", uid);
      await updateDoc(userRef, {
        emailVerified: true
      });
    } catch (error) {
      console.error("Error updating verification status:", error);
    }
  };
  
  // Format timer to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!resendDisabled) {
      try {
        // Resend verification email
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          
          // Reset timer and disable resend button
          setTimer(300);
          setResendDisabled(true);
          
          Alert.alert('Success', `A new verification link has been sent to ${email}.`);
        } else {
          Alert.alert('Error', 'User not logged in. Please go back and sign in again.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to resend verification email. Please try again.');
      }
    }
  };
  
  // Open email app
  const openEmailApp = () => {
    Linking.openURL('mailto:');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Email Verification</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to {email}. Please check your email and click the link to verify your account.
        </Text>
        
        {/* Timer for resend */}
        <View style={styles.timerContainer}>
          {resendDisabled ? (
            <Text style={styles.timerText}>You can resend email in: {formatTime(timer)}</Text>
          ) : (
            <Text style={styles.timerText}>You can now resend the verification email</Text>
          )}
        </View>
        
        {/* Open Email Button */}
        <TouchableOpacity 
          style={styles.emailButton}
          onPress={openEmailApp}
        >
          <View style={styles.buttonContent}>
            <Feather name="mail" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.emailButtonText}>Open Email App</Text>
          </View>
        </TouchableOpacity>
        
        {/* Resend Button */}
        <TouchableOpacity 
          style={[styles.resendButton, resendDisabled && styles.resendButtonDisabled]}
          onPress={handleResendVerification}
          disabled={resendDisabled}
        >
          <Text style={[styles.resendButtonText, resendDisabled && styles.resendButtonTextDisabled]}>
            Resend Verification Email
          </Text>
        </TouchableOpacity>
        
        {/* Back to Login */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.backButtonText}>
            Back to Login
          </Text>
        </TouchableOpacity>
        
        {/* Loading Indicator */}
        {verifying && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0a3d62" />
            <Text style={styles.loadingText}>Verifying your email...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    color: '#0a3d62',
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: '#0a3d62',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0a3d62',
  },
});