import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { apiService } from '@/services/api';
import { CreditCard, Calendar, DollarSign, Filter, Search, CircleCheck as CheckCircle, Circle as XCircle, Clock, Download, FileText, Share, User, Mail } from 'lucide-react-native';

export default function PaymentHistoryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      // Mock payment data - replace with actual API call
      // const response = await apiService.getPaymentHistory(user?.membershipID);
      
      const mockPayments = [
        {
          id: '1',
          fullName: user?.full_name || 'John Doe',
          email: user?.email || 'john.doe@example.com',
          amount: '₹12,000',
          plan: 'Annual Premium Plan',
          paymentDate: '2024-01-15',
          renewalDate: '2025-01-15',
          status: 'Completed',
          transactionId: 'TXN123456789',
          invoiceNumber: 'INV-2024-001',
        },
        {
          id: '2',
          fullName: user?.full_name || 'John Doe',
          email: user?.email || 'john.doe@example.com',
          amount: '₹3,000',
          plan: 'Quarterly Plan',
          paymentDate: '2023-10-15',
          renewalDate: '2024-01-15',
          status: 'Completed',
          transactionId: 'TXN123456790',
          invoiceNumber: 'INV-2023-045',
        },
        {
          id: '3',
          fullName: user?.full_name || 'John Doe',
          email: user?.email || 'john.doe@example.com',
          amount: '₹1,000',
          plan: 'Monthly Plan',
          paymentDate: '2024-02-01',
          renewalDate: '2024-03-01',
          status: 'Pending',
          transactionId: 'TXN123456791',
          invoiceNumber: 'INV-2024-012',
        },
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payment history:', error);
      Alert.alert('Error', 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const calculateRenewalDate = (paymentDate, plan) => {
    const date = new Date(paymentDate);
    if (plan.toLowerCase().includes('annual')) {
      date.setFullYear(date.getFullYear() + 1);
    } else if (plan.toLowerCase().includes('quarterly')) {
      date.setMonth(date.getMonth() + 3);
    } else if (plan.toLowerCase().includes('monthly')) {
      date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
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
    switch (status.toLowerCase()) {
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

  const handleDownloadInvoice = async (payment) => {
    if (payment.status.toLowerCase() !== 'completed') {
      Alert.alert('Error', 'Invoice is only available for completed payments');
      return;
    }

    setDownloadingInvoice(payment.id);
    try {
      // Mock PDF generation - replace with actual API call
      // const pdfBlob = await apiService.downloadInvoice(payment.id);
      
      const pdfContent = generateInvoicePDF(payment);
      
      if (Platform.OS === 'web') {
        // Web implementation
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${payment.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Mobile implementation would use FileSystem
        Alert.alert('Success', 'Invoice download feature will be implemented for mobile');
      }
      
      Alert.alert('Success', 'Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const generateInvoicePDF = (payment) => {
    // Mock PDF content - in real app, this would be generated by backend
    return `
      INVOICE
      
      Invoice Number: ${payment.invoiceNumber}
      Date: ${payment.paymentDate}
      
      Bill To:
      ${payment.fullName}
      ${payment.email}
      
      Description: ${payment.plan}
      Amount: ${payment.amount}
      Payment Date: ${payment.paymentDate}
      Renewal Date: ${payment.renewalDate}
      Transaction ID: ${payment.transactionId}
      Status: ${payment.status}
      
      Thank you for your payment!
    `;
  };

  const handleShareInvoice = async (payment) => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Invoice ${payment.invoiceNumber}`,
          text: `Payment invoice for ${payment.plan} - ${payment.amount}`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API or mobile
        Alert.alert('Share', 'Invoice sharing feature will be implemented');
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (selectedFilter === 'all') return true;
    return payment.status.toLowerCase() === selectedFilter.toLowerCase();
  });

  const totalAmount = payments
    .filter(p => p.status.toLowerCase() === 'completed')
    .reduce((sum, p) => sum + parseInt(p.amount.replace('₹', '').replace(',', '')), 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingBottom: 100,
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
    memberEmail: {
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
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
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
      flex: 1,
      textAlign: 'right',
    },
    paymentStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
      textTransform: 'capitalize',
    },
    invoiceActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    invoiceInfo: {
      flex: 1,
    },
    invoiceNumber: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    transactionId: {
      fontSize: 10,
      color: theme.textSecondary,
      marginTop: 2,
    },
    actionButtons: {
      flexDirection: 'row',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginLeft: 8,
    },
    actionButtonDisabled: {
      backgroundColor: theme.border,
    },
    actionButtonText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '600',
      marginLeft: 4,
    },
    actionButtonTextDisabled: {
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
        <Text style={styles.headerTitle}>Payment History</Text>
        <Text style={styles.headerSubtitle}>Track all your membership payments</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{totalAmount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Paid</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{payments.filter(p => p.status.toLowerCase() === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{payments.filter(p => p.status.toLowerCase() === 'pending').length}</Text>
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
                <Text style={styles.memberName}>{payment.fullName}</Text>
                <Text style={styles.memberEmail}>{payment.email}</Text>
              </View>
              <Text style={styles.paymentAmount}>{payment.amount}</Text>
            </View>
            
            <View style={styles.paymentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Plan</Text>
                <Text style={styles.detailValue}>{payment.plan}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Date</Text>
                <Text style={styles.detailValue}>{payment.paymentDate}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Renewal Date</Text>
                <Text style={styles.detailValue}>{payment.renewalDate}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.paymentStatus}>
                  {getStatusIcon(payment.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                    {payment.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Invoice Actions */}
            <View style={styles.invoiceActions}>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceNumber}>Invoice: {payment.invoiceNumber}</Text>
                <Text style={styles.transactionId}>TXN: {payment.transactionId}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    payment.status.toLowerCase() !== 'completed' && styles.actionButtonDisabled
                  ]}
                  onPress={() => handleDownloadInvoice(payment)}
                  disabled={payment.status.toLowerCase() !== 'completed' || downloadingInvoice === payment.id}
                >
                  <Download size={12} color={payment.status.toLowerCase() === 'completed' ? theme.primary : theme.textSecondary} />
                  <Text style={[
                    styles.actionButtonText,
                    payment.status.toLowerCase() !== 'completed' && styles.actionButtonTextDisabled
                  ]}>
                    {downloadingInvoice === payment.id ? 'Downloading...' : 'PDF'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    payment.status.toLowerCase() !== 'completed' && styles.actionButtonDisabled
                  ]}
                  onPress={() => handleShareInvoice(payment)}
                  disabled={payment.status.toLowerCase() !== 'completed'}
                >
                  <Share size={12} color={payment.status.toLowerCase() === 'completed' ? theme.primary : theme.textSecondary} />
                  <Text style={[
                    styles.actionButtonText,
                    payment.status.toLowerCase() !== 'completed' && styles.actionButtonTextDisabled
                  ]}>
                    Share
                  </Text>
                </TouchableOpacity>
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
