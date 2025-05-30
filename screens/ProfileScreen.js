import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { firestore } from "../utils/firebaseConfig";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { styles } from "./ProfileScreenStyles";
import VaccinationSection from "./VaccinationSection";

const { height, width } = Dimensions.get("window");

export default function PetProfileScreen({ navigation, route }) {
  const { pet } = route.params;
  const [petData, setPetData] = useState(pet);
  const [activeTab, setActiveTab] = useState("pet");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ownerContactFormVisible, setOwnerContactFormVisible] = useState(false);
  const [ownerContactDetails, setOwnerContactDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: "",
  });

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = "dkxkx7cn6";
  const CLOUDINARY_UPLOAD_PRESET = "absentee";

  useEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackButton}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });

    loadOwnerContactDetails();
  }, [navigation]);

  const loadOwnerContactDetails = () => {
    if (petData.ownerContact) {
      try {
        const parsed = JSON.parse(petData.ownerContact);
        setOwnerContactDetails(parsed);
      } catch (error) {
        // If it's a simple string, convert to structured format
        setOwnerContactDetails({
          ...ownerContactDetails,
          notes: petData.ownerContact,
        });
      }
    }
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return "Unknown";
    const today = new Date();
    const birth = new Date(birthdate);
    const ageInYears = Math.floor(
      (today - birth) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return `${ageInYears} ${ageInYears === 1 ? "yr" : "yrs"}`;
  };

  const openEditModal = (field) => {
    setEditingField(field);
    switch (field) {
      case "name":
        setEditValue(petData.name || "");
        break;
      case "breed":
        setEditValue(petData.breed || "");
        break;
      case "weight":
        setEditValue(petData.weight?.toString() || "");
        break;
      case "gender":
        setEditValue(petData.gender || "");
        break;
      case "size":
        setEditValue(petData.size || "");
        break;
      case "appearance":
        setEditValue(petData.appearance || "");
        break;
      default:
        setEditValue("");
    }
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingField(null);
    setEditValue("");
  };

  const updatePetField = async () => {
    if (!editValue.trim()) {
      Alert.alert("Error", "Please enter a valid value");
      return;
    }

    setIsUpdating(true);

    try {
      const updateData = {};

      switch (editingField) {
        case "name":
          updateData.name = editValue.trim();
          break;
        case "breed":
          updateData.breed = editValue.trim();
          break;
        case "weight":
          const weight = parseFloat(editValue);
          if (isNaN(weight) || weight <= 0) {
            Alert.alert("Error", "Please enter a valid weight");
            setIsUpdating(false);
            return;
          }
          updateData.weight = weight;
          break;
        case "gender":
          updateData.gender = editValue.trim();
          break;
        case "size":
          updateData.size = editValue.trim();
          break;
        case "appearance":
          updateData.appearance = editValue.trim();
          break;
      }

      const petRef = doc(firestore, "pets", petData.id);
      await updateDoc(petRef, updateData);

      setPetData((prev) => ({ ...prev, ...updateData }));

      closeEditModal();
      Alert.alert("Success", "Pet profile updated successfully");
    } catch (error) {
      console.error("Error updating pet:", error);
      Alert.alert("Error", "Failed to update pet profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const uploadToCloudinary = async (imageUri) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "pet_image.jpg",
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "pet_images");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      Alert.alert("Upload Failed", "Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePet = async () => {
    Alert.alert(
      "Delete Pet",
      `Are you sure you want to delete ${petData.name}? This action cannot be undone and will also delete all vaccination records.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUpdating(true);

              // Delete all vaccination records first
              const vaccinationsRef = collection(firestore, "vaccinations");
              const q = query(
                vaccinationsRef,
                where("petId", "==", petData.id)
              );
              const querySnapshot = await getDocs(q);

              const deletePromises = [];
              querySnapshot.forEach((doc) => {
                deletePromises.push(deleteDoc(doc.ref));
              });

              await Promise.all(deletePromises);

              // Delete the pet
              await deleteDoc(doc(firestore, "pets", petData.id));

              Alert.alert("Success", "Pet deleted successfully", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error("Error deleting pet:", error);
              Alert.alert("Error", "Failed to delete pet. Please try again.");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const updateQRCodeOwnerContact = async (serialNumber, ownerContactData) => {
    try {
      const qrCodesRef = collection(firestore, "qrCodes");
      const q = query(qrCodesRef, where("serialNumber", "==", serialNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const qrDoc = querySnapshot.docs[0];
        await updateDoc(doc(firestore, "qrCodes", qrDoc.id), {
          ownerContact: ownerContactData,
          ownerContactUpdatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error updating QR code owner contact:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        const cloudinaryUrl = await uploadToCloudinary(imageUri);

        if (cloudinaryUrl) {
          const petRef = doc(firestore, "pets", petData.id);
          await updateDoc(petRef, { imageUrl: cloudinaryUrl });

          setPetData((prev) => ({ ...prev, imageUrl: cloudinaryUrl }));
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSaveOwnerContact = async () => {
    try {
      setIsUpdating(true);

      const ownerContactString = JSON.stringify(ownerContactDetails);
      const petRef = doc(firestore, "pets", petData.id);
      await updateDoc(petRef, { ownerContact: ownerContactString });

      // Add this section to update the QR code document
      if (petData.serialNumber) {
        await updateQRCodeOwnerContact(
          petData.serialNumber,
          ownerContactDetails
        );
      }

      setPetData((prev) => ({ ...prev, ownerContact: ownerContactString }));
      setOwnerContactFormVisible(false);
      Alert.alert("Success", "Owner contact information updated successfully");
    } catch (error) {
      console.error("Error updating owner contact:", error);
      Alert.alert("Error", "Failed to update owner contact information");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderEditModal = () => {
    const getFieldLabel = () => {
      switch (editingField) {
        case "name":
          return "Pet Name";
        case "breed":
          return "Breed";
        case "weight":
          return "Weight (kg)";
        case "gender":
          return "Gender";
        case "size":
          return "Size";
        case "appearance":
          return "Appearance";
        default:
          return "Edit";
      }
    };

    const getPlaceholder = () => {
      switch (editingField) {
        case "name":
          return "Enter pet name";
        case "breed":
          return "Enter breed";
        case "weight":
          return "Enter weight in kg";
        case "gender":
          return "Enter gender";
        case "size":
          return "Enter size (Small, Medium, Large)";
        case "appearance":
          return "Describe your pet's appearance";
        default:
          return "Enter value";
      }
    };

    const getKeyboardType = () => {
      return editingField === "weight" ? "numeric" : "default";
    };

    return (
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit {getFieldLabel()}</Text>
              <TouchableOpacity
                onPress={closeEditModal}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.editInput,
                editingField === "appearance" && { height: 100 },
              ]}
              placeholder={getPlaceholder()}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType={getKeyboardType()}
              multiline={editingField === "appearance"}
              maxLength={
                editingField === "name"
                  ? 30
                  : editingField === "breed"
                  ? 50
                  : 1000
              }
            />

            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeEditModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, isUpdating && styles.disabledButton]}
                onPress={updatePetField}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderOwnerContactFormModal = () => {
    return (
      <Modal
        visible={ownerContactFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOwnerContactFormVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.ownerContactFormContent}>
            <View style={styles.ownerContactFormHeader}>
              <Text style={styles.ownerContactFormTitle}>
                Owner Contact Information
              </Text>
              <TouchableOpacity
                onPress={() => setOwnerContactFormVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.ownerContactFormScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Owner Name*</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter owner's full name"
                  value={ownerContactDetails.name}
                  onChangeText={(text) =>
                    setOwnerContactDetails({
                      ...ownerContactDetails,
                      name: text,
                    })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number*</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter phone number"
                  value={ownerContactDetails.phone}
                  onChangeText={(text) =>
                    setOwnerContactDetails({
                      ...ownerContactDetails,
                      phone: text,
                    })
                  }
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter email address"
                  value={ownerContactDetails.email}
                  onChangeText={(text) =>
                    setOwnerContactDetails({
                      ...ownerContactDetails,
                      email: text,
                    })
                  }
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Home Address</Text>
                <TextInput
                  style={[styles.formInput, { height: 80 }]}
                  placeholder="Enter home address"
                  value={ownerContactDetails.address}
                  onChangeText={(text) =>
                    setOwnerContactDetails({
                      ...ownerContactDetails,
                      address: text,
                    })
                  }
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Emergency Contact Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter emergency contact name"
                  value={ownerContactDetails.emergencyContact}
                  onChangeText={(text) =>
                    setOwnerContactDetails({
                      ...ownerContactDetails,
                      emergencyContact: text,
                    })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Emergency Contact Phone</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter emergency contact phone"
                  value={ownerContactDetails.emergencyPhone}
                  onChangeText={(text) =>
                    setOwnerContactDetails({
                      ...ownerContactDetails,
                      emergencyPhone: text,
                    })
                  }
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional Notes</Text>
                <TextInput
                  style={[styles.formInput, { height: 80 }]}
                  placeholder="Any additional notes or instructions"
                  value={ownerContactDetails.notes}
                  onChangeText={(text) =>
                    setOwnerContactDetails({
                      ...ownerContactDetails,
                      notes: text,
                    })
                  }
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.ownerContactFormButtons}>
              <TouchableOpacity
                style={[styles.saveButton, isUpdating && styles.disabledButton]}
                onPress={handleSaveOwnerContact}
                disabled={
                  isUpdating ||
                  !ownerContactDetails.name ||
                  !ownerContactDetails.phone
                }
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    Save Contact Information
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderPetProfileTab = () => {
    const displayOwnerContact = () => {
      if (!petData.ownerContact) return "Not specified";

      try {
        const parsed = JSON.parse(petData.ownerContact);
        return `${parsed.name || "Unknown"}\n${parsed.phone || ""}\n${
          parsed.email || ""
        }`;
      } catch (error) {
        return petData.ownerContact;
      }
    };

    return (
      <ScrollView style={styles.tabContent}>
        {/* Pet Image Section */}
        <TouchableOpacity style={styles.imageSection} onPress={pickImage}>
          <View style={styles.imageContainer}>
            {petData.imageUrl ? (
              <Image
                source={{ uri: petData.imageUrl }}
                style={styles.petImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="image" size={48} color="#ccc" />
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.petName}>{petData.name}</Text>
        <Text style={styles.petBreed}>{petData.breed}</Text>

        {/* Appearance Section */}
        <View style={styles.detailSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <TouchableOpacity onPress={() => openEditModal("appearance")}>
              <Feather name="edit-2" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.appearanceText}>{petData.appearance}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Details</Text>
            <TouchableOpacity onPress={() => openEditModal("name")}>
              <Feather name="edit-2" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gender</Text>
            <TouchableOpacity
              style={styles.detailValueContainer}
              onPress={() => openEditModal("gender")}
            >
              <Text style={styles.detailValue}>{petData.gender}</Text>
              <Feather
                name="edit-2"
                size={14}
                color="#666"
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size</Text>
            <TouchableOpacity
              style={styles.detailValueContainer}
              onPress={() => openEditModal("size")}
            >
              <Text style={styles.detailValue}>{petData.size}</Text>
              <Feather
                name="edit-2"
                size={14}
                color="#666"
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight</Text>
            <TouchableOpacity
              style={styles.detailValueContainer}
              onPress={() => openEditModal("weight")}
            >
              <Text style={styles.detailValue}>{petData.weight} kg</Text>
              <Feather
                name="edit-2"
                size={14}
                color="#666"
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Birthday</Text>
            <Text style={styles.detailValue}>
              {new Date(petData.birthdate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              ({calculateAge(petData.birthdate)})
            </Text>
          </View>
        </View>

        {/* Owner Contact Section */}
        <View style={styles.detailSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Owner Contact</Text>
            <TouchableOpacity onPress={() => setOwnerContactFormVisible(true)}>
              <Feather name="edit-2" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.ownerContactText}>{displayOwnerContact()}</Text>
        </View>

        {/* Delete Pet Section */}
        <View style={[styles.detailSection, { marginTop: 40 }]}>
          <TouchableOpacity
            style={styles.deletePetButton}
            onPress={handleDeletePet}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather
                  name="trash-2"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.deletePetButtonText}>Delete Pet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderHealthDetailsTab = () => {
    return <VaccinationSection petData={petData} setPetData={setPetData} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "pet" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("pet")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "pet" && styles.activeTabButtonText,
            ]}
          >
            Pet Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "health" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("health")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "health" && styles.activeTabButtonText,
            ]}
          >
            Health Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === "pet" ? renderPetProfileTab() : renderHealthDetailsTab()}

      {/* Modals */}
      {renderEditModal()}
      {renderOwnerContactFormModal()}
    </SafeAreaView>
  );
}
