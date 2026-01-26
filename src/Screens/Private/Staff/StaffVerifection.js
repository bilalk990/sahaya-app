import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import CommanView from '../../../Component/CommanView';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import HeaderForUser from '../../../Component/HeaderForUser';
import Button from '../../../Component/Button';
import { ImageConstant } from '../../../Constants/ImageConstant';
import SimpleModal from './../../../Component/UI/SimpleModal';
import { OtpInput } from 'react-native-otp-entry';
import LocalizedStrings from '../../../Constants/localization';
import { POST_FORM_DATA } from '../../../Backend/Backend';
import { AADHAR_VERFIY } from '../../../Backend/api_routes';
import { useDispatch } from 'react-redux';
import { userDetails } from '../../../Redux/action';

const StaffVerifection = ({ navigation, route }) => {
  const userData = route?.params?.userData;
  const adharNumber = route?.params?.adharNumber;
  console.log('userData-----', userData);
  // console.log('adharNumber-----', adharNumber);

  const [otp, setOtp] = useState('');
  const [Verify, setVerify] = useState(false);
  const dispatch = useDispatch();
  const [otpError, setOtpError] = useState('');
  const last4 = adharNumber.slice(-4);
  
  const handleVerify = () => {
    if (otp.length !== 6) {
      setOtpError(
        LocalizedStrings.AddStaff?.OTP_Placeholders ||
          'Please enter a valid 6-digit OTP',
      );
      return;
    }

    setOtpError('');

    let data = new FormData();
    data?.append('otp', otp);
    data?.append('user_id', userData?.user_id);

    POST_FORM_DATA(
      AADHAR_VERFIY,
      data,
      success => {
        if (success?.user) {
          dispatch(userDetails(success?.user));
          navigation.navigate('NewStaffFrom', {
            adharNumber: adharNumber,
            userData: userData,
          });
        } else {
          setOtpError(
            success?.message ||
              LocalizedStrings.Auth?.mobile_invalid ||
              'Invalid OTP. Please try again.',
          );
        }
      },
      error => {
        if (error?.data?.message) {
          setOtpError(error?.data?.message);
        } else if (error?.data?.error) {
          setOtpError(error?.data?.error);
        } else if (error?.message) {
          setOtpError(error.message);
        } else {
          setOtpError(error?.error || 'Invalid OTP. Please try again.');
        }
        console.log(error);
      },
      fail => {
        console.log(fail);
        setOtpError(
          LocalizedStrings.Auth?.mobile_invalid ||
            'Something went wrong. Please try again.',
        );
      },
    );
  };

  return (
    <CommanView>
      <HeaderForUser
        title={LocalizedStrings.AddStaff.title}
        style_title={styles.headerTitle}
        containerStyle={styles.headerContainer}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => {
          navigation?.goBack();
        }}
      />
      <View style={styles.card}>
        <Typography type={Font?.Poppins_SemiBold} style={styles.otpTitle}>
          {LocalizedStrings.AddStaff.Verify}
        </Typography>
        <Typography type={Font?.Poppins_Regular} style={styles.otpDesc}>
          {LocalizedStrings.AddStaff.Description}
          {last4}
        </Typography>

        <OtpInput
          numberOfDigits={6}
          focusColor="#D98579"
          onTextChange={text => {
            setOtp(text);
            if (otpError) {
              setOtpError('');
            }
          }}
          textInputProps={{
            keyboardType: 'number-pad',
          }}
          theme={{
            containerStyle: { marginTop: 20, marginBottom: 20 },
            pinCodeContainerStyle: {
              borderWidth: 1,
              borderColor: otpError ? 'red' : '#ccc',
              borderRadius: 8,
            },
            pinCodeTextStyle: {
              fontSize: 18,
              fontFamily: Font?.Poppins_Medium,
              color: '#000',
            },
          }}
        />

        {/* Error Message */}
        {otpError ? (
          <Typography
            size={12}
            color="red"
            style={{ textAlign: 'center', marginBottom: 10 }}
          >
            {otpError}
          </Typography>
        ) : null}

        <TouchableOpacity>
          <Typography
            type={Font?.Poppins_Regular}
            style={{
              marginTop: 10,
              marginBottom: 20,
            }}
          >
            {LocalizedStrings.AddStaff.Resend_Text.split('?')[0]}?{' '}
            <Typography type={Font?.Poppins_Regular} style={styles.resend}>
              {LocalizedStrings.AadhaarOTPVerification?.resend || 'Resend'}
            </Typography>{' '}
          </Typography>
        </TouchableOpacity>

        <Button
          onPress={handleVerify}
          title={LocalizedStrings.AddStaff.Verify_Add_Staff}
          main_style={styles.buttonStyle}
          icon={ImageConstant?.Arrow}
        />
      </View>
      <SimpleModal visible={Verify}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ padding: 40 }}>
            <Image
              source={ImageConstant?.ic_success}
              style={{ width: 60, height: 60, resizeMode: 'contain' }}
            />
          </View>
          <Typography
            size={20}
            type={Font?.Poppins_SemiBold}
            textAlign={'center'}
          >
            {LocalizedStrings.StaffAddedSuccess.Title}
          </Typography>
          <Typography
            size={16}
            type={Font?.Poppins_Regular}
            textAlign={'center'}
            color="#8C8D8B"
            style={{ marginTop: 30 }}
          >
            {LocalizedStrings.StaffAddedSuccess.Message}
          </Typography>
          <Button
            title={LocalizedStrings.StaffAddedSuccess.Done}
            onPress={() => navigation.navigate('TabNavigation')}
            main_style={{ marginTop: 20, width: '100%' }}
            icon={ImageConstant?.Arrow}
          />
        </View>
      </SimpleModal>
    </CommanView>
  );
};

export default StaffVerifection;

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileWrapper: {
    alignItems: 'center',
    marginVertical: 0,
  },
  profileImage: {
    height: 90,
    width: 90,
    borderRadius: 45,
    alignSelf: 'flex-end',
  },
  profileName: { fontSize: 18, marginTop: 10 },
  profileSub: { fontSize: 14, color: '#666' },
  editIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: '#E87C6F',
  },
  card: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EBEBEA',
    flex: 0.5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    marginTop: 5,
    marginBottom: 5,
  },
  role: {
    fontSize: 14,
    color: '#8C8D8B',
    marginBottom: 30,
  },
  info: {
    fontSize: 14,
    color: 'black',
    marginVertical: 2,
  },
  otpTitle: {
    // marginTop: 100,
    alignContent: 'center',
    fontSize: 16,
  },
  otpDesc: {
    textAlign: 'center',
    color: '#8C8D8B',
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 18,
    width: 40,
    height: 50,
    marginHorizontal: 5,
  },
  resend: {
    color: '#f15a29',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonStyle: {
    width: '100%',
  },
});
