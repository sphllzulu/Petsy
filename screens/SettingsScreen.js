import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { auth } from '../utils/firebaseConfig'; // Adjust path as needed
import { 
  signOut, 
  updatePassword, 
  updateProfile, 
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const isShortDevice = screenHeight < 700;
const isSmallDevice = screenWidth < 375;

const PrivacyPolicy = `PRIVACY POLICY FOR PETSY APP

Last updated: ${new Date().toLocaleDateString()}

1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.

Types of information we may collect include:
• Account information (email, display name)
• Pet profiles and information
• Usage data and app interactions
• Device information and identifiers

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
• Provide, maintain, and improve our services
• Process transactions and send related information
• Send technical notices and support messages
• Respond to your comments and questions
• Monitor and analyze usage patterns

3. INFORMATION SHARING
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:
• To comply with legal obligations
• To protect our rights and safety
• With your explicit consent
• To trusted service providers who assist in app operations

4. DATA SECURITY
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. DATA RETENTION
We retain your information for as long as your account is active or as needed to provide services. You may request deletion at any time.

6. YOUR RIGHTS
You have the right to:
• Access your personal information
• Correct inaccurate information
• Delete your account and data
• Opt-out of communications

7. CHILDREN'S PRIVACY
Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.

8. CHANGES TO PRIVACY POLICY
We may update this policy periodically. We will notify you of significant changes via email or app notification.

Contact us at privacy@petsy.app for questions about this policy.`;

const TermsOfService = `TERMS OF SERVICE FOR PETSY APP

Last updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By accessing and using Petsy, you accept and agree to be bound by these Terms of Service.

2. DESCRIPTION OF SERVICE
Petsy is a mobile application designed to help pet owners manage their pets' information, health records, and care schedules.

3. USER ACCOUNTS
• You must provide accurate information when creating an account
• You are responsible for maintaining account security
• You must be at least 13 years old to use this service
• One person may not maintain multiple accounts

4. USER CONDUCT
You agree not to:
• Use the service for illegal purposes
• Upload harmful, offensive, or inappropriate content
• Attempt to gain unauthorized access to our systems
• Interfere with other users' use of the service
• Violate any applicable laws or regulations

5. CONTENT AND DATA
• You retain ownership of content you submit
• You grant us license to use your content to provide services
• We may remove content that violates these terms
• You're responsible for backing up your data

6. PRIVACY
Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.

7. DISCLAIMERS
• The service is provided "as is" without warranties
• We don't guarantee uninterrupted or error-free service
• Pet care information is for reference only, not professional advice
• Always consult veterinarians for medical concerns

8. LIMITATION OF LIABILITY
Petsy shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.

9. TERMINATION
We may terminate or suspend your account for violations of these terms. You may delete your account at any time.

10. GOVERNING LAW
These terms are governed by the laws of [Your Jurisdiction].

11. CHANGES TO TERMS
We reserve the right to modify these terms. Continued use after changes constitutes acceptance.

12. CONTACT INFORMATION
For questions about these terms, contact us at legal@petsy.app

By using Petsy, you acknowledge that you have read and understood these terms.`;

const SettingsScreen = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  
  // Modal states
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setDisplayName(user.displayName || '');
      }
    });
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              Alert.alert('Success', 'You have been signed out successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      Alert.alert('Success', 'Password updated successfully');
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleProfileUpdate = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    try {
      await updateProfile(user, {
        displayName: displayName.trim(),
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      setProfileModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const initiateAccountDeletion = () => {
    setDeleteConfirmModalVisible(true);
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      Alert.alert('Error', 'Please enter your password to confirm deletion');
      return;
    }

    if (deleteConfirmText.toLowerCase() !== 'delete my account') {
      Alert.alert('Error', 'Please type "delete my account" to confirm');
      return;
    }

    try {
      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(user.email, deleteConfirmPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Delete the user
      await deleteUser(user);
      
      Alert.alert(
        'Account Deleted', 
        'Your account and all associated data have been permanently deleted.',
        [{ text: 'OK', onPress: () => setDeleteConfirmModalVisible(false) }]
      );
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password. Please try again.');
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert('Error', 'Please sign out and sign back in, then try again.');
      } else {
        Alert.alert('Error', 'Failed to delete account: ' + error.message);
      }
    }
  };

  const SettingItem = ({ title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (showArrow && <Text style={styles.arrow}>›</Text>)}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const DocumentModal = ({ visible, onClose, title, content }) => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.documentModalContainer}>
        <View style={styles.documentHeader}>
          <Text style={styles.documentTitle}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.documentContent}>
          <Text style={styles.documentText}>{content}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const DeleteConfirmModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={deleteConfirmModalVisible}
      onRequestClose={() => setDeleteConfirmModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: screenHeight * 0.8 }]}>
          <Text style={styles.modalTitle}>Delete Account</Text>
          <Text style={styles.deleteWarningText}>
            ⚠️ This action is permanent and cannot be undone. All your data, including pet profiles, 
            health records, and app settings will be permanently deleted.
          </Text>
          
          <Text style={styles.deleteInstructionText}>
            To confirm deletion, please:
          </Text>
          
          <Text style={styles.deleteStepText}>1. Enter your current password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            value={deleteConfirmPassword}
            onChangeText={setDeleteConfirmPassword}
          />
          
          <Text style={styles.deleteStepText}>2. Type "delete my account" below:</Text>
          <TextInput
            style={styles.input}
            placeholder="Type: delete my account"
            value={deleteConfirmText}
            onChangeText={setDeleteConfirmText}
            autoCapitalize="none"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setDeleteConfirmModalVisible(false);
                setDeleteConfirmPassword('');
                setDeleteConfirmText('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const PasswordModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={passwordModalVisible}
      onRequestClose={() => setPasswordModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          
          <TextInput
            style={styles.input}
            placeholder="New Password (min 6 characters)"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setPasswordModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handlePasswordChange}
            >
              <Text style={styles.confirmButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const ProfileModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={profileModalVisible}
      onRequestClose={() => setProfileModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setProfileModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleProfileUpdate}
            >
              <Text style={styles.confirmButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <SectionHeader title="ACCOUNT" />
        
        <View style={styles.section}>
          <SettingItem
            title="Profile"
            subtitle={user?.displayName || user?.email || 'Not signed in'}
            onPress={() => setProfileModalVisible(true)}
          />
          
          <SettingItem
            title="Email"
            subtitle={user?.email || 'No email'}
            onPress={() => Alert.alert('Info', 'Email cannot be changed from this screen')}
            showArrow={false}
          />
          
          <SettingItem
            title="Change Password"
            onPress={() => setPasswordModalVisible(true)}
          />
        </View>

        {/* Data & Privacy */}
        <SectionHeader title="DATA & PRIVACY" />
        
        <View style={styles.section}>
          <SettingItem
            title="Privacy Policy"
            onPress={() => setPrivacyModalVisible(true)}
          />
          
          <SettingItem
            title="Terms of Service"
            onPress={() => setTermsModalVisible(true)}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="DANGER ZONE" />
        
        <View style={styles.section}>
          <SettingItem
            title="Sign Out"
            onPress={handleSignOut}
          />
          
          <SettingItem
            title="Delete Account"
            subtitle="Permanently delete your account and all data"
            onPress={initiateAccountDeletion}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>Petsy App</Text>
        </View>
      </ScrollView>

      <PasswordModal />
      <ProfileModal />
      <DeleteConfirmModal />
      
      <DocumentModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title="PrivacyPolicy"
        content={PrivacyPolicy}
      />
      
      <DocumentModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        title="TermsOfService"
        content={TermsOfService}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: isShortDevice ? 20 : 30,
  },
  sectionHeader: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: '#666',
    marginTop: isShortDevice ? 20 : 30,
    marginBottom: 8,
    marginHorizontal: 16,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: isShortDevice ? 10 : 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
    minHeight: isShortDevice ? 44 : 48,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#c7c7cc',
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: isShortDevice ? 15 : 20,
    marginTop: isShortDevice ? 15 : 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isShortDevice ? 16 : 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: isShortDevice ? '85%' : '80%',
  },
  modalTitle: {
    fontSize: isSmallDevice ? 17 : 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: isShortDevice ? 16 : 20,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: 12,
    fontSize: isSmallDevice ? 15 : 16,
    backgroundColor: '#f9f9f9',
    minHeight: 44,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: isShortDevice ? 16 : 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '500',
  },
  
  // Delete Account Modal Styles
  deleteWarningText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteInstructionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  deleteStepText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  
  // Document Modal Styles
  documentModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
    backgroundColor: '#f8f8f8',
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  documentContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  documentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
});

export default SettingsScreen;