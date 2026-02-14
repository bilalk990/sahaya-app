import { StyleSheet, View, ScrollView, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import CommanView from '../../../Component/CommanView';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import Input from '../../../Component/Input';
import HeaderForUser from '../../../Component/HeaderForUser';
import Button from '../../../Component/Button';
import DropdownComponent from '../../../Component/DropdownComponent';
import UploadBox from '../../../Component/UploadBox';
import Date_Picker from '../../../Component/Date_Picker';
import { ImageConstant } from '../../../Constants/ImageConstant';
import LocalizedStrings from '../../../Constants/localization';
import { POST_FORM_DATA } from '../../../Backend/Backend';
import { validators } from '../../../Backend/Validator';
import { fetchPincodeDetails } from '../../../Backend/Utility';
import SimpleToast from 'react-native-simple-toast';
import moment from 'moment';
import { launchImageLibrary } from 'react-native-image-picker';
import { AddStaff, UpdateStaff } from '../../../Backend/api_routes';

const NewStaffForm = ({ navigation, route }) => {
  const data = route?.params?.userData;
  const adharNumber = route?.params?.adharNumber;

  // Personal Details States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberCountryCode, setPhoneNumberCountryCode] = useState('+91');
  const [aadharNumber, setAadharNumber] = useState(adharNumber || '');
  const [gender, setGender] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  // renamed to avoid confusion with React state
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [relation, setRelation] = useState(null);

  // Work Details States
  const [roleDesignation, setRoleDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [salary, setSalary] = useState('');
  const [upiId, setUpiId] = useState('');
  const [payFrequency, setPayFrequency] = useState(null);
  const [workingDays, setWorkingDays] = useState([]); // array of values

  // Document States
  const [staffPhoto, setStaffPhoto] = useState(null);
  const [policeClearance, setPoliceClearance] = useState(null);
  const [aadharCard, setAadharCard] = useState(null);

  // API States
  const [loading, setLoading] = useState(false);

  // Error States
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    aadharNumber: '',
    gender: '',
    dateOfBirth: '',
    street: '',
    city: '',
    stateName: '',
    pincode: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    relation: '',
    roleDesignation: '',
    joiningDate: '',
    salary: '',
    payFrequency: '',
    workingDays: '',
  });

  // Gender Options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  // Pay Frequency Options
  const payFrequencyOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Daily', value: 'daily' },
  ];

  // Working Days Options
  const workingDaysOptions = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
  ];

  // Relation Options
  const relationOptions = [
    { label: 'Brother', value: 'brother' },
    { label: 'Sister', value: 'sister' },
    { label: 'Father', value: 'father' },
    { label: 'Mother', value: 'mother' },
    { label: 'Son', value: 'son' },
    { label: 'Daughter', value: 'daughter' },
    { label: 'Spouse', value: 'spouse' },
    { label: 'Friend', value: 'friend' },
    { label: 'Other', value: 'other' },
  ];

  // Check if editing mode
  const isEditMode = !!data?.id;
  const staffId = data?.id;

  // Populate form with existing data when editing
  useEffect(() => {
    if (data && data.id) {
      // Personal Details
      if (data.first_name) setFirstName(data.first_name);
      if (data.last_name) setLastName(data.last_name);
      if (data.email) setEmail(data.email);
      if (data.phone_number) setPhoneNumber(data.phone_number);
      if (data.phone_number_country_code) {
        setPhoneNumberCountryCode(data.phone_number_country_code);
      }
      if (data.aadhar_number) setAadharNumber(data.aadhar_number);

      // Gender - find matching option
      if (data.gender) {
        const genderOption = genderOptions.find(
          opt =>
            opt.value === data.gender ||
            opt.value.toLowerCase() === data.gender.toLowerCase(),
        );
        setGender(
          genderOption || {
            label: data.gender.charAt(0).toUpperCase() + data.gender.slice(1),
            value: data.gender,
          },
        );
      }

      // Date of Birth
      if (data.dob) {
        // Handle different date formats
        const dobMoment = moment(
          data.dob,
          ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601],
          true,
        );
        if (dobMoment.isValid()) {
          setDateOfBirth(dobMoment.format('YYYY-MM-DD'));
        } else {
          setDateOfBirth(data.dob);
        }
      }

      // Address from addresses array
      if (data.addresses && data.addresses.length > 0) {
        const address = data.addresses[0];
        if (address.street) setStreet(address.street);
        if (address.city) setCity(address.city);
        if (address.state) setStateName(address.state);
        if (address.pincode) setPincode(String(address.pincode));
      }

      // Relation
      if (data.relation) {
        // Check if it's a string (name) or needs to be mapped to option
        const relationOption = relationOptions.find(
          opt => opt.value === data.relation || opt.label === data.relation,
        );
        if (relationOption) {
          setRelation(relationOption);
        } else {
          // If relation is a name string, try to find or create option
          setRelation({
            label: data.relation,
            value: data.relation.toLowerCase(),
          });
        }
      }

      // UPI ID
      if (data.upi_id) setUpiId(data.upi_id);

      // Work Details from user_work_info
      if (data.user_work_info) {
        const workInfo = data.user_work_info;
        if (workInfo.primary_role) {
          setRoleDesignation(workInfo.primary_role);
        }
      }

      // Note: Some fields like emergency_contact_name, emergency_contact_number,
      // joining_date, salary, pay_frequency, working_days might not be in the response
      // They will remain empty if not present

      // Images - if URLs are present, we can set them (but won't be editable unless re-uploaded)
      if (
        data.image &&
        data.image !== 'http://sahayya.co.in/public/noimage.jpg'
      ) {
        setStaffPhoto({ uri: data.image });
      }
      if (data.aadhar_front) {
        setAadharCard({ uri: data.aadhar_front });
      }
      if (data.verification_certificate) {
        setPoliceClearance({ uri: data.verification_certificate });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Clear city and state when pincode is cleared
  useEffect(() => {
    if (!pincode || pincode.length < 6) {
      setCity('');
      setStateName('');
      setErrors(prev => ({ ...prev, city: '', stateName: '' }));
    }
  }, [pincode]);

  // Fetch pincode details and auto-fill city and state
  useEffect(() => {
    const fetchDetails = async () => {
      if (pincode && pincode.length === 6) {
        try {
          const details = await fetchPincodeDetails(pincode);
          if (details && details.city) {
            setCity(details.city);
            setErrors(prev => (prev?.city ? { ...prev, city: null } : prev));
          }
          if (details && details.state) {
            setStateName(details.state);
            setErrors(prev =>
              prev?.stateName ? { ...prev, stateName: null } : prev,
            );
          }
        } catch (error) {
          console.error('Error fetching pincode details:', error);
        }
      }
    };

    // Small delay to avoid multiple calls (matching StepLocation)
    const timer = setTimeout(() => {
      fetchDetails();
    }, 300);

    return () => clearTimeout(timer);
  }, [pincode]);

  // Clear error handlers
  const clearError = field => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Image picker handler
  const handleImagePicker = type => {
    setLoading(false);
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
        SimpleToast.show('Error picking image', SimpleToast.SHORT);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const imageData = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `${type}_${Date.now()}.jpg`,
          path: asset.uri,
        };

        if (type === 'staffPhoto') {
          setStaffPhoto(imageData);
        } else if (type === 'policeClearance') {
          setPoliceClearance(imageData);
        } else if (type === 'aadharCard') {
          setAadharCard(imageData);
        }
      }
    });
  };

  // toggle working day for multi-select
  const toggleWorkingDay = dayValue => {
    setWorkingDays(prev => {
      if (prev.includes(dayValue)) {
        return prev.filter(d => d !== dayValue);
      }
      return [...prev, dayValue];
    });
    clearError('workingDays');
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      aadharNumber: '',
      gender: '',
      dateOfBirth: '',
      street: '',
      city: '',
      stateName: '',
      pincode: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      relation: '',
      roleDesignation: '',
      joiningDate: '',
      salary: '',
      payFrequency: '',
      workingDays: '',
    };

    let hasError = false;

    // Validate First Name
    const firstNameError = validators.checkAlphabet(
      'First Name',
      2,
      50,
      firstName,
    );
    if (firstNameError) {
      newErrors.firstName = firstNameError;
      hasError = true;
    }

    // Validate Last Name
    const lastNameError = validators.checkAlphabet(
      'Last Name',
      2,
      50,
      lastName,
    );
    if (lastNameError) {
      newErrors.lastName = lastNameError;
      hasError = true;
    }

    // Validate Email
    const emailError = validators.checkEmail('Email', email);
    if (emailError) {
      newErrors.email = emailError;
      hasError = true;
    }

    // Validate Phone Number
    const phoneError = validators.checkFixPhoneNumber(
      'Phone Number',
      phoneNumber,
      10,
      10,
    );
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
      hasError = true;
    }

    // Validate Aadhar Number
    if (!aadharNumber || aadharNumber.trim() === '') {
      newErrors.aadharNumber = 'Aadhar Number field is required.';
      hasError = true;
    } else if (!/^\d{12}$/.test(aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar Number must be 12 digits.';
      hasError = true;
    }

    // Validate Gender
    if (!gender || (!gender?.value && !gender)) {
      newErrors.gender = 'Please select gender';
      hasError = true;
    }

    // Validate Date of Birth
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth field is required.';
      hasError = true;
    } else {
      const selectedDate = moment(
        dateOfBirth,
        ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601],
        true,
      );
      const today = moment();
      if (!selectedDate.isValid()) {
        newErrors.dateOfBirth = 'Invalid date format for Date of Birth.';
        hasError = true;
      } else if (selectedDate.isAfter(today)) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future.';
        hasError = true;
      }
    }

    // Validate Street
    if (!street || street.trim() === '') {
      newErrors.street = 'Street/Landmark field is required.';
      hasError = true;
    } else if (street.trim().length < 5) {
      newErrors.street = 'Street/Landmark must be at least 5 characters.';
      hasError = true;
    }

    // Validate City
    const cityError = validators.checkAlphabet('City', 2, 50, city);
    if (cityError) {
      newErrors.city = cityError;
      hasError = true;
    }

    // Validate State
    const stateError = validators.checkAlphabet('State', 2, 50, stateName);
    if (stateError) {
      newErrors.stateName = stateError;
      hasError = true;
    }

    // Validate Pincode
    if (!pincode || pincode.trim() === '') {
      newErrors.pincode = 'Pincode field is required.';
      hasError = true;
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits.';
      hasError = true;
    }

    // Validate Emergency Contact Name
    const emergencyNameError = validators.checkAlphabet(
      'Emergency Contact Name',
      2,
      50,
      emergencyContactName,
    );
    if (emergencyNameError) {
      newErrors.emergencyContactName = emergencyNameError;
      hasError = true;
    }

    // Validate Emergency Contact Number
    const emergencyPhoneError = validators.checkFixPhoneNumber(
      'Emergency Contact Number',
      emergencyContactNumber,
      10,
      10,
    );
    if (emergencyPhoneError) {
      newErrors.emergencyContactNumber = emergencyPhoneError;
      hasError = true;
    }

    // Validate Relation
    if (!relation || (!relation?.value && !relation)) {
      newErrors.relation = 'Please select relation';
      hasError = true;
    }

    // Validate Role Designation
    if (!roleDesignation || roleDesignation.trim() === '') {
      newErrors.roleDesignation = 'Role/Designation field is required.';
      hasError = true;
    }

    // Validate Joining Date
    if (!joiningDate) {
      newErrors.joiningDate = 'Joining date field is required.';
      hasError = true;
    } else {
      const joinDateParsed = moment(
        joiningDate,
        ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601],
        true,
      );
      if (!joinDateParsed.isValid()) {
        newErrors.joiningDate = 'Invalid joining date format.';
        hasError = true;
      }
    }

    // Validate Salary
    const salaryError = validators.priceCheck('Salary', salary);
    if (salaryError) {
      newErrors.salary = salaryError;
      hasError = true;
    }

    // Validate Pay Frequency
    if (!payFrequency || (!payFrequency?.value && !payFrequency)) {
      newErrors.payFrequency = 'Please select pay frequency';
      hasError = true;
    }

    // Validate Working Days
    if (!workingDays || workingDays.length === 0) {
      newErrors.workingDays = 'Please select at least one working day';
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

    // Personal Details - ensure all values are trimmed and not empty
    formData.append('first_name', firstName?.trim() || '');
    formData.append('last_name', lastName?.trim() || '');
    formData.append('email', email?.trim() || '');
    formData.append('phone_number', phoneNumber?.trim() || '');
    formData.append(
      'phone_number_country_code',
      phoneNumberCountryCode || '+91',
    );

    // Handle gender - extract value from dropdown object
    const genderValue = gender?.value || gender || '';
    formData.append('gender', genderValue);

    // Format date of birth properly - should already be in YYYY-MM-DD format from Date_Picker
    if (
      !dateOfBirth ||
      (typeof dateOfBirth === 'string' && dateOfBirth.trim() === '')
    ) {
      SimpleToast.show('Date of birth is required', SimpleToast.SHORT);
      setLoading(false);
      return;
    }
    const dobValue =
      typeof dateOfBirth === 'string'
        ? dateOfBirth.trim()
        : moment(dateOfBirth).format('YYYY-MM-DD');
    formData.append('dob', dobValue);

    formData.append('street', street?.trim() || '');
    formData.append('city', city?.trim() || '');
    formData.append('state', stateName?.trim() || '');
    formData.append('pincode', pincode?.trim() || '');
    formData.append(
      'emergency_contact_name',
      emergencyContactName?.trim() || '',
    );
    formData.append(
      'emergency_contact_number',
      emergencyContactNumber?.trim() || '',
    );

    // Handle relation - extract value from dropdown object
    const relationValue = relation?.value || relation || '';
    formData.append('relation', relationValue);

    formData.append('aadhar_number', aadharNumber?.trim() || '');

    // Work Details - role_designation must be sent as array
    formData.append('role_designation[0]', roleDesignation?.trim() || '');

    // Format joining date properly - should already be in YYYY-MM-DD format from Date_Picker
    if (
      !joiningDate ||
      (typeof joiningDate === 'string' && joiningDate.trim() === '')
    ) {
      SimpleToast.show('Joining date is required', SimpleToast.SHORT);
      setLoading(false);
      return;
    }
    const joinDateValue =
      typeof joiningDate === 'string'
        ? joiningDate.trim()
        : moment(joiningDate).format('YYYY-MM-DD');
    formData.append('joining_date', joinDateValue);

    formData.append('salary', salary?.trim() || '');
    if (upiId?.trim()) {
      formData.append('upi_id', upiId.trim());
    }

    // Handle pay frequency - extract value from dropdown object
    const payFreqValue = payFrequency?.value || payFrequency || '';
    formData.append('pay_frequency', payFreqValue);

    // Working Days - append as array
    if (Array.isArray(workingDays)) {
      workingDays.forEach((day, index) => {
        formData.append(`working_days[${index}]`, day);
      });
    } else if (workingDays) {
      formData.append('working_days[0]', workingDays);
    }

    // Documents (optional)
    if (staffPhoto && staffPhoto.uri) {
      formData.append('staff_photo', {
        uri: staffPhoto.uri,
        name: staffPhoto.name || 'staff_photo.jpg',
        type: staffPhoto.type || 'image/jpeg',
      });
    }

    if (policeClearance && policeClearance.uri) {
      formData.append('police_clearance', {
        uri: policeClearance.uri,
        name: policeClearance.name || 'police_clearance.jpg',
        type: policeClearance.type || 'image/jpeg',
      });
    }

    if (aadharCard && aadharCard.uri) {
      formData.append('aadhar_card', {
        uri: aadharCard.uri,
        name: aadharCard.name || 'aadhar_card.jpg',
        type: aadharCard.type || 'image/jpeg',
      });
    }
    formData.append('is_staff_added', 1);

    // Determine API endpoint and add staff_id for update
    const apiEndpoint = isEditMode ? `${UpdateStaff}/${staffId}` : AddStaff;

    if (isEditMode) {
      formData.append('staff_id', String(staffId));
    }
    console.log('apiEndpoint----', apiEndpoint);
    console.log('formData----', formData);

    POST_FORM_DATA(
      apiEndpoint,
      formData,
      success => {
        setLoading(false);
        SimpleToast.show(
          success?.message ||
          (isEditMode
            ? 'Staff updated successfully!'
            : 'Staff added successfully!'),
          SimpleToast.SHORT,
        );
        navigation.navigate('TabNavigation', {
          screen: 'Dashboard',
        });
      },
      error => {
        setLoading(false);
        console.log('API Error Full:', JSON.stringify(error));

        // Extract Laravel validation errors
        const validationErrors = error?.errors || error?.data?.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          // Get first validation error message for each field
          const fieldErrors = Object.entries(validationErrors)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join('\n');
          console.log('Validation errors:', fieldErrors);
          SimpleToast.show(fieldErrors, SimpleToast.LONG);
        } else {
          const errorMessage =
            error?.message ||
            error?.data?.message ||
            error?.response?.data?.message ||
            (isEditMode
              ? 'Failed to update staff. Please try again.'
              : 'Failed to add staff. Please try again.');
          SimpleToast.show(errorMessage, SimpleToast.LONG);
        }
      },
      fail => {
        setLoading(false);
        SimpleToast.show(
          'Network error. Please check your connection and try again.',
          SimpleToast.SHORT,
        );
        console.log('Network Error:-----', fail);
      },
    );
  };

  return (
    <CommanView>
      <HeaderForUser
        source_arrow={ImageConstant?.BackArrow}
        title={LocalizedStrings.NewStaffForm.title}
        style_title={styles.headerTitle}
        containerStyle={styles.headerContainer}
        onPressLeftIcon={() => {
          navigation?.goBack();
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Personal Details */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={ImageConstant.person}
              style={{ height: 20, width: 20, marginRight: 8 }}
              resizeMode="contain"
            />
            <Typography
              type={Font?.Poppins_SemiBold}
              style={styles.sectionTitle}
            >
              {LocalizedStrings.NewStaffForm.Personal_Details}
            </Typography>
          </View>

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.First_Name || 'First Name'
            }
            title={LocalizedStrings.NewStaffForm.First_Name || 'First Name'}
            value={firstName}
            onChange={value => {
              setFirstName(value);
              clearError('firstName');
            }}
            error={errors.firstName}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={LocalizedStrings.NewStaffForm.Last_Name || 'Last Name'}
            title={LocalizedStrings.NewStaffForm.Last_Name || 'Last Name'}
            value={lastName}
            onChange={value => {
              setLastName(value);
              clearError('lastName');
            }}
            error={errors.lastName}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Email_Placeholder || 'Email'
            }
            title={LocalizedStrings.NewStaffForm.Email || 'Email'}
            value={email}
            onChange={value => {
              setEmail(value);
              clearError('email');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Mobile_Placeholder || '9876543210'
            }
            title={
              LocalizedStrings.NewStaffForm.Mobile_Number || 'Mobile Number'
            }
            value={phoneNumber}
            onChange={value => {
              setPhoneNumber(value);
              clearError('phoneNumber');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.phoneNumber}
          />

          <Input
            editable={false}
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Aadhaar_Placeholder ||
              '123456789012'
            }
            title={
              LocalizedStrings.NewStaffForm.Aadhaar_Number || 'Aadhaar Number'
            }
            value={aadharNumber}
            onChange={value => {
              setAadharNumber(value);
              clearError('aadharNumber');
            }}
            keyboardType="number-pad"
            maxLength={12}
            error={errors.aadharNumber}
          />

          <DropdownComponent
            title={LocalizedStrings.NewStaffForm.Gender || 'Gender'}
            placeholder={
              LocalizedStrings.NewStaffForm.Select_Gender || 'Select Gender'
            }
            width={'100%'}
            style_dropdown={{ marginHorizontal: 0 }}
            selectedTextStyleNew={{ marginLeft: 10 }}
            marginHorizontal={0}
            style_title={{ textAlign: 'left' }}
            data={genderOptions}
            value={gender}
            onChange={item => {
              setGender(item);
              clearError('gender');
            }}
            error={errors.gender}
          />

          <Date_Picker
            title={
              LocalizedStrings.NewStaffForm.Date_of_Birth || 'Date of Birth'
            }
            placeholder="DD-MM-YYYY"
            selected_date={dateOfBirth}
            onConfirm={date => {
              // Store as Date object or formatted string
              const formattedDate = moment(date).format('YYYY-MM-DD');
              setDateOfBirth(formattedDate);
              clearError('dateOfBirth');
            }}
            allowFutureDates={false}
            error={errors.dateOfBirth}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Street_Landmark || 'Street/Landmark'
            }
            title={LocalizedStrings.NewStaffForm.Home_Address || 'Home Address'}
            value={street}
            onChange={value => {
              setStreet(value);
              clearError('street');
            }}
            style_input={{ textAlign: 'start' }}
            // style_inputContainer={{ height: 100 }}
            multiline
            numberOfLines={2}
            error={errors.street}
          />
          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Pincode_Placeholder || '400050'
            }
            title={LocalizedStrings.NewStaffForm.Pincode || 'Pincode'}
            value={pincode}
            onChange={value => {
              // Only allow numbers and limit to 6 digits
              const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
              setPincode(numericValue);
              clearError('pincode');
            }}
            keyboardType="number-pad"
            maxLength={6}
            error={errors.pincode}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                style_title={{ color: '#8C8D8B' }}
                placeholder={LocalizedStrings.NewStaffForm.City || 'Mumbai'}
                title={LocalizedStrings.NewStaffForm.City || 'City'}
                value={city}
                onChange={value => {
                  setCity(value);
                  clearError('city');
                }}
                error={errors.city}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                style_title={{ color: '#8C8D8B' }}
                placeholder={
                  LocalizedStrings.NewStaffForm.State_Placeholder ||
                  'Maharashtra'
                }
                title={LocalizedStrings.NewStaffForm.State || 'State'}
                value={stateName}
                onChange={value => {
                  setStateName(value);
                  clearError('stateName');
                }}
                error={errors.stateName}
              />
            </View>
          </View>

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm
                .Emergency_Contact_Name_Placeholder || 'Emergency Contact Name'
            }
            title={
              LocalizedStrings.NewStaffForm.Emergency_Contact_Name ||
              'Emergency Contact Name'
            }
            value={emergencyContactName}
            onChange={value => {
              setEmergencyContactName(value);
              clearError('emergencyContactName');
            }}
            error={errors.emergencyContactName}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm
                .Emergency_Contact_Number_Placeholder || '9123456780'
            }
            title={
              LocalizedStrings.NewStaffForm.Emergency_Contact_Number ||
              'Emergency Contact Number'
            }
            value={emergencyContactNumber}
            onChange={value => {
              setEmergencyContactNumber(value);
              clearError('emergencyContactNumber');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.emergencyContactNumber}
          />

          <DropdownComponent
            title={LocalizedStrings.AddNewMember?.relation || 'Relation'}
            placeholder={
              LocalizedStrings.AddNewMember?.select_relation ||
              'Select Relation'
            }
            width={'100%'}
            style_dropdown={{ marginHorizontal: 0 }}
            selectedTextStyleNew={{ marginLeft: 10 }}
            marginHorizontal={0}
            style_title={{ textAlign: 'left' }}
            data={relationOptions}
            value={relation}
            onChange={item => {
              setRelation(item);
              clearError('relation');
            }}
            error={errors.relation}
          />
        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={ImageConstant.Verify}
              style={{ height: 20, width: 20, marginRight: 8 }}
              resizeMode="contain"
            />
            <Typography
              type={Font?.Poppins_SemiBold}
              style={styles.sectionTitle}
            >
              {LocalizedStrings.NewStaffForm.Work_Details}
            </Typography>
          </View>

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Role_Placeholder || 'e.g. Cleaner'
            }
            title={LocalizedStrings.NewStaffForm.Role_Designation}
            value={roleDesignation}
            onChange={value => {
              setRoleDesignation(value);
              clearError('roleDesignation');
            }}
            error={errors.roleDesignation}
          />

          <Date_Picker
            title={LocalizedStrings.NewStaffForm.Joining_Date || 'Joining Date'}
            placeholder="DD-MM-YYYY"
            selected_date={joiningDate}
            onConfirm={date => {
              // Store as Date object or formatted string
              const formattedDate = moment(date).format('YYYY-MM-DD');
              setJoiningDate(formattedDate);
              clearError('joiningDate');
            }}
            allowFutureDates={true}
            error={errors.joiningDate}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Salary_Placeholder || 'e.g. 10000'
            }
            title={LocalizedStrings.NewStaffForm.Salary}
            value={salary}
            onChange={value => {
              setSalary(value);
              clearError('salary');
            }}
            keyboardType="numeric"
            error={errors.salary}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={'e.g. name@upi'}
            title={'UPI ID'}
            value={upiId}
            onChange={value => setUpiId(value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <DropdownComponent
            title={LocalizedStrings.NewStaffForm.Pay_Frequency}
            placeholder={
              LocalizedStrings.NewStaffForm.Select_Frequency ||
              'Select Frequency'
            }
            width={'100%'}
            style_dropdown={{ marginHorizontal: 0 }}
            selectedTextStyleNew={{ marginLeft: 10 }}
            marginHorizontal={0}
            style_title={{ textAlign: 'left' }}
            data={payFrequencyOptions}
            value={payFrequency}
            onChange={item => {
              setPayFrequency(item);
              clearError('payFrequency');
            }}
            error={errors.payFrequency}
          />

          {/* Working days: show a dropdown with checkable items or simple buttons.
              Here we use the same DropdownComponent to list options but toggle on select.
              If your DropdownComponent supports multi-select natively, replace toggleWorkingDay usage. */}
          <DropdownComponent
            title={LocalizedStrings.NewStaffForm.Working_Days}
            placeholder={
              LocalizedStrings.NewStaffForm.Working_Days_Example ||
              'Select Working Days'
            }
            width={'100%'}
            style_dropdown={{ marginHorizontal: 0 }}
            selectedTextStyleNew={{ marginLeft: 10 }}
            marginHorizontal={0}
            style_title={{ textAlign: 'left' }}
            data={workingDaysOptions}
            // value prop shows joined values so user sees selection
            value={workingDays.length ? workingDays.join(', ') : ''}
            // onChange will receive the selected item; we toggle it
            onChange={item => {
              const val = item?.value || item;
              toggleWorkingDay(val);
            }}
            error={errors.workingDays}
          />

          {/* If you want a visible list of selected working days, show them below */}
          {workingDays.length > 0 && (
            <Typography type={Font?.Poppins_Regular} style={{ marginTop: 8 }}>
              Selected: {workingDays.join(', ')}
            </Typography>
          )}
        </View>

        <View style={styles.section}>
          <Typography type={Font?.Poppins_SemiBold} style={styles.sectionTitle}>
            {LocalizedStrings.NewStaffForm.KYC_Documents}
          </Typography>

          <View style={styles.uploadRowSingle}>
            <UploadBox
              title={LocalizedStrings.NewStaffForm.Staff_Photo}
              icon={ImageConstant.NewCamera}
              styles_container={styles.uploadBoxFull}
              onPress={() => handleImagePicker('staffPhoto')}
              image={staffPhoto}
            />
          </View>

          <View style={styles.uploadRow}>
            <UploadBox
              title={LocalizedStrings.NewStaffForm.Police_Clearance_Certificate}
              icon={ImageConstant.Verify}
              styles_container={styles.uploadBox}
              onPress={() => handleImagePicker('policeClearance')}
              image={policeClearance}
            />
            <UploadBox
              title={LocalizedStrings.NewStaffForm.Aadhaar_Card_Details}
              icon={ImageConstant.Doc}
              styles_container={styles.uploadBox}
              onPress={() => handleImagePicker('aadharCard')}
              image={aadharCard}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButton}>
        <Button
          title={
            isEditMode
              ? LocalizedStrings.NewStaffForm.Update_Staff || 'Update Staff'
              : LocalizedStrings.NewStaffForm.Add_Staff
          }
          onPress={() => handleSubmit()}
          main_style={styles.buttonStyle}
          loader={loading}
        />
      </View>
    </CommanView>
  );
};

export default NewStaffForm;

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#EBEBEA',
  },
  sectionTitle: {
    fontSize: 18,
  },
  uploadRowSingle: {
    alignItems: 'center',
    marginTop: 12,
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  uploadBoxFull: {
    width: '80%',
  },
  uploadBox: {
    flex: 1,
    marginHorizontal: 6,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  buttonStyle: {
    width: '90%',
  },
});
