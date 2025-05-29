// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   Alert,
//   Linking
// } from 'react-native';
// import { Feather } from '@expo/vector-icons';

// export default function NotificationsScreen({ navigation }) {
//   const [notifications, setNotifications] = useState([
//     {
//       id: '1',
//       petName: 'Lassie',
//       petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
//       message: 'Lassie was found',
//       date: '12 Jun 2023',
//       time: '13:48',
//       location: '12 Pine Ave, Ferndale, Johannesburg',
//       coordinates: { latitude: -26.1076, longitude: 28.0567 },
//       phoneNumber: '+27123456789',
//       isRead: false
//     },
//     {
//       id: '2',
//       petName: 'Lassie',
//       petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
//       message: 'Lassie was found',
//       date: '09 Mar 2023',
//       time: '18:58',
//       location: '143 Astro Street, Woodmead, Johannesburg',
//       coordinates: { latitude: -26.0808, longitude: 28.1123 },
//       phoneNumber: '+27987654321',
//       isRead: true
//     }
//   ]);

//   // Handle call action
//   const handleCall = (phoneNumber) => {
//     const phoneUrl = `tel:${phoneNumber}`;
//     Linking.canOpenURL(phoneUrl)
//       .then((supported) => {
//         if (supported) {
//           return Linking.openURL(phoneUrl);
//         } else {
//           Alert.alert('Error', 'Phone calls are not supported on this device');
//         }
//       })
//       .catch((err) => {
//         console.error('Error opening phone app:', err);
//         Alert.alert('Error', 'Failed to open phone app');
//       });
//   };

//   // Handle navigation action
//   const handleStartNavigation = (coordinates, location) => {
//     const { latitude, longitude } = coordinates;
//     const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
//     Linking.canOpenURL(url)
//       .then((supported) => {
//         if (supported) {
//           return Linking.openURL(url);
//         } else {
//           Alert.alert('Error', 'Maps application is not available');
//         }
//       })
//       .catch((err) => {
//         console.error('Error opening maps:', err);
//         Alert.alert('Error', 'Failed to open maps application');
//       });
//   };

//   // Handle delete action
//   const handleDelete = (notificationId) => {
//     Alert.alert(
//       'Delete Notification',
//       'Are you sure you want to delete this notification?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel'
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: () => {
//             setNotifications(prev => 
//               prev.filter(notification => notification.id !== notificationId)
//             );
//           }
//         }
//       ]
//     );
//   };

//   // Mark notification as read
//   const markAsRead = (notificationId) => {
//     setNotifications(prev =>
//       prev.map(notification =>
//         notification.id === notificationId
//           ? { ...notification, isRead: true }
//           : notification
//       )
//     );
//   };

//   // Render individual notification card
//   const renderNotificationCard = (notification) => {
//     return (
//       <TouchableOpacity
//         key={notification.id}
//         style={[
//           styles.notificationCard,
//           !notification.isRead && styles.unreadCard
//         ]}
//         onPress={() => markAsRead(notification.id)}
//         activeOpacity={0.7}
//       >
//         {/* Pet Image */}
//         <View style={styles.petImageContainer}>
//           <Image
//             source={{ uri: notification.petImage }}
//             style={styles.petImage}
//             resizeMode="cover"
//           />
//         </View>

//         {/* Notification Content */}
//         <View style={styles.notificationContent}>
//           {/* Message and timestamp */}
//           <View style={styles.messageHeader}>
//             <Text style={styles.messageText}>{notification.message}</Text>
//             <View style={styles.timestampContainer}>
//               <Text style={styles.dateText}>{notification.date}</Text>
//               <Text style={styles.timeText}>{notification.time}</Text>
//             </View>
//           </View>

//           {/* Location */}
//           <Text style={styles.locationText}>{notification.location}</Text>

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => handleCall(notification.phoneNumber)}
//             >
//               <Text style={styles.actionButtonText}>Call</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => handleStartNavigation(notification.coordinates, notification.location)}
//             >
//               <Text style={styles.actionButtonText}>Start Navigation</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => handleDelete(notification.id)}
//             >
//               <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Unread indicator */}
//         {!notification.isRead && <View style={styles.unreadIndicator} />}
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation?.goBack()}
//         >
//           <Feather name="arrow-left" size={24} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Notifications</Text>
//         <View style={styles.headerRight} />
//       </View>

