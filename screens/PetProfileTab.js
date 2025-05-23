import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function PetProfileTab({ petData, onEdit, isUpdating }) {
  // Calculate pet age
  const calculateAge = (birthdate) => {
    if (!birthdate) return 'Unknown';
    const today = new Date();
    const birth = new Date(birthdate);
    const ageInYears = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
    
    return `${ageInYears} ${ageInYears === 1 ? 'yr' : 'yrs'}`;
  };

  const EditableField = ({ label, value, field, onEdit, style = {} }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8f9fa',
        marginVertical: 4,
        borderRadius: 8,
        ...style
      }}
      onPress={() => onEdit(field)}
      disabled={isUpdating}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>{label}</Text>
        <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
          {value || 'Not specified'}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={{ padding: 16 }}>
      {/* Pet Image Section */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{ 
          width: 120, 
          height: 120, 
          borderRadius: 60, 
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {petData.imageUrl ? (
            <Image 
              source={{ uri: petData.imageUrl }} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Feather name="image" size={48} color="#ccc" />
          )}
        </View>
        
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 0,
            right: '50%',
            marginRight: -40,
            backgroundColor: '#0a3d62',
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: '#fff'
          }}
          onPress={() => onEdit('image')}
        >
          <Feather name="camera" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Pet Name and Breed */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
          {petData.name}
        </Text>
        <Text style={{ fontSize: 16, color: '#666' }}>
          {petData.breed}
        </Text>
      </View>

      {/* Basic Information */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>
          Basic Information
        </Text>
        
        <EditableField
          label="Name"
          value={petData.name}
          field="name"
          onEdit={onEdit}
        />
        
        <EditableField
          label="Breed"
          value={petData.breed}
          field="breed"
          onEdit={onEdit}
        />
        
        <EditableField
          label="Gender"
          value={petData.gender}
          field="gender"
          onEdit={onEdit}
        />
        
        <EditableField
          label="Size"
          value={petData.size}
          field="size"
          onEdit={onEdit}
        />
        
        <EditableField
          label="Weight"
          value={petData.weight ? `${petData.weight} kg` : null}
          field="weight"
          onEdit={onEdit}
        />
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: '#f8f9fa',
          marginVertical: 4,
          borderRadius: 8
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Birthday</Text>
            <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
              {petData.birthdate ? 
                new Date(petData.birthdate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) + ` (${calculateAge(petData.birthdate)})` 
                : 'Not specified'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Appearance */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>
          Appearance
        </Text>
        
        <TouchableOpacity
          style={{
            padding: 16,
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
          onPress={() => onEdit('appearance')}
          disabled={isUpdating}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, color: '#333', lineHeight: 24 }}>
              {petData.appearance || 'Add appearance description...'}
            </Text>
          </View>
          <Feather 
            name="edit-2" 
            size={20} 
            color="#666" 
            style={{ marginLeft: 12, marginTop: 2 }} 
          />
        </TouchableOpacity>
      </View>

      {/* Identification */}
      {(petData.serialNumber || petData.imei) && (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>
            Identification
          </Text>
          
          {petData.serialNumber && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: '#f8f9fa',
              marginVertical: 4,
              borderRadius: 8
            }}>
              <Feather name="tag" size={20} color="#666" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Serial Number</Text>
                <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                  {petData.serialNumber}
                </Text>
              </View>
            </View>
          )}
          
          {petData.imei && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: '#f8f9fa',
              marginVertical: 4,
              borderRadius: 8
            }}>
              <Feather name="smartphone" size={20} color="#666" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>IMEI</Text>
                <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                  {petData.imei}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}