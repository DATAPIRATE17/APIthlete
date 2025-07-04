import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Hash, CircleCheck as CheckCircle, Plus, ArrowRight } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StorageService } from '@/utils/storage';

const { width, height } = Dimensions.get('window');

interface GymSession {
  id: string;
  name: string;
  code: string;
  logo?: string;
  timestamp: number;
}

interface GymInfo {
  id: string;
  name: string;
  logo?: string;
  address?: string;
}

export default function GymAccessScreen() {
  const [currentScreen, setCurrentScreen] = useState<'entry' | 'qr' | 'manual' | 'welcome'>('entry');
  const [gymCode, setGymCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentGym, setCurrentGym] = useState<GymSession | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  const saveGymSession = async (gym: GymSession) => {
    try {
      const existingGyms = await StorageService.getObject<GymSession[]>('@saved_gyms') || [];
      const updatedGyms = [gym, ...existingGyms.filter(g => g.id !== gym.id)];
      await StorageService.setObject('@saved_gyms', updatedGyms);
    } catch (error) {
      console.error('Error saving gym session:', error);
    }
  };

  // Backend-ready gym code validation
  const validateGymCode = async (code: string): Promise<boolean> => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/gym/validate-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code })
      // });
      // const data = await response.json();
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any 6-digit code
      if (code.length === 6 && /^\d+$/.test(code)) {
        // TODO: Use actual gym data from backend response
        const gymInfo: GymInfo = await fetchGymInfo(code);
        
        const gymSession: GymSession = {
          id: code,
          name: gymInfo.name,
          code: code,
          logo: gymInfo.logo,
          timestamp: Date.now()
        };
        
        setCurrentGym(gymSession);
        await saveGymSession(gymSession);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error validating gym code:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Backend-ready gym info fetching
  const fetchGymInfo = async (code: string): Promise<GymInfo> => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`/api/gym/info/${code}`);
      // const data = await response.json();
      // return data.gym;
      
      // Mock data for now - this will be replaced with backend data
      return {
        id: code,
        name: `APIthlete Gym ${code.slice(0, 3)}`,
        logo: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
        address: 'Fitness Street, Gym City'
      };
    } catch (error) {
      console.error('Error fetching gym info:', error);
      throw error;
    }
  };

  const handleQRCodeScanned = async (data: string) => {
    try {
      // TODO: Backend integration for QR code validation
      // const response = await fetch('/api/gym/validate-qr', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ qrData: data })
      // });
      // const result = await response.json();
      
      // Extract gym code from QR data
      const codeMatch = data.match(/\d{6}/);
      if (codeMatch) {
        const code = codeMatch[0];
        const isValid = await validateGymCode(code);
        if (isValid) {
          setCurrentScreen('welcome');
        } else {
          Alert.alert('Invalid Code', 'The scanned QR code is not valid');
        }
      } else {
        Alert.alert('Invalid QR Code', 'Please scan a valid gym QR code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process QR code');
    }
  };

  const handleManualCodeSubmit = async () => {
    if (gymCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit code');
      return;
    }

    const isValid = await validateGymCode(gymCode);
    if (isValid) {
      setCurrentScreen('welcome');
    } else {
      Alert.alert('Invalid Code', 'The entered code is not valid');
    }
  };

  const handleContinueWithGym = () => {
    // Store gym session data for login screen
    router.push({
      pathname: '/login',
      params: { 
        gymId: currentGym?.id,
        gymName: currentGym?.name 
      }
    });
  };

  const handleJoinAnotherGym = () => {
    setCurrentScreen('entry');
    setGymCode('');
    setCurrentGym(null);
  };

  const renderNumberPad = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'];
    
    return (
      <View style={styles.numberPad}>
        {numbers.map((num, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.numberButton, num === '' && styles.numberButtonEmpty]}
            onPress={() => {
              if (num === '⌫') {
                setGymCode(prev => prev.slice(0, -1));
              } else if (num !== '' && gymCode.length < 6) {
                setGymCode(prev => prev + num.toString());
              }
            }}
            disabled={num === ''}
          >
            <Text style={styles.numberButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCodeDots = () => {
    return (
      <View style={styles.codeDotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.codeDot,
              index < gymCode.length && styles.codeDotFilled
            ]}
          />
        ))}
      </View>
    );
  };

  const renderEntryScreen = () => (
    <LinearGradient
      colors={['#065f46', '#10b981', '#047857']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require('@/assets/images/api.jpg')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.subtitle}>Enter your gym code to get started</Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                if (permission?.granted) {
                  setCurrentScreen('qr');
                } else {
                  requestPermission();
                }
              }}
            >
              <QrCode size={24} color="white" />
              <Text style={styles.primaryButtonText}>Scan QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentScreen('manual')}
            >
              <Hash size={24} color="#10b981" />
              <Text style={styles.secondaryButtonText}>Enter Code Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQRScreen = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#065f46', '#10b981', '#047857']}
        style={styles.qrHeader}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('entry')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.qrHeaderContent}>
          <Text style={styles.qrTitle}>Position QR Code</Text>
          <Text style={styles.qrSubtitle}>Align the QR code within the frame</Text>
        </View>
      </LinearGradient>

      <View style={styles.cameraContainer}>
        {permission?.granted ? (
          <CameraView
            style={styles.camera}
            onBarcodeScanned={({ data }) => handleQRCodeScanned(data)}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>Looking for QR code...</Text>
            </View>
          </CameraView>
        ) : (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Camera permission required</Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderManualScreen = () => (
    <LinearGradient
      colors={['#065f46', '#10b981', '#047857']}
      style={styles.container}
    >
      <View style={styles.manualHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('entry')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.manualHeaderContent}>
          <Text style={styles.manualTitle}>Gym Access Code</Text>
          <Text style={styles.manualSubtitle}>Enter the 6-digit code provided by your gym</Text>
        </View>
      </View>

      <View style={styles.manualContent}>
        {renderCodeDots()}
        {renderNumberPad()}
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            gymCode.length !== 6 && styles.continueButtonDisabled
          ]}
          onPress={handleManualCodeSubmit}
          disabled={gymCode.length !== 6 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#10b981" />
          ) : (
            <Text style={[
              styles.continueButtonText,
              gymCode.length !== 6 && styles.continueButtonTextDisabled
            ]}>
              Continue
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderWelcomeScreen = () => (
    <LinearGradient
      colors={['#065f46', '#10b981', '#047857']}
      style={styles.container}
    >
      <View style={styles.welcomeContent}>
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeIconContainer}>
            <CheckCircle size={64} color="#10B981" />
          </View>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeSubtitle}>You're connected to your gym</Text>
        </View>

        <View style={styles.gymInfoCard}>
          <View style={styles.gymInfoHeader}>
            {currentGym?.logo ? (
              <Image
                source={{ uri: currentGym.logo }}
                style={styles.gymLogo}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('@/assets/images/api.jpg')}
                style={styles.gymLogo}
                resizeMode="cover"
              />
            )}
            <View style={styles.gymInfoText}>
              <Text style={styles.gymName}>{currentGym?.name}</Text>
              <View style={styles.activeIndicator}>
                <View style={styles.activeIndicatorDot} />
                <Text style={styles.activeIndicatorText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.welcomeActions}>
          <TouchableOpacity
            style={styles.continueWithGymButton}
            onPress={handleContinueWithGym}
          >
            <Text style={styles.continueWithGymText}>
              Continue with {currentGym?.name}
            </Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.joinAnotherButton}
            onPress={handleJoinAnotherGym}
          >
            <Plus size={20} color="#10b981" />
            <Text style={styles.joinAnotherText}>Join Another Gym</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 60,
    },
    logoCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
      overflow: 'hidden',
    },
    logoImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    subtitle: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      lineHeight: 24,
      fontWeight: '600',
    },
    cardContainer: {
      width: '100%',
      maxWidth: 350,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 24,
      padding: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    primaryButton: {
      backgroundColor: '#10b981',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    secondaryButton: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    secondaryButtonText: {
      color: '#10b981',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    qrHeader: {
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    qrHeaderContent: {
      alignItems: 'center',
      marginTop: 20,
    },
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    backButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    qrTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 8,
    },
    qrSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    cameraContainer: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    scannerOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    scannerFrame: {
      width: 250,
      height: 250,
      borderWidth: 3,
      borderColor: 'white',
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    scannerText: {
      color: 'white',
      fontSize: 16,
      marginTop: 20,
      textAlign: 'center',
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    permissionText: {
      fontSize: 18,
      color: '#333',
      textAlign: 'center',
      marginBottom: 20,
    },
    permissionButton: {
      backgroundColor: '#10b981',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    permissionButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    manualHeader: {
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    manualHeaderContent: {
      alignItems: 'center',
      marginTop: 20,
    },
    manualTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 8,
    },
    manualSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
    },
    manualContent: {
      flex: 1,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    codeDotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    codeDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      marginHorizontal: 6,
    },
    codeDotFilled: {
      backgroundColor: 'white',
    },
    numberPad: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      maxWidth: 240,
      marginBottom: 20,
    },
    numberButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 6,
    },
    numberButtonEmpty: {
      backgroundColor: 'transparent',
    },
    numberButtonText: {
      fontSize: 20,
      fontWeight: '600',
      color: 'white',
    },
    continueButton: {
      backgroundColor: 'white',
      paddingVertical: 16,
      paddingHorizontal: 50,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      bottom:70,
    },
    continueButtonDisabled: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    continueButtonText: {
      color: '#10b981',
      fontSize: 16,
      fontWeight: '700',
      
    },
    continueButtonTextDisabled: {
      color: 'rgba(16, 185, 129, 0.5)',
    },
    welcomeContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    welcomeHeader: {
      alignItems: 'center',
      marginBottom: 40,
    },
    welcomeIconContainer: {
      marginBottom: 20,
    },
    welcomeTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 8,
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
    },
    gymInfoCard: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 24,
      marginBottom: 40,
      width: '100%',
      maxWidth: 350,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
    gymInfoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    gymLogo: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
    },
    gymInfoText: {
      flex: 1,
    },
    gymName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4,
    },
    activeIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    activeIndicatorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10B981',
      marginRight: 6,
    },
    activeIndicatorText: {
      fontSize: 14,
      color: '#10B981',
      fontWeight: '600',
    },
    welcomeActions: {
      width: '100%',
      maxWidth: 350,
    },
    continueWithGymButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    continueWithGymText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
    },
    joinAnotherButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 16,
      marginBottom: 16,
    },
    joinAnotherText: {
      color: '#10b981',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  switch (currentScreen) {
    case 'entry':
      return renderEntryScreen();
    case 'qr':
      return renderQRScreen();
    case 'manual':
      return renderManualScreen();
    case 'welcome':
      return renderWelcomeScreen();
    default:
      return renderEntryScreen();
  }
}
