import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import { ImageConstant } from '../../Constants/ImageConstant';
import Typography from '../../Component/UI/Typography';
import Button from '../../Component/Button';
import { Font } from '../../Constants/Font';
import { useSelector, useDispatch } from 'react-redux';
import { userDetails } from '../../Redux/action';
import { GET_WITH_TOKEN, POST_FORM_DATA } from '../../Backend/Backend';
import { PROFILE, GET_NOTIFICATION_SETTINGS, SAVE_NOTIFICATION_SETTINGS } from '../../Backend/api_routes';
import moment from 'moment';
import LocalizedStrings from '../../Constants/localization';
import SimpleToast from 'react-native-simple-toast';
import { useIsFocused } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { Alert } from 'react-native';

const StaffProfileMain = ({ navigation }) => {
    const dispatch = useDispatch();
    const userDetail = useSelector(store => store?.userDetails);
    const [loading, setLoading] = useState(false);
    const [terminateModal, setTerminateModal] = useState(false);
    const [Adhar, setAdhar] = useState()
    // Notification Settings State
    const [smsAlerts, setSmsAlerts] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationSaving, setNotificationSaving] = useState(false);
    const isFocused = useIsFocused();

    // Fetch profile data on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    // Fetch notification settings on component mount
    useEffect(() => {
        if (isFocused) {
            fetchNotificationSettings();
        }
    }, [isFocused]);


    const downloadImage = async (url, name) => {
        try {
            if (!url) {
                SimpleToast.show('Image not available', SimpleToast.SHORT);
                return;
            }
            const fileName = name || url.split('/').pop();
            const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

            setLoading(true);
            const downloadResult = await RNFS.downloadFile({
                fromUrl: url,
                toFile: destPath,
            }).promise;

            setLoading(false);

            if (downloadResult.statusCode === 200) {
                Alert.alert('Success', `Image saved to Downloads folder as ${fileName}`);
            } else {
                Alert.alert('Failed', 'Could not download image');
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Download failed, please try again');
        }
    };

    const fetchProfile = () => {
        setLoading(true);
        GET_WITH_TOKEN(
            PROFILE,
            success => {
                setLoading(false);
                setAdhar(success.data.kyc_information.aadhaar_front_path)
                if (success?.data) {
                    dispatch(userDetails(success.data));
                }
            },
            error => {
                setLoading(false);
            },
            fail => {
                setLoading(false);
            },
        );
    };

    // Get user data from userDetails
    const userImage = userDetail?.image
        ? { uri: userDetail.image }
        : ImageConstant.user;
    const userName = userDetail?.first_name && userDetail?.last_name
        ? `${userDetail.first_name} ${userDetail.last_name}`
        : userDetail?.first_name || userDetail?.name || 'User';
    const userRole = userDetail?.user_work_info?.primary_role
        || userDetail?.work_info?.primary_role
        || 'Staff Member';

    // Phone number with country code
    const countryCode = userDetail?.country_code || '+91';
    const phoneNumber = userDetail?.phone_number || 'N/A';
    const userPhone = phoneNumber !== 'N/A' ? `${countryCode} ${phoneNumber}` : 'N/A';
    const userEmail = userDetail?.email || 'N/A';

    // Date of Birth
    const userDOB = userDetail?.dob
        ? moment(userDetail.dob).format('DD/MM/YYYY')
        : 'N/A';

    // Gender
    const userGender = userDetail?.gender
        ? userDetail.gender.charAt(0).toUpperCase() + userDetail.gender.slice(1)
        : 'N/A';

    // Get address from userDetails
    const addresses = userDetail?.addresses || [];
    const currentAddress = addresses.length > 0 ? addresses[0] : {};
    const street = currentAddress?.street || 'N/A';
    const city = currentAddress?.city || 'N/A';
    const state = currentAddress?.state || 'N/A';
    const pincode = currentAddress?.pincode || 'N/A';

    // Get Aadhaar details
    const aadhaarNumber = userDetail?.aadhar_number || 'N/A';
    const aadhaarName = userDetail?.aadhar_name || userName;
    const aadharVerify = userDetail?.aadhar__verify == 1 || userDetail?.aadhar__verify === true;

    // Get KYC information
    const kycInfo = userDetail?.kyc_information || {};
    const aadhaarFront = kycInfo?.aadhaar_front_path || null;
    const aadhaarBack = kycInfo?.aadhaar_back_path || null;
    const policeVerification = kycInfo?.police_verification_path || null;
    const policeVerificationStatus = policeVerification ? 'Verified' : 'Pending';

    // Fetch notification settings
    const fetchNotificationSettings = () => {
        setNotificationLoading(true);
        GET_WITH_TOKEN(
            GET_NOTIFICATION_SETTINGS,
            success => {
                setNotificationLoading(false);
                if (success?.data) {
                    const notificationValue = success?.data?.value || success?.data?.notification || '0';
                    setSmsAlerts(notificationValue === '1' || notificationValue === 1);
                }
            },
            error => {
                setNotificationLoading(false);
            },
            fail => {
                setNotificationLoading(false);
            },
        );
    };

    // Handle SMS alerts change
    const handleSmsAlertsChange = (value) => {
        setSmsAlerts(value);
        saveNotificationSettings(value ? '1' : '0');
    };

    // Save notification settings
    const saveNotificationSettings = (value) => {
        setNotificationSaving(true);
        const formData = new FormData();
        formData.append('value', value);

        POST_FORM_DATA(
            SAVE_NOTIFICATION_SETTINGS,
            formData,
            success => {
                setNotificationSaving(false);
                SimpleToast.show(success?.message || 'Notification settings saved successfully', SimpleToast.SHORT);
            },
            error => {
                setNotificationSaving(false);
                SimpleToast.show(error?.message || 'Failed to save notification settings', SimpleToast.SHORT);
            },
            fail => {
                setNotificationSaving(false);
                SimpleToast.show('Network error. Please try again.', SimpleToast.SHORT);
            },
        );
    };

    return (<>
        <CommanView>
            <HeaderForUser
                title={LocalizedStrings.StaffProfile?.title || "Staff Profile"}
                source_logo={ImageConstant?.notification}
                Profile_icon={userDetail?.image && userDetail.image}
                style_title={styles.headerTitle}
                onPressRightIcon={() => navigation.navigate('Notification')}
                source_arrow={ImageConstant?.BackArrow}
                onPressLeftIcon={() => navigation?.goBack()}
            />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.profileCard}>
                    <Image source={userImage} style={styles.profileImage} />
                    <Typography style={styles.name} size={22}>{userName}</Typography>
                    <Typography style={styles.role}>{userRole}</Typography>

                    <View style={styles.flexRow}>
                        <Image source={ImageConstant.phone} style={styles.icon} />
                        <Typography style={styles.info}>{userPhone}</Typography>
                    </View>
                    <View style={styles.flexRow}>
                        <Image source={ImageConstant.Location} style={styles.icon} />
                        <Typography style={styles.info}>
                            {city !== 'N/A' && state !== 'N/A'
                                ? `${city}, ${state}`
                                : city !== 'N/A' ? city : state !== 'N/A' ? state : 'N/A'}
                        </Typography>
                    </View>
                    {userEmail !== 'N/A' && (
                        <View style={styles.flexRow}>
                            <Image source={ImageConstant.mail} style={styles.icon} />
                            <Typography style={styles.info}>{userEmail}</Typography>
                        </View>
                    )}

                    {/* <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Image source={ImageConstant.phone} style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Image source={ImageConstant.WhatsApp} style={styles.icon} />
                        </TouchableOpacity>
                    </View> */}
                    {/* <Button
                        onPress={() => navigation.navigate()}
                        style={styles.findStaffBtn}
                        title={'Find Staff with AI'}
                        main_style={styles.findStaffMain}
                    /> */}
                </View>
                <View style={styles.card}>
                    <Typography style={styles.cardTitle}>{LocalizedStrings.StaffProfile?.Personal_Information || "Personal Information"}</Typography>
                    <View style={styles.row}>
                        <Image source={ImageConstant.date} style={styles.icon} />
                        <View style={styles.textBox}>
                            <Typography style={styles.label}>{LocalizedStrings.StaffProfile?.Date_of_Birth || "Date of Birth"}</Typography>
                            <Typography style={styles.value}>{userDOB}</Typography>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Image source={ImageConstant.person} style={styles.icon} />
                        <View style={styles.textBox}>
                            <Typography style={styles.label}>{LocalizedStrings.StaffProfile?.Gender || "Gender"}</Typography>
                            <Typography style={styles.value}>{userGender}</Typography>
                        </View>
                    </View>
                    <View style={styles.rowNoBorder}>
                        <Image source={ImageConstant.phone} style={styles.icon} />
                        <View style={styles.textBox}>
                            <Typography style={styles.label}>{LocalizedStrings.StaffProfile?.Emergency_Contact || "Emergency Contact"}</Typography>
                            <Typography style={styles.value}>{userPhone}</Typography>
                        </View>
                    </View>
                </View>
                <View style={styles.card}>
                    <Typography style={styles.cardTitle}>{LocalizedStrings.StaffProfile?.Aadhaar_Details || "Aadhaar Details"}</Typography>
                    <View style={styles.row}>
                        <Image source={ImageConstant.hash} style={styles.icon} />
                        <View style={styles.textBox}>
                            <Typography style={styles.label}>{LocalizedStrings.StaffProfile?.Aadhaar_Number || "Aadhaar Number"}</Typography>
                            <Typography style={styles.value}>
                                {aadhaarNumber !== 'N/A' && aadhaarNumber.length > 4
                                    ? `XXXX XXXX ${aadhaarNumber.slice(-4)}`
                                    : aadhaarNumber}
                            </Typography>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Image source={ImageConstant.person} style={styles.icon} />
                        <View style={styles.textBox}>
                            <Typography style={styles.label}>{LocalizedStrings.StaffProfile?.Aadhaar_Name || "Aadhaar Name"}</Typography>
                            <Typography style={styles.value}>{aadhaarName}</Typography>
                        </View>
                    </View>
                    <View style={styles.rowNoBorder}>
                        <Image source={ImageConstant.Calendar} style={styles.icon} />
                        <View style={styles.textBox}>
                            <Typography style={styles.label}>{LocalizedStrings.StaffProfile?.KYC_Status || "Verification Status"}</Typography>
                            <Typography style={styles.value}>{aadharVerify ? 'Verified' : 'Pending'}</Typography>
                        </View>
                    </View>
                </View>


                <View style={styles.card}>
                    <Typography style={styles.cardTitle}>{LocalizedStrings.StaffProfile?.Residential_Address || "Residential Address"}</Typography>
                    {[
                        { label: LocalizedStrings.StaffProfile?.Street || 'Street', value: street },
                        { label: LocalizedStrings.StaffProfile?.City || 'City', value: city },
                        { label: LocalizedStrings.StaffProfile?.State || 'State', value: state },
                        { label: LocalizedStrings.StaffProfile?.Pincode || 'Pincode', value: pincode },
                    ].map((item, idx, arr) => (
                        <View key={item.label} style={idx === arr.length - 1 ? styles.rowNoBorder : styles.row}>
                            <Image source={ImageConstant.Location} style={styles.icon} />
                            <View style={styles.textBox}>
                                <Typography style={styles.label}>{item.label}</Typography>
                                <Typography style={styles.value}>{item.value}</Typography>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.card}>
                    <Typography style={styles.cardTitle}>{LocalizedStrings.StaffProfile?.KYC_Status || "KYC Documents"}</Typography>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 10,
                            borderBottomWidth: 0.2,
                            borderBottomColor: '#EBEBEA',
                            paddingBottom: 20
                        }}
                        onPress={() => {
                            if (aadhaarFront || aadhaarBack) {
                                setTerminateModal(true); // open modal for Aadhaar images
                            } else {
                                SimpleToast.show('Aadhaar images not available');
                            }
                        }}
                    >
                        <Image source={ImageConstant.Verify} style={styles.icon} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '88%' }}>
                            <Typography style={[styles.label, { color: 'black' }]}>Aadhaar Card</Typography>
                            <View style={aadharVerify ? styles.kycBadge : [styles.kycBadge, { backgroundColor: '#FEF9C3' }]}>
                                <Typography style={aadharVerify ? styles.kycText : [styles.kycText, { color: '#854D0E' }]}>
                                    {aadharVerify ? 'Verified' : 'Pending'}
                                </Typography>
                            </View>
                        </View>
                    </TouchableOpacity>


                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <Image source={ImageConstant.lines} style={styles.icon} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '88%' }}>
                            <Typography style={[styles.label, { color: 'black' }]}>Police Verification</Typography>
                            <View style={policeVerification ? styles.kycBadge : [styles.kycBadge, { backgroundColor: '#FEF9C3' }]}>
                                <Typography style={policeVerification ? styles.kycText : [styles.kycText, { color: '#854D0E' }]}>
                                    {policeVerificationStatus}
                                </Typography>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Typography style={styles.cardTitle}>{LocalizedStrings.EditProfile?.Notification_Preferences || 'Notification Preferences'}</Typography>

                    {notificationLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#E87C6F" />
                        </View>
                    ) : (
                        <View style={styles.toggleRow}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    width: '50%',
                                }}
                            >
                                <Image source={ImageConstant.phone} style={styles.icon} />
                                <View>
                                    <Typography style={styles.benefit}>{LocalizedStrings.EditProfile?.SMS_Alerts || 'SMS Alerts'}</Typography>
                                    <Typography style={styles.subText}>
                                        {LocalizedStrings.EditProfile?.SMS_Alerts_Desc || 'Get important notifications via text message.'}
                                    </Typography>
                                </View>
                            </View>
                            <Switch
                                value={smsAlerts}
                                onValueChange={handleSmsAlertsChange}
                                trackColor={{ false: '#ccc', true: '#E87C6F' }}
                                thumbColor={'#fff'}
                                disabled={notificationSaving}
                            />
                        </View>
                    )}
                </View>



            </ScrollView>



        </CommanView>
        {terminateModal && (
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <TouchableOpacity style={styles.closeModal} onPress={() => setTerminateModal(false)}>
                        <Typography style={{ fontSize: 18, color: '#E87C6F' }}>✕</Typography>
                    </TouchableOpacity>

                    <Typography style={styles.modalTitleText}>Aadhaar Card Images</Typography>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {aadhaarFront ? (
                            <View style={{ marginBottom: 20 }}>
                                <Image source={{ uri: aadhaarFront }} style={styles.aadhaarImage} />
                                <TouchableOpacity
                                    style={styles.downloadBtn}
                                    onPress={() => downloadImage(aadhaarFront, 'Aadhaar_Front.jpg')}
                                >
                                    <Typography style={styles.downloadText}>Download Front</Typography>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Typography style={styles.noImageText}>Front image not available</Typography>
                        )}

                        {aadhaarBack ? (
                            <View style={{ marginBottom: 20 }}>
                                <Image source={{ uri: aadhaarBack }} style={styles.aadhaarImage} />
                                <TouchableOpacity
                                    style={styles.downloadBtn}
                                    onPress={() => downloadImage(aadhaarBack, 'Aadhaar_Back.jpg')}
                                >
                                    <Typography style={styles.downloadText}>Download Back</Typography>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Typography style={styles.noImageText}>Back image not available</Typography>
                        )}
                    </ScrollView>
                </View>
            </View>
        )}

    </>
    );
};

