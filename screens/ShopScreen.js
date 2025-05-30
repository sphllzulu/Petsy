import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
// import { saveOrderToFirebase, updateOrderStatus, savePaymentDetails } from './firebase-payment-utils';
import { firestore, auth } from '../utils/firebaseConfig'; // Your existing config
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

const BACKEND_URL = 'https://petsyserver.onrender.com'; 

export default function ShopScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Sample product data
  const products = [
    {
      id: '1',
      name: 'Petsy Tag',
      description: 'Keep your pet safe with these Petsy Tags, never truly separated from your furry friend',
      price: 150.00,
      currency: 'R',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
      inStock: true,
      category: 'Pet Tags'
    }
  ];

  // Add item to cart
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems(prev => [...prev, { ...product, quantity: 1 }]);
    }
    
    setSelectedQuantity(prev => prev + 1);
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
      setSelectedQuantity(prev => prev - 1);
    } else {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      setSelectedQuantity(prev => prev - 1);
    }
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get quantity for specific product
  const getProductQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Initialize payment sheet
  const initializePaymentSheet = async (clientSecret) => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Petsy Store',
      paymentIntentClientSecret: clientSecret,
      defaultBillingDetails: {
        name: 'Customer Name',
      },
      allowsDelayedPaymentMethods: true,
      returnURL: 'your-app://stripe-redirect', // Configure this in your app.json
    });

    if (error) {
      console.error('Error initializing payment sheet:', error);
      return false;
    }

    return true;
  };

  
