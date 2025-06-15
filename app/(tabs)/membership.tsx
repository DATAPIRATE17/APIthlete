import React, { useState } from 'react';
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
import { Check, Crown, Star, Zap, Shield, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MembershipScreen() {
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const membershipPlans = [
    {
      id: 'annual',
      name: 'Annual Plan',
      price: '₹1,200',
      originalPrice: '₹1,500',
      duration: 'Renews every 365 days',
      icon: Crown,
      color: '#FFD700',
      popular: true,
      savings: '20% OFF',
      features: [
        'All gym equipment access',
        'Personal trainer sessions',
        'Nutrition guidance',
        'Free locker facility',
        'Guest passes (2 per month)',
        'Priority booking',
        'Free fitness assessment',
      ],
    },
    {
      id: 'quarterly',
      name: 'Quarterly Plan',
      price: '₹5,000',
      originalPrice: '₹6,000',
      duration: 'Renews every 90 days',
      icon: Star,
      color: '#8B5CF6',
      popular: false,
      savings: '15% OFF',
      features: [
        'All gym equipment access',
        'Personal trainer sessions',
        'Nutrition guidance',
        'Free locker facility',
        'Group fitness classes',
      ],
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '₹1,000',
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
      ],
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '₹100',
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
        'Off-peak hours only',
      ],
    },
    {
      id: 'starter',
      name: 'Starter Plan',
      price: '₹33',
      originalPrice: null,
      duration: 'Monthly renewal',
      icon: Shield,
      color: '#EF4444',
      popular: false,
      savings: null,
      features: [
        'Basic equipment access',
        'Limited hours (6-10 AM)',
        'No personal training',
        'Community access',
      ],
    },
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    const selectedPlanData = membershipPlans.find(plan => plan.id === planId);
    
    Alert.alert(
      'Confirm Selection',
      `You selected ${selectedPlanData?.name} for ${selectedPlanData?.price}. This will redirect you to PhonePe for payment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed to Payment', 
          onPress: () => handlePayment(planId)
        },
      ]
    );
  };

  const handlePayment = (planId: string) => {
    // TODO: Integrate with PhonePe payment gateway
    Alert.alert('Payment Integration', 'PhonePe integration will be implemented here');
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
    featuresList: {
      marginBottom: 24,
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
        {/* Recommended Section */}
        <View style={styles.recommendedSection}>
          <Text style={styles.recommendedTitle}>💪 Most Popular Choice</Text>
          <Text style={styles.recommendedText}>
            Our Annual Plan offers the best value with maximum savings and premium features
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

            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <Check size={18} color={theme.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

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