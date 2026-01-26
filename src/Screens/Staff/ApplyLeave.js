import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import { Font } from '../../Constants/Font';
import Button from '../../Component/Button';
import Input from '../../Component/Input';
import DropdownComponent from '../../Component/DropdownComponent';
import Date_Picker from '../../Component/Date_Picker';
import UploadBox from '../../Component/UploadBox';
import { ImageConstant } from '../../Constants/ImageConstant';
import LocalizedStrings from '../../Constants/localization';
import { useIsFocused } from '@react-navigation/native';
import { GET_WITH_TOKEN, POST_FORM_DATA } from '../../Backend/Backend';
import {
  LeaveList,
  ApplyLeave as ApplyLeaveRoute,
} from '../../Backend/api_routes';
import SimpleToast from 'react-native-simple-toast';
import moment from 'moment';
import { launchImageLibrary } from 'react-native-image-picker';
import { validators } from '../../Backend/Validator';

const ApplyLeave = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const [leaveList, setLeaveList] = useState([]);
  const jobID = route?.params?.jobId;
  // Form state variables
  const [leaveType, setLeaveType] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [loading, setLoading] = useState(false);


  // Error states
  const [errors, setErrors] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, [isFocused]);

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

  // Image picker handler for document
  const handleDocumentPicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        return;
      } else if (response.errorMessage) {
        SimpleToast.show('Error picking document', SimpleToast.SHORT);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const documentData = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `document_${Date.now()}.jpg`,
          path: asset.uri,
        };
        setSupportingDocument(documentData);
      }
    });
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

    const formData = new FormData();
    formData.append('leave_type_id', leaveType?.value || leaveType);

    // Format dates properly
    const startDateFormatted =
      typeof startDate === 'string'
        ? moment(startDate, ['YYYY-MM-DD', 'DD-MM-YYYY'], true).format(
            'YYYY-MM-DD',
          )
        : moment(startDate).format('YYYY-MM-DD');
    formData.append('start_date', startDateFormatted);

    const endDateFormatted =
      typeof endDate === 'string'
        ? moment(endDate, ['YYYY-MM-DD', 'DD-MM-YYYY'], true).format(
            'YYYY-MM-DD',
          )
        : moment(endDate).format('YYYY-MM-DD');
    formData.append('end_date', endDateFormatted);

    formData.append('reason', reason.trim());
    formData.append('job_id', jobID);
    console.log('jobID----', formData);

    // Add supporting document if provided
    if (supportingDocument && supportingDocument.uri) {
      formData.append('supporting_document', {
        uri: supportingDocument.uri,
        name: supportingDocument.name || 'supporting_document.jpg',
        type: supportingDocument.type || 'image/jpeg',
      });
    }

    POST_FORM_DATA(
      ApplyLeaveRoute,
      formData,
      success => {
        setLoading(false);
        SimpleToast.show(
          success?.message || 'Leave request submitted successfully!',
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
          'Failed to submit leave request. Please try again.';
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

          <View style={styles.uploadContainer}>
            <UploadBox
              title={
                supportingDocument
                  ? 'Document Selected'
                  : LocalizedStrings.LeaveApplications?.Supporting_Document ||
                    'Supporting Document (Optional)'
              }
              icon={ImageConstant.Doc}
              onPress={handleDocumentPicker}
            />
            {supportingDocument && (
              <Input
                title="Selected File"
                value={supportingDocument.name || 'Document'}
                editable={false}
                style_title={{ color: '#8C8D8B', fontSize: 12 }}
              />
            )}
          </View>
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
  uploadContainer: {
    marginTop: 10,
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
