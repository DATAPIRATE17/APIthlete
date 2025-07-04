import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { Save, User, Mail, Phone, MapPin, Calendar, Heart, Camera, CreditCard, Filter, Search, CircleCheck as CheckCircle, Circle as XCircle, Clock, Download, Share as ShareIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Linking from 'expo-linking';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://portal.flexzonegym.com';

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

export default function ProfileSettingsScreen() {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [gymInfo, setGymInfo] = useState<GymInfo | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    emergency_contact: '',
    age: '',
    gender: '',
    pincode: '',
    health_condition: '',
    address: '',
  });

  useEffect(() => {
    loadUserProfile();
    loadGymInfo();
  }, [user]);

  const loadUserProfile = async () => {
    try {
      if (!user?._id || !token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.user) {
        const userData = data.user;
        
        setFormData({
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          emergency_contact: userData.emergency_contact || '',
          age: userData.age ? String(userData.age) : '',
          gender: userData.gender || '',
          pincode: userData.pincode || '',
          health_condition: userData.health_condition || 'Normal',
          address: userData.address || '',
        });
        
        if (userData.passport_photo) {
          setProfileImage(userData.passport_photo);
        } else if (userData.passport_photo_url) {
          const photoUrl = userData.passport_photo_url.startsWith('http') 
            ? userData.passport_photo_url 
            : `${API_BASE_URL}${userData.passport_photo_url}`;
          setProfileImage(photoUrl);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadGymInfo = async () => {
    try {
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await fetch(`${API_BASE_URL}/api/gym/gym-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
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
      setPaymentLoading(true);
      
      if (!user?.membershipID || !token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/payment/payment-details/${user.membershipID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load payment history: ${response.status}`);
      }

      const data = await response.json();
      const paymentsArray = Array.isArray(data) ? data : [data];
      
      const validatedPayments = paymentsArray.map(payment => ({
        ...payment,
        status: (payment.status || payment.payment_status || 'pending').toLowerCase(),
        amount_paid: payment.amount_paid || '₹0',
        invoice_number: payment.invoice_number || `INV-${payment.transactionID?.slice(-6).toUpperCase() || '000000'}`,
        transactionID: payment.transactionID || 'N/A',
        id: payment.id || payment.transactionID || Math.random().toString(36).substring(7)
      }));

      setPayments(validatedPayments);
    } catch (error: any) {
      console.error('Error loading payment history:', error);
      Alert.alert('Error', 'Failed to load payment history');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      if (Platform.OS !== 'web') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Permission to access camera roll is required!');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
          await uploadProfilePicture(result.assets[0]);
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            if (file.size > 500 * 1024) {
              Alert.alert('Error', 'Image size should be less than 500KB');
              return;
            }
            
            const reader = new FileReader();
            reader.onload = async (event) => {
              const imageUri = event.target?.result as string;
              setProfileImage(imageUri);
              await uploadProfilePicture(file);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfilePicture = async (imageAsset) => {
    if (!token || !user?._id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setUploadingPhoto(true);
    try {
      let base64Image = '';
      let mimeType = 'image/jpeg';
      
      if (Platform.OS === 'web') {
        const file = imageAsset;
        if (file.size > 500 * 1024) {
          throw new Error('Image size should be less than 500KB');
        }
        
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
        mimeType = file.type || 'image/jpeg';
      } else {
        const fileUri = imageAsset.uri;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (fileInfo.size && fileInfo.size > 500 * 1024) {
          throw new Error('Image size should be less than 500KB');
        }
        
        base64Image = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        mimeType = imageAsset.type || 'image/jpeg';
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/edit/${user.membershipID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passport_photo: base64Image,
          photo_mime_type: mimeType,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to upload profile picture');
      }

      setProfileImage(`data:${mimeType};base64,${base64Image}`);
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.full_name || !formData.email || !formData.phone_number) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!token || !user?.membershipID) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        emergency_contact: formData.emergency_contact,
        age: formData.age ? parseInt(formData.age) : 0,
        gender: formData.gender,
        pincode: formData.pincode,
        health_condition: formData.health_condition || 'Normal',
        address: formData.address
      };

      if (profileImage && profileImage.startsWith('data:')) {
        payload.passport_photo = profileImage.split(',')[1];
        payload.photo_mime_type = profileImage.split(';')[0].split(':')[1];
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/edit/${user.membershipID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update profile');
      }
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusIcon = (status = 'pending') => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'completed': 
      case 'paid': 
        return <CheckCircle size={16} color="#22C55E" />;
      case 'pending': 
        return <Clock size={16} color="#F59E0B" />;
      case 'failed': 
      case 'rejected':
        return <XCircle size={16} color="#EF4444" />;
      default: 
        return <Clock size={16} color="#6B7280" />;
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

  const handleDownloadInvoice = async (payment: Payment) => {
    const normalizedStatus = payment.status.toLowerCase();
    if (normalizedStatus !== 'completed' && normalizedStatus !== 'paid') {
      Alert.alert('Error', 'Invoice is only available for completed payments');
      return;
    }

    setDownloadingInvoice(payment.id);
    try {
      const htmlContent = generateInvoiceHTML(payment);
      const { uri } = await Print.printToFileAsync({ html: htmlContent, width: 612, height: 792 });

      const fileName = `Invoice_${payment.invoice_number}_${Date.now()}.pdf`;
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
    profileSection: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    profileImagePlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileImageText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.primary,
      borderRadius: 16,
      padding: 6,
      borderWidth: 2,
      borderColor: theme.surface,
    },
    profileName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    profileId: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    changePhotoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    changePhotoText: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
    formSection: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 6,
    },
    requiredLabel: {
      color: theme.error,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    genderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    genderButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    genderButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    genderButtonText: {
      fontSize: 14,
      color: theme.text,
    },
    genderButtonTextActive: {
      color: 'white',
    },
    saveButton: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonDisabled: {
      backgroundColor: theme.border,
      shadowOpacity: 0,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 8,
      letterSpacing: 0.5,
    },
    loadingIndicator: {
      marginRight: 8,
    },
    paymentHistoryButton: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    paymentHistoryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 12,
    },
    paymentHistoryContent: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 10,
      color: theme.textSecondary,
    },
    filtersContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterButtonText: {
      color: theme.text,
      marginLeft: 6,
      fontSize: 12,
    },
    paymentCard: {
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    paymentInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    memberEmail: {
      fontSize: 10,
      color: theme.textSecondary,
      marginTop: 2,
    },
    paymentAmount: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.primary,
    },
    paymentDetails: {
      marginBottom: 8,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      flex: 1,
    },
    detailValue: {
      fontSize: 12,
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
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
      textTransform: 'capitalize',
    },
    invoiceActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    invoiceInfo: {
      flex: 1,
    },
    invoiceNumber: {
      fontSize: 10,
      color: theme.textSecondary,
    },
    transactionId: {
      fontSize: 8,
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
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginLeft: 6,
    },
    actionButtonDisabled: {
      backgroundColor: theme.border,
    },
    actionButtonText: {
      fontSize: 10,
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
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg' }}
          style={styles.headerBackground}
          resizeMode="cover"
        />
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your personal information</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleImagePicker}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Camera size={12} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{formData.full_name || 'User Name'}</Text>
          <Text style={styles.profileId}>ID: {user?.membershipID || 'N/A'}</Text>
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={handleImagePicker}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Camera size={12} color={theme.primary} />
            )}
            <Text style={styles.changePhotoText}>
              {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment History Button */}
        <TouchableOpacity
          style={styles.paymentHistoryButton}
          onPress={() => {
            if (!showPaymentHistory) {
              loadPaymentHistory();
            }
            setShowPaymentHistory(!showPaymentHistory);
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CreditCard size={20} color={theme.primary} />
            <Text style={styles.paymentHistoryButtonText}>Payment History</Text>
          </View>
          <Text style={{ color: theme.textSecondary }}>
            {showPaymentHistory ? '−' : '+'}
          </Text>
        </TouchableOpacity>

        {/* Payment History Content */}
        {showPaymentHistory && (
          <View style={styles.paymentHistoryContent}>
            {paymentLoading ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : (
              <>
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
                    <Filter size={12} color={theme.text} />
                    <Text style={styles.filterButtonText}>
                      {selectedFilter === 'all' ? 'All Payments' : selectedFilter}
                    </Text>
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
                            <Download size={10} color={
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
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Personal Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <User size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textSecondary}
                value={formData.full_name}
                onChangeText={(text) => updateField('full_name', text)}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Email Address <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Mail size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Phone size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.textSecondary}
                value={formData.phone_number}
                onChangeText={(text) => updateField('phone_number', text)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Emergency Contact</Text>
            <View style={styles.inputContainer}>
              <Phone size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Emergency contact number"
                placeholderTextColor={theme.textSecondary}
                value={formData.emergency_contact}
                onChangeText={(text) => updateField('emergency_contact', text)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Age</Text>
            <View style={styles.inputContainer}>
              <Calendar size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                placeholderTextColor={theme.textSecondary}
                value={formData.age}
                onChangeText={(text) => updateField('age', text)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    formData.gender === gender && styles.genderButtonActive,
                  ]}
                  onPress={() => updateField('gender', gender)}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === gender && styles.genderButtonTextActive,
                    ]}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <MapPin size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Enter your address"
                placeholderTextColor={theme.textSecondary}
                value={formData.address}
                onChangeText={(text) => updateField('address', text)}
                multiline
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pincode</Text>
            <View style={styles.inputContainer}>
              <MapPin size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter pincode"
                placeholderTextColor={theme.textSecondary}
                value={formData.pincode}
                onChangeText={(text) => updateField('pincode', text)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Health Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Health Condition</Text>
            <View style={styles.inputContainer}>
              <Heart size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Any health conditions or allergies"
                placeholderTextColor={theme.textSecondary}
                value={formData.health_condition}
                onChangeText={(text) => updateField('health_condition', text)}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={loading}
        >
          {loading && (
            <ActivityIndicator size="small" color="white" style={styles.loadingIndicator} />
          )}
          <Save size={16} color="white" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
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
