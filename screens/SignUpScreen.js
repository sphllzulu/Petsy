// import React, { useState } from 'react';
// import { 
//   StyleSheet, 
//   Text, 
//   View, 
//   Image, 
//   TextInput, 
//   TouchableOpacity, 
//   SafeAreaView, 
//   StatusBar,
//   ScrollView,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions
// } from 'react-native';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { doc, setDoc } from 'firebase/firestore';
// import { auth, firestore } from '../utils/firebaseConfig'; // Import from your firebase config
// import { Feather, AntDesign, FontAwesome } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// const { width, height } = Dimensions.get('window');

// export default function SignUpScreen() {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [acceptTerms, setAcceptTerms] = useState(false);
//   const [loading, setLoading] = useState(false);
  
//   const navigation = useNavigation();
  
//   const handleSignup = async () => {
//     // Validate inputs
//     if (!username.trim()) {
//       Alert.alert('Error', 'Please enter a username');
//       return;
//     }
    
//     if (!email.trim()) {
//       Alert.alert('Error', 'Please enter an email address');
//       return;
//     }
    
//     if (!password.trim() || password.length < 6) {
//       Alert.alert('Error', 'Please enter a password (minimum 6 characters)');
//       return;
//     }
    
//     if (!acceptTerms) {
//       Alert.alert('Error', 'Please accept the terms and conditions');
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       // Create user with email and password
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
      
//       // Store additional user data in Firestore
//       await setDoc(doc(firestore, "users", user.uid), {
//         username: username,
//         email: email,
//         createdAt: new Date().toISOString(),
//       });
      
//       // Navigation will be handled by the onAuthStateChanged listener in App.js
//     } catch (error) {
//       setLoading(false);
      
//       let errorMessage = 'An error occurred during signup';
//       if (error.code === 'auth/email-already-in-use') {
//         errorMessage = 'This email is already in use';
//       } else if (error.code === 'auth/invalid-email') {
//         errorMessage = 'Please enter a valid email address';
//       } else if (error.code === 'auth/weak-password') {
//         errorMessage = 'Password is too weak';
//       }
      
//       Alert.alert('Error', errorMessage);
//     }
//   };
  
//   const handleGoogleSignIn = () => {
//     // Implement Google Sign-In
//     Alert.alert('Info', 'Google Sign-In would be implemented here');
//   };
  
//   const handleFacebookSignIn = () => {
//     // Implement Facebook Sign-In
//     Alert.alert('Info', 'Facebook Sign-In would be implemented here');
//   };
  
//   const handleAppleSignIn = () => {
//     // Implement Apple Sign-In
//     Alert.alert('Info', 'Apple Sign-In would be implemented here');
//   };
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
//       {/* Background Dog Image */}
//       <Image 
//         source={require('../assets/dog-paw-up.png')} 
//         style={styles.backgroundDogImage} 
//         resizeMode="cover"
//       />
      
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardAvoidView}
//       >
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           <View style={styles.formContainer}>
//             <Text style={styles.title}>Create Account</Text>
            
//             {/* Username Input */}
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Username</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="name@email.com"
//                 value={username}
//                 onChangeText={setUsername}
//                 autoCapitalize="none"
//               />
//             </View>
            
//             {/* Email Input */}
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Email</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="name@email.com"
//                 value={email}
//                 onChangeText={setEmail}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//               />
//             </View>
            
//             {/* Password Input */}
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Password</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="****************"
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry
//               />
//             </View>
            
//             {/* Terms Checkbox */}
//             <TouchableOpacity 
//               style={styles.checkboxContainer}
//               onPress={() => setAcceptTerms(!acceptTerms)}
//               activeOpacity={0.7}
//             >
//               <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
//                 {acceptTerms && <Feather name="check" size={14} color="white" />}
//               </View>
//               <Text style={styles.checkboxLabel}>Accept terms and conditions</Text>
//             </TouchableOpacity>
            
//             {/* Signup Button */}
//             <TouchableOpacity 
//               style={styles.signupButton}
//               onPress={handleSignup}
//               disabled={loading}
//             >
//               <Text style={styles.signupButtonText}>
//                 {loading ? 'Creating Account...' : 'Create Account'}
//               </Text>
//             </TouchableOpacity>
            
//             {/* Login Link */}
//             <View style={styles.loginLinkContainer}>
//               <Text style={styles.loginText}>Already have an account? </Text>
//               <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
//                 <Text style={styles.loginLink}>Log in here</Text>
//               </TouchableOpacity>
//             </View>
            
//             {/* Social Login */}
//             <View style={styles.socialLoginContainer}>
//               <Text style={styles.socialLoginText}>Or sign in using these</Text>
              
