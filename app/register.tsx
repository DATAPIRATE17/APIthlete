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
import { User, Mail, Phone, MapPin, Calendar, Heart, Users, Clock, ArrowLeft, CircleCheck as CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FormData {
  full_name: string;
  email: string;
  phone_number: string;
  age: string;
  gender: string;
  health_condition: string;
  address: string;
  pincode: string;
  emergency_contact: string;
  trainer_name: string;
  availability: string;
  identity_type: string;
  identity_number: string;
  date_of_birth: string;
}

export default function RegisterScreen() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone_number: phoneNumber || '',
    age: '',
    gender: '',
    health_condition: '',
    address: '',
    pincode: '',
    emergency_contact: '',
    trainer_name: '',
    availability: '',
    identity_type: '',
    identity_number: '',
    date_of_birth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { theme } = useTheme();

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.full_name && formData.email && formData.phone_number);
      case 2:
        return !!(formData.age && formData.gender && formData.address && formData.pincode);
      case 3:
        return !!(formData.emergency_contact && formData.health_condition && formData.availability);
      case 4:
        return !!(formData.identity_type && formData.identity_number);
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

  const handleRegister = async () => {
    if (!validateStep(4)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      const response = await apiService.registerUser(formDataToSend);
      
      if (response.token) {
        Alert.alert(
          'Registration Successful!',
          `Welcome ${formData.full_name}! Your membership ID is ${response.user?.membershipID}`,
          [
            {
              text: 'Continue to Login',
              onPress: () => router.replace('/login')
            }
          ]
        );
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
            editable={false}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Additional Details</Text>
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
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Health & Training</Text>
      <Text style={styles.stepSubtitle}>Help us customize your experience</Text>

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
        <Text style={styles.inputLabel}>Health Condition *</Text>
        <View style={styles.inputWrapper}>
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Preferred Training Time *</Text>
        <View style={styles.availabilityContainer}>
          {['Morning', 'Evening'].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.availabilityButton,
                formData.availability === time && styles.availabilityButtonActive,
              ]}
              onPress={() => updateField('availability', time)}
            >
              <Clock size={16} color={formData.availability === time ? 'white' : theme.textSecondary} />
              <Text
                style={[
                  styles.availabilityButtonText,
                  formData.availability === time && styles.availabilityButtonTextActive,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Preferred Trainer (Optional)</Text>
        <View style={styles.inputWrapper}>
          <Users size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter trainer name (optional)"
            placeholderTextColor={theme.textSecondary}
            value={formData.trainer_name}
            onChangeText={(text) => updateField('trainer_name', text)}
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Identity Verification</Text>
      <Text style={styles.stepSubtitle}>Final step to complete your registration</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Identity Type *</Text>
        <View style={styles.identityTypeContainer}>
          {['Aadhar Card', 'PAN Card', 'Driving License', 'Passport'].map((type) => (
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
        <Text style={styles.inputLabel}>Date of Birth (Optional)</Text>
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
    availabilityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    availabilityButton: {
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
    availabilityButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    availabilityButtonText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 8,
    },
    availabilityButtonTextActive: {
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}