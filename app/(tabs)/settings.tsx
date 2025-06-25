import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { Save, User, Mail, Phone, MapPin, Calendar, Heart, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://api.apithlete.webgeon.com';

export default function ProfileSettingsScreen() {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    emergency_contact: '',
    age: '',
    gender: '',
    pincode: '',
    health_condition: '',
    address: '',
  });

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    try {
      if (!user?._id || !token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.user) {
        const userData = data.user;
        
        setFormData({
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          emergency_contact: userData.emergency_contact || '',
          age: userData.age ? String(userData.age) : '',
          gender: userData.gender || '',
          pincode: userData.pincode || '',
          health_condition: userData.health_condition || 'Normal',
          address: userData.address || '',
        });
        
        if (userData.passport_photo) {
          setProfileImage(userData.passport_photo);
        } else if (userData.passport_photo_url) {
          const photoUrl = userData.passport_photo_url.startsWith('http') 
            ? userData.passport_photo_url 
            : `${API_BASE_URL}${userData.passport_photo_url}`;
          setProfileImage(photoUrl);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      if (Platform.OS !== 'web') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Permission to access camera roll is required!');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
          await uploadProfilePicture(result.assets[0]);
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            if (file.size > 500 * 1024) {
              Alert.alert('Error', 'Image size should be less than 500KB');
              return;
            }
            
            const reader = new FileReader();
            reader.onload = async (event) => {
              const imageUri = event.target?.result as string;
              setProfileImage(imageUri);
              await uploadProfilePicture(file);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfilePicture = async (imageAsset) => {
    if (!token || !user?._id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setUploadingPhoto(true);
    try {
      let base64Image = '';
      let mimeType = 'image/jpeg';
      
      if (Platform.OS === 'web') {
        const file = imageAsset;
        if (file.size > 500 * 1024) {
          throw new Error('Image size should be less than 500KB');
        }
        
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data URL prefix
          };
          reader.readAsDataURL(file);
        });
        mimeType = file.type || 'image/jpeg';
      } else {
        const fileUri = imageAsset.uri;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (fileInfo.size && fileInfo.size > 500 * 1024) {
          throw new Error('Image size should be less than 500KB');
        }
        
        base64Image = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        mimeType = imageAsset.type || 'image/jpeg';
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/edit/${user.membershipID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passport_photo: base64Image,
          photo_mime_type: mimeType,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to upload profile picture');
      }

      setProfileImage(`data:${mimeType};base64,${base64Image}`);
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.full_name || !formData.email || !formData.phone_number) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!token || !user?.membershipID) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        emergency_contact: formData.emergency_contact,
        age: formData.age ? parseInt(formData.age) : 0,
        gender: formData.gender,
        pincode: formData.pincode,
        health_condition: formData.health_condition || 'Normal',
        address: formData.address
      };

      if (profileImage && profileImage.startsWith('data:')) {
        payload.passport_photo = profileImage.split(',')[1];
        payload.photo_mime_type = profileImage.split(';')[0].split(':')[1];
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/edit/${user.membershipID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update profile');
      }
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg' }}
          style={styles.headerBackground}
          resizeMode="cover"
        />
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your personal information</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleImagePicker}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Camera size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{formData.full_name || 'User Name'}</Text>
          <Text style={styles.profileId}>ID: {user?.membershipID || 'N/A'}</Text>
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={handleImagePicker}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Camera size={16} color={theme.primary} />
            )}
            <Text style={styles.changePhotoText}>
              {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <User size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textSecondary}
                value={formData.full_name}
                onChangeText={(text) => updateField('full_name', text)}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Email Address <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.textSecondary}
                value={formData.phone_number}
                onChangeText={(text) => updateField('phone_number', text)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Emergency Contact</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Emergency contact number"
                placeholderTextColor={theme.textSecondary}
                value={formData.emergency_contact}
                onChangeText={(text) => updateField('emergency_contact', text)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Age</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                placeholderTextColor={theme.textSecondary}
                value={formData.age}
                onChangeText={(text) => updateField('age', text)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    formData.gender === gender && styles.genderButtonActive,
                  ]}
                  onPress={() => updateField('gender', gender)}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === gender && styles.genderButtonTextActive,
                    ]}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Enter your address"
                placeholderTextColor={theme.textSecondary}
                value={formData.address}
                onChangeText={(text) => updateField('address', text)}
                multiline
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pincode</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter pincode"
                placeholderTextColor={theme.textSecondary}
                value={formData.pincode}
                onChangeText={(text) => updateField('pincode', text)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Health Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Health Condition</Text>
            <View style={styles.inputContainer}>
              <Heart size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Any health conditions or allergies"
                placeholderTextColor={theme.textSecondary}
                value={formData.health_condition}
                onChangeText={(text) => updateField('health_condition', text)}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={loading}
        >
          {loading && (
            <ActivityIndicator size="small" color="white" style={styles.loadingIndicator} />
          )}
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#22C55E',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#22C55E',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#1E293B',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  formSection: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  requiredLabel: {
    color: '#dc3545',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderButtonActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    bottom:30,
  },
  saveButtonDisabled: {
    backgroundColor: '#e9ecef',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  loadingIndicator: {
    marginRight: 8,
  },
});
