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
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  ChevronDown,
  Activity,
  Users,
  CreditCard,
  TrendingUp,
  Dumbbell,
  Calendar,
  Target,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const router = useRouter();

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
    { name: 'Payments', route: '/(tabs)/payments', icon: CreditCard },
    { name: 'Trainer', route: '/(tabs)/trainer', icon: Users },
    { name: 'Membership', route: '/(tabs)/membership', icon: TrendingUp },
    { name: 'Settings', route: '/(tabs)/settings', icon: User },
  ];

  const stats = [
    { title: 'Active Members', value: '1,234', color: theme.primary, icon: Users },
    { title: 'Monthly Revenue', value: '₹45,000', color: '#F59E0B', icon: TrendingUp },
    { title: 'Trainers', value: '12', color: '#EF4444', icon: Users },
    { title: 'Equipment', value: '85', color: '#8B5CF6', icon: Dumbbell },
  ];

  const quickActions = [
    { title: 'View Plans', icon: TrendingUp, route: '/(tabs)/membership', color: theme.primary },
    { title: 'Payments', icon: CreditCard, route: '/(tabs)/payments', color: '#F59E0B' },
    { title: 'Trainers', icon: Users, route: '/(tabs)/trainer', color: '#EF4444' },
    { title: 'Profile', icon: User, route: '/(tabs)/settings', color: '#8B5CF6' },
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    membershipInfo: {
      flex: 1,
    },
    membershipTitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 4,
    },
    membershipId: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    membershipStatus: {
      backgroundColor: theme.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    membershipStatusText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    statsSection: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: (width - 60) / 2,
      backgroundColor: theme.surface,
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    statIcon: {
      marginBottom: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statTitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
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
              <Text style={styles.logoText}>Apiathelete</Text>
              <Text style={styles.subtitle}>Fitness Management</Text>
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
            <View style={styles.membershipInfo}>
              <Text style={styles.membershipTitle}>Membership ID</Text>
              <Text style={styles.membershipId}>{user?.membershipID || 'N/A'}</Text>
            </View>
            <View style={styles.membershipStatus}>
              <Text style={styles.membershipStatusText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Gym Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <stat.icon size={32} color={stat.color} style={styles.statIcon} />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
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
                onPress={() => router.push(action.route as any)}
              >
                <action.icon size={32} color={action.color} style={styles.actionIcon} />
                <Text style={styles.actionText}>{action.title}</Text>
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
                  router.push(item.route as any);
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