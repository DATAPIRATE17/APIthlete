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
  ActivityIndicator,
  Image,
  Share,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { CreditCard, Calendar, DollarSign, Filter, Search, CircleCheck as CheckCircle, Circle as XCircle, Clock, Download, Share as ShareIcon } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

interface Payment {
  id: string;
  full_name: string;
  email: string;
  amount_paid: string;
  membership_plan: string;
  payment_date: string;
  renewal_date: string;
  status: string;
  transactionID: string;
  invoice_number: string;
}

interface GymInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: {
    contentType: string;
    base64: string;
  };
}

export default function PaymentHistoryScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user, token, logout } = useAuth();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gymInfo, setGymInfo] = useState<GymInfo | null>(null);

  const API_BASE_URL = 'https://api.apithlete.webgeon.com/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([loadPaymentHistory(), loadGymInfo()]);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    fetchData();
  }, []);

  const loadGymInfo = async () => {
    try {
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await fetch(`${API_BASE_URL}/gym/gym-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          await handleUnauthorized();
          return;
        }
        throw new Error('Failed to load gym info');
      }
      
      const data = await response.json();
      setGymInfo(data.gym || null);
    } catch (error) {
      console.error('Error loading gym info:', error);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.membershipID) {
        throw new Error('Membership ID not found');
      }

      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await fetch(`${API_BASE_URL}/payment/payment-details/${user.membershipID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          await handleUnauthorized();
          return;
        }
        throw new Error(`Failed to load payment history: ${response.status}`);
      }

      const data = await response.json();
      const paymentsArray = Array.isArray(data) ? data : [data];
      
      // Normalize payment status to handle both 'status' and 'payment_status'
      const validatedPayments = paymentsArray.map(payment => ({
        ...payment,
        status: (payment.status || payment.payment_status || 'pending').toLowerCase(),
        amount_paid: payment.amount_paid || '₹0',
        invoice_number: payment.invoice_number || `INV-${payment.transactionID?.slice(-6).toUpperCase() || '000000'}`,
        transactionID: payment.transactionID || 'N/A',
        id: payment.id || payment.transactionID || Math.random().toString(36).substring(7) // Ensure unique ID
      }));

      setPayments(validatedPayments);
    } catch (error: any) {
      console.error('Error loading payment history:', error);
      setError(error.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleUnauthorized = async () => {
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => {
            logout();
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  const getStatusIcon = (status = 'pending') => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'completed': 
      case 'paid': 
        return <CheckCircle size={20} color="#22C55E" />;
      case 'pending': 
        return <Clock size={20} color="#F59E0B" />;
      case 'failed': 
      case 'rejected':
        return <XCircle size={20} color="#EF4444" />;
      default: 
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status = 'pending') => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'completed': 
      case 'paid': 
        return '#22C55E';
      case 'pending': 
        return '#F59E0B';
      case 'failed': 
      case 'rejected':
        return '#EF4444';
      default: 
        return '#6B7280';
    }
  };

  const handleDownloadInvoice = async (payment: Payment) => {
    const normalizedStatus = payment.status.toLowerCase();
    if (normalizedStatus !== 'completed' && normalizedStatus !== 'paid') {
      Alert.alert('Error', 'Invoice is only available for completed payments');
      return;
    }

    setDownloadingInvoice(payment.id);
    try {
      const htmlContent = generateInvoiceHTML(payment);
      const { uri } = await Print.printToFileAsync({ html: htmlContent ,width:612, height:792});

      const fileName =`Invoice_${payment.invoice_number}_${Date.now()}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      
      const fileInfo = await FileSystem.getInfoAsync(newUri);

      if (!fileInfo.exists) {
        throw new Error('Failed to save invoice file');
      }  
      
      Alert.alert(
        'Invoice Downloaded',
        'What would you like to do with the invoice?',
        [
          { 
            text: 'Open', 
            onPress: () => Linking.openURL(newUri) 
          },
          { 
            text: 'Share', 
            onPress: () => shareInvoice(newUri) 
          },
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
        ]
      );
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const shareInvoice = async (fileUri: string, fileName: string) => {

     try {
    // Ensure the file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('Invoice file not found');
      }

    // Create a temporary copy that can be shared
      const shareableUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: fileUri, to: shareableUri });

    // Share the file
      await Share.share({
        url: shareableUri,
        title: `Invoice ${fileName}`,
        message: 'Here is your invoice PDF',
      }, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Invoice',
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
      Alert.alert('Error', 'Failed to share invoice. Please try again.');
    }
  };

  const handleShareInvoice = async (payment: Payment) => {
    const normalizedStatus = payment.status.toLowerCase();
    try {
      if (normalizedStatus !== 'completed' && normalizedStatus !== 'paid') {
        Alert.alert('Error', 'Only completed payments can be shared');
        return;
      }
       
      const htmlContent = generateInvoiceHTML(payment);
      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        width: 612,
        height: 792,
      });
    
      const fileName = `Invoice_${payment.invoice_number}_${Date.now()}.pdf`;
      await shareInvoice(uri, fileName);
    } catch (error) {
      console.error('Error sharing invoice:', error);
      Alert.alert('Error', 'Failed to generate invoice for sharing');
    }
  };
      

  const generateInvoiceHTML = (payment: Payment) => {
    const logoData = gymInfo?.logo ? `data:${gymInfo.logo.contentType};base64,${gymInfo.logo.base64}` : '';
    const safeStatus = payment.status?.toLowerCase() || 'pending';
    const isCompleted = safeStatus === 'completed' || safeStatus === 'paid';
    
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .gym-info { margin-bottom: 15px; }
            .gym-logo { max-width: 150px; max-height: 80px; margin-bottom: 10px; }
            .gym-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .gym-contact { font-size: 12px; color: #666; margin-bottom: 2px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
            .subtitle { font-size: 14px; margin-bottom: 5px; color: #666; text-align: center; }
            .info-container { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-column { width: 48%; }
            .info-title { font-size: 12px; color: #999; margin-bottom: 3px; }
            .info-text { font-size: 14px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total-row { display: flex; justify-content: flex-end; margin-top: 20px; }
            .total-text { font-size: 14px; font-weight: bold; margin-right: 10px; }
            .total-amount { font-size: 14px; font-weight: bold; }
            .status { 
              display: inline-block; 
              padding: 5px; 
              border-radius: 5px; 
              font-size: 14px; 
              margin-bottom: 10px;
            }
            .completed { background-color: #E6F7E6; color: #2E7D32; }
            .pending { background-color: #FFF8E1; color: #F57F17; }
            .failed { background-color: #FFEBEE; color: #C62828; }
            .footer { text-align: center; font-size: 10px; color: #999; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="gym-info">
                ${logoData ? `<img src="${logoData}" class="gym-logo" alt="Gym Logo" />` : ''}
                <div class="gym-name">${gymInfo?.name || 'Your Gym Name'}</div>
                <div class="gym-contact">${gymInfo?.address || '123 Gym Street, Fitness City'}</div>
                <div class="gym-contact">Phone: ${gymInfo?.phone || '(123) 456-7890'}</div>
                <div class="gym-contact">Email: ${gymInfo?.email || 'info@yourgym.com'}</div>
              </div>
            </div>
          </div>

          <div>
            <div class="title">PAYMENT RECEIPT</div>
            <div class="subtitle">Invoice #${payment.invoice_number}</div>
            <div class="subtitle">Date: ${new Date(payment.payment_date).toLocaleDateString()}</div>
          </div>

          <div class="info-container">
            <div class="info-column">
              <div class="info-title">BILLED TO:</div>
              <div class="info-text">${payment.full_name}</div>
              <div class="info-text">${payment.email}</div>
              <div class="info-text">Membership ID: ${user?.membershipID}</div>
            </div>
            <div class="info-column">
              <div class="info-title">PAYMENT DETAILS:</div>
              <div class="info-text">Transaction ID: ${payment.transactionID}</div>
              <div class="info-text">Status: ${payment.status}</div>
              <div class="status ${isCompleted ? 'completed' : safeStatus}">
                ${isCompleted ? 'PAID' : payment.status.toUpperCase()}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th>MEMBERSHIP PERIOD</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${payment.membership_plan} Membership</td>
                <td>
                  ${new Date(payment.payment_date).toLocaleDateString()} - 
                  ${new Date(payment.renewal_date).toLocaleDateString()}
                </td>
                <td>${payment.amount_paid}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-row">
            <div class="total-text">TOTAL:</div>
            <div class="total-amount">${payment.amount_paid}</div>
          </div>

          <div class="footer">
            <div>Thank you for choosing ${gymInfo?.name || 'Your Gym'}</div>
            <div>© ${new Date().getFullYear()} ${gymInfo?.name || 'Your Gym'}. All rights reserved.</div>
          </div>
        </body>
      </html>
    `;
  };

  const filteredPayments = payments.filter(payment => {
    if (selectedFilter === 'all') return true;
    const normalizedStatus = payment.status.toLowerCase();
    const normalizedFilter = selectedFilter.toLowerCase();
    
    if (normalizedFilter === 'completed') {
      return normalizedStatus === 'completed' || normalizedStatus === 'paid';
    }
    return normalizedStatus === normalizedFilter;
  });

  const totalAmount = payments
    .filter(p => {
      const status = p.status.toLowerCase();
      return status === 'completed' || status === 'paid';
    })
    .reduce((sum, p) => sum + parseFloat(p.amount_paid.replace(/[^0-9.]/g, '')), 0);

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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      backgroundColor: theme.error + '20',
      padding: 16,
      borderRadius: 8,
      margin: 20,
      borderWidth: 1,
      borderColor: theme.error,
    },
    errorText: {
      color: theme.error,
      textAlign: 'center',
    },
    retryButton: {
      color: theme.primary,
      textAlign: 'center',
      marginTop: 10,
      fontWeight: '600',
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error.includes('401') ? 'Session expired. Please log in again.' : error}
        </Text>
        {error.includes('401') ? (
          <TouchableOpacity onPress={() => {
            logout();
            navigation.navigate('Login');
          }}>
            <Text style={styles.retryButton}>Go to Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={loadPaymentHistory}>
            <Text style={styles.retryButton}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment History</Text>
        <Text style={styles.headerSubtitle}>Track all your membership payments</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{totalAmount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Paid</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {payments.filter(p => {
                const status = p.status.toLowerCase();
                return status === 'completed' || status === 'paid';
              }).length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{payments.filter(p => p.status.toLowerCase() === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

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

        {filteredPayments.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentInfo}>
                <Text style={styles.memberName}>{payment.full_name}</Text>
                <Text style={styles.memberEmail}>{payment.email}</Text>
              </View>
              <Text style={styles.paymentAmount}>{payment.amount_paid}</Text>
            </View>
            
            <View style={styles.paymentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Plan</Text>
                <Text style={styles.detailValue}>{payment.membership_plan}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(payment.payment_date).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Renewal Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(payment.renewal_date).toLocaleDateString()}
                </Text>
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

            <View style={styles.invoiceActions}>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceNumber}>Invoice: {payment.invoice_number}</Text>
                <Text style={styles.transactionId}>TXN: {payment.transactionID}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    (payment.status.toLowerCase() !== 'completed' && payment.status.toLowerCase() !== 'paid') && styles.actionButtonDisabled
                  ]}
                  onPress={() => handleDownloadInvoice(payment)}
                  disabled={(payment.status.toLowerCase() !== 'completed' && payment.status.toLowerCase() !== 'paid') || downloadingInvoice === payment.id}
                >
                  {downloadingInvoice === payment.id ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Download size={12} color={
                      (payment.status.toLowerCase() === 'completed' || payment.status.toLowerCase() === 'paid') 
                        ? theme.primary 
                        : theme.textSecondary
                    } />
                  )}
                  <Text style={[
                    styles.actionButtonText,
                    (payment.status.toLowerCase() !== 'completed' && payment.status.toLowerCase() !== 'paid') && styles.actionButtonTextDisabled
                  ]}>
                    PDF
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    (payment.status.toLowerCase() !== 'completed' && payment.status.toLowerCase() !== 'paid') && styles.actionButtonDisabled
                  ]}
                  onPress={() => handleShareInvoice(payment)}
                  disabled={payment.status.toLowerCase() !== 'completed' && payment.status.toLowerCase() !== 'paid'}
                >
                  <ShareIcon size={12} color={
                    (payment.status.toLowerCase() === 'completed' || payment.status.toLowerCase() === 'paid') 
                      ? theme.primary 
                      : theme.textSecondary
                  } />
                  <Text style={[
                    styles.actionButtonText,
                    (payment.status.toLowerCase() !== 'completed' && payment.status.toLowerCase() !== 'paid') && styles.actionButtonTextDisabled
                  ]}>
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

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
