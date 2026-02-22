import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Modal,
} from 'react-native';
import CommanView from '../../../Component/CommanView';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import HeaderForUser from '../../../Component/HeaderForUser';
import { ImageConstant } from '../../../Constants/ImageConstant';
import LocalizedStrings from '../../../Constants/localization';
import SimpleToast from 'react-native-simple-toast';
import Button from '../../../Component/Button';
// SimpleModal replaced with full-screen Modal
import DropdownComponent from '../../../Component/DropdownComponent';
import Input from '../../../Component/Input';
import UploadBox from '../../../Component/UploadBox';
import { POST_FORM_DATA, API } from '../../../Backend/Backend';
import { BlacklistAdd, BlacklistReport, ReviewStore } from '../../../Backend/api_routes';
import { launchImageLibrary } from 'react-native-image-picker';

const terminationReasons = [
  { label: 'No longer required', value: 'no_longer_required' },
  { label: 'Poor performance', value: 'poor_performance' },
  { label: 'Misbehavior', value: 'misbehavior' },
  { label: 'Theft', value: 'theft' },
  { label: 'Attendance issues', value: 'attendance_issues' },
  { label: 'Other', value: 'other' },
];

const getProfileImage = (img) => {
  if (!img || img.includes('noimage')) return null;
  if (img.startsWith('http')) return img;
  const baseUrl = API.replace('/api/', '');
  return `${baseUrl}${img}`;
};

