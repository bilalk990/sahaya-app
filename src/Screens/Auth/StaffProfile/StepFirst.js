import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import React, { useState, useRef } from 'react';
import CommanView from '../../../Component/CommanView';
import Header from '../../../Component/Header';
import { Font } from '../../../Constants/Font';
import { ImageConstant } from '../../../Constants/ImageConstant';
import Input from '../../../Component/Input';
import DropdownComponent from '../../../Component/DropdownComponent';
import Button from '../../../Component/Button';
import Typography from '../../../Component/UI/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { isAuth, userDetails } from '../../../Redux/action';
import KYCVerificationStaff from './KYCVerificationStaff';
import StepLoactionStaff from './StepLoactionStaff';
import StepWokInfo from './StepWokInfo';
import UpdateProfile from '../../Staff/UpdateProfile';
import ImageModal from '../../../Component/Modals/ImageModal';
import { POST_FORM_DATA, POST_WITH_TOKEN } from '../../../Backend/Backend';
import {
  DELETE_ACCOUNT,
  LOGOUT,
  PROFILE_UPDATE,
} from '../../../Backend/api_routes';
import { validators } from '../../../Backend/Validator';
import { formatDateWithDashes, isValidForm } from '../../../Backend/Utility';
import Date_Picker from '../../../Component/Date_Picker';
import LocalizedStrings from '../../../Constants/localization';
const StepFirst = () => {
  const userTypes = useSelector(store => store?.userType);
  const userDetail = useSelector(store => store?.userDetails);
  const [activeTab, setActiveTab] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [firstName, setFirstName] = useState(userDetail?.first_name || '');
  const [lastName, setLastName] = useState(userDetail?.last_name || '');
  const [gender, setGender] = useState(
    { label: '', value: userDetail?.gender } || null,
  );
  const [dob, setDob] = useState(userDetail?.dob || '');
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false);
  const kycRef = useRef(null);
  const locationRef = useRef(null);
  const workInfoRef = useRef(null);
  const lastWorkRef = useRef(null);
  const Dispatch = useDispatch();
  const SendStepsApi = () => {
    let error = {
      firstName: validators?.checkRequire('First Name', firstName),
      lastName: validators?.checkRequire('Last Name', lastName),
      dob: validators?.checkRequire('dob', dob),
      gender: validators?.checkRequire('Gender', gender?.value),
    };
    setError(error);
    if (isValidForm(error)) {
      setLoader(true);

      console.log('workInfoRef-----',formData);

      
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('gender', gender?.value);
      formData.append('dob', formatDateWithDashes(dob) || '');
      formData.append('is_edit', 0);
      formData.append('user_role_id', userTypes == 0 ? 1 : 2);
      if (selectedPhoto?.path || selectedPhoto?.uri) {
        formData.append('photo', {
          uri: selectedPhoto?.path || selectedPhoto?.uri,
          name: selectedPhoto?.name || '',
          type: selectedPhoto?.mime || 'image/jpeg',
        });
      }
      POST_FORM_DATA(
        PROFILE_UPDATE,
        formData,
        success => {
          setLoader(false);
          Profile();
          if (success?.data?.step == 2) {
            setActiveTab(1);
          }
        },
        error => {
          setLoader(false);
        },
        fail => {
          setLoader(false);
        },
      );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 20,
                }}
              >
                <Image
                  source={
                    userDetail?.image
                      ? { uri: selectedPhoto?.path || userDetail?.image }
                      : ImageConstant?.Conatiner
                  }
                  style={{ width: 112, height: 112, borderRadius: 112 }}
                />
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 20,
                    borderColor: '#EBEBEA',
                  }}
                  onPress={() => setShowImageModal(true)}
                >
                  <Image
                    source={ImageConstant?.NewCamera}
                    style={{ width: 14, height: 12, tintColor: '#D98579' }}
                  />
                  <Typography
                    type={Font?.Poppins_Medium}
                    color={'#D98579'}
                    style={{ marginLeft: 10 }}
                  >
                    {LocalizedStrings.EditProfile?.change_photo ||
                      'Change Photo'}
                  </Typography>
                </TouchableOpacity>
                {/* <Button title={"Change Photo"} linerColor={["#fff","#fff"]} title_style={{color:"#D98579"}} icon={ImageConstant?.Camera}/> */}
              </View>
            </View>
            <View
              style={{
                flex: 1,
                borderWidth: 1,
                padding: 20,
                borderRadius: 8,
                borderColor: '#EBEBEA',
              }}
            >
              <Typography style={styles.sectionTitle}>
                {LocalizedStrings.EditProfile?.Personal_Details ||
                  'Basic Information'}
              </Typography>
              <Input
                title={
                  LocalizedStrings.EditProfile?.first_name ||
                  LocalizedStrings.EditProfile?.Name ||
                  'First Name'
                }
                value={firstName}
                onChange={text => {
                  setFirstName(text);
                  if (error?.firstName) setError({ ...error, firstName: null });
                }}
                error={error?.firstName}
              />
              <Input
                title={LocalizedStrings.EditProfile?.last_name || 'Last Name'}
                value={lastName}
                onChange={text => {
                  setLastName(text);
                  if (error?.lastName) setError({ ...error, lastName: null });
                }}
                error={error?.lastName}
              />
              <DropdownComponent
                title={LocalizedStrings.EditProfile?.Gender || 'Gender'}
                // placeholder={'Select Gender'}
                width={'100%'}
                style_dropdown={{ marginHorizontal: 0 }}
                selectedTextStyleNew={{ marginLeft: 10 }}
                marginHorizontal={0}
                value={gender?.value}
                style_title={{ textAlign: 'left' }}
                data={[
                  {
                    label: LocalizedStrings.EditProfile?.Male || 'Male',
                    value: 'male',
                  },
                  {
                    label: LocalizedStrings.EditProfile?.Female || 'Female',
                    value: 'female',
                  },
                  {
                    label: LocalizedStrings.EditProfile?.Other || 'Other',
                    value: 'other',
                  },
                ]}
                onChange={item => {
                  setGender(item || null);
                  if (error?.gender) setError({ ...error, gender: null });
                }}
                error={error?.gender}
              />
              <Date_Picker
                title={
                  LocalizedStrings.EditProfile?.Date_of_Birth || 'Date of Birth'
                }
                placeholder={'DD-MM-YYYY'}
                selected_date={dob}
                allowFutureDates={false}
                disablePastDates={false}
                ageRestrict={true}
                onConfirm={item => {
                  setDob(item);
                  if (error?.dob) setError({ ...error, dob: null });
                }}
                error={error?.dob}
              />
            </View>
          </>
        );
      case 1:
        return (
          <>
            <KYCVerificationStaff ref={kycRef} userDetail={userDetail} />
          </>
        );
      case 2:
        return (
          <>
            <StepLoactionStaff ref={locationRef} />
          </>
        );
      case 3:
        return (
          <>
            <StepWokInfo ref={workInfoRef} />
          </>
        );
      case 4:
        return (
          <>
            <UpdateProfile ref={lastWorkRef} />
          </>
        );
      default:
        return null;
    }
  };

  const confirmLogout = () => {
    POST_WITH_TOKEN(
      DELETE_ACCOUNT,
      {},
      success => {
        // SimpleToast.show(
        //   success?.message ||
        //     LocalizedStrings.Settings?.accountDeletedSuccess ||
        //     'Account deleted successfully',
        //   SimpleToast.SHORT,
        // );
        // Logout user after account deletion
        Dispatch(isAuth(false));
        Dispatch(userDetails({}));
      },
      error => {
        SimpleToast.show(
          error?.message ||
            LocalizedStrings.Settings?.accountDeleteFailed ||
            'Failed to delete account',
          SimpleToast.SHORT,
        );
      },
      fail => {
        SimpleToast.show(
          LocalizedStrings.Settings?.networkError ||
            'Network error. Please try again.',
          SimpleToast.SHORT,
        );
      },
    );
  };

  return (
    <CommanView>
      <Header
        source_arrow={ImageConstant?.BackArrow}
        onBackPressFun={() => {
          if (activeTab === 0) {
            confirmLogout();
          } else {
            setActiveTab(activeTab - 1);
          }
        }}
        title={LocalizedStrings.EditProfile?.title || 'Complete Profile'}
        style_title={{ fontFamily: Font?.Manrope_SemiBold }}
        onBackPress
      />
      {renderContent()}
      {activeTab === 0 && (
        <ImageModal
          showModal={showImageModal}
          title={LocalizedStrings.EditProfile?.change_photo || 'Upload Photo'}
          close={() => setShowImageModal(false)}
          selected={image => {
            let obj = {
              uri: image[0]?.path,
              path: image[0]?.path,
              name: image[0]?.filename,
              type: image[0]?.mime || 'image/jpeg',
            };
            setSelectedPhoto(obj);
          }}
        />
      )}
      <Button
        title={
          activeTab == 4
            ? LocalizedStrings.EditProfile?.Save_Changes || 'Save & Proceed'
            : LocalizedStrings.Auth?.next || 'Next'
        }
        onPress={async () => {
          if (activeTab == 0) {
            SendStepsApi();
          } else if (activeTab == 1) {
            // Save KYC and move to next step
            try {
              setLoader(true);
              await kycRef.current?.saveKYC();
              setActiveTab(2);
            } catch (error) {
            } finally {
              setLoader(false);
            }
          } else if (activeTab == 2) {
            // Save addresses and move to next step
            try {
              setLoader(true);
              await locationRef.current?.saveAddresses();
              setActiveTab(3);
            } catch (error) {
            } finally {
              setLoader(false);
            }
          } else if (activeTab == 3) {
            // Save work info and move to next step
            try {
              setLoader(true);
              await workInfoRef.current?.saveWorkInfo();
              setActiveTab(4);
            } catch (error) {
            } finally {
              setLoader(false);
            }
          } else if (activeTab == 4) {
            // Save last work experience
            try {
              setLoader(true);
              await lastWorkRef.current?.saveLastWorkExperience();
              // Navigation to next screen or completion
              SimpleToast.show(
                LocalizedStrings.EditProfile?.profile_completed ||
                  'Profile completed successfully',
                SimpleToast.SHORT,
              );
            } catch (error) {
            } finally {
              setLoader(false);
            }
          }
        }}
        style={{ width: 150, alignSelf: 'flex-end' }}
        disabled={loader}
        loader={loader}
      />
    </CommanView>
  );
};

export default StepFirst;

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: Font?.Manrope_Bold,
    fontSize: 16,
    marginBottom: 10,
  },
  tabContainer: {
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#f7f7f7',
    backgroundColor: '#f7f7f7',
    overflow: 'scroll',
    color: ' #8C8D8B',
    marginTop: 20,
    padding: 5,
    overflow: 'hidden',
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    overflow: 'scroll',
    flexDirection: 'row',
  },
  tabText: {
    fontFamily: Font?.Manrope_SemiBold,
    fontSize: 14,
    color: '#666',
  },
  activeTab: {
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  activeTabText: {
    color: 'black',
  },
});
