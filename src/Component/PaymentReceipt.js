import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import RNShare from 'react-native-share';
import RNFS from 'react-native-fs';
import SimpleToast from 'react-native-simple-toast';
import Typography from './UI/Typography';
import { Font } from '../Constants/Font';
import moment from 'moment';

const PaymentReceipt = ({ visible, onClose, paymentData, userDetails }) => {
  const viewShotRef = useRef();
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!paymentData) return null;

  const amount = Number(paymentData?.net_salary ?? paymentData?.amount ?? 0);
  const baseSalary = Number(
    paymentData?.salary_breakdown?.base_salary ?? paymentData?.basic_salary ?? 0,
  );
  const bonus = Number(
    paymentData?.salary_breakdown?.performance_bonus ??
      paymentData?.performative_allowance ??
      0,
  );
  const overtimePay = Number(
    paymentData?.salary_breakdown?.overtime_pay ??
      paymentData?.over_time_allowance ??
      0,
  );
  const taxDeduction = Number(
    paymentData?.salary_breakdown?.tax_deduction ?? paymentData?.tax ?? 0,
  );
  const advancePayment = Number(
    paymentData?.salary_breakdown?.advance_payment ??
      paymentData?.advance_payment ??
      0,
  );
  const staffName =
    paymentData?.staff_member?.name ??
    paymentData?.processed_by?.name ??
    'N/A';
  const paymentDate = paymentData?.created_at
    ? moment(paymentData.created_at).format('DD MMM YYYY, hh:mm A')
    : moment().format('DD MMM YYYY, hh:mm A');
  const paymentId =
    paymentData?.payment_id ?? paymentData?.id ?? paymentData?.salary_id ?? '--';
  const paymentMethod =
    paymentData?.payment_mode ?? paymentData?.payment_method ?? 'Cash';
  const status = paymentData?.status ?? 'Paid';

  const captureReceipt = async () => {
    try {
      const uri = await viewShotRef.current.capture({
        format: 'png',
        quality: 1,
      });
      return uri;
    } catch (error) {
      console.log('Capture error:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsSaving(true);
    try {
      const uri = await captureReceipt();
      if (!uri) {
        SimpleToast.show('Failed to capture receipt', SimpleToast.SHORT);
        setIsSaving(false);
        return;
      }

      const fileName = `Sahayya_Receipt_${paymentId}_${Date.now()}.png`;
      const downloadDir =
        Platform.OS === 'android'
          ? RNFS.DownloadDirectoryPath
          : RNFS.DocumentDirectoryPath;
      const destPath = `${downloadDir}/${fileName}`;

      await RNFS.copyFile(uri, destPath);

      if (Platform.OS === 'android') {
        await RNFS.scanFile(destPath);
      }

      setIsSaving(false);
      SimpleToast.show('Receipt saved to Downloads!', SimpleToast.SHORT);
    } catch (error) {
      console.log('Download error:', error);
      SimpleToast.show('Failed to save receipt', SimpleToast.SHORT);
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const uri = await captureReceipt();
      if (!uri) {
        SimpleToast.show('Failed to capture receipt', SimpleToast.SHORT);
        setIsSharing(false);
        return;
      }

      // Read captured image as base64 for reliable sharing across all apps
      const filePath = uri.replace('file://', '');
      const base64Data = await RNFS.readFile(filePath, 'base64');
      const base64Image = `data:image/png;base64,${base64Data}`;

      await RNShare.open({
        title: 'Sahayya Payment Receipt',
        message: `Payment Receipt - ${staffName} - ₹${amount.toFixed(2)}`,
        url: base64Image,
        type: 'image/png',
        subject: 'Sahayya Payment Receipt',
        filename: `Sahayya_Receipt_${paymentId}`,
      });
    } catch (error) {
      if (error?.message !== 'User did not share') {
        console.log('Share error:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Typography type={Font.Poppins_SemiBold} style={styles.closeBtnText}>
              X
            </Typography>
          </TouchableOpacity>

          {/* Capturable receipt area */}
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1 }}
            style={styles.receiptContainer}
          >
            <View style={styles.receipt}>
              {/* Header */}
              <View style={styles.receiptHeader}>
                <Typography
                  type={Font.Poppins_Bold}
                  style={styles.receiptTitle}
                >
                  SAHAYYA
                </Typography>
                <Typography
                  type={Font.Poppins_Regular}
                  style={styles.receiptSubtitle}
                >
                  Payment Receipt
                </Typography>
              </View>

              {/* Divider */}
              <View style={styles.dashedLine} />

              {/* Status badge */}
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        status?.toLowerCase() === 'paid' ? '#E8F5E9' : '#FFF3E0',
                    },
                  ]}
                >
                  <Typography
                    type={Font.Poppins_SemiBold}
                    style={[
                      styles.statusText,
                      {
                        color:
                          status?.toLowerCase() === 'paid'
                            ? '#2E7D32'
                            : '#E65100',
                      },
                    ]}
                  >
                    {status?.toUpperCase()}
                  </Typography>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.amountSection}>
                <Typography
                  type={Font.Poppins_Regular}
                  style={styles.amountLabel}
                >
                  Total Amount
                </Typography>
                <Typography
                  type={Font.Poppins_Bold}
                  style={styles.amountValue}
                >
                  ₹{amount.toFixed(2)}
                </Typography>
              </View>

              {/* Divider */}
              <View style={styles.dashedLine} />

              {/* Payment Info */}
              <View style={styles.infoSection}>
                <InfoRow label="Receipt No" value={`#${paymentId}`} />
                <InfoRow label="Date" value={paymentDate} />
                <InfoRow label="Staff Name" value={staffName} />
                <InfoRow label="Payment Method" value={paymentMethod} />
                {userDetails?.name && (
                  <InfoRow label="Paid By" value={userDetails.name} />
                )}
              </View>

              {/* Divider */}
              <View style={styles.dashedLine} />

              {/* Salary Breakdown */}
              <View style={styles.breakdownSection}>
                <Typography
                  type={Font.Poppins_SemiBold}
                  style={styles.breakdownTitle}
                >
                  Salary Breakdown
                </Typography>
                <BreakdownRow label="Base Salary" value={baseSalary} positive />
                {bonus > 0 && (
                  <BreakdownRow
                    label="Performance Bonus"
                    value={bonus}
                    positive
                  />
                )}
                {overtimePay > 0 && (
                  <BreakdownRow
                    label="Overtime Pay"
                    value={overtimePay}
                    positive
                  />
                )}
                {taxDeduction > 0 && (
                  <BreakdownRow label="Tax Deduction" value={taxDeduction} />
                )}
                {advancePayment > 0 && (
                  <BreakdownRow
                    label="Advance Payment"
                    value={advancePayment}
                  />
                )}
                <View style={styles.totalLine} />
                <View style={styles.totalRow}>
                  <Typography
                    type={Font.Poppins_SemiBold}
                    style={styles.totalLabel}
                  >
                    Net Salary
                  </Typography>
                  <Typography
                    type={Font.Poppins_Bold}
                    style={styles.totalValue}
                  >
                    ₹{amount.toFixed(2)}
                  </Typography>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.receiptFooter}>
                <Typography
                  type={Font.Poppins_Regular}
                  style={styles.footerText}
                >
                  Generated by Sahayya App
                </Typography>
                <Typography
                  type={Font.Poppins_Regular}
                  style={styles.footerText}
                >
                  {moment().format('DD MMM YYYY, hh:mm A')}
                </Typography>
              </View>
            </View>
          </ViewShot>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={handleDownload}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Typography
                  type={Font.Poppins_SemiBold}
                  style={styles.btnText}
                >
                  Download
                </Typography>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Typography
                  type={Font.Poppins_SemiBold}
                  style={styles.btnText}
                >
                  Share
                </Typography>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Typography type={Font.Poppins_Regular} style={styles.infoLabel}>
      {label}
    </Typography>
    <Typography type={Font.Poppins_SemiBold} style={styles.infoValue}>
      {value}
    </Typography>
  </View>
);

