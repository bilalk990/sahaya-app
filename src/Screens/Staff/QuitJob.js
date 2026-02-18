import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import Input from '../../Component/Input';
import Button from '../../Component/Button';
import { ImageConstant } from '../../Constants/ImageConstant';
import LocalizedStrings from '../../Constants/localization';
import { POST_WITH_TOKEN } from '../../Backend/Backend';
import Date_Picker from '../../Component/Date_Picker';
import { QuitJob as QuitJobRoute } from '../../Backend/api_routes';
import moment from 'moment';
import SimpleToast from 'react-native-simple-toast';
import { validators } from '../../Backend/Validator';

const QuitJob = ({ navigation, route }) => {
  const jobId = route?.params?.jobId || route?.params?.job_id;

  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    endDate: '',
    reason: '',
  });

  const clearError = field => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {
      endDate: '',
      reason: '',
    };
    let hasError = false;

    // Validate End Date
    if (!endDate || endDate.trim() === '') {
      newErrors.endDate = 'End date field is required.';
      hasError = true;
    } else {
      const dateMoment = moment(
        endDate,
        ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601],
        true,
      );
      if (!dateMoment.isValid()) {
        newErrors.endDate = 'Invalid date format.';
        hasError = true;
      } else {
        const today = moment();
        if (dateMoment.isBefore(today, 'day')) {
          newErrors.endDate = 'End date cannot be in the past.';
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

    if (!jobId) {
      SimpleToast.show(
        'Job ID is missing. Please try again.',
        SimpleToast.SHORT,
      );
      return;
    }

    setLoading(true);

    const endDateFormatted =
      typeof endDate === 'string'
        ? moment(endDate, ['YYYY-MM-DD', 'DD-MM-YYYY'], true).format(
            'YYYY-MM-DD',
          )
        : moment(endDate).format('YYYY-MM-DD');

    const body = {
      job_id: jobId,
      end_date: endDateFormatted,
      reason: reason.trim(),
    };

    POST_WITH_TOKEN(
      QuitJobRoute,
      body,
      success => {
        setLoading(false);
        SimpleToast.show(
          success?.message || 'Quit job request submitted successfully!',
          SimpleToast.SHORT,
        );
        navigation?.goBack();
      },
      error => {
        setLoading(false);
        const errorMessage =
          error?.message ||
          error?.data?.message ||
          error?.response?.data?.message ||
          'Failed to submit quit job request. Please try again.';
        SimpleToast.show(errorMessage, SimpleToast.SHORT);
        console.log('API Error:', error);
      },
      fail => {
        setLoading(false);
        SimpleToast.show(
          'Network error. Please check your connection and try again.',
          SimpleToast.SHORT,
        );
        console.log('Network Error:', fail);
      },
    );
  };

  return (
    <CommanView>
      <HeaderForUser
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation.goBack()}
        title={
          LocalizedStrings.staffSection?.RequestLeaveQuit?.request_quit_job ||
          'Request to Quit Job'
        }
        style_title={{ fontSize: 18 }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Date_Picker
            title={
              LocalizedStrings.staffSection?.RequestLeaveQuit?.end_date ||
              'End Date'
            }
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
              LocalizedStrings.staffSection?.RequestLeaveQuit?.reason_to_quit ||
              'Reason to Quit'
            }
            placeholder={
              LocalizedStrings.staffSection?.RequestLeaveQuit
                ?.reason_placeholder ||
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
            LocalizedStrings.staffSection?.RequestLeaveQuit
              ?.submit_leave_request || 'Submit Request'
          }
          main_style={styles.button}
          loader={loading}
        />
      </View>
    </CommanView>
  );
};

export default QuitJob;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
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