//       {/* Notifications List */}
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {notifications.length > 0 ? (
//           notifications.map(notification => renderNotificationCard(notification))
//         ) : (
//           <View style={styles.emptyState}>
//             <Feather name="bell-off" size={48} color="#ccc" />
//             <Text style={styles.emptyStateText}>No notifications yet</Text>
//             <Text style={styles.emptyStateSubtext}>
//               You'll receive notifications when your pets are found
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   backButton: {
//     padding: 5,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   headerRight: {
//     width: 34, // Same width as back button for centering
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 20,
//   },
//   notificationCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     position: 'relative',
//   },
//   unreadCard: {
//     borderLeftWidth: 4,
//     borderLeftColor: '#0a3d62',
//   },
//   petImageContainer: {
//     position: 'absolute',
//     top: 16,
//     left: 16,
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     overflow: 'hidden',
//   },
//   petImage: {
//     width: '100%',
//     height: '100%',
//   },
//   notificationContent: {
//     marginLeft: 66, // Space for pet image + margin
//   },
//   messageHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   messageText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000',
//     flex: 1,
//   },
//   timestampContainer: {
//     alignItems: 'flex-end',
//   },
//   dateText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   timeText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   locationText: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 16,
//     lineHeight: 20,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   actionButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     color: '#0a3d62',
//     fontWeight: '500',
//   },
//   deleteButtonText: {
//     color: '#e74c3c',
//   },
//   unreadIndicator: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#0a3d62',
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyStateText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyStateSubtext: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     paddingHorizontal: 40,
//     lineHeight: 20,
//   },
// });

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
  Dimensions
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

const { width } = Dimensions.get('window');

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
      case 'pending': return '#FF6B35';
      case 'contacted': return '#4ECDC4';
      case 'resolved': return '#45B7D1';
      default: return '#FF6B35';
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
            <Ionicons 
              name="paw" 
              size={24} 
              color="#FF6B35" 
              style={styles.petIcon}
            />
            <View>
              <Text style={styles.petName}>{petName} Found!</Text>
              <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Ionicons 
              name={getStatusIcon(status)} 
              size={16} 
              color="white" 
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.finderInfo}>
          <Text style={styles.finderTitle}>Found by:</Text>
          <Text style={styles.finderName}>{finderInfo.name}</Text>
          
          {finderInfo.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.locationText}>{finderInfo.location}</Text>
            </View>
          )}
          
          {finderInfo.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>{finderInfo.message}</Text>
            </View>
          )}
        </View>

        <View style={styles.contactButtons}>
          <TouchableOpacity 
            style={[styles.contactBtn, styles.callBtn]}
            onPress={() => handleCallFinder(finderInfo.phone)}
          >
            <Ionicons name="call" size={20} color="white" />
            <Text style={styles.contactBtnText}>Call</Text>
          </TouchableOpacity>
          
          {finderInfo.email && (
            <TouchableOpacity 
              style={[styles.contactBtn, styles.emailBtn]}
              onPress={() => handleEmailFinder(finderInfo.email, petName)}
            >
              <Ionicons name="mail" size={20} color="white" />
              <Text style={styles.contactBtnText}>Email</Text>
            </TouchableOpacity>
          )}
        </View>

        {status === 'pending' && (
          <TouchableOpacity 
            style={styles.markContactedBtn}
            onPress={() => markAsContacted(id)}
          >
            <Text style={styles.markContactedText}>Mark as Contacted</Text>
          </TouchableOpacity>
        )}

        {status === 'contacted' && (
          <TouchableOpacity 
            style={styles.resolveBtn}
            onPress={() => markAsResolved(id, petName)}
          >
            <Text style={styles.resolveBtnText}>Mark as Resolved</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pet Notifications</Text>
        <Text style={styles.headerSubtitle}>
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petIcon: {
    marginRight: 12,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  finderInfo: {
    marginBottom: 16,
  },
  finderTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  finderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  messageContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  callBtn: {
    backgroundColor: '#4CAF50',
  },
  emailBtn: {
    backgroundColor: '#2196F3',
  },
  contactBtnText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  markContactedBtn: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  markContactedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resolveBtn: {
    backgroundColor: '#45B7D1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resolveBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});

export default NotificationsScreen;