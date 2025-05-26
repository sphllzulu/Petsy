import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      petName: 'Lassie',
      petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
      message: 'Lassie was found',
      date: '12 Jun 2023',
      time: '13:48',
      location: '12 Pine Ave, Ferndale, Johannesburg',
      coordinates: { latitude: -26.1076, longitude: 28.0567 },
      phoneNumber: '+27123456789',
      isRead: false
    },
    {
      id: '2',
      petName: 'Lassie',
      petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
      message: 'Lassie was found',
      date: '09 Mar 2023',
      time: '18:58',
      location: '143 Astro Street, Woodmead, Johannesburg',
      coordinates: { latitude: -26.0808, longitude: 28.1123 },
      phoneNumber: '+27987654321',
      isRead: true
    }
  ]);

  // Handle call action
  const handleCall = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((err) => {
        console.error('Error opening phone app:', err);
        Alert.alert('Error', 'Failed to open phone app');
      });
  };

  // Handle navigation action
  const handleStartNavigation = (coordinates, location) => {
    const { latitude, longitude } = coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Maps application is not available');
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Failed to open maps application');
      });
  };

  // Handle delete action
  const handleDelete = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => 
              prev.filter(notification => notification.id !== notificationId)
            );
          }
        }
      ]
    );
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Render individual notification card
  const renderNotificationCard = (notification) => {
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationCard,
          !notification.isRead && styles.unreadCard
        ]}
        onPress={() => markAsRead(notification.id)}
        activeOpacity={0.7}
      >
        {/* Pet Image */}
        <View style={styles.petImageContainer}>
          <Image
            source={{ uri: notification.petImage }}
            style={styles.petImage}
            resizeMode="cover"
          />
        </View>

        {/* Notification Content */}
        <View style={styles.notificationContent}>
          {/* Message and timestamp */}
          <View style={styles.messageHeader}>
            <Text style={styles.messageText}>{notification.message}</Text>
            <View style={styles.timestampContainer}>
              <Text style={styles.dateText}>{notification.date}</Text>
              <Text style={styles.timeText}>{notification.time}</Text>
            </View>
          </View>

          {/* Location */}
          <Text style={styles.locationText}>{notification.location}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCall(notification.phoneNumber)}
            >
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleStartNavigation(notification.coordinates, notification.location)}
            >
              <Text style={styles.actionButtonText}>Start Navigation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(notification.id)}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unread indicator */}
        {!notification.isRead && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0 ? (
          notifications.map(notification => renderNotificationCard(notification))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              You'll receive notifications when your pets are found
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 34, // Same width as back button for centering
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0a3d62',
  },
  petImageContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  notificationContent: {
    marginLeft: 66, // Space for pet image + margin
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  timestampContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#0a3d62',
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#e74c3c',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a3d62',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});