import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { Menu, Bell, Sun, Moon, LogOut, User, ChevronDown, Activity, Users, CreditCard, TrendingUp, Dumbbell, Calendar, Target, Clock, CircleCheck as CheckCircle, Circle as XCircle, MapPin, Phone, Mail, UserCheck, UserX, Shield, Heart, Chrome as Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface MembershipDetails {
  status: string;
  membershipID: string;
  plan: string;
  paymentStatus: string;
  expiryDate: string;
  joinDate: string;
}

interface PersonalInfo {
  age?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
  emergency_contact?: string;
  health_condition?: string;
}

interface GymInfo {
  name: string;
  logoUrl?: string;
}

export default function DashboardScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, token, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [membershipDetails, setMembershipDetails] = useState<MembershipDetails | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [gymInfo, setGymInfo] = useState<GymInfo | null>(null);
  const [qrExpiryTime, setQrExpiryTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('2:00');
  const router = useRouter();

  const API_BASE_URL = 'https://portal.flexzonegym.com/api';

  useEffect(() => {
    if (token) {
      loadDashboardData();
      fetchGymInfo();
    }
  }, [token]);

  // Countdown timer effect
  useEffect(() => {
    if (!qrExpiryTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = qrExpiryTime - now;
      
      if (diff <= 0) {
        clearInterval(interval);
        setQrCode(null);
        setQrExpiryTime(null);
        setRemainingTime('0:00');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemainingTime(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [qrExpiryTime]);

  const fetchGymInfo = async () => {
    try {
      const [infoResponse, logoResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/gym/gym-info`),
        fetch(`${API_BASE_URL}/gym/logo`)
      ]);

      if (!infoResponse.ok) {
        throw new Error('Failed to fetch gym information');
      }

      const infoData = await infoResponse.json();
      const logoData = logoResponse.ok ? await logoResponse.json() : null;

      setGymInfo({
        name: infoData.name,
        logoUrl: logoData?.logoUrl || null
      });
    } catch (error) {
      console.error('Error fetching gym info:', error);
      // Fallback to default gym info if API fails
      setGymInfo({
        name: 'APIthlete',
        logoUrl: null
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile data
      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        throw new Error(`Profile error: ${profileResponse.status}`);
      }

      const responseData = await profileResponse.json();
      const profileData = responseData.user;
      
      // Set personal info from profile data
      setPersonalInfo({
        age: profileData.age?.toString() || 'N/A',
        gender: profileData.gender || 'N/A',
        phone_number: profileData.phone_number || 'N/A',
        address: profileData.address || 'N/A',
        emergency_contact: profileData.emergency_contact || 'N/A',
        health_condition: profileData.health_condition || 'N/A'
      });

      // Set membership details from profile data
      setMembershipDetails({
        status: profileData.membership_status || user?.membership_status || 'Inactive',
        membershipID: profileData.membershipID || user?.membershipID || 'N/A',
        plan: profileData.membership_plan || 'N/A',
        paymentStatus: profileData.payment_status || 'Pending',
        expiryDate: profileData.renewal_date ? new Date(profileData.renewal_date).toLocaleDateString() : 'N/A',
        joinDate: profileData.payment_date ? new Date(profileData.payment_date).toLocaleDateString() : 'N/A'
      });

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      if (!token || !user?.membershipID) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/attendance/checkin/${user.membershipID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check in');
      }
      
      const responseData = await response.json();
      setIsCheckedIn(true);
      setCheckInTime(new Date());
      Alert.alert('Success', responseData.message || 'Checked in successfully!');
    } catch (error: any) {
      console.error('Check-in error:', error);
      Alert.alert('Error', error.message || 'Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      if (!token || !user?.membershipID) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/attendance/checkout/${user.membershipID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check out');
      }
      
      const responseData = await response.json();
      setIsCheckedIn(false);
      setCheckInTime(null);
      Alert.alert('Success', responseData.message || 'Checked out successfully!');
    } catch (error: any) {
      console.error('Check-out error:', error);
      Alert.alert('Error', error.message || 'Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      if (!token || !user?.membershipID) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      // Check payment status first
      if (membershipDetails?.paymentStatus !== 'completed') {
        Alert.alert('Error', 'Please complete your payment to generate QR code');
        return;
      }

      setQrCodeLoading(true);
      const response = await fetch(`${API_BASE_URL}/payment/admin/generate/${user.membershipID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate QR code');
      }
      
      const responseData = await response.json();
      setQrCode(responseData.qrCode);
      // Set expiry time to current time + 2 minutes (120000 ms)
      setQrExpiryTime(Date.now() + 120000);
      setRemainingTime('2:00');
    } catch (error: any) {
      console.error('QR code generation error:', error);
      Alert.alert('Error', error.message || 'Failed to generate QR code');
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              setShowUserMenu(false);
              await logout();
              // Clear navigation stack and go to login
              router.replace({
                pathname: '/login',
                params: { reset: 'true' }
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  const navigationItems = [
    { name: 'Dashboard', route: '/(tabs)', icon: Activity },
    { name: 'Payment History', route: '/(tabs)/payments', icon: CreditCard },
    { name: 'My Trainer', route: '/(tabs)/trainer', icon: Users },
    { name: 'Membership Plans', route: '/(tabs)/membership', icon: TrendingUp },
    { name: 'Profile Settings', route: '/(tabs)/settings', icon: User },
  ];

  const quickActions = [
    { 
      title: isCheckedIn ? 'Check Out' : 'Check In', 
      icon: isCheckedIn ? UserX : UserCheck, 
      action: isCheckedIn ? handleCheckOut : handleCheckIn,
      color: isCheckedIn ? '#EF4444' : '#22C55E'
    },
    { 
      title: 'Generate QR Code', 
      icon: Shield, 
      action: generateQRCode,
      color: '#3B82F6',
      loading: qrCodeLoading
    },
    { title: 'Payment History', icon: CreditCard, route: '/(tabs)/payments', color: '#F59E0B' },
    { title: 'My Trainer', icon: Users, route: '/(tabs)/trainer', color: '#8B5CF6' },
    { title: 'Profile Settings', icon: User, route: '/(tabs)/settings', color: '#06B6D4' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuButton: {
      padding: 8,
      marginRight: 12,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoIcon: {
      marginRight: 8,
    },
    logoImage: {
      width: 24,
      height: 24,
      marginRight: 8,
      borderRadius: 4,
    },
    logoText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    subtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    notificationButton: {
      padding: 8,
      marginRight: 12,
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.error,
    },
    userButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      rig:20,
    },
    userButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      marginRight: 4,
    },
    content: {
      flex: 1,
      paddingBottom: 100,
    },
    heroSection: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 32,
      position: 'relative',
      overflow: 'hidden',
    },
    heroBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
    },
    welcomeText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 8,
    },
    welcomeSubtext: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
      marginBottom: 20,
    },
    membershipCard: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    membershipRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    membershipLabel: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
    },
    membershipValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
    },
    checkInSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    checkInButton: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 4,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    checkInButtonActive: {
      backgroundColor: '#EF4444',
    },
    checkInButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    checkInTime: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center',
      marginTop: 8,
    },
    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      bottom:5,
    },
    
    sectionTitlee: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      bottom:65,
    },
    membershipDetailsCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      bottom:10,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      flex: 1,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      flex: 2,
      textAlign: 'right',
    },
    statusActive: {
      color: theme.success,
    },
    statusInactive: {
      color: theme.error,
    },
    personalInfoCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      bottom:73,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    infoIcon: {
      marginRight: 12,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    quickActionsSection: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionCard: {
      width: (width - 60) / 2,
      backgroundColor: theme.surface,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionIcon: {
      marginBottom: 12,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
    },
    userMenuContainer: {
      position: 'absolute',
      top: 80,
      right: 20,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 8,
      minWidth: 200,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    navMenuContainer: {
      position: 'absolute',
      top: 80,
      left: 20,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 8,
      minWidth: 200,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 12,
      fontWeight: '500',
    },
    menuItemLogout: {
      color: '#EF4444',
    },
    qrCodeImage: {
      width: 150,
      height: 150,
      alignSelf: 'center',
      marginVertical: 10,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            {gymInfo?.logoUrl ? (
              <Image 
                source={{ uri: gymInfo.logoUrl }}
                style={styles.logoImage}
              />
            ) : (
              <Dumbbell size={24} color={theme.primary} style={styles.logoIcon} />
            )}
            <View>
              <Text style={styles.logoText}>{gymInfo?.name || 'APIthlete'}</Text>
              <Text style={styles.subtitle}>Powered By Webgeon Results</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.userButton}
            onPress={() => setShowUserMenu(true)}
          >
            <Text style={styles.userButtonText}>
              {user?.full_name?.split(' ')[0] || 'User'}
            </Text>
            <ChevronDown size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg' }}
            style={styles.heroBackground}
            resizeMode="cover"
          />
          <Text style={styles.welcomeText}>
            Welcome Back, {user?.full_name?.split(' ')[0] || 'User'}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            Ready to crush your fitness goals today?
          </Text>
          
          <View style={styles.membershipCard}>
            <View style={styles.membershipRow}>
              <Text style={styles.membershipLabel}>Membership ID</Text>
              <Text style={styles.membershipValue}>{user?.membershipID || 'N/A'}</Text>
            </View>
            <View style={styles.membershipRow}>
              <Text style={styles.membershipLabel}>Email</Text>
              <Text style={styles.membershipValue}>{user?.email || 'N/A'}</Text>
            </View>
          </View>

          {/* QR Code Display */}
          {membershipDetails?.paymentStatus === 'completed' ? (
            qrCode ? (
              <View style={styles.membershipCard}>
                <Text style={[styles.membershipLabel, { textAlign: 'center', marginBottom: 8 }]}>
                  Your Membership QR Code
                </Text>
                <Image 
                  source={{ uri: qrCode }}
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
                <Text style={[styles.checkInTime, { textAlign: 'center' }]}>
                  Expires in {remainingTime}
                </Text>
                <TouchableOpacity
                  style={[styles.checkInButton, { marginTop: 12 }]}
                  onPress={generateQRCode}
                  disabled={qrCodeLoading}
                >
                  {qrCodeLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Shield size={20} color="white" />
                      <Text style={styles.checkInButtonText}>Refresh QR Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.checkInButton}
                onPress={generateQRCode}
                disabled={qrCodeLoading}
              >
                {qrCodeLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Shield size={20} color="white" />
                    <Text style={styles.checkInButtonText}>Generate QR Code</Text>
                  </>
                )}
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.membershipCard}>
              <Text style={[styles.membershipLabel, { textAlign: 'center', color: '#EF4444' }]}>
                Complete your payment to generate QR code
              </Text>
            </View>
          )}

          {/* Check In/Out Section */}
          <View style={styles.checkInSection}>
            <TouchableOpacity
              style={[styles.checkInButton, isCheckedIn && styles.checkInButtonActive]}
              onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : isCheckedIn ? (
                <UserX size={20} color="white" />
              ) : (
                <UserCheck size={20} color="white" />
              )}
              <Text style={styles.checkInButtonText}>
                {loading ? 'Processing...' : (isCheckedIn ? 'Check Out' : 'Check In')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {isCheckedIn && checkInTime && (
            <Text style={styles.checkInTime}>
              Checked in at {checkInTime.toLocaleTimeString()}
            </Text>
          )}
        </View>

        {/* Membership Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Details</Text>
          <View style={styles.membershipDetailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[
                styles.detailValue, 
                membershipDetails?.status === 'Active' ? styles.statusActive : styles.statusInactive
              ]}>
                {membershipDetails?.status || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Membership ID</Text>
              <Text style={styles.detailValue}>{membershipDetails?.membershipID || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plan</Text>
              <Text style={styles.detailValue}>{membershipDetails?.plan || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Status</Text>
              <Text style={[
                styles.detailValue,
                membershipDetails?.paymentStatus === 'Completed' ? styles.statusActive : styles.statusInactive
              ]}>
                {membershipDetails?.paymentStatus || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expiry Date</Text>
              <Text style={styles.detailValue}>{membershipDetails?.expiryDate || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitlee}>Personal Information</Text>
          <View style={styles.personalInfoCard}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={theme.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{personalInfo?.age ? `${personalInfo.age}`: 'N/A'} </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <User size={20} color={theme.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{personalInfo?.gender || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Phone size={20} color={theme.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{personalInfo?.phone_number || 'N/A' || user?.phone_number}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MapPin size={20} color={theme.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{personalInfo?.address || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Heart size={20} color={theme.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Health Condition</Text>
                <Text style={styles.infoValue}>{personalInfo?.health_condition || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modal}
          onPress={() => setShowUserMenu(false)}
        >
          <View style={styles.userMenuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <Bell size={20} color={theme.text} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                toggleTheme();
                setShowUserMenu(false);
              }}
            >
              {isDark ? (
                <Sun size={20} color={theme.text} />
              ) : (
                <Moon size={20} color={theme.text} />
              )}
              <Text style={styles.menuItemText}>
                {isDark ? 'Light Theme' : 'Dark Theme'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#EF4444" />
              <Text style={[styles.menuItemText, styles.menuItemLogout]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}













// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Modal,
//   Alert,
//   Image,
//   Dimensions,
//   ActivityIndicator,
// } from 'react-native';
// import { useTheme } from '@/components/ThemeProvider';
// import { useAuth } from '@/components/AuthProvider';
// import { Menu, Bell, Sun, Moon, LogOut, User, ChevronDown, Activity, Users, CreditCard, TrendingUp, Dumbbell, Calendar, Target, Clock, CircleCheck as CheckCircle, Circle as XCircle, MapPin, Phone, Mail, UserCheck, UserX, Shield, Heart, Chrome as Home } from 'lucide-react-native';
// import { useRouter } from 'expo-router';

// const { width } = Dimensions.get('window');

// interface MembershipDetails {
//   status: string;
//   membershipID: string;
//   plan: string;
//   paymentStatus: string;
//   expiryDate: string;
//   joinDate: string;
// }

// interface PersonalInfo {
//   age?: string;
//   gender?: string;
//   phone_number?: string;
//   address?: string;
//   emergency_contact?: string;
//   health_condition?: string;
// }

// interface GymInfo {
//   name: string;
//   logo?: {
//     contentType: string;
//     base64: string;
//   };
// }

// export default function DashboardScreen() {
//   const { theme, toggleTheme, isDark } = useTheme();
//   const { user, token, logout } = useAuth();
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showNavMenu, setShowNavMenu] = useState(false);
//   const [isCheckedIn, setIsCheckedIn] = useState(false);
//   const [membershipDetails, setMembershipDetails] = useState<MembershipDetails | null>(null);
//   const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
//   const [checkInTime, setCheckInTime] = useState<Date | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [qrCode, setQrCode] = useState<string | null>(null);
//   const [qrCodeLoading, setQrCodeLoading] = useState(false);
//   const [gymInfo, setGymInfo] = useState<GymInfo | null>(null);
//   const [qrExpiryTime, setQrExpiryTime] = useState<number | null>(null);
//   const [remainingTime, setRemainingTime] = useState<string>('2:00');
//   const router = useRouter();

//   const API_BASE_URL = 'https://portal.flexzonegym.com/api';

//   useEffect(() => {
//     if (token) {
//       loadDashboardData();
//       fetchGymInfo();
//     }
//   }, [token]);

//   // Countdown timer effect
//   useEffect(() => {
//     if (!qrExpiryTime) return;

//     const interval = setInterval(() => {
//       const now = Date.now();
//       const diff = qrExpiryTime - now;
      
//       if (diff <= 0) {
//         clearInterval(interval);
//         setQrCode(null);
//         setQrExpiryTime(null);
//         setRemainingTime('0:00');
//         return;
//       }

//       const minutes = Math.floor(diff / 60000);
//       const seconds = Math.floor((diff % 60000) / 1000);
//       setRemainingTime(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [qrExpiryTime]);

//   const fetchGymInfo = async () => {
//     try {
//       const [infoResponse, logoResponse] = await Promise.all([
//         fetch(`${API_BASE_URL}/gym/gym-info`),
//         fetch(`${API_BASE_URL}/gym/logo`)
//       ]);

//       if (!infoResponse.ok || !logoResponse.ok) {
//         throw new Error('Failed to fetch gym information');
//       }

//       const infoData = await infoResponse.json();
//       const logoData = await logoResponse.json();

//       setGymInfo({
//         name: infoData.name,
//         logo: logoData.base64 ? logoData : null
//       });
//     } catch (error) {
//       console.error('Error fetching gym info:', error);
//       // Fallback to default gym info if API fails
//       setGymInfo({
//         name: 'APIthlete',
//         logo: null
//       });
//     }
//   };

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch profile data
//       const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!profileResponse.ok) {
//         throw new Error(`Profile error: ${profileResponse.status}`);
//       }

//       const responseData= await profileResponse.json();
//       const profileData = responseData.user;
      
//       // Set personal info from profile data
//       setPersonalInfo({
//         age: profileData.age?.toString() || 'N/A',
//         gender: profileData.gender || 'N/A',
//         phone_number: profileData.phone_number || 'N/A',
//         address: profileData.address || 'N/A',
//         emergency_contact: profileData.emergency_contact || 'N/A',
//         health_condition: profileData.health_condition || 'N/A'
//       });

//       // Set membership details from profile data
//       setMembershipDetails({
//         status: profileData.membership_status ||user?.membership_status || 'Inactive',
//         membershipID: profileData.membershipID || user?.membershipID || 'N/A',
//         plan: profileData.membership_plan || 'N/A',
//         paymentStatus: profileData.payment_status || 'Pending',
//         expiryDate: profileData.renewal_date ? new Date(profileData.renewal_date).toLocaleDateString() : 'N/A',
//         joinDate: profileData.payment_date ? new Date(profileData.payment_date).toLocaleDateString() : 'N/A'
//       });

//     } catch (error: any) {
//       console.error('Error loading dashboard data:', error);
//       Alert.alert('Error', error.message || 'Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCheckIn = async () => {
//     try {
//       if (!token || !user?.membershipID) {
//         Alert.alert('Error', 'Authentication required');
//         return;
//       }

//       setLoading(true);
//       const response = await fetch(`${API_BASE_URL}/attendance/checkin/${user.membershipID}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to check in');
//       }
      
//       const responseData = await response.json();
//       setIsCheckedIn(true);
//       setCheckInTime(new Date());
//       Alert.alert('Success', responseData.message || 'Checked in successfully!');
//     } catch (error: any) {
//       console.error('Check-in error:', error);
//       Alert.alert('Error', error.message || 'Failed to check in. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCheckOut = async () => {
//     try {
//       if (!token || !user?.membershipID) {
//         Alert.alert('Error', 'Authentication required');
//         return;
//       }

//       setLoading(true);
//       const response = await fetch(`${API_BASE_URL}/attendance/checkout/${user.membershipID}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to check out');
//       }
      
//       const responseData = await response.json();
//       setIsCheckedIn(false);
//       setCheckInTime(null);
//       Alert.alert('Success', responseData.message || 'Checked out successfully!');
//     } catch (error: any) {
//       console.error('Check-out error:', error);
//       Alert.alert('Error', error.message || 'Failed to check out. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateQRCode = async () => {
//     try {
//       if (!token || !user?.membershipID) {
//         Alert.alert('Error', 'Authentication required');
//         return;
//       }

//       // Check payment status first
//       if (membershipDetails?.paymentStatus !== 'completed') {
//         Alert.alert('Error', 'Please complete your payment to generate QR code');
//         return;
//       }

//       setQrCodeLoading(true);
//       const response = await fetch(`${API_BASE_URL}/payment/admin/generate/${user.membershipID}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to generate QR code');
//       }
      
//       const responseData = await response.json();
//       setQrCode(responseData.qrCode);
//       // Set expiry time to current time + 2 minutes (120000 ms)
//       setQrExpiryTime(Date.now() + 120000);
//       setRemainingTime('2:00');
//     } catch (error: any) {
//       console.error('QR code generation error:', error);
//       Alert.alert('Error', error.message || 'Failed to generate QR code');
//     } finally {
//       setQrCodeLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Logout', 
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               setShowUserMenu(false);
//               await logout();
//               // Clear navigation stack and go to login
//               router.replace({
//                 pathname: '/login',
//                 params: { reset: 'true' }
//               });
//             } catch (error) {
//               console.error('Logout error:', error);
//               Alert.alert('Error', 'Failed to logout. Please try again.');
//             }
//           }
//         },
//       ]
//     );
//   };

//   const navigationItems = [
//     { name: 'Dashboard', route: '/(tabs)', icon: Activity },
//     { name: 'Payment History', route: '/(tabs)/payments', icon: CreditCard },
//     { name: 'My Trainer', route: '/(tabs)/trainer', icon: Users },
//     { name: 'Membership Plans', route: '/(tabs)/membership', icon: TrendingUp },
//     { name: 'Profile Settings', route: '/(tabs)/settings', icon: User },
//   ];

//   const quickActions = [
//     { 
//       title: isCheckedIn ? 'Check Out' : 'Check In', 
//       icon: isCheckedIn ? UserX : UserCheck, 
//       action: isCheckedIn ? handleCheckOut : handleCheckIn,
//       color: isCheckedIn ? '#EF4444' : '#22C55E'
//     },
//     { 
//       title: 'Generate QR Code', 
//       icon: Shield, 
//       action: generateQRCode,
//       color: '#3B82F6',
//       loading: qrCodeLoading
//     },
//     { title: 'Payment History', icon: CreditCard, route: '/(tabs)/payments', color: '#F59E0B' },
//     { title: 'My Trainer', icon: Users, route: '/(tabs)/trainer', color: '#8B5CF6' },
//     { title: 'Profile Settings', icon: User, route: '/(tabs)/settings', color: '#06B6D4' },
//   ];

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.background,
//     },
//     header: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       paddingHorizontal: 20,
//       paddingTop: 50,
//       paddingBottom: 20,
//       backgroundColor: theme.surface,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.border,
//     },
//     headerLeft: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     menuButton: {
//       padding: 8,
//       marginRight: 12,
//     },
//     logoContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     logoIcon: {
//       marginRight: 8,
//     },
//     logoImage: {
//       width: 24,
//       height: 24,
//       marginRight: 8,
//       borderRadius: 4,
//     },
//     logoText: {
//       fontSize: 18,
//       fontWeight: 'bold',
//       color: theme.text,
//     },
//     subtitle: {
//       fontSize: 12,
//       color: theme.textSecondary,
//       marginTop: 2,
//     },
//     headerRight: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     notificationButton: {
//       padding: 8,
//       marginRight: 12,
//       position: 'relative',
//     },
//     notificationBadge: {
//       position: 'absolute',
//       top: 6,
//       right: 6,
//       width: 8,
//       height: 8,
//       borderRadius: 4,
//       backgroundColor: theme.error,
//     },
//     userButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: theme.primary,
//       paddingHorizontal: 12,
//       paddingVertical: 8,
//       borderRadius: 20,
//       rig:20,
//     },
//     userButtonText: {
//       color: 'white',
//       fontSize: 14,
//       fontWeight: '600',
//       marginRight: 4,
//     },
//     content: {
//       flex: 1,
//       paddingBottom: 100,
//     },
//     heroSection: {
//       backgroundColor: theme.primary,
//       paddingHorizontal: 20,
//       paddingVertical: 32,
//       position: 'relative',
//       overflow: 'hidden',
//     },
//     heroBackground: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       opacity: 0.1,
//     },
//     welcomeText: {
//       fontSize: 28,
//       fontWeight: 'bold',
//       color: 'white',
//       marginBottom: 8,
//     },
//     welcomeSubtext: {
//       fontSize: 16,
//       color: 'rgba(255,255,255,0.9)',
//       marginBottom: 20,
//     },
//     membershipCard: {
//       backgroundColor: 'rgba(255,255,255,0.15)',
//       borderRadius: 16,
//       padding: 16,
//       marginBottom: 16,
//     },
//     membershipRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: 8,
//     },
//     membershipLabel: {
//       fontSize: 14,
//       color: 'rgba(255,255,255,0.8)',
//     },
//     membershipValue: {
//       fontSize: 16,
//       fontWeight: 'bold',
//       color: 'white',
//     },
//     checkInSection: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginTop: 16,
//     },
//     checkInButton: {
//       flex: 1,
//       backgroundColor: 'rgba(255,255,255,0.2)',
//       paddingVertical: 12,
//       borderRadius: 12,
//       alignItems: 'center',
//       marginHorizontal: 4,
//       flexDirection: 'row',
//       justifyContent: 'center',
//     },
//     checkInButtonActive: {
//       backgroundColor: '#EF4444',
//     },
//     checkInButtonText: {
//       color: 'white',
//       fontSize: 14,
//       fontWeight: '600',
//       marginLeft: 8,
//     },
//     checkInTime: {
//       fontSize: 12,
//       color: 'rgba(255,255,255,0.8)',
//       textAlign: 'center',
//       marginTop: 8,
//     },
//     section: {
//       padding: 20,
//     },
//     sectionTitle: {
//       fontSize: 20,
//       fontWeight: 'bold',
//       color: theme.text,
//       marginBottom: 16,
//       bottom:5,
//     },
    
//     sectionTitlee: {
//       fontSize: 20,
//       fontWeight: 'bold',
//       color: theme.text,
//       marginBottom: 16,
//       bottom:65,
//     },
//     membershipDetailsCard: {
//       backgroundColor: theme.surface,
//       borderRadius: 16,
//       padding: 20,
//       marginBottom: 20,
//       borderWidth: 1,
//       borderColor: theme.border,
//       bottom:10,
//     },
//     detailRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: 12,
//     },
//     detailLabel: {
//       fontSize: 14,
//       color: theme.textSecondary,
//       flex: 1,
//     },
//     detailValue: {
//       fontSize: 14,
//       fontWeight: '600',
//       color: theme.text,
//       flex: 2,
//       textAlign: 'right',
//     },
//     statusActive: {
//       color: theme.success,
//     },
//     statusInactive: {
//       color: theme.error,
//     },
//     personalInfoCard: {
//       backgroundColor: theme.surface,
//       borderRadius: 16,
//       padding: 20,
//       marginBottom: 20,
//       borderWidth: 1,
//       borderColor: theme.border,
//       bottom:73,
//     },
//     infoRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 16,
//     },
//     infoIcon: {
//       marginRight: 12,
//     },
//     infoContent: {
//       flex: 1,
//     },
//     infoLabel: {
//       fontSize: 12,
//       color: theme.textSecondary,
//       marginBottom: 4,
//     },
//     infoValue: {
//       fontSize: 14,
//       fontWeight: '600',
//       color: theme.text,
//     },
//     quickActionsSection: {
//       paddingHorizontal: 20,
//       paddingBottom: 20,
//     },
//     actionGrid: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       justifyContent: 'space-between',
//     },
//     actionCard: {
//       width: (width - 60) / 2,
//       backgroundColor: theme.surface,
//       padding: 20,
//       borderRadius: 16,
//       alignItems: 'center',
//       marginBottom: 12,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },
//     actionIcon: {
//       marginBottom: 12,
//     },
//     actionText: {
//       fontSize: 14,
//       fontWeight: '600',
//       color: theme.text,
//       textAlign: 'center',
//     },
//     modal: {
//       flex: 1,
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       justifyContent: 'flex-start',
//     },
//     userMenuContainer: {
//       position: 'absolute',
//       top: 80,
//       right: 20,
//       backgroundColor: theme.surface,
//       borderRadius: 16,
//       padding: 8,
//       minWidth: 200,
//       borderWidth: 1,
//       borderColor: theme.border,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.1,
//       shadowRadius: 12,
//       elevation: 8,
//     },
//     navMenuContainer: {
//       position: 'absolute',
//       top: 80,
//       left: 20,
//       backgroundColor: theme.surface,
//       borderRadius: 16,
//       padding: 8,
//       minWidth: 200,
//       borderWidth: 1,
//       borderColor: theme.border,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.1,
//       shadowRadius: 12,
//       elevation: 8,
//     },
//     menuItem: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingVertical: 12,
//       paddingHorizontal: 16,
//       borderRadius: 12,
//     },
//     menuItemText: {
//       fontSize: 16,
//       color: theme.text,
//       marginLeft: 12,
//       fontWeight: '500',
//     },
//     menuItemLogout: {
//       color: '#EF4444',
//     },
//     qrCodeImage: {
//       width: 150,
//       height: 150,
//       alignSelf: 'center',
//       marginVertical: 10,
//     },
//   });

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <View style={styles.logoContainer}>
//             {gymInfo?.logo?.base64 ? (
//               <Image 
//                 source={{ uri: `data:${gymInfo.logo.contentType};base64,${gymInfo.logo.base64}` }}
//                 style={styles.logoImage}
//               />
//             ) : (
//               <Dumbbell size={24} color={theme.primary} style={styles.logoIcon} />
//             )}
//             <View>
//               <Text style={styles.logoText}>{gymInfo?.name || 'APIthlete'}</Text>
//               <Text style={styles.subtitle}>Powered By Webgeon Results</Text>
//             </View>
//           </View>
//         </View>
        
//         <View style={styles.headerRight}>
//           <TouchableOpacity 
//             style={styles.userButton}
//             onPress={() => setShowUserMenu(true)}
//           >
//             <Text style={styles.userButtonText}>
//               {user?.full_name?.split(' ')[0] || 'User'}
//             </Text>
//             <ChevronDown size={16} color="white" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Content */}
//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Hero Section */}
//         <View style={styles.heroSection}>
//           <Image
//             source={{ uri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg' }}
//             style={styles.heroBackground}
//             resizeMode="cover"
//           />
//           <Text style={styles.welcomeText}>
//             Welcome Back, {user?.full_name?.split(' ')[0] || 'User'}!
//           </Text>
//           <Text style={styles.welcomeSubtext}>
//             Ready to crush your fitness goals today?
//           </Text>
          
//           <View style={styles.membershipCard}>
//             <View style={styles.membershipRow}>
//               <Text style={styles.membershipLabel}>Membership ID</Text>
//               <Text style={styles.membershipValue}>{user?.membershipID || 'N/A'}</Text>
//             </View>
//             <View style={styles.membershipRow}>
//               <Text style={styles.membershipLabel}>Email</Text>
//               <Text style={styles.membershipValue}>{user?.email || 'N/A'}</Text>
//             </View>
//           </View>

//           {/* QR Code Display */}
//           {membershipDetails?.paymentStatus === 'completed' ? (
//             qrCode ? (
//               <View style={styles.membershipCard}>
//                 <Text style={[styles.membershipLabel, { textAlign: 'center', marginBottom: 8 }]}>
//                   Your Membership QR Code
//                 </Text>
//                 <Image 
//                   source={{ uri: qrCode }}
//                   style={styles.qrCodeImage}
//                   resizeMode="contain"
//                 />
//                 <Text style={[styles.checkInTime, { textAlign: 'center' }]}>
//                   Expires in {remainingTime}
//                 </Text>
//                 <TouchableOpacity
//                   style={[styles.checkInButton, { marginTop: 12 }]}
//                   onPress={generateQRCode}
//                   disabled={qrCodeLoading}
//                 >
//                   {qrCodeLoading ? (
//                     <ActivityIndicator color="white" size="small" />
//                   ) : (
//                     <>
//                       <Shield size={20} color="white" />
//                       <Text style={styles.checkInButtonText}>Refresh QR Code</Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <TouchableOpacity
//                 style={styles.checkInButton}
//                 onPress={generateQRCode}
//                 disabled={qrCodeLoading}
//               >
//                 {qrCodeLoading ? (
//                   <ActivityIndicator color="white" size="small" />
//                 ) : (
//                   <>
//                     <Shield size={20} color="white" />
//                     <Text style={styles.checkInButtonText}>Generate QR Code</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             )
//           ) : (
//             <View style={styles.membershipCard}>
//               <Text style={[styles.membershipLabel, { textAlign: 'center', color: '#EF4444' }]}>
//                 Complete your payment to generate QR code
//               </Text>
//             </View>
//           )}

//           {/* Check In/Out Section */}
//           <View style={styles.checkInSection}>
//             <TouchableOpacity
//               style={[styles.checkInButton, isCheckedIn && styles.checkInButtonActive]}
//               onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="white" size="small" />
//               ) : isCheckedIn ? (
//                 <UserX size={20} color="white" />
//               ) : (
//                 <UserCheck size={20} color="white" />
//               )}
//               <Text style={styles.checkInButtonText}>
//                 {loading ? 'Processing...' : (isCheckedIn ? 'Check Out' : 'Check In')}
//               </Text>
//             </TouchableOpacity>
//           </View>
          
//           {isCheckedIn && checkInTime && (
//             <Text style={styles.checkInTime}>
//               Checked in at {checkInTime.toLocaleTimeString()}
//             </Text>
//           )}
//         </View>

//         {/* Membership Details */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Membership Details</Text>
//           <View style={styles.membershipDetailsCard}>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Status</Text>
//               <Text style={[
//                 styles.detailValue, 
//                 membershipDetails?.status === 'Active' ? styles.statusActive : styles.statusInactive
//               ]}>
//                 {membershipDetails?.status || 'N/A'}
//               </Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Membership ID</Text>
//               <Text style={styles.detailValue}>{membershipDetails?.membershipID || 'N/A'}</Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Plan</Text>
//               <Text style={styles.detailValue}>{membershipDetails?.plan || 'N/A'}</Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Payment Status</Text>
//               <Text style={[
//                 styles.detailValue,
//                 membershipDetails?.paymentStatus === 'Completed' ? styles.statusActive : styles.statusInactive
//               ]}>
//                 {membershipDetails?.paymentStatus || 'N/A'}
//               </Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Expiry Date</Text>
//               <Text style={styles.detailValue}>{membershipDetails?.expiryDate || 'N/A'}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Personal Information */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitlee}>Personal Information</Text>
//           <View style={styles.personalInfoCard}>
//             <View style={styles.infoRow}>
//               <Calendar size={20} color={theme.primary} style={styles.infoIcon} />
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Age</Text>
//                 <Text style={styles.infoValue}>{personalInfo?.age ? `${personalInfo.age}`: 'N/A'} </Text>
//               </View>
//             </View>
            
//             <View style={styles.infoRow}>
//               <User size={20} color={theme.primary} style={styles.infoIcon} />
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Gender</Text>
//                 <Text style={styles.infoValue}>{personalInfo?.gender || 'N/A'}</Text>
//               </View>
//             </View>
            
//             <View style={styles.infoRow}>
//               <Phone size={20} color={theme.primary} style={styles.infoIcon} />
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Phone Number</Text>
//                 <Text style={styles.infoValue}>{personalInfo?.phone_number || 'N/A' || user?.phone_number}</Text>
//               </View>
//             </View>
            
//             <View style={styles.infoRow}>
//               <MapPin size={20} color={theme.primary} style={styles.infoIcon} />
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Address</Text>
//                 <Text style={styles.infoValue}>{personalInfo?.address || 'N/A'}</Text>
//               </View>
//             </View>
            
//             <View style={styles.infoRow}>
//               <Heart size={20} color={theme.primary} style={styles.infoIcon} />
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Health Condition</Text>
//                 <Text style={styles.infoValue}>{personalInfo?.health_condition || 'N/A'}</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </ScrollView>

//       {/* User Menu Modal */}
//       <Modal
//         visible={showUserMenu}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowUserMenu(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modal}
//           onPress={() => setShowUserMenu(false)}
//         >
//           <View style={styles.userMenuContainer}>
//             <TouchableOpacity style={styles.menuItem}>
//               <Bell size={20} color={theme.text} />
//               <Text style={styles.menuItemText}>Notifications</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.menuItem}
//               onPress={() => {
//                 toggleTheme();
//                 setShowUserMenu(false);
//               }}
//             >
//               {isDark ? (
//                 <Sun size={20} color={theme.text} />
//               ) : (
//                 <Moon size={20} color={theme.text} />
//               )}
//               <Text style={styles.menuItemText}>
//                 {isDark ? 'Light Theme' : 'Dark Theme'}
//               </Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.menuItem}
//               onPress={handleLogout}
//             >
//               <LogOut size={20} color="#EF4444" />
//               <Text style={[styles.menuItemText, styles.menuItemLogout]}>Logout</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// }













