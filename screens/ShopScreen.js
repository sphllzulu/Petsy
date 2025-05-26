import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ShopScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState(0);

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

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before proceeding to checkout.');
      return;
    }
    
    Alert.alert(
      'Proceed to Checkout',
      `Total: R${getTotalPrice().toFixed(2)}\n\nWould you like to proceed with your order?`,
      [
        {
          text: 'Continue Shopping',
          style: 'cancel'
        },
        {
          text: 'Checkout',
          onPress: () => {
            // Here you would typically navigate to checkout screen
            Alert.alert('Success', 'Proceeding to checkout...');
          }
        }
      ]
    );
  };

  // Render product card
  const renderProductCard = (product) => {
    const quantity = getProductQuantity(product.id);
    
    return (
      <View key={product.id} style={styles.productCard}>
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
              <Feather name="heart" size={12} color="#0a3d62" />
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
                >
                  <Feather name="minus" size={16} color="#fff" />
                </TouchableOpacity>
              )}
              
              {quantity > 0 && (
                <Text style={styles.quantityText}>{quantity}</Text>
              )}
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(product)}
              >
                <Feather name="plus" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Feather name="shopping-cart" size={24} color="#000" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {products.map(product => renderProductCard(product))}
        
        {/* Additional spacing for checkout button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Checkout Button */}
      {selectedQuantity > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>
              Add {selectedQuantity} to basket • R{getTotalPrice().toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  cartButton: {
    padding: 5,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: 80,
    height: 80,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  leftTag: {
    marginRight: 8,
  },
  rightTag: {
    marginLeft: 8,
  },
  tagText: {
    fontSize: 10,
  },
  productInfo: {
    padding: 16,
    paddingTop: 0,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0a3d62',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 100, // Space for checkout button
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkoutButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});