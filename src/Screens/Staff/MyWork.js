import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import Typography from '../../Component/UI/Typography';
import { Font } from '../../Constants/Font';
import { ImageConstant } from '../../Constants/ImageConstant';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import LocalizedStrings from '../../Constants/localization';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import { myWorkJobs } from '../../Backend/api_routes';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const MyWork = () => {
  const navigation = useNavigation();
  const userDetail = useSelector(store => store?.userDetails);
  const [jobList, setJobList] = useState([]);
  const isFocused = useIsFocused();
  const Profile = async () => {
    if (!userDetail?.id) return;
    GET_WITH_TOKEN(
      `${myWorkJobs}/${userDetail?.id}`,
      success => {
        const data = success?.data;
        setJobList(Array.isArray(data) ? data : data ? [data] : []);
      },
      error => {},
      fail => {},
    );
  };

  useEffect(() => {
    if (userDetail?.id) {
      Profile();
    }
  }, [isFocused, userDetail?.id]);

  // Get user profile image from userDetails, fallback to default icon
  const profileIcon = userDetail?.image
    ? userDetail.image
    : ImageConstant?.user;

  return (
    <CommanView>
      <HeaderForUser
        title={LocalizedStrings.staffSection?.MyWork?.title || 'My Work'}
        onPressLeftIcon={() => navigation?.goBack()}
        style_title={styles.headerTitle}
        source_logo={ImageConstant?.notification}
        Profile_icon={profileIcon}
        onPressRightIcon={() => navigation.navigate('Notification')}
      />
      <View style={styles.spacer} />

      {jobList.map((job, index) => (
        <View key={index} style={styles.card}>
          <View
            style={[
              styles.titleRow,
              { borderColor: 'white', marginTop: 0, paddingTop: 0 },
            ]}
          >
            <Image source={ImageConstant?.lines} style={styles.titleIcon} />
            <Typography
              type={Font.Poppins_SemiBold}
              size={17}
              style={styles.title}
            >
              {LocalizedStrings.staffSection?.MyWork?.current_employer ||
                'Current Employer'}
            </Typography>
          </View>
          <View style={styles.rowInline}>
            <Typography size={13} style={styles.text}>
              {LocalizedStrings.staffSection?.MyWork?.employer || 'Employer'}:{' '}
            </Typography>
            <Typography type={Font.Poppins_SemiBold} size={13}>
              {job.creator?.name || 'N/A'}
            </Typography>
          </View>
          <View style={styles.rowInline}>
            <Typography size={13} style={styles.text}>
              {LocalizedStrings.staffSection?.MyWork?.role || 'Role'}:{' '}
            </Typography>
            <Typography type={Font.Poppins_SemiBold} size={13}>
              {job.title}
            </Typography>
          </View>
          <View style={styles.rowInline}>
            <Typography size={13} style={styles.text}>
              {LocalizedStrings.staffSection?.MyWork?.joined || 'Joined'}:{' '}
            </Typography>
            <Typography type={Font.Poppins_SemiBold} size={13}>
              {formatDate(job.created_at)}
            </Typography>
          </View>

          <View style={styles.titleRow}>
            <Image source={ImageConstant?.Salary} style={styles.titleIcon} />
            <Typography
              type={Font.Poppins_SemiBold}
              size={17}
              style={styles.title}
            >
              {LocalizedStrings.staffSection?.MyWork?.salary_summary ||
                'Salary Summary'}
            </Typography>
          </View>
          <Typography size={12} style={styles.label}>
            {LocalizedStrings.staffSection?.MyWork?.current_monthly_salary ||
              'Current Monthly Salary'}
          </Typography>
          <Typography
            type={Font.Poppins_Bold}
            size={20}
            style={styles.valueBig}
          >
            ${job.compensation} {job.compensation_type ? `(${job.compensation_type})` : ''}
          </Typography>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate('EarningSummary', {
                id: job?.id,
              })
            }
          >
            <Typography size={14} style={styles.buttonText}>
              {LocalizedStrings.staffSection?.MyWork?.view_details ||
                'View Details'}{' '}
            </Typography>
            <Image
              source={ImageConstant?.next}
              tintColor={'white'}
              style={{
                width: 20,
                height: 13,
                resizeMode: 'center',
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.quitButton]}
            onPress={() =>
              navigation.navigate('QuitJob', { jobId: job?.id })
            }
          >
            <Image
              source={ImageConstant?.Door}
              tintColor={'white'}
              style={{
                width: 20,
                height: 13,
                resizeMode: 'center',
              }}
            />
            <Typography size={14} style={styles.quitText}>
              {LocalizedStrings.staffSection?.MyWork?.quit_job || 'Quit Job'}
            </Typography>
          </TouchableOpacity>
        </View>
      ))}
      <View style={styles.bottomSpacer} />
    </CommanView>
  );
};

export default MyWork;

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
  },
  spacer: {
    height: 20,
  },
  bottomSpacer: {
    height: 100,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 0,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#DEE1E6',
    paddingVertical: 12,
    marginTop: 10,
  },
  titleIcon: {
    height: 20,
    width: 22,
    marginRight: 6,
    tintColor: '#171A1F',
    objectFit: 'contain',
  },
  title: {
    color: '#000',
  },

  text: {
    color: '#555',
    marginBottom: 2,
  },
  label: {
    color: 'gray',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  rowInline: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },

  value: {
    fontWeight: '600',
    color: '#000',
    fontFamily: Font?.Poppins_SemiBold,
  },
  valueBig: {
    color: '#000',
    marginVertical: 6,
  },

  button: {
    backgroundColor: '#D98579',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff' },
  secondaryButton: {
    backgroundColor: 'white',
    borderColor: '#DEE1E6',
    borderWidth: 2,
  },
  secondaryBtnText: {
    color: 'black',
  },

  quitButton: {
    backgroundColor: '#BD6162',
  },
  quitText: {
    color: 'white',
  },
});
