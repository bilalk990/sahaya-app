import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import CommanView from '../../../Component/CommanView';
import HeaderForUser from '../../../Component/HeaderForUser';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import { GET_WITH_TOKEN, POST_WITH_TOKEN } from '../../../Backend/Backend';
import { ApplicantsList, ApplicantsStatus } from '../../../Backend/api_routes';
import { ImageConstant } from '../../../Constants/ImageConstant';
import { useIsFocused } from '@react-navigation/native';
import SimpleToast from 'react-native-simple-toast';
import LocalizedStrings from '../../../Constants/localization';
import EmptyView from '../../../Component/UI/EmptyView';
import moment from 'moment';

export const leaveRequests = [
  {
    id: 1,
    name: 'Alice Johnson',
    initials: 'AJ',
    type: 'Annual Leave',
    dates: '2024-07-15 → 2024-07-30',
    reason: 'Family vacation and personal rejuvenation.',
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Robert Williams',
    initials: 'RW',
    type: 'Sick Leave',
    dates: '2024-07-01 → 2024-07-09',
    reason: 'Recovering from a severe flu, doctor recommended rest.',
    status: 'Approved',
  },
  {
    id: 3,
    name: 'Maria Garcia',
    initials: 'MG',
    type: 'Casual Leave',
    dates: '2024-07-25 → 2024-07-30',
    reason: 'Attending a cousin’s wedding ceremony.',
    status: 'Pending',
  },
  {
    id: 4,
    name: 'David Lee',
    initials: 'DL',
    type: 'Sick Leave',
    dates: '2024-07-08 → 2024-07-16',
    reason: 'Expecting the arrival of a new family member.',
    status: 'Rejected',
  },
  {
    id: 5,
    name: 'Sophia Chen',
    initials: 'SC',
    type: 'Annual Leave',
    dates: '2024-07-23 → 2024-07-26',
    reason: 'Home renovation project.',
    status: 'Pending',
  },
];

