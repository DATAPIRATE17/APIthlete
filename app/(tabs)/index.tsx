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
  const [barcode, setBarcode] = useState<string | null>(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const router = useRouter();

  const API_BASE_URL = 'https://api.apithlete.webgeon.com/api';

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

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

      const responseData= await profileResponse.json();
      const profileData = responseData.user;
      
      // Set personal info from profile data - Fixed the property names here
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
        status: profileData.membership_status ||user?.membership_status || 'Inactive',
        membershipID: profileData.membershipID || user?.membershipID || 'N/A', // Added fallback to user.membershipID
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

  const generateBarcode = async () => {
    try {
      if (!token || !user?.membershipID) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      setBarcodeLoading(true);
      const response = await fetch(`${API_BASE_URL}/payment/admin/generate-barcode/${user.membershipID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate barcode');
      }
      
      const responseData = await response.json();
      setBarcode(responseData.barcode);
    } catch (error: any) {
      console.error('Barcode generation error:', error);
      Alert.alert('Error', error.message || 'Failed to generate barcode');
    } finally {
      setBarcodeLoading(false);
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
            setShowUserMenu(false);
            await logout();
            router.replace('/login');
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
      title: 'Generate Barcode', 
      icon: Shield, 
      action: generateBarcode,
      color: '#3B82F6',
      loading: barcodeLoading
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
    },
    membershipDetailsCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
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
      backgroundColor: 'rgba(0,0,0,0.5)',
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
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowNavMenu(true)}
          >
            <Menu size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Dumbbell size={24} color={theme.primary} style={styles.logoIcon} />
            <View>
              <Text style={styles.logoText}>APIthlete</Text>
              <Text style={styles.subtitle}>Powered By Webgeon Results</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={theme.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          
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

          {/* Barcode Display */}
          {barcode && (
            <View style={styles.membershipCard}>
              <Text style={[styles.membershipLabel, { textAlign: 'center', marginBottom: 8 }]}>
                Your Membership Barcode
              </Text>
              <Text style={[styles.membershipValue, { 
                textAlign: 'center',
                fontSize: 12,
                fontFamily: 'monospace',
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: 8,
                borderRadius: 4
              }]}>
                {barcode}
              </Text>
              <Text style={[styles.checkInTime, { textAlign: 'center' }]}>
                Expires in 2 minutes
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
          <Text style={styles.sectionTitle}>Personal Information</Text>
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

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.actionCard}
                onPress={() => action.route ? router.push(action.route) : action.action?.()}
                disabled={action.loading}
              >
                {action.loading ? (
                  <ActivityIndicator size="small" color={action.color} />
                ) : (
                  <>
                    <action.icon size={32} color={action.color} style={styles.actionIcon} />
                    <Text style={styles.actionText}>{action.title}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
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

      {/* Navigation Menu Modal */}
      <Modal
        visible={showNavMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNavMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modal}
          onPress={() => setShowNavMenu(false)}
        >
          <View style={styles.navMenuContainer}>
            {navigationItems.map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  setShowNavMenu(false);
                  router.push(item.route);
                }}
              >
                <item.icon size={20} color={theme.text} />
                <Text style={styles.menuItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
