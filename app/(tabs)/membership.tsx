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
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { Check, Crown, Star, Zap, Shield, Sparkles, Dumbbell, Users, Calendar, Target } from 'lucide-react-native';

const API_BASE_URL = 'https://api.apithlete.webgeon.com';
const { width } = Dimensions.get('window');

interface MembershipPlan {
  _id: string;
  name: string;
  price: number;
  renewal: number;
  description: string;
  perks?: string[];
  popular?: boolean;
  color?: string;
}

export default function MembershipPlansScreen() {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembershipPlans();
    loadCurrentPlan();
  }, []);

  const loadMembershipPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/membership/all`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMembershipPlans(data.plans);
      } else {
        setError(data.message || 'Failed to load membership plans');
      }
    } catch (error) {
      console.error('Error loading membership plans:', error);
      setError('Failed to load membership plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      if (user?.membershipID) {
        const response = await fetch(`${API_BASE_URL}/api/payment/payment-details/${user.membershipID}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.membership_plan) {
          setCurrentPlan({
            name: data.membership_plan,
            expiry: data.renewal_date ? new Date(data.renewal_date).toLocaleDateString() : 'Not available'
          });
        }
      }
    } catch (error) {
      console.error('Error loading current plan:', error);
    }
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    const selectedPlanData = membershipPlans.find(plan => plan._id === planId);
    
    if (!user?.membershipID) {
      setError('User membership ID not found');
      return;
    }

    Alert.alert(
      'Upgrade Membership',
      `You selected ${selectedPlanData?.name} for ₹${selectedPlanData?.price}. Do you want to proceed with payment?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedPlan(null) },
        { 
          text: 'Proceed to Payment', 
          onPress: () => initiatePaymentProcess(planId, selectedPlanData)
        },
      ]
    );
  };

  const initiatePaymentProcess = async (planId: string, planData: MembershipPlan) => {
    try {
      setProcessingPayment(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          membershipID: user?.membershipID,
          membership_plan: planData.name
        }),
      });
      
      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Open the payment URL in browser
        const canOpen = await Linking.canOpenURL(data.checkoutUrl);
        if (canOpen) {
          await Linking.openURL(data.checkoutUrl);
          // Start polling for payment status
          pollPaymentStatus(data.orderId);
        } else {
          setError('Cannot open payment link');
        }
      } else {
        setError(data.error || 'Failed to initiate payment');
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to process payment. Please try again.');
      setSelectedPlan(null);
    } finally {
      setProcessingPayment(false);
    }
  };

  const pollPaymentStatus = async (orderId: string) => {
    try {
      let attempts = 0;
      const maxAttempts = 10;
      const interval = setInterval(async () => {
        attempts++;
        
        const response = await fetch(`${API_BASE_URL}/api/payment/status/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.status === 'SUCCESS') {
          clearInterval(interval);
          Alert.alert('Payment Successful', 'Your membership has been upgraded successfully!');
          loadCurrentPlan();
          // Refresh user data
          if (user) {
            const userResponse = await fetch(`${API_BASE_URL}/api/user/${user.membershipID}`, {
              headers: {
                'Authorization': `Bearer ${user?.token}`,
                'Content-Type': 'application/json',
              },
            });
            const userData = await userResponse.json();
            if (userData.success) {
              updateUser(userData.user);
            }
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          Alert.alert('Payment Pending', 'Payment is still processing. Please check your payment history later.');
        }
      }, 3000);
    } catch (error) {
      console.error('Payment status polling error:', error);
    }
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Membership Plans</Text>
          <Text style={styles.headerSubtitle}>Choose the perfect plan for your fitness journey</Text>
        </View>
        
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.error, marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              setError(null);
              loadMembershipPlans();
            }}
          >
            <Text style={styles.selectButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (membershipPlans.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Membership Plans</Text>
          <Text style={styles.headerSubtitle}>Choose the perfect plan for your fitness journey</Text>
        </View>
        
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.textSecondary }}>No membership plans available.</Text>
        </View>
      </View>
    );
  }

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
        {currentPlan && (
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlanTitle}>Your Current Plan</Text>
            <Text style={styles.currentPlanName}>{currentPlan.name}</Text>
            <Text style={styles.currentPlanExpiry}>Expires on: {currentPlan.expiry}</Text>
          </View>
        )}

        {/* Recommended Section */}
        <View style={styles.recommendedSection}>
          <Text style={styles.recommendedTitle}>💪 Upgrade Your Experience</Text>
          <Text style={styles.recommendedText}>
            Explore our premium plans with enhanced features and exclusive benefits
          </Text>
        </View>

        {membershipPlans.map((plan) => (
          <TouchableOpacity
            key={plan._id}
            style={[
              styles.planCard,
              selectedPlan === plan._id && styles.planCardSelected,
            ]}
            onPress={() => handlePlanSelection(plan._id)}
            activeOpacity={0.9}
            disabled={processingPayment}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Sparkles size={12} color="white" />
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <View style={styles.planIcon}>
                {plan.name.includes('Premium') ? (
                  <Crown size={40} color={plan.color || theme.primary} />
                ) : plan.name.includes('Standard') ? (
                  <Star size={40} color={plan.color || theme.primary} />
                ) : (
                  <Zap size={40} color={plan.color || theme.primary} />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDuration}>
                  {plan.renewal === 1 ? 'Monthly renewal' : `Renews every ${plan.renewal} months`}
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={[styles.planPrice, { color: plan.color || theme.primary }]}>
                ₹{plan.price}
              </Text>
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Features Included</Text>
              <View style={styles.featuresList}>
                {plan.description.split('\n').map((feature, index) => (
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
                selectedPlan === plan._id && styles.selectButtonSelected,
              ]}
              onPress={() => handlePlanSelection(plan._id)}
              disabled={processingPayment}
            >
              {processingPayment && selectedPlan === plan._id ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.selectButtonText}>
                  {selectedPlan === plan._id ? '✓ Selected' : 'Select Plan'}
                </Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