// Save order to Firestore
 const saveOrderToFirebase = async (orderData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const orderRef = await addDoc(collection(firestore, 'orders'), {
      userId: user.uid,
      userEmail: user.email,
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'pending'
    });

    return orderRef.id;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

// Update order status after payment
 const updateOrderStatus = async (orderId, paymentData) => {
  try {
    const orderRef = doc(firestore, 'orders', orderId);
    
    await updateDoc(orderRef, {
      status: paymentData.status === 'succeeded' ? 'completed' : 'failed',
      paymentIntentId: paymentData.paymentIntentId,
      paymentStatus: paymentData.status,
      paidAt: paymentData.status === 'succeeded' ? serverTimestamp() : null,
      paymentMethod: paymentData.paymentMethod || null
    });

    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Save payment details
 const savePaymentDetails = async (paymentData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const paymentRef = await addDoc(collection(firestore, 'payments'), {
      userId: user.uid,
      paymentIntentId: paymentData.paymentIntentId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: paymentData.status,
      orderId: paymentData.orderId,
      createdAt: serverTimestamp()
    });

    return paymentRef.id;
  } catch (error) {
    console.error('Error saving payment details:', error);
    throw error;
  }
};


  // Open payment sheet
  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error`, error.message);
      return false;
    }

    return true;
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before proceeding to checkout.');
      return;
    }

    setLoading(true);

    try {
      // 1. Save order to Firebase first
      const orderData = {
        items: cartItems,
        totalAmount: getTotalPrice(),
        currency: 'ZAR',
        timestamp: new Date().toISOString()
      };

      const orderId = await saveOrderToFirebase(orderData);

      // 2. Create payment intent on backend
      const response = await fetch(`${BACKEND_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getTotalPrice(),
          currency: 'zar',
          metadata: {
            orderId: orderId,
            items: JSON.stringify(cartItems.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })))
          }
        }),
      });

      const { clientSecret, paymentIntentId } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // 3. Initialize payment sheet
      const initSuccess = await initializePaymentSheet(clientSecret);
      if (!initSuccess) {
        throw new Error('Failed to initialize payment sheet');
      }

      // 4. Present payment sheet
      const paymentSuccess = await openPaymentSheet();
      
      if (paymentSuccess) {
        // 5. Confirm payment on backend
        const confirmResponse = await fetch(`${BACKEND_URL}/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntentId
          }),
        });

        const paymentResult = await confirmResponse.json();

        // 6. Update order status in Firebase
        await updateOrderStatus(orderId, {
          status: paymentResult.status,
          paymentIntentId: paymentIntentId
        });

        // 7. Save payment details
        await savePaymentDetails({
          paymentIntentId: paymentIntentId,
          amount: getTotalPrice(),
          currency: 'ZAR',
          status: paymentResult.status,
          orderId: orderId
        });

        if (paymentResult.status === 'succeeded') {
          Alert.alert(
            'Payment Successful!',
            'Your order has been placed successfully. You will receive a confirmation email shortly.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Clear cart and navigate
                  setCartItems([]);
                  setSelectedQuantity(0);
                  // navigation.navigate('OrderConfirmation', { orderId });
                }
              }
            ]
          );
        } else {
          Alert.alert('Payment Failed', 'Please try again or contact support.');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render product card
  const renderProductCard = (product) => {
    const quantity = getProductQuantity(product.id);
    
    return (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.cardContent}>
          {/* Product Image */}
          <View style={styles.productImageContainer}>
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
            {/* Overlay for pet tags visualization */}
            <View style={styles.tagsOverlay}>
              <View style={[styles.tag, styles.leftTag]}>
                <Feather name="heart" size={10} color="#0a3d62" />
              </View>
              <View style={[styles.tag, styles.rightTag]}>
                <Text style={styles.tagText}>🐾</Text>
              </View>
            </View>
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <Text style={styles.productPrice}>
                  {product.currency}{product.price.toFixed(2)}
                </Text>
              </View>

              {/* Add/Remove Buttons */}
              <View style={styles.quantityControls}>
                {quantity > 0 && (
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => removeFromCart(product.id)}
                    activeOpacity={0.8}
                  >
                    <Feather name="minus" size={14} color="#fff" />
                  </TouchableOpacity>
                )}
                
                {quantity > 0 && (
                  <Text style={styles.quantityText}>{quantity}</Text>
                )}
                
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addToCart(product)}
                  activeOpacity={0.8}
                >
                  <Feather name="plus" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafbfc" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color="#2f3640" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Shop</Text>
          
          <TouchableOpacity style={styles.cartButton} activeOpacity={0.7}>
            <Feather name="shopping-cart" size={22} color="#2f3640" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pet Tags</Text>
          <Text style={styles.sectionSubtitle}>Keep your pets safe and identifiable</Text>
        </View>
        
        {products.map(product => renderProductCard(product))}
        
        {/* Additional spacing for checkout button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Checkout Button */}
      {selectedQuantity > 0 && (
        <View style={styles.checkoutContainer}>
          <View style={styles.checkoutShadow} />
          <TouchableOpacity
            style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
            onPress={handleCheckout}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <View style={styles.checkoutContent}>
                  <View style={styles.checkoutLeft}>
                    <Text style={styles.checkoutButtonText}>
                      Add to basket
                    </Text>
                    <Text style={styles.checkoutSubtext}>
                      {selectedQuantity} item{selectedQuantity > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.checkoutPrice}>
                    R{getTotalPrice().toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2f3640',
    letterSpacing: -0.5,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#0a3d62',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fafbfc',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2f3640',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#747d8c',
    fontWeight: '500',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
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
  cardContent: {
    padding: 20,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  tagsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  tag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  leftTag: {
    marginRight: 6,
  },
  rightTag: {
    marginLeft: 6,
  },
  tagText: {
    fontSize: 8,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productDetails: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2f3640',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  productDescription: {
    fontSize: 14,
    color: '#747d8c',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a3d62',
    letterSpacing: -0.2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#747d8c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    minWidth: 20,
    textAlign: 'center',
    color: '#2f3640',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0a3d62',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 120, // Space for checkout button
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fafbfc',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  checkoutShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e1e5e9',
  },
  checkoutButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0a3d62',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#a4b0be',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  checkoutLeft: {
    alignItems: 'flex-start',
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  checkoutSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  checkoutPrice: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});