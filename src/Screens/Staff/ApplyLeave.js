import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import { Font } from '../../Constants/Font';
import Button from '../../Component/Button';
import Input from '../../Component/Input';
import DropdownComponent from '../../Component/DropdownComponent';
import Date_Picker from '../../Component/Date_Picker';
import { ImageConstant } from '../../Constants/ImageConstant';
import LocalizedStrings from '../../Constants/localization';
import { useIsFocused } from '@react-navigation/native';
import { GET_WITH_TOKEN, POST_WITH_TOKEN } from '../../Backend/Backend';
import {
  LeaveList,
  ApplyLeave as ApplyLeaveRoute,
  myWork,
  PROFILE,
} from '../../Backend/api_routes';
import SimpleToast from 'react-native-simple-toast';
import moment from 'moment';
import { useSelector } from 'react-redux';

const ApplyLeave = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const userDetail = useSelector(store => store?.userDetails);
  const [leaveList, setLeaveList] = useState([]);
  const paramHouseownerId = route?.params?.houseownerId;
  // Form state variables
  const [leaveType, setLeaveType] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [houseownerId, setHouseownerId] = useState(paramHouseownerId || null);

  // Error states
  const [errors, setErrors] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaveTypes();
    if (!houseownerId) {
      // Try userDetail first for houseowner info
      const fromUser =
        userDetail?.added_by ||
        userDetail?.houseowner_id ||
        userDetail?.house_owner_id ||
        userDetail?.employer_id ||
        null;
      if (fromUser) {
        setHouseownerId(fromUser);
      } else {
        // Fetch from profile API to get added_by field
        fetchHouseownerFromProfile();
      }
    }
  }, [isFocused]);

  const fetchHouseownerFromProfile = () => {
    GET_WITH_TOKEN(
      PROFILE,
      success => {
        const profile = success?.data;
        const ownerId =
          profile?.added_by ||
          profile?.houseowner_id ||
          profile?.employer_id ||
          null;
        if (ownerId) {
          setHouseownerId(ownerId);
        } else {
          // Fall back to myWork API
          fetchHouseownerFromMyWork();
        }
      },
      () => fetchHouseownerFromMyWork(),
      () => fetchHouseownerFromMyWork(),
    );
  };

  const fetchHouseownerFromMyWork = () => {
    GET_WITH_TOKEN(
      myWork,
      success => {
        const data = success?.data;
        const ownerId = data?.added_by || null;
        if (ownerId) {
          setHouseownerId(ownerId);
        }
      },
      () => {},
      () => {},
    );
  };

  const fetchLeaveTypes = () => {
    GET_WITH_TOKEN(
      LeaveList,
      success => {
        const leaveTypes = success?.data?.map(item => ({
          
          value: item.id,
          label: item.name,
        }));
        setLeaveList(leaveTypes || []);
      },
      error => {
        console.log('error----', error);
        SimpleToast.show('Failed to load leave types', SimpleToast.SHORT);
      },
      fail => {
        SimpleToast.show('Network error. Please try again.', SimpleToast.SHORT);
      },
    );
  };

  // Clear error handler
  const clearError = field => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    };
    let hasError = false;

    // Validate Leave Type
    if (!leaveType || (!leaveType?.value && !leaveType)) {
      newErrors.leaveType = 'Please select leave type';
      hasError = true;
    }

    // Validate Start Date
    if (!startDate || startDate.trim() === '') {
      newErrors.startDate = 'Start date field is required.';
      hasError = true;
    } else {
      const startMoment = moment(
        startDate,
        ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601],
        true,
      );
      if (!startMoment.isValid()) {
        newErrors.startDate = 'Invalid start date format.';
        hasError = true;
      }
    }

    // Validate End Date
    if (!endDate || endDate.trim() === '') {
      newErrors.endDate = 'End date field is required.';
      hasError = true;
    } else {
      const endMoment = moment(
        endDate,
        ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601],
        true,
      );
      if (!endMoment.isValid()) {
        newErrors.endDate = 'Invalid end date format.';
        hasError = true;
      } else if (startDate) {
        const startMoment = moment(
          startDate,
          ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601],
          true,
        );
        if (startMoment.isValid() && endMoment.isBefore(startMoment, 'day')) {
          newErrors.endDate = 'End date cannot be before start date.';
          hasError = true;
        }
      }
    }

    // Validate Reason
    if (!reason || reason.trim() === '') {
      newErrors.reason = 'Reason field is required.';
      hasError = true;
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters.';
      hasError = true;
    } else if (reason.trim().length > 500) {
      newErrors.reason = 'Reason must not exceed 500 characters.';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (loading) return;

    if (!validateForm()) {
      SimpleToast.show(
        'Please fill all required fields correctly',
        SimpleToast.SHORT,
      );
      return;
    }

    setLoading(true);

    const startDateFormatted =
      typeof startDate === 'string'
        ? moment(startDate, ['YYYY-MM-DD', 'DD-MM-YYYY'], true).format(
            'YYYY-MM-DD',
          )
        : moment(startDate).format('YYYY-MM-DD');

    const endDateFormatted =
      typeof endDate === 'string'
        ? moment(endDate, ['YYYY-MM-DD', 'DD-MM-YYYY'], true).format(
            'YYYY-MM-DD',
          )
        : moment(endDate).format('YYYY-MM-DD');

    if (!houseownerId) {
      SimpleToast.show('Houseowner not found. Please try again.', SimpleToast.SHORT);
      setLoading(false);
      return;
    }

    const body = {
      houseowner_id: Number(houseownerId),
      leave_type_id: Number(leaveType?.value || leaveType),
      start_date: startDateFormatted,
      end_date: endDateFormatted,
      reason: reason.trim(),
    };

    POST_WITH_TOKEN(
      ApplyLeaveRoute,
      body,
      success => {
        setLoading(false);
        SimpleToast.show(
          success?.message || 'Leave request submitted successfully!',
          SimpleToast.SHORT,
        );
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('TabNavigationForStaff', { screen: 'DashboardHome' });
        }
      },
      error => {
        setLoading(false);
        const msg = error?.data?.message || error?.message || error?.response?.data?.message;
        const errorMessage = msg || 'Failed to submit leave request. Please try again.';
        SimpleToast.show(errorMessage, SimpleToast.SHORT);
      },
      fail => {
        setLoading(false);
        SimpleToast.show(
          'Network error. Please check your connection and try again.',
          SimpleToast.SHORT,
        );
      },
    );
  };
  return (
    <CommanView>
      <HeaderForUser
        title={
          LocalizedStrings.staffSection?.StaffDashboard?.apply_leave ||
          'Apply Leave'
        }
        style_title={{ fontSize: 18 }}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <DropdownComponent
            title={
              LocalizedStrings.LeaveApplications?.LeaveType || 'Leave Type'
            }
            placeholder={
              LocalizedStrings.LeaveApplications?.LeaveType ||
              'Select leave type'
            }
            width={'100%'}
            style_dropdown={{ marginHorizontal: 0 }}
            selectedTextStyleNew={{
              marginLeft: 10,
              fontFamily: Font.Poppins_Regular,
            }}
            marginHorizontal={0}
            style_title={{
              textAlign: 'left',
              fontFamily: Font.Poppins_Regular,
            }}
            data={leaveList}
            value={leaveType}
            onChange={item => {
              setLeaveType(item);
              clearError('leaveType');
            }}
            error={errors.leaveType}
          />

          <Date_Picker
            title={
              LocalizedStrings.LeaveApplications?.Start_Date || 'Start Date'
            }
            placeholder="DD-MM-YYYY"
            selected_date={startDate}
            onConfirm={date => {
              const formattedDate = moment(date).format('YYYY-MM-DD');
              setStartDate(formattedDate);
              clearError('startDate');
            }}
            allowFutureDates={true}
            error={errors.startDate}
          />

          <Date_Picker
            title={LocalizedStrings.LeaveApplications?.End_Date || 'End Date'}
            placeholder="DD-MM-YYYY"
            selected_date={endDate}
            onConfirm={date => {
              const formattedDate = moment(date).format('YYYY-MM-DD');
              setEndDate(formattedDate);
              clearError('endDate');
            }}
            allowFutureDates={true}
            error={errors.endDate}
          />

          <Input
            title={
              LocalizedStrings.LeaveApplications?.Reason || 'Reason for Absence'
            }
            placeholder={
              LocalizedStrings.LeaveApplications?.Reason_Placeholder ||
              'Please describe your reason in detail...'
            }
            value={reason}
            onChange={value => {
              setReason(value);
              clearError('reason');
            }}
            style_inputContainer={{ height: 100 }}
            style_input={{ textAlign: 'start' }}
            multiline={true}
            numberOfLines={4}
            error={errors.reason}
          />

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={handleSubmit}
          title={
            LocalizedStrings.LeaveApplications?.Submit_Leave_Request ||
            'Submit Leave Request'
          }
          main_style={styles.button}
          loader={loading}
        />
      </View>
    </CommanView>
  );
};

export default ApplyLeave;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#EBEBEA',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  button: {
    width: '100%',
  },
});