const HouseHoldStaffProfile = ({ navigation, route }) => {
  const data = route?.params?.item;
  const profileImageUrl = getProfileImage(data?.image);

  const [modalMode, setModalMode] = useState(null);
  const [reason, setReason] = useState(null);
  const [rating, setRating] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [policeStationName, setPoliceStationName] = useState('');
  const [policeStationContact, setPoliceStationContact] = useState('');
  const [policeStationAddress, setPoliceStationAddress] = useState('');
  const [firPhoto, setFirPhoto] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const maskAadhar = num => num ? num.replace(/\d(?=\d{4})/g, 'x') : '';

  const openWhatsApp = async number => {
    if (!number) {
      SimpleToast.show('Phone number not available', SimpleToast.SHORT);
      return;
    }
    const phone = number.replace(/\D/g, '');
    const url = `whatsapp://send?phone=91${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      SimpleToast.show('WhatsApp not installed', SimpleToast.SHORT);
      return;
    }
    Linking.openURL(url);
  };

  const handleCall = number => {
    if (!number) {
      SimpleToast.show('Phone number not available', SimpleToast.SHORT);
      return;
    }
    Linking.openURL(`tel:+91${number}`);
  };

  const resetModal = () => {
    setModalMode(null);
    setReason(null);
    setRating(0);
    setRemarks('');
    setPoliceStationName('');
    setPoliceStationContact('');
    setPoliceStationAddress('');
    setFirPhoto(null);
    setSubmitLoading(false);
  };

  const handlePickFirPhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        return;
      } else if (response.errorMessage) {
        SimpleToast.show('Error picking image', SimpleToast.SHORT);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setFirPhoto({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `fir_photo_${Date.now()}.jpg`,
          path: asset.uri,
        });
      }
    });
  };

  const submitReview = () => {
    if (rating <= 0) return;
    const formData = new FormData();
    formData.append('staff_id', data?.id);
    formData.append('rating', rating);
    if (remarks) formData.append('review', remarks);
    POST_FORM_DATA(ReviewStore, formData);
  };

  const handleSubmitTerminate = () => {
    if (!reason) {
      SimpleToast.show('Please select a reason', SimpleToast.SHORT);
      return;
    }
    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('staff_id', data?.id);
    formData.append('reason', reason);
    if (remarks) formData.append('remarks', remarks);

    if (rating > 0) submitReview();

    POST_FORM_DATA(
      BlacklistAdd,
      formData,
      res => {
        setSubmitLoading(false);
        SimpleToast.show('Employee removed successfully', SimpleToast.SHORT);
        resetModal();
        navigation.goBack();
      },
      err => {
        setSubmitLoading(false);
        SimpleToast.show(
          err?.data?.message || 'Something went wrong',
          SimpleToast.SHORT,
        );
      },
      () => {
        setSubmitLoading(false);
      },
    );
  };

  const handleSubmitReport = () => {
    if (!reason) {
      SimpleToast.show('Please select a reason', SimpleToast.SHORT);
      return;
    }
    if (!policeStationName) {
      SimpleToast.show('Please enter police station name', SimpleToast.SHORT);
      return;
    }
    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('staff_id', data?.id);
    formData.append('reason', reason);
    if (remarks) formData.append('remarks', remarks);
    formData.append('police_station_name', policeStationName);
    if (policeStationContact) formData.append('police_station_contact', policeStationContact);
    if (policeStationAddress) formData.append('police_station_address', policeStationAddress);
    if (firPhoto) {
      formData.append('fir_photo', {
        uri: firPhoto.uri,
        type: firPhoto.type,
        name: firPhoto.name,
      });
    }

    if (rating > 0) submitReview();

    POST_FORM_DATA(
      BlacklistReport,
      formData,
      res => {
        setSubmitLoading(false);
        SimpleToast.show('Employee reported & removed successfully', SimpleToast.SHORT);
        resetModal();
        navigation.goBack();
      },
      err => {
        setSubmitLoading(false);
        SimpleToast.show(
          err?.data?.message || 'Something went wrong',
          SimpleToast.SHORT,
        );
      },
      () => {
        setSubmitLoading(false);
      },
    );
  };

  console.log('data------', data);

  return (
    <CommanView>
      <HeaderForUser
        title={LocalizedStrings.StaffProfile.title}
        source_logo={ImageConstant?.notification}
        style_title={styles.headerTitle}
        onPressRightIcon={() => navigation.navigate('Notification')}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation?.goBack()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <Image
            source={profileImageUrl ? { uri: profileImageUrl } : ImageConstant.user}
            style={styles.profileImage}
          />
          <Typography style={styles.name} size={22}>
            {data?.name}
          </Typography>
          <Typography style={styles.role}>
            {data?.user_work_info?.primary_role}
          </Typography>

          <View style={styles.flexRow}>
            <Image source={ImageConstant.phone} style={styles.icon} />
            <Typography style={styles.info}>
              {data?.phone_number_prefix} {data?.phone_number}
            </Typography>
          </View>
          <View style={styles.flexRow}>
            <Image source={ImageConstant.Location} style={styles.icon} />
            <Typography style={styles.info}>
              {data?.addresses?.[0]?.city || data?.location || 'Not Available'} {data?.addresses?.[0]?.state || ''}
            </Typography>
          </View>
          <View style={styles.flexRow}>
            <Image source={ImageConstant.mail} style={styles.icon} />
            <Typography style={styles.info}>{data?.email}</Typography>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleCall(data?.phone_number)}
            >
              <Image source={ImageConstant.phone} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => openWhatsApp(data?.phone_number)}
            >
              <Image source={ImageConstant.WhatsApp} style={styles.icon} />
            </TouchableOpacity>
          </View>
          <Button
            onPress={() => navigation.navigate('AttendanceScreen')}
            style={styles.attendanceBtn}
            title={'Attendance Statistics'}
            main_style={styles.attendanceBtnMain}
          />
        </View>
        <View style={styles.card}>
          <Typography style={styles.cardTitle}>
            {LocalizedStrings.StaffProfile.Personal_Information}
          </Typography>
          <View style={styles.row}>
            <Image source={ImageConstant.date} style={styles.icon} />
            <View style={styles.textBox}>
              <Typography style={styles.label}>
                {LocalizedStrings.StaffProfile.Date_of_Birth}
              </Typography>
              <Typography style={styles.value}>{data?.dob}</Typography>
            </View>
          </View>
          <View style={styles.row}>
            <Image source={ImageConstant.person} style={styles.icon} />
            <View style={styles.textBox}>
              <Typography style={styles.label}>
                {LocalizedStrings.StaffProfile.Gender}
              </Typography>
              <Typography style={styles.value}>{data?.gender}</Typography>
            </View>
          </View>
          <View style={styles.rowNoBorder}>
            <Image source={ImageConstant.phone} style={styles.icon} />
            <View style={styles.textBox}>
              <Typography style={styles.label}>
                {LocalizedStrings.StaffProfile.Emergency_Contact}
              </Typography>
              <Typography style={styles.value}>
                +91 {data?.added_by_user?.phone_number}
              </Typography>
            </View>
          </View>
        </View>

        {data?.user_work_info && (
          <View style={styles.card}>
            <Typography style={styles.cardTitle}>
              Work Information
            </Typography>
            {data?.user_work_info?.primary_role && (
              <View style={styles.row}>
                <Image source={ImageConstant.Briefcase} style={styles.icon} />
                <View style={styles.textBox}>
                  <Typography style={styles.label}>Role</Typography>
                  <Typography style={styles.value}>
                    {Array.isArray(data.user_work_info.primary_role)
                      ? data.user_work_info.primary_role.join(', ')
                      : data.user_work_info.primary_role}
                  </Typography>
                </View>
              </View>
            )}
            {data?.user_work_info?.salary && (
              <View style={styles.row}>
                <Image source={ImageConstant.Dollar} style={styles.icon} />
                <View style={styles.textBox}>
                  <Typography style={styles.label}>Salary</Typography>
                  <Typography style={styles.value}>
                    ₹{Number(data.user_work_info.salary).toLocaleString('en-IN')}
                  </Typography>
                </View>
              </View>
            )}
            {data?.user_work_info?.pay_frequency && (
              <View style={styles.row}>
                <Image source={ImageConstant.Calendar} style={styles.icon} />
                <View style={styles.textBox}>
                  <Typography style={styles.label}>Pay Frequency</Typography>
                  <Typography style={[styles.value, { textTransform: 'capitalize' }]}>
                    {data.user_work_info.pay_frequency}
                  </Typography>
                </View>
              </View>
            )}
            {data?.user_work_info?.working_days && (
              <View style={styles.row}>
                <Image source={ImageConstant.Calendar} style={styles.icon} />
                <View style={styles.textBox}>
                  <Typography style={styles.label}>Working Days</Typography>
                  <Typography style={styles.value}>
                    {Array.isArray(data.user_work_info.working_days)
                      ? data.user_work_info.working_days.join(', ')
                      : data.user_work_info.working_days}
                  </Typography>
                </View>
              </View>
            )}
            {data?.user_work_info?.joining_date && (
              <View style={styles.rowNoBorder}>
                <Image source={ImageConstant.Calendar} style={styles.icon} />
                <View style={styles.textBox}>
                  <Typography style={styles.label}>Joining Date</Typography>
                  <Typography style={styles.value}>
                    {data.user_work_info.joining_date}
                  </Typography>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Typography style={styles.cardTitle}>
            {LocalizedStrings.StaffProfile.Aadhaar_Details}
          </Typography>
          <View style={styles.row}>
            <Image source={ImageConstant.hash} style={styles.icon} />
            <View style={styles.textBox}>
              <Typography style={styles.label}>
                {LocalizedStrings.StaffProfile.Aadhaar_Number}
              </Typography>
              <Typography style={styles.value}>
                {maskAadhar(data?.aadhar_number)}
              </Typography>
            </View>
          </View>
          <View style={styles.row}>
            <Image source={ImageConstant.person} style={styles.icon} />
            <View style={styles.textBox}>
              <Typography style={styles.label}>
                {LocalizedStrings.StaffProfile.Aadhaar_Name}
              </Typography>
              <Typography style={styles.value}>{data?.name}</Typography>
            </View>
          </View>
          <View style={styles.rowNoBorder}>
            <Image source={ImageConstant.Calendar} style={styles.icon} />
            <View style={styles.textBox}>
              <Typography style={styles.label}>
                {LocalizedStrings.StaffProfile.Issued_By}
              </Typography>
              <Typography style={styles.value}>UIDAI</Typography>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Typography style={styles.cardTitle}>
            {LocalizedStrings.StaffProfile.Residential_Address}
          </Typography>
          {[
            {
              label: LocalizedStrings.StaffProfile.Street,
              value: data?.addresses?.[0]?.street || '',
            },
            {
              label: LocalizedStrings.StaffProfile.Locality,
              value: data?.addresses?.[0]?.city || '',
            },
            {
              label: LocalizedStrings.StaffProfile.City,
              value: data?.addresses?.[0]?.city || '',
            },
            {
              label: LocalizedStrings.StaffProfile.State,
              value: data?.addresses?.[0]?.state || '',
            },
            {
              label: LocalizedStrings.StaffProfile.Pincode,
              value: data?.addresses?.[0]?.pincode || '',
            },
          ].map((item, idx, arr) => (
            <View
              key={item.label}
              style={idx === arr.length - 1 ? styles.rowNoBorder : styles.row}
            >
              <Image source={ImageConstant.Location} style={styles.icon} />
              <View style={styles.textBox}>
                <Typography style={styles.label}>{item.label}</Typography>
                <Typography style={styles.value}>{item.value}</Typography>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Typography style={styles.cardTitle}>
            {LocalizedStrings.StaffProfile.KYC_Status}
          </Typography>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              borderBottomWidth: 0.2,
              borderBottomColor: '#EBEBEA',
              paddingBottom: 20,
            }}
          >
            <Image source={ImageConstant.Verify} style={styles.icon} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '88%',
              }}
            >
              <Typography style={[styles.label, { color: 'black' }]}>
                {LocalizedStrings.NewStaffForm.Aadhaar_Card_Details ||
                  'Aadhaar Card'}
              </Typography>
              <View
                style={[
                  styles.kycBadge,
                  {
                    backgroundColor:
                      data?.aadhar__verify == 1 ? '#E6F7EC' : '#FEF9C3',
                  },
                ]}
              >
                <Typography
                  style={[
                    styles.kycText,
                    {
                      color: data?.aadhar__verify == 1 ? '#28A745' : '#854D0E',
                    },
                  ]}
                >
                  {data?.aadhar__verify == 1
                    ? LocalizedStrings.FindStaff.Verified || 'Verified'
                    : LocalizedStrings.LeaveApplications.Pending || 'Pending'}
                </Typography>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <Image source={ImageConstant.lines} style={styles.icon} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '88%',
              }}
            >
              <Typography style={[styles.label, { color: 'black' }]}>
                {LocalizedStrings.FindStaff.Police_Verification ||
                  'Police Verification'}
              </Typography>
              <View
                style={[
                  styles.kycBadge,
                  {
                    backgroundColor:
                      data?.aadhar__verify == 1 ? '#E6F7EC' : '#FEF9C3',
                  },
                ]}
              >
                <Typography
                  style={[
                    styles.kycText,
                    {
                      color: data?.aadhar__verify == 1 ? '#28A745' : '#854D0E',
                    },
                  ]}
                >
                  {LocalizedStrings.LeaveApplications.Pending || 'Pending'}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionBorder]}
            onPress={() => setModalMode('terminate')}>
            <Typography style={styles.actionButtonText}>
              Remove/Terminate Employee
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionBorder, styles.mt12]}
            onPress={() => setModalMode('report')}>
            <Typography style={[styles.actionButtonText, { color: '#C77166' }]}>
              Report & Remove Employee
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalMode !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={resetModal}
      >
        <View style={styles.fullModalContainer}>
          <View style={styles.fullModalHeader}>
            <TouchableOpacity onPress={resetModal} style={styles.fullModalBackBtn}>
              <Image source={ImageConstant?.BackArrow} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
            </TouchableOpacity>
            <Typography type={Font.Poppins_SemiBold} size={18} style={{ flex: 1, textAlign: 'center', marginRight: 32 }}>
              {modalMode === 'report'
                ? 'Report & Remove Employee'
                : 'Remove/Terminate Employee'}
            </Typography>
          </View>

          <ScrollView
            contentContainerStyle={styles.fullModalScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalProfileCard}>
              <Image
                source={profileImageUrl ? { uri: profileImageUrl } : ImageConstant.user}
                style={styles.modalProfileImage}
              />
              <View style={styles.modalProfileText}>
                <Typography type={Font.Poppins_SemiBold} size={16}>
                  {data?.name}
                </Typography>
                <Typography type={Font.Poppins_Regular} size={13} color="#666">
                  {data?.user_work_info?.primary_role}
                </Typography>
              </View>
            </View>

            <View style={styles.fullModalCard}>
              <DropdownComponent
                title="Reason for termination"
                data={terminationReasons}
                value={reason}
                onChange={item => setReason(item.value)}
                style_dropdown={styles.dropdown}
                style_title={styles.dropdownTitle}
                marginHorizontal={0}
                placeholder="Select a reason"
              />

              <Typography
                type={Font.Poppins_Medium}
                size={15}
                style={{ marginTop: 16, marginBottom: 8 }}>
                Rate this employee
              </Typography>
              <View style={styles.modalRatingRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Typography style={[styles.starText, { color: star <= rating ? '#F5A623' : '#ccc' }]}>
                      {star <= rating ? '\u2605' : '\u2606'}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                title="Remarks"
                placeholder="Enter your remarks (optional)"
                value={remarks}
                onChange={setRemarks}
                multiline
                numberOfLines={3}
                style_inputContainer={{ height: 80 }}
                mainStyle={{ marginVertical: 5 }}
              />
            </View>

            {modalMode === 'report' && (
              <View style={styles.fullModalCard}>
                <Typography type={Font.Poppins_SemiBold} size={16} style={{ marginBottom: 12 }}>
                  Police Station Details
                </Typography>
                <Input
                  title="Police Station Name"
                  placeholder="Enter police station name"
                  value={policeStationName}
                  onChange={setPoliceStationName}
                  style_inputContainer={styles.input}
                  mainStyle={{ marginVertical: 5 }}
                />
                <Input
                  title="Contact Number"
                  placeholder="Enter contact number"
                  value={policeStationContact}
                  onChange={setPoliceStationContact}
                  keyboardType="phone-pad"
                  style_inputContainer={styles.input}
                  mainStyle={{ marginVertical: 5 }}
                />
                <Input
                  title="Police Station Address"
                  placeholder="Enter address"
                  value={policeStationAddress}
                  onChange={setPoliceStationAddress}
                  multiline
                  numberOfLines={2}
                  style_inputContainer={{ height: 70 }}
                  mainStyle={{ marginVertical: 5 }}
                />

                <Typography
                  type={Font.Poppins_Medium}
                  size={15}
                  style={{ marginTop: 12, marginBottom: 8 }}>
                  FIR Photo (optional)
                </Typography>
                <UploadBox
                  title="Upload FIR Photo"
                  onPress={handlePickFirPhoto}
                  image={firPhoto}
                />
              </View>
            )}

            <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
              <Button
                onPress={
                  modalMode === 'report'
                    ? handleSubmitReport
                    : handleSubmitTerminate
                }
                title={modalMode === 'report' ? 'Report & Remove' : 'Confirm Termination'}
                loader={submitLoading}
                main_style={styles.modalActionBtn}
                linerColor={
                  modalMode === 'report'
                    ? ['#C77166', '#C77166']
                    : ['#D98579', '#D98579']
                }
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </CommanView>
  );
};

export default HouseHoldStaffProfile;

const styles = StyleSheet.create({
  container: { paddingVertical: 16 },
  headerTitle: { fontSize: 18 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EBEBEA',
  },
  profileImage: {
    height: 90,
    width: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontFamily: Font.Poppins_Bold,
    marginBottom: 2,
  },
  role: {
    fontFamily: Font.Poppins_Regular,
    color: '#666',
    marginBottom: 12,
  },
  info: {
    fontFamily: Font.Poppins_Medium,
    fontSize: 15,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    width: '80%',
  },
  icon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    marginRight: 10,
    tintColor: '#8C8D8B',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginVertical: 12,
  },
  iconBtn: {
    backgroundColor: '#f2f2f2',
    width: '47%',
    height: 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D98579',
    alignItems: 'center',
    justifyContent: 'center',
  },
  findStaffBtn: { height: 42 },
  findStaffMain: {
    width: '92%',
    marginTop: 10,
  },
  attendanceBtn: { height: 42 },
  attendanceBtnMain: {
    width: '92%',
    marginTop: 5,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBEBEA',
  },
  cardTitle: {
    fontFamily: Font.Poppins_Bold,
    fontSize: 18,
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#EBEBEA',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EBEBEA',
  },
  rowNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  textBox: { marginLeft: 10 },
  label: {
    fontFamily: Font.Poppins_Regular,
    fontSize: 13,
    color: '#888',
  },
  value: {
    fontFamily: Font.Poppins_SemiBold,
    fontSize: 14,
    marginTop: 2,
  },
  professionalBox: { paddingVertical: 15 },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noBorder: {
    borderColor: 'white',
    marginBottom: 0,
  },
  kycBadge: {
    backgroundColor: '#E6F7EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  kycText: {
    color: '#28A745',
    fontFamily: Font.Poppins_Medium,
  },

  actionFooter: {
    marginTop: 20,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBorder: {
    borderColor: '#EBEBEA',
    borderWidth: 2,
  },
  mt12: { marginTop: 12 },
  actionButtonText: {
    color: '#8C8D8B',
    fontSize: 16,
    fontWeight: '600',
  },

  fullModalContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  fullModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEA',
    paddingTop: 40,
  },
  fullModalBackBtn: {
    padding: 4,
    marginRight: 8,
  },
  fullModalScroll: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  fullModalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBEBEA',
  },
  modalProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBEBEA',
  },
  modalProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modalProfileText: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  dropdown: {
    marginHorizontal: 0,
    height: 43,
  },
  dropdownText: {
    marginLeft: 10,
    fontFamily: Font.Poppins_Regular,
  },
  dropdownTitle: {
    textAlign: 'left',
    fontFamily: Font.Poppins_Regular,
  },
  modalRatingRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  starText: {
    fontSize: 32,
    marginRight: 4,
  },
  input: { height: 43 },
  uploadSection: {
    marginTop: 10,
  },
  modalActionBtn: {
    marginTop: 20,
    width: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 50,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#C77166',
    paddingHorizontal: 5,
  },
});
