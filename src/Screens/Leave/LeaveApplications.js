import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import Typography from '../../Component/UI/Typography';
import { Font } from '../../Constants/Font';
import { ImageConstant } from '../../Constants/ImageConstant';
import LocalizedStrings from '../../Constants/localization';
import { GET_WITH_TOKEN, POST_WITH_TOKEN } from '../../Backend/Backend';
import {
  LeaveApprove,
  LeaveListUser,
  LeaveRejectr,
} from '../../Backend/api_routes';
import SimpleToast from 'react-native-simple-toast';
import { useIsFocused } from '@react-navigation/native';

export const leaveRequests = [
  {
    id: 1,
    name: 'Alice Johnson',
    initials: 'AJ',
    type: 'Annual Leave',
    dates: '2024-07-15 → 2024-07-30',
    reason: 'Family vacation and personal rejuvenation.',
    status: LocalizedStrings.Dashboard?.Pending || 'Pending',
  },
  {
    id: 2,
    name: 'Robert Williams',
    initials: 'RW',
    type: 'Sick Leave',
    dates: '2024-07-01 → 2024-07-09',
    reason: 'Recovering from a severe flu, doctor recommended rest.',
    status: LocalizedStrings.Dashboard?.Approved || 'Approved',
  },
  {
    id: 3,
    name: 'Maria Garcia',
    initials: 'MG',
    type: 'Casual Leave',
    dates: '2024-07-25 → 2024-07-30',
    reason: 'Attending a cousin’s wedding ceremony.',
    status: LocalizedStrings.Dashboard?.Pending || 'Pending',
  },
  {
    id: 4,
    name: 'David Lee',
    initials: 'DL',
    type: 'Sick Leave',
    dates: '2024-07-08 → 2024-07-16',
    reason: 'Expecting the arrival of a new family member.',
    status: LocalizedStrings.Dashboard?.Rejected || 'Rejected',
  },
  {
    id: 5,
    name: 'Sophia Chen',
    initials: 'SC',
    type: 'Annual Leave',
    dates: '2024-07-23 → 2024-07-26',
    reason: 'Home renovation project.',
    status: LocalizedStrings.Dashboard?.Pending || 'Pending',
  },
];
export default function LeaveApplicationsScreen({ navigation }) {
  const [leaveList, setLeaveList] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    Profile();
  }, [isFocused]);

  const Profile = () => {
    GET_WITH_TOKEN(
      LeaveListUser,
      success => {
        setLeaveList(success?.data);
        // SimpleToast.show('ssss to load profile', SimpleToast.SHORT);
        // Profile();
      },
      error => {
        // SimpleToast.show('Failed to load profile', SimpleToast.SHORT);
      },
      fail => {
        // SimpleToast.show('Network error. Please try again.', SimpleToast.SHORT);
      },
    );
  };

  const manageLeaves = (type, id) => {
    const route = type == 'Approve' ? LeaveApprove : LeaveRejectr;
    POST_WITH_TOKEN(
      `${route}/${id}`,
      {},
      success => {
        console.log('API success:', success);
        Profile();
        SimpleToast.show(
          success?.message || 'Quit job request submitted successfully!',
          SimpleToast.SHORT,
        );
      },
      error => {
        console.log('API Error:', error);
      },
      fail => {
        console.log('Network Error:', fail);
      },
    );
  };

  return (
    <CommanView>
      <HeaderForUser
        title={
          LocalizedStrings.Dashboard?.Leave_Applications || 'Leave Applications'
        }
        navigation={navigation}
        showRightIcon={true}
        source_logo={ImageConstant?.notification}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation?.goBack()}
        onPressRightIcon={() => navigation.navigate('Notification')}
        style_title={{ fontSize: 18 }}
      />
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
            {LocalizedStrings.Dashboard?.Recent_Requests || 'Recent Requests'}
          </Typography>
          {leaveList?.length > 0 ? (
            <Typography type={Font.Poppins_Regular}>
              {leaveList?.length + 1} total
            </Typography>
          ) : (
            ''
          )}
        </View>
        {leaveList.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.avatar}>
                <Typography
                  type={Font.Poppins_SemiBold}
                  style={[styles.avatarText, { textTransform: 'capitalize' }]}
                >
                  {item.user.first_name?.charAt(0)}
                </Typography>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Typography type={Font.Poppins_SemiBold} style={styles.name}>
                  {item.user.first_name} {item.user.last_name}
                </Typography>
                <Typography type={Font.Poppins_Regular} style={styles.type}>
                  {item.leave_type?.name}
                </Typography>
              </View>
              <View
                style={[
                  styles.statusTag,
                  {
                    backgroundColor:
                      item.status ==
                      (LocalizedStrings.Dashboard?.Approved || 'approved')
                        ? '#A7F3D0'
                        : item.status ==
                          (LocalizedStrings.Dashboard?.Pending || 'pending')
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
                        item.status ==
                        (LocalizedStrings.Dashboard?.Approved || 'approved')
                          ? '#047857'
                          : item.status ==
                            (LocalizedStrings.Dashboard?.Pending || 'Pending')
                          ? '#B45309'
                          : '#B91C1C',
                    },
                  ]}
                >
                  {item.status}
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
                {LocalizedStrings.Dashboard?.Dates_Requested ||
                  'Dates Requested'}
                : {item.start_date} - {item.end_date}
              </Typography>
            </View>
            <View style={styles.row}>
              <Image
                source={ImageConstant.lines}
                style={styles.icon}
                resizeMode="contain"
              />
              <Typography type={Font.Poppins_Regular} style={styles.reason}>
                {LocalizedStrings.Dashboard?.Reason || 'Reason'}: {item.reason}
              </Typography>
            </View>
            {item.status !== 'approved' && (
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
                  onPress={() => manageLeaves('Reject', item?.id)}
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
                    {LocalizedStrings.Dashboard?.Reject || 'Reject'}
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#D98579' }]}
                  onPress={() => manageLeaves('Approve', item?.id)}
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
                    {LocalizedStrings.Dashboard?.Approve || 'Approve'}
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
  avatarText: { fontSize: 15, color: '#333' },
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
});
