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
import { Users, Star, Calendar, Phone, MapPin, Clock, CircleCheck as CheckCircle, User, Mail, Target, Award } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MyTrainerScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [assignedTrainer, setAssignedTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedTrainer();
  }, []);

  const loadAssignedTrainer = async () => {
    try {
      setLoading(true);
      // Mock assigned trainer data - replace with actual API call
      // const response = await apiService.getAssignedTrainer(user?.membershipID);
      
      const mockTrainer = {
        id: 'TR001',
        name: 'Sarah Johnson',
        trainerId: 'TR001',
        specialization: 'Strength Training & Yoga',
        experience: '5 years',
        rating: 4.9,
        image: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg',
        bio: 'Certified strength trainer with expertise in powerlifting, bodybuilding, and yoga. Passionate about helping clients achieve their fitness goals.',
        phone: '+91 9876543210',
        email: 'sarah.johnson@gym.com',
        availability: 'Available Today',
        isAvailable: true,
        weeklySchedule: {
          Monday: '6:00 AM - 10:00 AM, 6:00 PM - 9:00 PM',
          Tuesday: '6:00 AM - 10:00 AM, 6:00 PM - 9:00 PM',
          Wednesday: '6:00 AM - 10:00 AM, 6:00 PM - 9:00 PM',
          Thursday: '6:00 AM - 10:00 AM, 6:00 PM - 9:00 PM',
          Friday: '6:00 AM - 10:00 AM, 6:00 PM - 9:00 PM',
          Saturday: '7:00 AM - 12:00 PM',
          Sunday: 'Rest Day'
        },
        assignedCustomers: 15,
        achievements: [
          'Certified Personal Trainer (ACSM)',
          'Yoga Alliance Certified (RYT-200)',
          'Nutrition Specialist',
          'First Aid & CPR Certified'
        ],
        assignedDate: '2024-01-15',
        nextSession: '2024-02-15 07:00 AM'
      };
      
      setAssignedTrainer(mockTrainer);
    } catch (error) {
      console.error('Error loading assigned trainer:', error);
      Alert.alert('Error', 'Failed to load trainer information');
    } finally {
      setLoading(false);
    }
  };

  const handleContactTrainer = (type: 'phone' | 'email') => {
    if (!assignedTrainer) return;
    
    if (type === 'phone') {
      Alert.alert(
        'Contact Trainer',
        `Call ${assignedTrainer.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => {
            // In a real app, this would open the phone dialer
            Alert.alert('Feature', 'Phone dialer would open here');
          }}
        ]
      );
    } else {
      Alert.alert(
        'Contact Trainer',
        `Send email to ${assignedTrainer.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Email', onPress: () => {
            // In a real app, this would open the email client
            Alert.alert('Feature', 'Email client would open here');
          }}
        ]
      );
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
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Trainer</Text>
          <Text style={styles.headerSubtitle}>Loading trainer information...</Text>
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
        {!assignedTrainer ? (
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
              <Image
                source={{ uri: assignedTrainer.image }}
                style={styles.trainerImage}
                resizeMode="cover"
              />
              <View style={styles.trainerInfo}>
                <Text style={styles.trainerName}>{assignedTrainer.name}</Text>
                <Text style={styles.trainerId}>ID: {assignedTrainer.trainerId}</Text>
                <Text style={styles.trainerSpecialization}>{assignedTrainer.specialization}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.rating}>{assignedTrainer.rating}</Text>
                </View>
              </View>
            </View>

            {/* Availability */}
            <View style={[
              styles.availabilityContainer,
              !assignedTrainer.isAvailable && styles.unavailableContainer
            ]}>
              <CheckCircle size={12} color={assignedTrainer.isAvailable ? theme.success : theme.error} />
              <Text style={[
                styles.availabilityText,
                !assignedTrainer.isAvailable && styles.unavailableText
              ]}>
                {assignedTrainer.availability}
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
                >
                  <Phone size={16} color="white" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContactTrainer('email')}
                >
                  <Mail size={16} color="white" />
                  <Text style={styles.contactButtonText}>Email</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Trainer Stats</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{assignedTrainer.experience}</Text>
                  <Text style={styles.statLabel}>Experience</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{assignedTrainer.assignedCustomers}</Text>
                  <Text style={styles.statLabel}>Assigned Customers</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{assignedTrainer.rating}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>
            </View>

            {/* Weekly Schedule */}
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

            {/* Achievements */}
            <View style={styles.achievementsSection}>
              <Text style={styles.sectionTitle}>Certifications & Achievements</Text>
              <View style={styles.achievementsList}>
                {assignedTrainer.achievements.map((achievement, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.achievementItem,
                      index === assignedTrainer.achievements.length - 1 && styles.achievementItemLast
                    ]}
                  >
                    <Award size={16} color={theme.primary} />
                    <Text style={styles.achievementText}>{achievement}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Next Session Info */}
            {assignedTrainer.nextSession && (
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>Next Session</Text>
                <Text style={styles.sessionDetails}>
                  Scheduled for {assignedTrainer.nextSession}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