export default function ListingJob({ navigation, route }) {
  const [listAppJob, setListAppList] = useState([]);
  const id = route.params.id;
  const isFocused = useIsFocused();

  const handleCall = phoneNumber => {
    if (!phoneNumber) {
      SimpleToast.show('Phone number not available', SimpleToast.SHORT);
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = async phoneNumber => {
    if (!phoneNumber) {
      SimpleToast.show('Phone number not available', SimpleToast.SHORT);
      return;
    }
    const phone = phoneNumber.replace(/\D/g, '');
    const url = `whatsapp://send?phone=91${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      SimpleToast.show('WhatsApp not installed', SimpleToast.SHORT);
      return;
    }
    Linking.openURL(url);
  };

  useEffect(() => {
    if (isFocused) {
      JobList();
    }
  }, [isFocused]);

  const JobList = () => {
    GET_WITH_TOKEN(
      `${ApplicantsList}/${id}/applications`,
      success => {
        setListAppList(success?.data);
      },
      error => {},
      fail => {},
    );
  };

  const handelapplication = (status, jobID) => {
    const body = {
      application_status: status,
    };

    const formData = new FormData();

    // Job Details
    formData.append('application_status', status);

    POST_WITH_TOKEN(
      `${ApplicantsStatus}/${jobID}/status`,
      body,
      success => {
        SimpleToast.show(success?.message, SimpleToast.SHORT);
        JobList();
      },
      error => {
        SimpleToast.show(
          error?.message || 'Failed to delete Member',
          SimpleToast.SHORT,
        );
      },
      fail => {
        SimpleToast.show('Network error. Please try again.', SimpleToast.SHORT);
      },
    );
  };

  return (
    <CommanView>
      <HeaderForUser
        title={
          LocalizedStrings.MyJobPostings.job_applications || 'Job Applications'
        }
        navigation={navigation}
        showRightIcon={true}
        source_logo={ImageConstant?.notification}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation?.goBack()}
        onPressRightIcon={() => navigation.navigate('Notification')}
        style_title={{ fontSize: 18 }}
      />
      {listAppJob.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyView
            title={
              LocalizedStrings.MyJobPostings?.no_applicants || 'No Applicants'
            }
            description={
              LocalizedStrings.MyJobPostings?.no_applicants_desc ||
              'No one has applied for this job yet. Share the job posting to get applicants.'
            }
            icon={ImageConstant?.Users}
            iconColor="#D98579"
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 16 }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <Typography type={Font.Poppins_SemiBold} style={{ fontSize: 17 }}>
              {LocalizedStrings.LeaveApplications.Subtitle || 'Recent Requests'}
            </Typography>
            <Typography type={Font.Poppins_Regular}>
              {listAppJob.length}
            </Typography>
          </View>
          {listAppJob.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.avatar}>
                  <Typography
                    type={Font.Poppins_SemiBold}
                    style={styles.avatarText}
                  >
                    {item.user?.first_name.charAt(0)}
                  </Typography>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Typography type={Font.Poppins_SemiBold} style={styles.name}>
                    {item.user?.first_name} {item.user?.last_name}
                  </Typography>
                  <Typography type={Font.Poppins_Regular} style={styles.type}>
                    {item.user?.phone_number}
                  </Typography>
                </View>
                <View
                  style={[
                    styles.statusTag,
                    {
                      backgroundColor:
                        item.status == 'accepted'
                          ? '#A7F3D0'
                          : item.status == 'pending'
                          ? '#FEF3C7'
                          : '#FECACA',
                    },
                  ]}
                >
                  <Typography
                    type={Font.Poppins_SemiBold}
                    style={[
                      styles.statusText,
                      {
                        color:
                          item?.application_status == 'accepted'
                            ? '#047857'
                            : item?.application_status == 'pending'
                            ? '#B45309'
                            : '#B91C1C',
                      },
                    ]}
                  >
                    {item?.application_status == 'accepted'
                      ? LocalizedStrings.LeaveApplications.Approved
                      : item?.application_status == 'pending'
                      ? LocalizedStrings.LeaveApplications.Pending
                      : item?.application_status == 'rejected'
                      ? LocalizedStrings.LeaveApplications.Rejected
                      : item?.application_status}
                  </Typography>
                </View>
              </View>
              <View style={styles.row}>
                <Image
                  source={ImageConstant.lines}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Typography type={Font.Poppins_Regular} style={styles.dates}>
                  {LocalizedStrings.LeaveApplications.DatesRequested}:{' '}
                  {moment(item?.available_from).format('DD-MM-YYYY')}
                </Typography>
              </View>
              <View style={styles.contactRow}>
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => handleCall(item.user?.phone_number)}
                >
                  <Image
                    source={ImageConstant.phone}
                    style={[styles.icon, { tintColor: '#D98579' }]}
                    resizeMode="contain"
                  />
                  <Typography
                    type={Font.Poppins_Regular}
                    style={{ color: '#D98579', fontSize: 12, marginLeft: 4 }}
                  >
                    Call
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => handleWhatsApp(item.user?.phone_number)}
                >
                  <Image
                    source={ImageConstant.WhatsApp}
                    style={[styles.icon, { tintColor: '#25D366' }]}
                    resizeMode="contain"
                  />
                  <Typography
                    type={Font.Poppins_Regular}
                    style={{ color: '#25D366', fontSize: 12, marginLeft: 4 }}
                  >
                    WhatsApp
                  </Typography>
                </TouchableOpacity>
              </View>

              {item?.application_status == 'pending' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#D98579',
                      },
                    ]}
                    onPress={() => handelapplication('Reject', item?.id)}
                  >
                    <Image
                      source={ImageConstant.X}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                    <Typography
                      type={Font.Poppins_Regular}
                      style={{ color: '#D98579', fontSize: 13, marginLeft: 4 }}
                    >
                      {LocalizedStrings.LeaveApplications.Reject}
                    </Typography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: '#D98579' },
                    ]}
                    onPress={() => handelapplication('accepted', item?.id)}
                  >
                    <Image
                      source={ImageConstant.correct}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                    <Typography
                      type={Font.Poppins_Regular}
                      style={{ color: '#FFFFFF', fontSize: 13, marginLeft: 4 }}
                    >
                      {LocalizedStrings.LeaveApplications.Approve}
                    </Typography>
                  </TouchableOpacity>
                </View>
              )}

              {item?.application_status == 'accepted' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: '#D98579', flex: 1, justifyContent: 'center' },
                    ]}
                    onPress={() => navigation.navigate('Aadhar')}
                  >
                    <Image
                      source={ImageConstant.correct}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                    <Typography
                      type={Font.Poppins_Regular}
                      style={{ color: '#FFFFFF', fontSize: 13, marginLeft: 4 }}
                    >
                      {'Add Staff'}
                    </Typography>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </CommanView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 13, color: '#333' },
  name: { fontSize: 14, color: '#111' },
  type: { fontSize: 12, color: '#666' },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusText: { fontSize: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  icon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  dates: { fontSize: 12, color: '#555' },
  reason: { fontSize: 12, color: '#777' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 36,
    marginHorizontal: 5,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEA',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
