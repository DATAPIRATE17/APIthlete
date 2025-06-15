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
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { Phone, ArrowRight, Dumbbell, Shield } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://api.apithlete.webgeon.com/api';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();
  const { theme } = useTheme();

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/otp/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber // Removed country code prefix
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'OTP sent successfully') {
        setSessionId(data.sessionId);
        setShowOTPInput(true);
        setOtpSent(true);
        setError('');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!sessionId) {
      setError('Session expired. Please resend OTP.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          otp
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        if (data.user) {
          router.replace('/(tabs)');
        } else {
          router.push({
            pathname: '/register',
            params: { phoneNumber }
          });
        }
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setError('');
    setOtpSent(false);
    setSessionId('');
    await handleSendOTP();
  };

  const renderOTPInputs = () => {
    const otpInputs = [];
    for (let i = 0; i < 6; i++) {
      otpInputs.push(
        <TextInput
          key={i}
          style={[
            styles.otpInput,
            otp.length > i && styles.otpInputFocused,
          ]}
          value={otp[i] || ''}
          onChangeText={(text) => {
            if (text.length <= 1) {
              const newOtp = otp.split('');
              newOtp[i] = text;
              setOtp(newOtp.join(''));
            }
          }}
          keyboardType="numeric"
          maxLength={1}
          autoFocus={i === 0}
        />
      );
    }
    return otpInputs;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Dumbbell size={48} color="white" />
          </View>
          <Text style={styles.logoText}>Apiathelete</Text>
          <Text style={styles.subtitle}>Fitness Management System</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.stepIndicator}>
            <View style={[styles.step, styles.stepActive]}>
              <Text style={[styles.stepText, styles.stepTextActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, showOTPInput && styles.stepLineActive]} />
            <View style={[styles.step, showOTPInput && styles.stepActive]}>
              <Text style={[styles.stepText, showOTPInput && styles.stepTextActive]}>2</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {otpSent && !error ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>OTP sent successfully to {phoneNumber}</Text>
            </View>
          ) : null}

          {!showOTPInput ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={[styles.inputWrapper, phoneNumber && styles.inputWrapperFocused]}>
                  <Phone size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#666"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Text>
                <ArrowRight size={20} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter OTP</Text>
                <Text style={[styles.inputLabel, { fontSize: 12, color: '#666', marginBottom: 12 }]}>
                  We've sent a 6-digit code to {phoneNumber}
                </Text>
                <View style={styles.otpContainer}>
                  {renderOTPInputs()}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Text>
                <ArrowRight size={20} color="white" />
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.securityNote}>
            <Shield size={16} color="#4a90e2" />
            <Text style={styles.securityText}>
              Your phone number is secure and will only be used for authentication
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    opacity: 0.1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    backgroundColor: '#4a90e2',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  stepActive: {
    backgroundColor: '#4a90e2',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  stepTextActive: {
    color: 'white',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#ddd',
  },
  stepLineActive: {
    backgroundColor: '#4a90e2',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  inputWrapperFocused: {
    borderColor: '#4a90e2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  otpInputFocused: {
    borderColor: '#4a90e2',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#34c759',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#ddd',
    shadowOpacity: 0,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  securityText: {
    color: '#4a90e2',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});