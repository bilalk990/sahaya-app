import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import CommanView from '../../../Component/CommanView';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import HeaderForUser from '../../../Component/HeaderForUser';
import { ImageConstant } from '../../../Constants/ImageConstant';
import LocalizedStrings from '../../../Constants/localization';
import SimpleToast from 'react-native-simple-toast';
import Button from '../../../Component/Button';

const HouseHoldStaffProfile = ({ navigation, route }) => {
  const data = route?.params?.item;
  const maskAadhar = num => num.replace(/\d(?=\d{4})/g, 'x');
  const openWhatsApp = async number => {
    const phone = number.replace(/\D/g, '');
    const url = `whatsapp://send?phone=${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      SimpleToast.show('WhatsApp not installed');
      return;
    }
    Linking.openURL(url);
  };
  console.log('data------',data);
  
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
          <Image source={{ uri: data?.image }} style={styles.profileImage} />
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
              {/* {data?.addresses[0]?.street}  */}
              {data?.addresses[0]?.city} {data?.addresses[0]?.state}
            </Typography>
          </View>
          <View style={styles.flexRow}>
            <Image source={ImageConstant.mail} style={styles.icon} />
            <Typography style={styles.info}>{data?.email}</Typography>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => Linking.openURL(`tel:${data?.phone_number}`)}
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
          {/* <Button
            onPress={() => navigation.navigate('NewStaffFrom', { item: data })}
            style={styles.findStaffBtn}
            title={'Edit'}
            main_style={styles.findStaffMain}
          /> */}
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
              value: data?.addresses[0]?.street,
            },
            {
              label: LocalizedStrings.StaffProfile.Locality,
              value: data?.addresses[0]?.city,
            },
            {
              label: LocalizedStrings.StaffProfile.City,
              value: data?.addresses[0]?.city,
            },
            {
              label: LocalizedStrings.StaffProfile.State,
              value: data?.addresses[0]?.state,
            },
            {
              label: LocalizedStrings.StaffProfile.Pincode,
              value: data?.addresses[0]?.pincode,
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
      </ScrollView>
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

  modalContainer: {
    paddingTop: 20,
  },
  modalTitle: { marginBottom: 20 },
  modalProfile: {
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
  },
  modalProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  modalProfileText: {
    marginLeft: 10,
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
  input: { height: 43 },
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