//               <View style={styles.socialButtonsContainer}>
//                 <TouchableOpacity 
//                   style={styles.socialButton}
//                   onPress={handleGoogleSignIn}
//                 >
//                   <AntDesign name="google" size={20} color="black" />
//                 </TouchableOpacity>
                
//                 <TouchableOpacity 
//                   style={styles.socialButton}
//                   onPress={handleFacebookSignIn}
//                 >
//                   <FontAwesome name="facebook" size={20} color="black" />
//                 </TouchableOpacity>
                
//                 <TouchableOpacity 
//                   style={styles.socialButton}
//                   onPress={handleAppleSignIn}
//                 >
//                   <AntDesign name="apple1" size={20} color="black" />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   backgroundDogImage: {
//     position: 'absolute',
//     top: 0,
//     width: width,
//     height: height * 0.3, // Take up 30% of the screen height
//     opacity: 0.9, // Make it slightly transparent
//   },
//   keyboardAvoidView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingTop: height * 0.25, // Start content below the dog image
//     paddingBottom: 20,
//   },
//   formContainer: {
//     backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent background
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     paddingHorizontal: 20,
//     paddingTop: 30,
//     paddingBottom: 20,
//     flex: 1,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   inputContainer: {
//     marginBottom: 15,
//   },
//   inputLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 5,
//   },
//   input: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     paddingVertical: 8,
//     fontSize: 16,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 15,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     marginRight: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   checkboxChecked: {
//     backgroundColor: '#0a3d62',
//     borderColor: '#0a3d62',
//   },
//   checkboxLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   signupButton: {
//     backgroundColor: '#0a3d62',
//     borderRadius: 25,
//     paddingVertical: 15,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   signupButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   loginLinkContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 20,
//   },
//   loginText: {
//     color: '#666',
//   },
//   loginLink: {
//     color: '#0a3d62',
//     fontWeight: 'bold',
//   },
//   socialLoginContainer: {
//     marginTop: 30,
//     alignItems: 'center',
//   },
//   socialLoginText: {
//     color: '#666',
//     marginBottom: 15,
//   },
//   socialButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   socialButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.5,
//   },
// });

import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../utils/firebaseConfig'; // Import from your firebase config
import { Feather, AntDesign, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();
  
  const handleSignup = async () => {
    // Validate inputs
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      Alert.alert('Error', 'Please enter a password (minimum 6 characters)');
      return;
    }
    
    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
        emailVerified: false,
      });
      
      // Send verification email using Firebase
      await sendEmailVerification(user);
      
      setLoading(false);
      
      // Navigate to OTP verification screen
      navigation.navigate('OtpVerification', { 
        email: email,
        userId: user.uid
      });
      
      // Show success message
      Alert.alert(
        'Verification Email Sent',
        'Please check your email inbox and enter the verification code to complete your registration.'
      );
      
    } catch (error) {
      setLoading(false);
      
      let errorMessage = 'An error occurred during signup';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };
  
  const handleGoogleSignIn = () => {
    // Implement Google Sign-In
    Alert.alert('Info', 'Google Sign-In would be implemented here');
  };
  
  const handleFacebookSignIn = () => {
    // Implement Facebook Sign-In
    Alert.alert('Info', 'Facebook Sign-In would be implemented here');
  };
  
  const handleAppleSignIn = () => {
    // Implement Apple Sign-In
    Alert.alert('Info', 'Apple Sign-In would be implemented here');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Background Dog Image */}
      <Image 
        source={require('../assets/dog-paw-up.png')} 
        style={styles.backgroundDogImage} 
        resizeMode="cover"
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="name@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="****************"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            {/* Terms Checkbox */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Feather name="check" size={14} color="white" />}
              </View>
              <Text style={styles.checkboxLabel}>Accept terms and conditions</Text>
            </TouchableOpacity>
            
            {/* Signup Button */}
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
            
            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.loginLink}>Log in here</Text>
              </TouchableOpacity>
            </View>
            
            {/* Social Login */}
            <View style={styles.socialLoginContainer}>
              <Text style={styles.socialLoginText}>Or sign in using these</Text>
              
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={handleGoogleSignIn}
                >
                  <AntDesign name="google" size={20} color="black" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={handleFacebookSignIn}
                >
                  <FontAwesome name="facebook" size={20} color="black" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={handleAppleSignIn}
                >
                  <AntDesign name="apple1" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backgroundDogImage: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.3, // Take up 30% of the screen height
    opacity: 0.9, // Make it slightly transparent
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.25, // Start content below the dog image
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent background
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0a3d62',
    borderColor: '#0a3d62',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  signupButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#0a3d62',
    fontWeight: 'bold',
  },
  socialLoginContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  socialLoginText: {
    color: '#666',
    marginBottom: 15,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
});