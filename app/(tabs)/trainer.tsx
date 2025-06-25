
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
import { Users, Star, Calendar, Phone, MapPin, Clock, CircleCheck as CheckCircle, User, Mail, Target, Award } from 'lucide-react-native';

const API_BASE_URL = 'https://api.apithlete.webgeon.com';
const { width } = Dimensions.get('window');

interface Trainer {
  trainerID?: string;
  trainer_name?: string;
  specialization?: string;
  phone_number?: string;
  passport_photo_url?: string;
  assigned_Members?: number;
  availability?: string | string[];
  email?: string;
  rating?: string;
  bio?: string;
  weeklySchedule?: Record<string, string>;
}

export default function MyTrainerScreen() {
  const { theme } = useTheme();
  const { user,token } = useAuth();
  const [assignedTrainer, setAssignedTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssignedTrainer();
  }, []);

  const parseAvailability = (availability: string | string[] | undefined) => {
    if (!availability) return [];
    if (Array.isArray(availability)) return availability;
    try {
      return JSON.parse(availability) || [];
    } catch {
      return [];
    }
  };

  const isTrainerAvailableToday = (availability: string | string[] | undefined) => {
    const availabilityArray = parseAvailability(availability);
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    return availabilityArray.includes(today) || availabilityArray.includes('Morning');
  };

  const loadAssignedTrainer = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user?.membershipID) {
        throw new Error('No membership ID found');
      }

      console.log('Fetching trainer for membership:', user.membershipID);
      const response = await fetch(`${API_BASE_URL}/api/admin/trainers/${user.membershipID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type' : 'application/json'
        },
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        if (response.status === 404) {
          if (data.error === "No trainer assigned to this member") {
            setAssignedTrainer(null);
            return;
          }
          throw new Error(data.error || "Member not found");
        }
        throw new Error(data.message || "Failed to fetch trainer");
      }

      if (!data.trainer_name) {
        setAssignedTrainer(null);
        return;
      }

      // Format the trainer data while preserving all original UI structure
      const formattedTrainer: Trainer = {
        trainerID: data.trainerID,
        trainer_name: data.trainer_name,
        specialization: data.specialization || 'General Fitness',
        passport_photo_url: data.passport_photo_url || data.passport_photo,
        phone_number: data.phone_number,
        email: data.email || `${data.trainer_name.toLowerCase().replace(/\s+/g, '.')}@gym.com`,
        rating: data.rating || '4.8',
        bio: data.bio || 'Certified trainer with expertise in various fitness disciplines.',
        availability: data.availability,
        // weeklySchedule: {
        //   Monday: '6:00 AM - 12:00 PM',
        //   Tuesday: '6:00 AM - 12:00 PM',
        //   Wednesday: '6:00 AM - 12:00 PM',
        //   Thursday: '6:00 AM - 12:00 PM',
        //   Friday: '6:00 AM - 12:00 PM',
        //   Saturday: 'Rest Day',
        //   Sunday: 'Rest Day'
        // },
        assigned_Members: data.assigned_Members
      };

      setAssignedTrainer(formattedTrainer);
    } catch (error) {
      console.error('Full error loading trainer:', error);
      setError(error.message || 'Failed to load trainer information');
      setAssignedTrainer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleContactTrainer = (type: 'phone' | 'email') => {
    if (!assignedTrainer) return;
    
    if (type === 'phone' && assignedTrainer.phone_number) {
      Alert.alert(
        'Contact Trainer',
        `Call ${assignedTrainer.trainer_name} at ${assignedTrainer.phone_number}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => Linking.openURL(`tel:${assignedTrainer.phone_number}`) }
        ]
      );
    } else if (type === 'email' && assignedTrainer.email) {
      Alert.alert(
        'Contact Trainer',
        `Send email to ${assignedTrainer.trainer_name} at ${assignedTrainer.email}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Email', onPress: () => Linking.openURL(`mailto:${assignedTrainer.email}`) }
        ]
      );
    }
  };

  // All style definitions remain exactly the same
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
    noTrainerCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    noTrainerIcon: {
      marginBottom: 16,
    },
    noTrainerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    noTrainerText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    trainerCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    trainerHeader: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    trainerImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginRight: 20,
    },
    trainerInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    trainerName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    trainerId: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    trainerSpecialization: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '600',
      marginBottom: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rating: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 4,
    },
    availabilityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.success + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
    availabilityText: {
      fontSize: 12,
      color: theme.success,
      fontWeight: '600',
      marginLeft: 4,
    },
    unavailableContainer: {
      backgroundColor: theme.error + '20',
    },
    unavailableText: {
      color: theme.error,
    },
    trainerBio: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 20,
    },
    contactSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    contactButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    contactButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 12,
      marginHorizontal: 4,
    },
    contactButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    scheduleSection: {
      marginBottom: 20,
    },
    scheduleCard: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    scheduleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    scheduleRowLast: {
      borderBottomWidth: 0,
    },
    scheduleDay: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    scheduleTime: {
      fontSize: 14,
      color: theme.textSecondary,
      flex: 2,
      textAlign: 'right',
    },
    restDay: {
      color: theme.error,
      fontStyle: 'italic',
    },
    statsSection: {
      marginBottom: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    achievementsSection: {
      marginBottom: 20,
    },
    achievementsList: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    achievementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    achievementItemLast: {
      marginBottom: 0,
    },
    achievementText: {
      fontSize: 14,
      color: theme.text,
      marginLeft: 12,
      flex: 1,
    },
    sessionInfo: {
      backgroundColor: theme.primary + '20',
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
    },
    sessionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 8,
    },
    sessionDetails: {
      fontSize: 14,
      color: theme.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: theme.error,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Trainer</Text>
          <Text style={styles.headerSubtitle}>Loading trainer information...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Trainer</Text>
          <Text style={styles.headerSubtitle}>Error loading information</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.contactButton, { marginTop: 20 }]}
            onPress={loadAssignedTrainer}
          >
            <Text style={styles.contactButtonText}>Try Again</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>My Trainer</Text>
        <Text style={styles.headerSubtitle}>Your assigned fitness coach</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!assignedTrainer?.trainer_name ? (
          <View style={styles.noTrainerCard}>
            <Users size={48} color={theme.textSecondary} style={styles.noTrainerIcon} />
            <Text style={styles.noTrainerTitle}>No Trainer Assigned</Text>
            <Text style={styles.noTrainerText}>
              You don't have a trainer assigned yet. Please contact the gym administration to get a trainer assigned to your membership.
            </Text>
          </View>
        ) : (
          <View style={styles.trainerCard}>
            {/* Trainer Header */}
            <View style={styles.trainerHeader}>
              {assignedTrainer.passport_photo_url ? (
                <Image
                  source={{ uri: assignedTrainer.passport_photo_url }}
                  style={styles.trainerImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.trainerImage, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
                  <User size={40} color="white" />
                </View>
              )}
              <View style={styles.trainerInfo}>
                <Text style={styles.trainerName}>{assignedTrainer.trainer_name}</Text>
                {assignedTrainer.trainerID && (
                  <Text style={styles.trainerId}>ID: {assignedTrainer.trainerID}</Text>
                )}
                {assignedTrainer.specialization && (
                  <Text style={styles.trainerSpecialization}>{assignedTrainer.specialization}</Text>
                )}
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.rating}>{assignedTrainer.rating}</Text>
                </View>
              </View>
            </View>

            {/* Availability */}
            <View style={[
              styles.availabilityContainer,
              !isTrainerAvailableToday(assignedTrainer.availability) && styles.unavailableContainer
            ]}>
              <CheckCircle size={12} color={isTrainerAvailableToday(assignedTrainer.availability) ? theme.success : theme.error} />
              <Text style={[
                styles.availabilityText,
                !isTrainerAvailableToday(assignedTrainer.availability) && styles.unavailableText
              ]}>
                {isTrainerAvailableToday(assignedTrainer.availability) ? 'Available Today' : 'Not Available Today'}
              </Text>
            </View>

            {/* Bio */}
            <Text style={styles.trainerBio}>{assignedTrainer.bio}</Text>

            {/* Contact Section */}
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact Trainer</Text>
              <View style={styles.contactButtons}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContactTrainer('phone')}
                  disabled={!assignedTrainer.phone_number}
                >
                  <Phone size={16} color="white" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContactTrainer('email')}
                  disabled={!assignedTrainer.email}
                >
                  <Mail size={16} color="white" />
                  <Text style={styles.contactButtonText}>Email</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekly Schedule */}
            {assignedTrainer.weeklySchedule && (
              <View style={styles.scheduleSection}>
                <Text style={styles.sectionTitle}>Weekly Schedule</Text>
                <View style={styles.scheduleCard}>
                  {Object.entries(assignedTrainer.weeklySchedule).map(([day, time], index, array) => (
                    <View 
                      key={day} 
                      style={[
                        styles.scheduleRow,
                        index === array.length - 1 && styles.scheduleRowLast
                      ]}
                    >
                      <Text style={styles.scheduleDay}>{day}</Text>
                      <Text style={[
                        styles.scheduleTime,
                        time === 'Rest Day' && styles.restDay
                      ]}>
                        {time}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
