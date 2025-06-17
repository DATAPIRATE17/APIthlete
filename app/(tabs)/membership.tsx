import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { apiService } from '@/services/api';
import { Check, Crown, Star, Zap, Shield, Sparkles, Dumbbell, Users, Calendar, Target } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MembershipPlansScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadMembershipPlans();
  }, []);

  const loadMembershipPlans = async () => {
    try {
      setLoading(true);
      // Mock membership plans data - replace with actual API call
      // const response = await apiService.getMembershipPlans();
      
      const mockPlans = [
        {
          id: 'annual-premium',
          name: 'Annual Premium Plan',
          price: '₹12,000',
          originalPrice: '₹15,000',
          duration: 'Renews every 365 days',
          icon: Crown,
          color: '#FFD700',
          popular: true,
          savings: '20% OFF',
          features: [
            'All gym equipment access',
            'Personal trainer sessions (8 sessions/month)',
            'Nutrition guidance & meal planning',
            'Free locker facility',
            'Guest passes (4 per month)',
            'Priority booking for classes',
            'Free fitness assessment',
            'Access to premium equipment',
            'Sauna & steam room access',
            'Free protein shake (1 per day)',
            'Massage therapy (2 sessions/month)',
            'Diet consultation with nutritionist'
          ],
          perks: [
            '24/7 gym access',
            'Free parking',
            'Towel service',
            'Premium locker room access'
          ]
        },
        {
          id: 'quarterly-plus',
          name: 'Quarterly Plus Plan',
          price: '₹3,500',
          originalPrice: '₹4,200',
          duration: 'Renews every 90 days',
          icon: Star,
          color: '#8B5CF6',
          popular: false,
          savings: '15% OFF',
          features: [
            'All gym equipment access',
            'Personal trainer sessions (4 sessions/month)',
            'Basic nutrition guidance',
            'Free locker facility',
            'Group fitness classes',
            'Guest passes (2 per month)',
            'Fitness assessment',
            'Access to cardio equipment'
          ],
          perks: [
            'Extended gym hours (5 AM - 11 PM)',
            'Free parking',
            'Basic locker room access'
          ]
        },
        {
          id: 'monthly-standard',
          name: 'Monthly Standard Plan',
          price: '₹1,200',
          originalPrice: null,
          duration: 'Renews every 30 days',
          icon: Zap,
          color: '#22C55E',
          popular: false,
          savings: null,
          features: [
            'All gym equipment access',
            'Group fitness classes',
            'Basic nutrition tips',
            'Locker facility',
            'Guest pass (1 per month)',
            'Fitness consultation'
          ],
          perks: [
            'Standard gym hours (6 AM - 10 PM)',
            'Basic equipment access'
          ]
        },
        {
          id: 'basic-plan',
          name: 'Basic Plan',
          price: '₹800',
          originalPrice: null,
          duration: 'Monthly renewal',
          icon: Shield,
          color: '#6B7280',
          popular: false,
          savings: null,
          features: [
            'Limited equipment access',
            'Basic gym facilities',
            'Community support',
            'Off-peak hours only (10 AM - 4 PM)',
            'Basic locker facility'
          ],
          perks: [
            'Affordable pricing',
            'No long-term commitment'
          ]
        }
      ];
      
      setMembershipPlans(mockPlans);
    } catch (error) {
      console.error('Error loading membership plans:', error);
      Alert.alert('Error', 'Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    const selectedPlanData = membershipPlans.find(plan => plan.id === planId);
    
    Alert.alert(
      'Upgrade Membership',
      `You selected ${selectedPlanData?.name} for ${selectedPlanData?.price}. Contact gym administration to upgrade your membership.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Contact Admin', 
          onPress: () => Alert.alert('Contact', 'Please visit the gym reception or call +91 9876543210')
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingBottom: 100,
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
    currentPlanCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    currentPlanTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 8,
    },
    currentPlanName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    currentPlanExpiry: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    planCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: theme.border,
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    planCardSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + '10',
      transform: [{ scale: 1.02 }],
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: 20,
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    popularText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 4,
    },
    savingsBadge: {
      position: 'absolute',
      top: -10,
      left: 20,
      backgroundColor: theme.success,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    savingsText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '700',
    },
    planHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    planIcon: {
      marginRight: 16,
    },
    planInfo: {
      flex: 1,
    },
    planName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    planDuration: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    planPrice: {
      fontSize: 32,
      fontWeight: 'bold',
      marginRight: 8,
    },
    originalPrice: {
      fontSize: 18,
      color: theme.textSecondary,
      textDecorationLine: 'line-through',
    },
    featuresSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    featuresList: {
      marginBottom: 16,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 4,
    },
    featureText: {
      fontSize: 15,
      color: theme.text,
      marginLeft: 12,
      flex: 1,
      fontWeight: '500',
    },
    perksList: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    perk: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    perkLast: {
      marginBottom: 0,
    },
    perkText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 8,
      flex: 1,
    },
    selectButton: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    selectButtonSelected: {
      backgroundColor: theme.success,
    },
    selectButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    recommendedSection: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    recommendedTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    recommendedText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
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
        <Text style={styles.headerTitle}>Membership Plans</Text>
        <Text style={styles.headerSubtitle}>Choose the perfect plan for your fitness journey</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan */}
        <View style={styles.currentPlanCard}>
          <Text style={styles.currentPlanTitle}>Your Current Plan</Text>
          <Text style={styles.currentPlanName}>Annual Premium Plan</Text>
          <Text style={styles.currentPlanExpiry}>Expires on: December 31, 2024</Text>
        </View>

        {/* Recommended Section */}
        <View style={styles.recommendedSection}>
          <Text style={styles.recommendedTitle}>💪 Upgrade Your Experience</Text>
          <Text style={styles.recommendedText}>
            Explore our premium plans with enhanced features and exclusive benefits
          </Text>
        </View>

        {membershipPlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
            ]}
            onPress={() => handlePlanSelection(plan.id)}
            activeOpacity={0.9}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Sparkles size={12} color="white" />
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}
            
            {plan.savings && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{plan.savings}</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <plan.icon 
                size={40} 
                color={plan.color} 
                style={styles.planIcon}
              />
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDuration}>{plan.duration}</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={[styles.planPrice, { color: plan.color }]}>
                {plan.price}
              </Text>
              {plan.originalPrice && (
                <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
              )}
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Features Included</Text>
              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.feature}>
                    <Check size={18} color={theme.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            {plan.perks && plan.perks.length > 0 && (
              <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>Additional Perks</Text>
                <View style={styles.perksList}>
                  {plan.perks.map((perk, index) => (
                    <View key={index} style={[styles.perk, index === plan.perks.length - 1 && styles.perkLast]}>
                      <Target size={14} color={theme.primary} />
                      <Text style={styles.perkText}>{perk}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.selectButton,
                selectedPlan === plan.id && styles.selectButtonSelected,
              ]}
              onPress={() => handlePlanSelection(plan.id)}
            >
              <Text style={styles.selectButtonText}>
                {selectedPlan === plan.id ? '✓ Selected' : 'Select Plan'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
