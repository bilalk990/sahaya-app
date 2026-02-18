import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import Typography from '../../Component/UI/Typography';
import { Font } from '../../Constants/Font';
import { ImageConstant } from '../../Constants/ImageConstant';
import Button from '../../Component/Button';
import { useSelector } from 'react-redux';
import LocalizedStrings from '../../Constants/localization';
import { useIsFocused } from '@react-navigation/native';
import SimpleToast from 'react-native-simple-toast';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import { customerDashbord } from '../../Backend/api_routes';

const StaffDashboard = ({ navigation }) => {
  const userDetail = useSelector(store => store?.userDetails);
  const isFocused = useIsFocused();
  const [dataDash, setDataDash] = useState();

  useEffect(() => {
    GetUser();
  }, [isFocused]);

  const GetUser = () => {
    GET_WITH_TOKEN(
      customerDashbord,
      success => {
        setDataDash(success?.data);
      },
      error => {
        SimpleToast.show('Failed to load profile', SimpleToast.SHORT);
      },
      fail => {
        SimpleToast.show('Network error. Please try again.', SimpleToast.SHORT);
      },
    );
  };

  // Get user image and name - skip default/placeholder images from backend
  const imgUrl = userDetail?.image?.toLowerCase() || '';
  const isDefaultImage =
    !userDetail?.image ||
    imgUrl.includes('noimage') ||
    imgUrl.includes('no_image') ||
    imgUrl.includes('no-image') ||
    imgUrl.includes('default') ||
    imgUrl.includes('placeholder');
  const userImage = isDefaultImage ? null : userDetail.image;
  const userName =
    userDetail?.first_name && userDetail?.last_name
      ? `${userDetail.first_name} ${userDetail.last_name}`
      : userDetail?.first_name || userDetail?.name || 'User';
  return (
    <CommanView>
      <HeaderForUser
        title={
          LocalizedStrings.staffSection?.StaffDashboard?.title ||
          'Staff Dashboard'
        }
        style_title={{ fontSize: 18 }}
        source_logo={ImageConstant?.notification}
        onPressRightIcon={() => navigation.navigate('Notifications')}
      />

      <TouchableOpacity
        onPress={() => {
          navigation.navigate('StaffProfileMain');
        }}
        style={[styles.card, { marginTop: 20 }]}
      >
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', flex: 0.9 }}>
            <Image
              source={userImage ? { uri: userImage } : ImageConstant.user}
              style={styles.profilePic}
            />
            <View style={{ marginLeft: 10 }}>
              <Typography type={Font.Poppins_Bold} style={styles.name}>
                {userName}
              </Typography>
              <Typography type={Font.Poppins_Regular}>
                {LocalizedStrings.staffSection?.StaffDashboard?.greeting ||
                  'Ready for a productive day!'}
              </Typography>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flex: 0.1,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            <Image
              source={ImageConstant?.BackArrow}
              tintColor={'#D98579'}
              style={{
                width: 20,
                height: 20,
                resizeMode: 'center',
                transform: [{ rotate: '180deg' }],
              }}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.rowBetween}>
        <View style={[styles.card, styles.flexCard, styles.summaryCard]}>
          <View style={styles.cardContent}>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 10,
                alignItems: 'center',
              }}
            >
              <Image
                source={ImageConstant.late}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: '#D98579',
                  marginRight: 10,
                }}
              />
              <Typography type={Font.Poppins_Medium} style={styles.greenText}>
                {LocalizedStrings.staffSection?.StaffDashboard?.present_today ||
                  'Present Today'}
              </Typography>
            </View>
            <Typography type={Font.Poppins_SemiBold} color="#8C8D8B">
              {LocalizedStrings.staffSection?.StaffDashboard
                ?.attendance_summary || 'Attendance Summary'}
            </Typography>
            <Typography type={Font.Poppins_light} size={14}>
              {LocalizedStrings.staffSection?.StaffDashboard?.last_30_days ||
                'Last 30 Days'} - {dataDash?.attendance_summary?.last_30_days?.days_present || 0}{' '}
              {LocalizedStrings.staffSection?.StaffDashboard?.days_present ||
                'Days Present'}
              {'\n'}{dataDash?.attendance_summary?.last_30_days?.leaves_taken || 0}{' '}
              {LocalizedStrings.staffSection?.StaffDashboard?.leaves_taken ||
                'Leaves'}
            </Typography>
          </View>
          <Button
            title={
              LocalizedStrings.staffSection?.StaffDashboard?.view_statistics ||
              'View Statistics'
            }
            main_style={styles.smallBtn}
            title_style={styles.btnTextSmall}
            onPress={() => navigation.navigate('StaffAttendance')}
            style={{ height: 40 }}
          />
        </View>

        <View style={[styles.card, styles.flexCard, styles.summaryCard]}>
          <View style={styles.cardContent}>
            <Image
              source={ImageConstant.Dollar}
              style={{
                height: 20,
                width: 20,
                tintColor: '#D98579',
                marginRight: 10,
                marginBottom: 10,
              }}
            />
            <Typography type={Font.Poppins_SemiBold} color="#8C8D8B">
              {LocalizedStrings.staffSection?.StaffDashboard?.earnings_summary ||
                'Earnings Summary'}
            </Typography>
            <Typography type={Font.Poppins_Bold} style={styles.earning}>
              ${dataDash?.earnings_summary?.total_earnings || 0}
            </Typography>
            <Typography style={styles.subText}>
              {LocalizedStrings.staffSection?.StaffDashboard
                ?.total_earnings_month || 'Total earnings this month'}
            </Typography>
          </View>
          <Button
            title={
              LocalizedStrings.staffSection?.StaffDashboard?.view_details ||
              'View Details'
            }
            main_style={styles.smallBtn}
            title_style={styles.btnTextSmall}
            onPress={() => navigation.navigate('EarningSummary')}
            style={{ height: 40 }}
          />
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={[styles.card, styles.flexCard, styles.summaryCard]}>
          <View style={styles.cardContent}>
            <Image
              source={ImageConstant.lines}
              style={{
                height: 25,
                width: 20,
                tintColor: '#D98579',
                marginRight: 10,
                marginBottom: 10,
              }}
            />
            <Typography type={Font.Poppins_SemiBold} color="#8C8D8B">
              {LocalizedStrings.staffSection?.StaffDashboard?.leave_requests ||
                'Leave Requests'}
            </Typography>
            <Typography type={Font?.Poppins_Bold}>
              {dataDash?.leave_summary?.last_month?.total_requests || 0} {LocalizedStrings.LeaveApplications?.LeaveType || 'Leave Type'}
            </Typography>
            <Typography style={styles.subText}>
              {LocalizedStrings.staffSection?.StaffDashboard?.in_last_month ||
                'In Last month'}
            </Typography>
            <Typography style={styles.linkText}>
              {LocalizedStrings.staffSection?.StaffDashboard?.view_history ||
                'View History'}
            </Typography>
          </View>
          <Button
            title={
              LocalizedStrings.staffSection?.StaffDashboard?.apply_leave ||
              'Apply Leave'
            }
            main_style={styles.smallBtn}
            title_style={styles.btnTextSmall}
            onPress={() => navigation.navigate('ApplyLeave')}
            style={{ height: 40 }}
          />
        </View>

        <View style={[styles.card, styles.flexCard, styles.summaryCard]}>
          <View style={styles.cardContent}>
            <Image
              source={ImageConstant.Calendar}
              style={{
                height: 25,
                width: 22.5,
                tintColor: '#D98579',
                marginRight: 10,
                marginBottom: 10,
              }}
            />
            <Typography type={Font.Poppins_SemiBold} color="#8C8D8B">
              {LocalizedStrings.staffSection?.StaffDashboard?.new_job_matches ||
                'New Job Matches'}
            </Typography>
            <Typography type={Font.Poppins_Bold}>
              {dataDash?.job_matches?.count || 0} {LocalizedStrings.staffSection?.JobDetails?.title || 'Job Details'}
            </Typography>
            <Typography style={styles.subText}>
              {LocalizedStrings.staffSection?.StaffDashboard?.recommended_jobs ||
                'Recommended jobs based on your profile'}
            </Typography>
          </View>
          <Button
            title={
              LocalizedStrings.staffSection?.StaffDashboard?.view_jobs ||
              'View Jobs'
            }
            main_style={styles.smallBtn}
            title_style={styles.btnTextSmall}
            onPress={() => navigation.navigate('ActiveJob')}
            style={{ height: 40 }}
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: '#EBEBEA' }]}>
        <Typography type={Font.Poppins_SemiBold} size={17}>
          {LocalizedStrings.staffSection?.StaffDashboard?.recent_alerts ||
            'Recent Alerts'}
        </Typography>

        <View style={styles.alertItem}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={ImageConstant.late}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: '#22C55E',
                  marginRight: 10,
                }}
              />
              <Typography type={Font.Poppins_Medium} size={15}>
                {LocalizedStrings.staffSection?.StaffDashboard
                  ?.payment_processed || 'Payment Processed'}
              </Typography>
            </View>
            <Typography style={styles.alertTime}>2 hours ago</Typography>
          </View>
          <View style={{ paddingLeft: 30 }}>
            <Typography style={styles.subText}>
              {LocalizedStrings.staffSection?.StaffDashboard?.salary_credited ||
                'Your salary has been successfully credited.'}
            </Typography>
          </View>
        </View>

        <View style={[styles.alertItem, { borderBottomWidth: 0 }]}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={ImageConstant.mail}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: '#D98579',
                  marginRight: 10,
                  marginTop: 2,
                }}
              />
              <Typography type={Font.Poppins_Medium} size={15}>
                {LocalizedStrings.staffSection?.StaffDashboard
                  ?.new_policy_update || 'New Policy Update'}
              </Typography>
            </View>

            <Typography style={styles.alertTime}>7 hours ago</Typography>
          </View>
          <View style={{ paddingLeft: 30 }}>
            <Typography style={[styles.subText]}>
              {LocalizedStrings.staffSection?.StaffDashboard?.review_policy ||
                'Review the updated company travel policy.'}
            </Typography>
          </View>
        </View>
      </View>
      <View style={{ height: 100 }} />
    </CommanView>
  );
};

export default StaffDashboard;

const styles = StyleSheet.create({
  headerTitle: { fontSize: 18 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBEBEA',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    fontSize: 16,
    marginBottom: 4,
  },

  flexCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  summaryCard: {
    minHeight: 220,
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  smallBtn: {
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
  },
  btnTextSmall: {
    fontSize: 12,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
  },

  greenText: {
    color: 'green',
    fontSize: 12,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  earning: {
    fontSize: 18,
    color: '#E87C6F',
    marginVertical: 6,
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  alertItem: {
    marginVertical: 5,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
