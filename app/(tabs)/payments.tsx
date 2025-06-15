import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Filter, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react-native';

export default function PaymentsScreen() {
  const { theme } = useTheme();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock payment data
  const payments = [
    {
      id: '1',
      memberName: 'John Doe',
      membershipId: 'GYM001',
      amount: '₹1,200',
      plan: 'Annual Plan',
      date: '2024-01-15',
      status: 'completed',
      method: 'PhonePe',
    },
    {
      id: '2',
      memberName: 'Jane Smith',
      membershipId: 'GYM002',
      amount: '₹1,000',
      plan: 'Monthly Plan',
      date: '2024-01-14',
      status: 'completed',
      method: 'UPI',
    },
    {
      id: '3',
      memberName: 'Mike Johnson',
      membershipId: 'GYM003',
      amount: '₹5,000',
      plan: 'Quarterly Plan',
      date: '2024-01-13',
      status: 'pending',
      method: 'PhonePe',
    },
    {
      id: '4',
      memberName: 'Sarah Wilson',
      membershipId: 'GYM004',
      amount: '₹100',
      plan: 'Basic Plan',
      date: '2024-01-12',
      status: 'failed',
      method: 'Card',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#22C55E" />;
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      case 'failed':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22C55E';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (selectedFilter === 'all') return true;
    return payment.status === selectedFilter;
  });

  const totalAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseInt(p.amount.replace('₹', '').replace(',', '')), 0);

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
    },
    filtersContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterButtonText: {
      color: theme.text,
      marginLeft: 8,
      fontSize: 14,
    },
    searchButton: {
      backgroundColor: theme.surface,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    paymentCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    paymentInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    membershipId: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    paymentAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
    },
    paymentDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentLeft: {
      flex: 1,
    },
    planName: {
      fontSize: 14,
      color: theme.text,
      marginBottom: 4,
    },
    paymentDate: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    paymentRight: {
      alignItems: 'flex-end',
    },
    paymentStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
      textTransform: 'capitalize',
    },
    paymentMethod: {
      fontSize: 12,
      color: theme.textSecondary,
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
      width: '80%',
      maxWidth: 300,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    filterOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: theme.background,
    },
    filterOptionActive: {
      backgroundColor: theme.primary,
    },
    filterOptionText: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'center',
      textTransform: 'capitalize',
    },
    filterOptionTextActive: {
      color: 'white',
    },
    modalCloseButton: {
      backgroundColor: theme.border,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    modalCloseButtonText: {
      color: theme.text,
      textAlign: 'center',
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payments</Text>
        <Text style={styles.headerSubtitle}>Track all payment transactions</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{totalAmount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{payments.filter(p => p.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{payments.filter(p => p.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={16} color={theme.text} />
            <Text style={styles.filterButtonText}>
              {selectedFilter === 'all' ? 'All Payments' : selectedFilter}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.searchButton}>
            <Search size={16} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Payment List */}
        {filteredPayments.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentInfo}>
                <Text style={styles.memberName}>{payment.memberName}</Text>
                <Text style={styles.membershipId}>{payment.membershipId}</Text>
              </View>
              <Text style={styles.paymentAmount}>{payment.amount}</Text>
            </View>
            
            <View style={styles.paymentDetails}>
              <View style={styles.paymentLeft}>
                <Text style={styles.planName}>{payment.plan}</Text>
                <Text style={styles.paymentDate}>{payment.date}</Text>
              </View>
              
              <View style={styles.paymentRight}>
                <View style={styles.paymentStatus}>
                  {getStatusIcon(payment.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                    {payment.status}
                  </Text>
                </View>
                <Text style={styles.paymentMethod}>{payment.method}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Payments</Text>
            
            {['all', 'completed', 'pending', 'failed'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  selectedFilter === filter && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setSelectedFilter(filter);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilter === filter && styles.filterOptionTextActive,
                  ]}
                >
                  {filter === 'all' ? 'All Payments' : filter}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}