const BreakdownRow = ({ label, value, positive }) => (
  <View style={styles.breakdownRow}>
    <Typography type={Font.Poppins_Regular} style={styles.breakdownLabel}>
      {label}
    </Typography>
    <Typography
      type={Font.Poppins_SemiBold}
      style={[
        styles.breakdownValue,
        { color: positive ? '#333' : '#D98579' },
      ]}
    >
      {positive ? '+' : '-'}₹{Number(value).toFixed(2)}
    </Typography>
  </View>
);

export default PaymentReceipt;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    maxHeight: '90%',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 14,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#333',
  },
  receiptContainer: {
    backgroundColor: '#fff',
  },
  receipt: {
    padding: 20,
    backgroundColor: '#fff',
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  receiptTitle: {
    fontSize: 22,
    color: '#D98579',
    letterSpacing: 2,
  },
  receiptSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ddd',
    marginVertical: 12,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  amountSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  amountLabel: {
    fontSize: 12,
    color: '#888',
  },
  amountValue: {
    fontSize: 28,
    color: '#333',
    marginTop: 2,
  },
  infoSection: {
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },
  breakdownSection: {
    marginVertical: 4,
  },
  breakdownTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 12,
  },
  totalLine: {
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 8,
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    color: '#D98579',
  },
  receiptFooter: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  footerText: {
    fontSize: 10,
    color: '#aaa',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  downloadBtn: {
    flex: 1,
    backgroundColor: '#D98579',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
  },
});
