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
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { apiService } from '@/services/api';
import { Save, User, Mail, Phone, MapPin, Calendar, Heart, Camera } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    age: '',
    gender: '',
    health_condition: '',
    phone_number: '',
    emergency_contact: '',
    address: '',
    pincode: '',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      if (user) {
        setFormData({
          full_name: user.full_name || '',
          email: user.email || '',
          age: '',
          gender: '',
          health_condition: '',
          phone_number: '',
          emergency_contact: '',
          address: '',
          pincode: '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.full_name || !formData.email || !formData.phone_number) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (user?.membershipID) {
        await apiService.updateProfile(user.membershipID, formData);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error: any) {
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
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
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    profileImageText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: 'white',
    },
    profileName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    profileId: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    changePhotoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary + '20',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    changePhotoText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    formSection: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
    genderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    genderButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    genderButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    genderButtonText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
    genderButtonTextActive: {
      color: 'white',
    },
    saveButton: {
      backgroundColor: theme.primary,
      paddingVertical: 18,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonDisabled: {
      backgroundColor: theme.border,
      shadowOpacity: 0,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 8,
      letterSpacing: 0.5,
    },
  });

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
          <View style={styles.profileImage}>
            <Text style={styles.profileImageText}>
              {user?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.full_name || 'User Name'}</Text>
          <Text style={styles.profileId}>ID: {user?.membershipID || 'N/A'}</Text>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Camera size={16} color={theme.primary} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
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
            <Text style={styles.label}>Email Address *</Text>
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
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
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
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
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
                multiline
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
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}