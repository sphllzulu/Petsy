import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../utils/firebaseConfig'; // Adjust path as needed
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPets, setUserPets] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigation.navigate('Login'); // Redirect to login if not authenticated
      return;
    }

    // First, get user's pets to filter notifications
    fetchUserPets(currentUser.uid);
    
    // Set up real-time listener for notifications
    const unsubscribe = setupNotificationListener(currentUser.uid);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchUserPets = async (userId) => {
    try {
      const petsRef = collection(firestore, 'pets');
      const petsQuery = query(petsRef, where('userId', '==', userId));
      const petsSnapshot = await getDocs(petsQuery);
      
      const pets = petsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserPets(pets);
    } catch (error) {
      console.error('Error fetching user pets:', error);
    }
  };

  const setupNotificationListener = (userId) => {
    try {
      // Query notifications where the pet belongs to the current user
      const notificationsRef = collection(firestore, 'foundPetNotifications');
      const notificationsQuery = query(
        notificationsRef,
        where('ownerInfo.userId', '==', userId), // Assuming you'll add userId to ownerInfo
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const fetchedNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        setNotifications(fetchedNotifications);
        setLoading(false);
        setRefreshing(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up notification listener:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      await fetchUserPets(currentUser.uid);
    }
  };

  const handleCallFinder = (phoneNumber) => {
    Alert.alert(
      'Call Finder',
      `Do you want to call ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`);
          }
        }
      ]
    );
  };

  const handleEmailFinder = (email, petName) => {
    const subject = encodeURIComponent(`Thank you for finding ${petName}`);
    const body = encodeURIComponent(`Hi,\n\nThank you so much for finding ${petName}! I'll be in touch soon to arrange pickup.\n\nBest regards`);
    
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const markAsContacted = async (notificationId) => {
    try {
      const notificationRef = doc(firestore, 'foundPetNotifications', notificationId);
      await updateDoc(notificationRef, {
        status: 'contacted',
        contactedAt: new Date()
      });
      
      Alert.alert('Success', 'Notification marked as contacted');
    } catch (error) {
      console.error('Error updating notification:', error);
      Alert.alert('Error', 'Failed to update notification status');
    }
  };

  const markAsResolved = async (notificationId, petName) => {
    Alert.alert(
      'Mark as Resolved',
      `Have you been reunited with ${petName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Resolved',
          onPress: async () => {
            try {
              const notificationRef = doc(firestore, 'foundPetNotifications', notificationId);
              await updateDoc(notificationRef, {
                status: 'resolved',
                resolvedAt: new Date()
              });
              
              Alert.alert('Great!', `So happy you're reunited with ${petName}! 🎉`);
            } catch (error) {
              console.error('Error resolving notification:', error);
              Alert.alert('Error', 'Failed to update notification status');
            }
          }
        }
      ]
    );
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#0a3d62';
      case 'contacted': return '#57606f';
      case 'resolved': return '#2f3640';
      default: return '#0a3d62';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'alert-circle';
      case 'contacted': return 'chatbubble-ellipses';
      case 'resolved': return 'checkmark-circle';
      default: return 'alert-circle';
    }
  };

  const renderNotificationCard = (notification) => {
    const { finderInfo, petName, timestamp, status, id } = notification;
    
    return (
      <View key={id} style={styles.notificationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.petIconContainer}>
              <Ionicons 
                name="paw" 
                size={20} 
                color="#0a3d62" 
              />
            </View>
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{petName} Found</Text>
              <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Ionicons 
              name={getStatusIcon(status)} 
              size={12} 
              color="white" 
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.finderInfo}>
          <Text style={styles.finderTitle}>Found by</Text>
          <Text style={styles.finderName}>{finderInfo.name}</Text>
          
          {finderInfo.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#747d8c" />
              <Text style={styles.locationText}>{finderInfo.location}</Text>
            </View>
          )}
          
          {finderInfo.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message</Text>
              <Text style={styles.messageText}>{finderInfo.message}</Text>
            </View>
          )}
        </View>

        <View style={styles.contactButtons}>
          <TouchableOpacity 
            style={[styles.contactBtn, styles.callBtn]}
            onPress={() => handleCallFinder(finderInfo.phone)}
          >
            <Ionicons name="call-outline" size={16} color="white" />
            <Text style={styles.contactBtnText}>Call</Text>
          </TouchableOpacity>
          
          {finderInfo.email && (
            <TouchableOpacity 
              style={[styles.contactBtn, styles.emailBtn]}
              onPress={() => handleEmailFinder(finderInfo.email, petName)}
            >
              <Ionicons name="mail-outline" size={16} color="white" />
              <Text style={styles.contactBtnText}>Email</Text>
            </TouchableOpacity>
          )}
        </View>

        {status === 'pending' && (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => markAsContacted(id)}
          >
            <Text style={styles.actionBtnText}>Mark as Contacted</Text>
          </TouchableOpacity>
        )}

        {status === 'contacted' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.resolveBtn]}
            onPress={() => markAsResolved(id, petName)}
          >
            <Text style={styles.actionBtnText}>Mark as Resolved</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fafbfc" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a3d62" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafbfc" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Pet Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#0a3d62']}
            tintColor="#0a3d62"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#a4b0be" />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You'll be notified here when someone finds your pet
            </Text>
          </View>
        ) : (
          notifications.map(renderNotificationCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  header: {
    backgroundColor: '#fafbfc',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2f3640',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#747d8c',
    marginTop: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#747d8c',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f2f6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3640',
    letterSpacing: -0.2,
  },
  timestamp: {
    fontSize: 13,
    color: '#747d8c',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f2f6',
    marginBottom: 16,
  },
  finderInfo: {
    marginBottom: 20,
  },
  finderTitle: {
    fontSize: 13,
    color: '#747d8c',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3640',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#747d8c',
    marginLeft: 6,
    fontWeight: '500',
  },
  messageContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0a3d62',
  },
  messageLabel: {
    fontSize: 12,
    color: '#747d8c',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    color: '#2f3640',
    lineHeight: 20,
    fontWeight: '500',
  },
  contactButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  callBtn: {
    backgroundColor: '#0a3d62',
  },
  emailBtn: {
    backgroundColor: '#57606f',
  },
  contactBtnText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: '#f1f3f8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  resolveBtn: {
    backgroundColor: '#0a3d62',
    borderColor: '#0a3d62',
  },
  actionBtnText: {
    color: '#57606f',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2f3640',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 16,
    color: '#747d8c',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});

export default NotificationsScreen;