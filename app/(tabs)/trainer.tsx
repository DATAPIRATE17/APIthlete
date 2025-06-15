import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Star,
  Calendar,
  Phone,
  MapPin,
} from 'lucide-react-native';

export default function TrainerScreen() {
  const { theme } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock trainer data
  const trainers = [
    {
      id: '1',
      name: 'John Smith',
      specialization: 'Strength Training',
      experience: '5 years',
      rating: 4.8,
      assignedMembers: 15,
      availability: ['Morning', 'Evening'],
      phone: '+91 9876543210',
      location: 'Mumbai',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      specialization: 'Yoga & Pilates',
      experience: '3 years',
      rating: 4.9,
      assignedMembers: 12,
      availability: ['Morning'],
      phone: '+91 9876543211',
      location: 'Delhi',
    },
    {
      id: '3',
      name: 'Mike Wilson',
      specialization: 'Cardio & HIIT',
      experience: '7 years',
      rating: 4.7,
      assignedMembers: 18,
      availability: ['Evening'],
      phone: '+91 9876543212',
      location: 'Bangalore',
    },
    {
      id: '4',
      name: 'Emily Davis',
      specialization: 'Functional Training',
      experience: '4 years',
      rating: 4.8,
      assignedMembers: 10,
      availability: ['Morning', 'Evening'],
      phone: '+91 9876543213',
      location: 'Chennai',
    },
  ];

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.surface,
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
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
    searchContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    searchInput: {
      flex: 1,
      backgroundColor: theme.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 12,
    },
    searchButton: {
      backgroundColor: theme.surface,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    trainerCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    trainerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    trainerInfo: {
      flex: 1,
    },
    trainerName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    trainerSpecialization: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    rating: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.primary,
      marginLeft: 4,
    },
    trainerDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 8,
    },
    detailText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 4,
    },
    availabilityContainer: {
      flexDirection: 'row',
      marginTop: 8,
    },
    availabilityBadge: {
      backgroundColor: theme.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginRight: 8,
    },
    availabilityText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '600',
    },
    assignedMembers: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
      textAlign: 'center',
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalInput: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.text,
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    cancelButton: {
      backgroundColor: theme.border,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.text,
    },
    saveButtonText: {
      color: 'white',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trainers</Text>
        <Text style={styles.headerSubtitle}>Manage gym trainers and assignments</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{trainers.length}</Text>
            <Text style={styles.statLabel}>Total Trainers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {trainers.reduce((sum, t) => sum + t.assignedMembers, 0)}
            </Text>
            <Text style={styles.statLabel}>Assigned Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {(trainers.reduce((sum, t) => sum + t.rating, 0) / trainers.length).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>

        {/* Search and Add */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search trainers..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Search size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Trainers List */}
        {filteredTrainers.map((trainer) => (
          <View key={trainer.id} style={styles.trainerCard}>
            <View style={styles.trainerHeader}>
              <View style={styles.trainerInfo}>
                <Text style={styles.trainerName}>{trainer.name}</Text>
                <Text style={styles.trainerSpecialization}>{trainer.specialization}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Star size={14} color={theme.primary} fill={theme.primary} />
                <Text style={styles.rating}>{trainer.rating}</Text>
              </View>
            </View>

            <View style={styles.trainerDetails}>
              <View style={styles.detailItem}>
                <Calendar size={14} color={theme.textSecondary} />
                <Text style={styles.detailText}>{trainer.experience}</Text>
              </View>
              <View style={styles.detailItem}>
                <Phone size={14} color={theme.textSecondary} />
                <Text style={styles.detailText}>{trainer.phone}</Text>
              </View>
              <View style={styles.detailItem}>
                <MapPin size={14} color={theme.textSecondary} />
                <Text style={styles.detailText}>{trainer.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Users size={14} color={theme.textSecondary} />
                <Text style={styles.detailText}>{trainer.assignedMembers} members</Text>
              </View>
            </View>

            <View style={styles.availabilityContainer}>
              {trainer.availability.map((slot, index) => (
                <View key={index} style={styles.availabilityBadge}>
                  <Text style={styles.availabilityText}>{slot}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Trainer Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Trainer</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Trainer Name"
              placeholderTextColor={theme.textSecondary}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Specialization"
              placeholderTextColor={theme.textSecondary}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Experience (years)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Location"
              placeholderTextColor={theme.textSecondary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  // Handle save trainer
                  setShowAddModal(false);
                }}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}