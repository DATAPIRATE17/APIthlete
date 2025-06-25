import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { apiService } from '@/services/api';
import { User, Mail, Phone, MapPin, Calendar, Heart, Users, Clock, ArrowLeft, CircleCheck as CheckCircle, Upload, FileText } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/components/AuthProvider';

const { width } = Dimensions.get('window');

interface FormData {
  full_name: string;
  email: string;
  phone_number: string;
  age: string;
  date_of_birth: string;
  gender: string;
  emergency_contact: string;
  address: string;
  pincode: string;
  availability: string;
  identity_type: string;
  identity_number: string;
  health_condition: string;
  passport_photo?: any;
  identity_document?: any;
  trainer_name?: string;
}

export default function RegisterScreen() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone_number: phoneNumber || '',
    age: '',
    date_of_birth: '',
    gender: 'male',
    emergency_contact: '',
    address: '',
    pincode: '',
    availability: 'Morning',
    identity_type: 'Aadhar Card',
    identity_number: '',
    health_condition: 'Normal',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [passportPhoto, setPassportPhoto] = useState<any>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const {login}= useAuth();

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.full_name && formData.email && formData.phone_number);
      case 2:
        return !!(formData.age && formData.date_of_birth && formData.gender && formData.emergency_contact);
      case 3:
        return !!(formData.address && formData.pincode && formData.availability);
      case 4:
        return !!(formData.identity_type && formData.identity_number && formData.health_condition);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handlePassportPhotoPicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.7,
        base64: true
      });

      if (!result.canceled && result.assets[0]) {
        const photo = result.assets[0];
        
        setPassportPhoto({
          uri: photo.uri,
          name: `passport_photo_${Date.now()}.jpg`,
          type: 'image/jpeg',
          base64: photo.base64
        });
      }
    } catch (error) {
      console.error('Error picking passport photo:', error);
      Alert.alert('Error', 'Failed to pick passport photo');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (5MB limit)
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

        setSelectedDocument(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRegister = async () => {
    if (!validateStep(4)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      // Append passport photo if selected
      if (passportPhoto) {
        formDataToSend.append('passport_photo', {
          uri: passportPhoto.uri,
          type: passportPhoto.type,
          name: passportPhoto.name,
        } as any);
      }

      // Append identity document if selected
      if (selectedDocument) {
        formDataToSend.append('identity_document', {
          uri: selectedDocument.uri,
          type: selectedDocument.mimeType || 'application/octet-stream',
          name: selectedDocument.name || 'identity_document',
        } as any);
      }

      const response = await apiService.registerUser(formDataToSend);
      
      if (response.token && response.user) {

        await login(response.token, response.user);

        Alert.alert(
          'Registration Successful!',
          `Welcome ${formData.full_name}! Your membership ID is ${response.user?.membershipID}.`,
          [
            {
              text: 'Continue to Dashboard',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      }else{
        throw new Error('Registration Failed-no token received');
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive,
            currentStep > step && styles.stepCircleCompleted
          ]}>
            {currentStep > step ? (
              <CheckCircle size={16} color="white" />
            ) : (
              <Text style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive
              ]}>
                {step}
              </Text>
            )}
          </View>
          {step < 4 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Let's start with your basic details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <View style={styles.inputWrapper}>
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <View style={styles.inputWrapper}>
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <View style={styles.inputWrapper}>
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
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Details</Text>
      <Text style={styles.stepSubtitle}>Tell us more about yourself</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Age *</Text>
        <View style={styles.inputWrapper}>
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date of Birth *</Text>
        <View style={styles.inputWrapper}>
          <Calendar size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textSecondary}
            value={formData.date_of_birth}
            onChangeText={(text) => updateField('date_of_birth', text)}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Gender *</Text>
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Emergency Contact *</Text>
        <View style={styles.inputWrapper}>
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Passport Photo *</Text>
        <Text style={styles.inputSubLabel}>Clear face photo for identification</Text>
        <TouchableOpacity
          style={styles.documentButton}
          onPress={handlePassportPhotoPicker}
        >
          <Upload size={20} color={theme.primary} />
          <Text style={styles.documentButtonText}>
            {passportPhoto ? 'Photo Selected' : 'Choose Photo'}
          </Text>
        </TouchableOpacity>
        {passportPhoto && (
          <View style={styles.selectedFile}>
            <FileText size={16} color={theme.success} />
            <Text style={styles.selectedFileText}>Passport photo selected</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Contact & Preferences</Text>
      <Text style={styles.stepSubtitle}>Your address and gym preferences</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Address *</Text>
        <View style={styles.inputWrapper}>
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Pincode *</Text>
        <View style={styles.inputWrapper}>
          <MapPin size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter pincode"
            placeholderTextColor={theme.textSecondary}
            value={formData.pincode}
            onChangeText={(text) => updateField('pincode', text)}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Trainer Name (Optional)</Text>
        <View style={styles.inputWrapper}>
          <Users size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter preferred trainer name"
            placeholderTextColor={theme.textSecondary}
            value={formData.trainer_name || ''}
            onChangeText={(text) => updateField('trainer_name', text)}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Preferred Time Slot *</Text>
        <View style={styles.timeSlotContainer}>
          {['Morning', 'Evening'].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlotButton,
                formData.availability === time && styles.timeSlotButtonActive,
              ]}
              onPress={() => updateField('availability', time)}
            >
              <Clock size={16} color={formData.availability === time ? 'white' : theme.textSecondary} />
              <Text
                style={[
                  styles.timeSlotButtonText,
                  formData.availability === time && styles.timeSlotButtonTextActive,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Identity & Health</Text>
      <Text style={styles.stepSubtitle}>Final step to complete your registration</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Identity Card Type *</Text>
        <View style={styles.identityTypeContainer}>
          {['Aadhar Card', 'PAN Card', 'Passport', 'Driving License'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.identityTypeButton,
                formData.identity_type === type && styles.identityTypeButtonActive,
              ]}
              onPress={() => updateField('identity_type', type)}
            >
              <Text
                style={[
                  styles.identityTypeButtonText,
                  formData.identity_type === type && styles.identityTypeButtonTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Identity Number *</Text>
        <View style={styles.inputWrapper}>
          <User size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter identity number"
            placeholderTextColor={theme.textSecondary}
            value={formData.identity_number}
            onChangeText={(text) => updateField('identity_number', text)}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Health Condition *</Text>
        <View style={styles.healthContainer}>
          {['Normal', 'Not Normal'].map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.healthButton,
                formData.health_condition === condition && styles.healthButtonActive,
              ]}
              onPress={() => updateField('health_condition', condition)}
            >
              <Heart size={16} color={formData.health_condition === condition ? 'white' : theme.textSecondary} />
              <Text
                style={[
                  styles.healthButtonText,
                  formData.health_condition === condition && styles.healthButtonTextActive,
                ]}
              >
                {condition}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Upload Identity Document *</Text>
        <Text style={styles.inputSubLabel}>Images or PDF files, max 5MB</Text>
        <TouchableOpacity
          style={styles.documentButton}
          onPress={handleDocumentPicker}
        >
          <Upload size={20} color={theme.primary} />
          <Text style={styles.documentButtonText}>
            {selectedDocument ? selectedDocument.name : 'Choose File'}
          </Text>
        </TouchableOpacity>
        {selectedDocument && (
          <View style={styles.selectedFile}>
            <FileText size={16} color={theme.success} />
            <Text style={styles.selectedFileText}>{selectedDocument.name}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      padding: 8,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32,
    },
    stepContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepCircleActive: {
      backgroundColor: theme.primary,
    },
    stepCircleCompleted: {
      backgroundColor: theme.success,
    },
    stepNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.textSecondary,
    },
    stepNumberActive: {
      color: 'white',
    },
    stepLine: {
      width: 40,
      height: 2,
      backgroundColor: theme.border,
      marginHorizontal: 8,
    },
    stepLineActive: {
      backgroundColor: theme.success,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    stepSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    inputSubLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
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
      backgroundColor: theme.surface,
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
    },
    genderButtonTextActive: {
      color: 'white',
    },
    timeSlotContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeSlotButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      marginHorizontal: 4,
    },
    timeSlotButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    timeSlotButtonText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 8,
    },
    timeSlotButtonTextActive: {
      color: 'white',
    },
    identityTypeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    identityTypeButton: {
      width: '48%',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      alignItems: 'center',
      marginBottom: 8,
    },
    identityTypeButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    identityTypeButtonText: {
      fontSize: 14,
      color: theme.text,
      textAlign: 'center',
    },
    identityTypeButtonTextActive: {
      color: 'white',
    },
    healthContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    healthButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      marginHorizontal: 4,
    },
    healthButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    healthButtonText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 8,
    },
    healthButtonTextActive: {
      color: 'white',
    },
    documentButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'dashed',
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    documentButtonText: {
      fontSize: 16,
      color: theme.primary,
      marginLeft: 8,
      fontWeight: '600',
    },
    selectedFile: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      padding: 8,
      backgroundColor: theme.success + '20',
      borderRadius: 8,
    },
    selectedFileText: {
      fontSize: 14,
      color: theme.success,
      marginLeft: 8,
      fontWeight: '600',
    },
    errorContainer: {
      backgroundColor: theme.error + '20',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: theme.error,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 32,
    },
    backButtonStyle: {
      flex: 1,
      backgroundColor: theme.border,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginRight: 8,
    },
    nextButton: {
      flex: 1,
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginLeft: 8,
    },
    registerButton: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    buttonDisabled: {
      backgroundColor: theme.border,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
    backButtonText: {
      color: theme.text,
    },
    termsText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 18,
    },
    loginText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
    loginLink: {
      color: theme.primary,
      fontWeight: '600',
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => currentStep > 1 ? handleBack() : router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderStepIndicator()}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButtonStyle}
              onPress={handleBack}
            >
              <Text style={[styles.buttonText, styles.backButtonText]}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < 4 ? (
            <TouchableOpacity
              style={[styles.nextButton, !validateStep(currentStep) && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={!validateStep(currentStep)}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {currentStep === 4 && (
          <>
            <Text style={styles.termsText}>
              By registering, you agree to our Terms & Privacy Policy.
            </Text>
            
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text 
                style={styles.loginLink}
                onPress={() => router.push('/login')}
              >
                Login through OTP-Phone Number
              </Text>
            </Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