export default StaffProfileMain;

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
        marginBottom: 10
    },
    name: {
        fontFamily: Font.Poppins_Bold,
        marginBottom: 2
    },
    role: {
        fontFamily: Font.Poppins_Regular,
        color: '#666',
        marginBottom: 12
    },
    info: {
        fontFamily: Font.Poppins_Medium,
        fontSize: 15
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        width: '80%'
    },
    icon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginRight: 10,
        tintColor: '#8C8D8B'
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%', marginVertical: 12
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
        marginTop: 10
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
        borderColor: '#EBEBEA'
    },
    rowNoBorder: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12
    },
    textBox: { marginLeft: 10 },
    label: {
        fontFamily: Font.Poppins_Regular,
        fontSize: 13,
        color: '#888'
    },
    value: {
        fontFamily: Font.Poppins_SemiBold,
        fontSize: 14,
        marginTop: 2
    },
    professionalBox: { paddingVertical: 15 },
    kycHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    noBorder: {
        borderColor: 'white',
        marginBottom: 0
    },
    kycBadge: {
        backgroundColor: '#E6F7EC',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4
    },
    kycText: {
        color: '#28A745',
        fontFamily: Font.Poppins_Medium
    },

    actionFooter: {
        marginTop: 20
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
        borderWidth: 2
    },
    mt12: { marginTop: 12 },
    actionButtonText: {
        color: '#8C8D8B',
        fontSize: 16,
        fontWeight: '600'
    },


    modalContainer: {
        paddingTop: 20
    },
    modalTitle: { marginBottom: 20 },
    modalProfile: {
        alignItems: 'center',
        marginBottom: 20,
        flexDirection: 'row'
    },
    modalProfileImage: {
        width: 50,
        height: 50,
        borderRadius: 30
    },
    modalProfileText: {
        marginLeft: 10,
        justifyContent: 'center'
    },
    dropdown: {
        marginHorizontal: 0,
        height: 43
    },
    dropdownText: {
        marginLeft: 10,
        fontFamily: Font.Poppins_Regular
    },
    dropdownTitle: {
        textAlign: 'left',
        fontFamily: Font.Poppins_Regular
    },
    modalRatingRow: {
        flexDirection: 'row',
        marginVertical: 10
    },
    input: { height: 43 },
    modalActionBtn: {
        marginTop: 20,
        width: '100%'
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    benefit: {
        fontSize: 14,
        marginVertical: 2,
        fontFamily: Font.Poppins_Medium,
        color: '#333',
    },
    subText: {
        fontSize: 12,
        color: '#666',
        width: '80%',
        fontFamily: Font.Poppins_Regular,
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    modalBox: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        maxHeight: '80%',
    },
    closeModal: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
    },
    modalTitleText: {
        fontFamily: Font.Poppins_Bold,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    aadhaarImage: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        borderRadius: 10,
    },
    noImageText: {
        textAlign: 'center',
        color: '#888',
        marginVertical: 10,
        fontFamily: Font.Poppins_Regular,
    },
    downloadBtn: {
        backgroundColor: '#E87C6F',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf: 'center',
        marginTop: 10,
    },
    downloadText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: Font.Poppins_Medium,
    },


});
