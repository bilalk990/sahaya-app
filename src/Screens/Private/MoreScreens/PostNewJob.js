import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CommanView from '../../../Component/CommanView';
import HeaderForUser from '../../../Component/HeaderForUser';
import { ImageConstant } from '../../../Constants/ImageConstant';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import Input from '../../../Component/Input';
import DropdownComponent from '../../../Component/DropdownComponent';
import Button from '../../../Component/Button';
import {
  GET_WITH_TOKEN,
  POST_FORM_DATA,
  POST_WITH_TOKEN,
} from '../../../Backend/Backend';
import {
  AddJob,
  ApplicantsList,
  ListJob,
} from '../../../Backend/api_routes';
import SimpleToast from 'react-native-simple-toast';
import LocalizedStrings from '../../../Constants/localization';
import { fetchPincodeDetails } from '../../../Backend/Utility';
import { validators } from '../../../Backend/Validator';
import { isValidForm } from '../../../Backend/Utility';

const PostNewJob = ({ navigation, route }) => {
  const editId = route?.params?.id;
  const [jobData, setJobData] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Compensation
  const [expectedCompensation, setExpectedCompensation] = useState('');
  const [compensationType, setCompensationType] = useState(null);

  // Location
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(null);
  const [zipCode, setZipCode] = useState('');

  // Working Schedule
  const [preferredHours, setPreferredHours] = useState('');
  const [preferredDays, setPreferredDays] = useState('');
  const [commitment, setCommitment] = useState([]);

  // Requirements & Skills
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [loading, setLoading] = useState(false);

  const [availableSkills, setAvailableSkills] = useState([]);

  // Add new skill modal state
  const [isAddSkillVisible, setIsAddSkillVisible] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');

  // Error states
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    expectedCompensation: '',
    compensationType: '',
    streetAddress: '',
    zipCode: '',
    city: '',
    state: '',
    commitment: '',
    preferredHours: '',
    additionalRequirements: '',
    selectedSkills: '',
  });

  useEffect(() => {
    JobList();
  }, [editId]);

  const JobList = () => {
    GET_WITH_TOKEN(
      `${ListJob}/${editId}`,
      success => {
        setJobData(success?.data);
      },
      error => {},
      fail => {},
    );
  };

  // Populate the form when job data is loaded (editing)
  useEffect(() => {
    if (!jobData || !jobData.id) return;

    // Job Details
    setTitle(jobData.title || '');
    setDescription(jobData.description || '');

    // Compensation
    const compValue =
      jobData.expected_compensation || jobData.compensation || '';
    setExpectedCompensation(String(compValue || ''));

    // Try to map compensation type to dropdown option; fallback to raw string
    const compTypeRaw = jobData.compensation_type || '';
    const matchComp = option =>
      option.value === compTypeRaw ||
      option.label.toLowerCase() === compTypeRaw?.toLowerCase();
    const foundComp = Array.isArray(compensationTypeOptions)
      ? compensationTypeOptions.find(matchComp)
      : null;
    setCompensationType(foundComp || compTypeRaw || null);

    // Location
    setStreetAddress(jobData.street_address || '');
    setCity(jobData.city || '');

    // Try to map state string to option; fallback to raw string
    const stateRaw = jobData.state || '';
    const foundState = Array.isArray(stateOptions)
      ? stateOptions.find(s => s.label === stateRaw || s.value === stateRaw)
      : null;
    setState(foundState || stateRaw || null);
    setZipCode(jobData.zip_code ? String(jobData.zip_code) : '');

    // Working Schedule
    const commitRaw = jobData.commitment_type || '';
    setCommitment(commitRaw ? [commitRaw] : []);
    setPreferredHours(jobData.preferred_hours || '');
    setPreferredDays(jobData.preferred_days || '');

    // Skills from boolean flags
    const skillSelections = [];
    if (jobData.childcare_experience)
      skillSelections.push('Childcare Experience');
    if (jobData.cooking_required) skillSelections.push('Cooking');
    if (jobData.driving_license_required)
      skillSelections.push('Driving License');
    if (jobData.first_aid_certified)
      skillSelections.push('First Aid Certified');
    if (jobData.pet_care_required) skillSelections.push('Pet Care');

    // Merge custom skills from comma-separated required_skills
    const requiredSkillsStr = jobData.required_skills || '';
    const extraSkills = requiredSkillsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s);

    // Add missing customs to selections (case-insensitive dedupe)
    const seenLc = new Set(skillSelections.map(s => s.toLowerCase()));
    extraSkills.forEach(s => {
      if (!seenLc.has(s.toLowerCase())) {
        skillSelections.push(s);
      }
    });

    // Ensure chips exist for custom skills
    const availMap = new Map(availableSkills.map(s => [s.toLowerCase(), s]));
    extraSkills.forEach(s => {
      const k = s.toLowerCase();
      if (!availMap.has(k)) {
        availMap.set(k, s);
      }
    });
    const mergedAvailable = Array.from(availMap.values());
    if (mergedAvailable.length !== availableSkills.length) {
      setAvailableSkills(mergedAvailable);
    }

    // Final unique selections preserving order
    const finalSeen = new Set();
    const finalSelected = [];
    skillSelections.forEach(s => {
      const k = s.toLowerCase();
      if (!finalSeen.has(k)) {
        finalSeen.add(k);
        finalSelected.push(s);
      }
    });
    setSelectedSkills(finalSelected);

    // Additional Requirements
    setAdditionalRequirements(jobData.additional_requirements || '');
  }, [jobData]);

  const toggleSkill = skill => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(item => item !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
    // Clear error when skill is selected
    if (errors.selectedSkills) {
      setErrors({ ...errors, selectedSkills: null });
    }
  };

  const stateOptions = [
    { label: 'Andhra Pradesh', value: 'andhra_pradesh' },
    { label: 'Arunachal Pradesh', value: 'arunachal_pradesh' },
    { label: 'Assam', value: 'assam' },
    { label: 'Bihar', value: 'bihar' },
    { label: 'Chhattisgarh', value: 'chhattisgarh' },
    { label: 'Goa', value: 'goa' },
    { label: 'Gujarat', value: 'gujarat' },
    { label: 'Haryana', value: 'haryana' },
    { label: 'Himachal Pradesh', value: 'himachal_pradesh' },
    { label: 'Jharkhand', value: 'jharkhand' },
    { label: 'Karnataka', value: 'karnataka' },
    { label: 'Kerala', value: 'kerala' },
    { label: 'Madhya Pradesh', value: 'madhya_pradesh' },
    { label: 'Maharashtra', value: 'maharashtra' },
    { label: 'Manipur', value: 'manipur' },
    { label: 'Meghalaya', value: 'meghalaya' },
    { label: 'Mizoram', value: 'mizoram' },
    { label: 'Nagaland', value: 'nagaland' },
    { label: 'Odisha', value: 'odisha' },
    { label: 'Punjab', value: 'punjab' },
    { label: 'Rajasthan', value: 'rajasthan' },
    { label: 'Sikkim', value: 'sikkim' },
    { label: 'Tamil Nadu', value: 'tamil_nadu' },
    { label: 'Telangana', value: 'telangana' },
    { label: 'Tripura', value: 'tripura' },
    { label: 'Uttar Pradesh', value: 'uttar_pradesh' },
    { label: 'Uttarakhand', value: 'uttarakhand' },
    { label: 'West Bengal', value: 'west_bengal' },
  ];

  // Clear city and state when pincode is cleared
  useEffect(() => {
    if (!zipCode || zipCode.length < 6) {
      setCity('');
      setState(null);
      setErrors(prev => ({ ...prev, city: '', state: '' }));
    }
  }, [zipCode]);

  // Fetch pincode details and auto-fill city and state
  useEffect(() => {
    const fetchDetails = async () => {
      if (zipCode && zipCode.length === 6) {
        try {
          const details = await fetchPincodeDetails(zipCode);
          if (details && details.city) {
            setCity(details.city);
            setErrors(prev => (prev?.city ? {...prev, city: null} : prev));
          }
          if (details && details.state) {
            // Set state as string (matching StepLocation behavior)
            setState(details.state);
            setErrors(prev => (prev?.state ? {...prev, state: null} : prev));
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
  }, [zipCode]);

  const openAddSkill = () => {
    setNewSkillName('');
    setIsAddSkillVisible(true);
  };

  const closeAddSkill = () => {
    setIsAddSkillVisible(false);
  };

  const confirmAddSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) {
      return setIsAddSkillVisible(false);
    }
    // Avoid duplicates (case-insensitive)
    const exists = availableSkills.some(
      s => s.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      const updated = [...availableSkills, trimmed];
      setAvailableSkills(updated);
    }
    // Select it
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
    }
    setIsAddSkillVisible(false);
  };

  // Clear error handlers
  const handleTitleChange = value => {
    setTitle(value);
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleDescriptionChange = value => {
    setDescription(value);
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }));
    }
  };

  const handleCompensationChange = value => {
    setExpectedCompensation(value);
    if (errors.expectedCompensation) {
      setErrors(prev => ({ ...prev, expectedCompensation: '' }));
    }
  };

  const handleCompensationTypeChange = value => {
    setCompensationType(value);
    if (errors.compensationType) {
      setErrors(prev => ({ ...prev, compensationType: '' }));
    }
  };

  const handleStreetAddressChange = value => {
    setStreetAddress(value);
    if (errors.streetAddress) {
      setErrors(prev => ({ ...prev, streetAddress: '' }));
    }
  };

  const handleZipCodeChange = value => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setZipCode(numericValue);
    if (errors.zipCode) {
      setErrors(prev => ({ ...prev, zipCode: '' }));
    }
  };

  const toggleCommitment = option => {
    // Only allow one commitment type at a time
    if (commitment.includes(option)) {
      setCommitment([]);
    } else {
      setCommitment([option]);
    }
    if (errors.commitment) {
      setErrors(prev => ({ ...prev, commitment: '' }));
    }
  };

  const handlePostJob = () => {
    if (loading) return;

    // Validate all fields using validators
    const validationErrors = {};

    // Validate Title
    const titleError = validators.checkRequire('Job Title', title);
    if (titleError) {
      validationErrors.title = titleError;
    } else if (title && title.trim().length < 3) {
      validationErrors.title = 'Job title must be at least 3 characters';
    } else if (title && title.trim().length > 100) {
      validationErrors.title = 'Job title must not exceed 100 characters';
    }

    // Validate Description
    const descError = validators.checkRequire('Job Description', description);
    if (descError) {
      validationErrors.description = descError;
    } else if (description && description.trim().length < 20) {
      validationErrors.description =
        'Job description must be at least 20 characters';
    } else if (description && description.trim().length > 2000) {
      validationErrors.description =
        'Job description must not exceed 2000 characters';
    }

    // Validate Expected Compensation
    const compError = validators.checkRequire(
      'Expected Compensation',
      expectedCompensation,
    );
    if (compError) {
      validationErrors.expectedCompensation = compError;
    } else if (
      expectedCompensation &&
      (isNaN(parseFloat(expectedCompensation)) ||
        parseFloat(expectedCompensation) <= 0)
    ) {
      validationErrors.expectedCompensation =
        'Compensation must be a valid number greater than 0';
    }

    // Validate Compensation Type
    validationErrors.compensationType = validators.checkRequire(
      'Compensation Type',
      compensationType?.value || compensationType,
    );

    // Validate Street Address
    const addressError = validators.checkRequire(
      'Street Address',
      streetAddress,
    );
    if (addressError) {
      validationErrors.streetAddress = addressError;
    } else if (streetAddress && streetAddress.trim().length < 5) {
      validationErrors.streetAddress =
        'Street address must be at least 5 characters';
    }

    // Validate Pincode
    const zipError = validators.checkRequire('Pincode', zipCode);
    if (zipError) {
      validationErrors.zipCode = zipError;
    } else if (zipCode && !/^\d{6}$/.test(zipCode.trim())) {
      validationErrors.zipCode = 'Please enter a valid 6-digit pincode';
    }

    // Validate City
    validationErrors.city = validators.checkRequire('City', city);

    // Validate State
    validationErrors.state = validators.checkRequire(
      'State',
      state?.label || state,
    );

    // Validate Commitment Type
    if (commitment.length === 0) {
      validationErrors.commitment = 'Commitment Type field is required.';
    }

    // Validate Preferred Hours
    validationErrors.preferredHours = validators.checkRequire(
      'Preferred Hours',
      preferredHours,
    );

    // Validate Additional Requirements
    validationErrors.additionalRequirements = validators.checkRequire(
      'Additional Requirements',
      additionalRequirements,
    );

    // Validate Selected Skills
    if (selectedSkills.length === 0) {
      validationErrors.selectedSkills = 'Required Skills field is required.';
    }

    setErrors(validationErrors);

    if (!isValidForm(validationErrors)) {
      SimpleToast.show('Please fill all required fields', SimpleToast.SHORT);
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Job Details
    formData.append('title', title);
    formData.append('description', description);

    // Compensation
    formData.append('compensation', expectedCompensation);
    formData.append(
      'compensation_type',
      compensationType?.value || compensationType,
    );

    // Location
    formData.append('street_address', streetAddress);
    formData.append('city', city);
    formData.append('state', state?.label || state);
    formData.append('zip_code', zipCode);

    // Working Schedule
    if (commitment.length > 0) {
      // Convert to API format (lowercase with underscore)
      const commitmentValue = commitment[0].toLowerCase().replace('-', '-');
      formData.append('commitment_type', commitmentValue);
    }
    if (preferredHours) formData.append('preferred_hours', preferredHours);
    if (preferredDays) formData.append('preferred_days', preferredDays);

    // Status
    formData.append('status', 'pending');

    // Skills & Requirements
    selectedSkills.forEach((skill, index) => {
      const skillMap = {
        'Childcare Experience': { key: 'childcare_experience', value: '1' },
        Cooking: { key: 'cooking_required', value: '1' },
        'Driving License': { key: 'driving_license_required', value: '1' },
        'First Aid Certified': { key: 'first_aid_certified', value: '1' },
        'Pet Care': { key: 'pet_care_required', value: '1' },
      };

      const skillData = skillMap[skill];
      if (skillData) {
        formData.append(skillData.key, skillData.value);
      }
    });

    // Additional Requirements
    if (additionalRequirements) {
      formData.append('additional_requirements', additionalRequirements);
    }

    // Required Skills
    if (selectedSkills.length > 0) {
      const skillsString = selectedSkills.join(', ');
      formData.append('required_skills', skillsString);
    }

    // Debug: Log the form data before sending

    POST_FORM_DATA(
      AddJob,
      formData,
      success => {
        SimpleToast.show('Job posted successfullyfsdfds!', SimpleToast.SHORT);
        setLoading(false);
        handelapplication(success?.data?.id);
        navigation?.goBack();
        // navigation.navigate('MyJobPosting');
      },
      error => {
        SimpleToast.show('Failed to post job', SimpleToast.SHORT);
        setLoading(false);
      },
      fail => {
        SimpleToast.show(
          'Network error. Please try againfsdf.',
          SimpleToast.SHORT,
        );
        setLoading(false);
      },
    );
  };

  const handelapplication = id => {
    const body = {
      status: 'open',
    };

    POST_WITH_TOKEN(
      `${ApplicantsList}/${id}/status`,
      body,
      success => {
        // SimpleToast.show(
        //   success?.message || 'Member deleted successfully',
        //   SimpleToast.SHORT,
        // );
      },
      error => {
        // SimpleToast.show(
        //   error?.message || 'Failed to delete Member',
        //   SimpleToast.SHORT,
        // );
      },
      fail => {
        // SimpleToast.show('Network error. Please try again.', SimpleToast.SHORT);
      },
    );
  };

  const UpdatePostJob = () => {
    if (loading) return;

    // Validate all fields using validators
    const validationErrors = {};

    // Validate Title
    const titleError = validators.checkRequire('Job Title', title);
    if (titleError) {
      validationErrors.title = titleError;
    } else if (title && title.trim().length < 3) {
      validationErrors.title = 'Job title must be at least 3 characters';
    } else if (title && title.trim().length > 100) {
      validationErrors.title = 'Job title must not exceed 100 characters';
    }

    // Validate Description
    const descError = validators.checkRequire('Job Description', description);
    if (descError) {
      validationErrors.description = descError;
    } else if (description && description.trim().length < 20) {
      validationErrors.description =
        'Job description must be at least 20 characters';
    } else if (description && description.trim().length > 2000) {
      validationErrors.description =
        'Job description must not exceed 2000 characters';
    }

    // Validate Expected Compensation
    const compError = validators.checkRequire(
      'Expected Compensation',
      expectedCompensation,
    );
    if (compError) {
      validationErrors.expectedCompensation = compError;
    } else if (
      expectedCompensation &&
      (isNaN(parseFloat(expectedCompensation)) ||
        parseFloat(expectedCompensation) <= 0)
    ) {
      validationErrors.expectedCompensation =
        'Compensation must be a valid number greater than 0';
    }

    // Validate Compensation Type
    validationErrors.compensationType = validators.checkRequire(
      'Compensation Type',
      compensationType?.value || compensationType,
    );

    // Validate Street Address
    const addressError = validators.checkRequire(
      'Street Address',
      streetAddress,
    );
    if (addressError) {
      validationErrors.streetAddress = addressError;
    } else if (streetAddress && streetAddress.trim().length < 5) {
      validationErrors.streetAddress =
        'Street address must be at least 5 characters';
    }

    // Validate Pincode
    const zipError = validators.checkRequire('Pincode', zipCode);
    if (zipError) {
      validationErrors.zipCode = zipError;
    } else if (zipCode && !/^\d{6}$/.test(zipCode.trim())) {
      validationErrors.zipCode = 'Please enter a valid 6-digit pincode';
    }

    // Validate City
    validationErrors.city = validators.checkRequire('City', city);

    // Validate State
    validationErrors.state = validators.checkRequire(
      'State',
      state?.label || state,
    );

    // Validate Commitment Type
    if (commitment.length === 0) {
      validationErrors.commitment = 'Commitment Type field is required.';
    }

    // Validate Preferred Hours
    validationErrors.preferredHours = validators.checkRequire(
      'Preferred Hours',
      preferredHours,
    );

    // Validate Additional Requirements
    validationErrors.additionalRequirements = validators.checkRequire(
      'Additional Requirements',
      additionalRequirements,
    );

    // Validate Selected Skills
    if (selectedSkills.length === 0) {
      validationErrors.selectedSkills = 'Required Skills field is required.';
    }

    setErrors(validationErrors);

    if (!isValidForm(validationErrors)) {
      SimpleToast.show('Please fill all required fields', SimpleToast.SHORT);
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Job Details
    formData.append('title', title);
    formData.append('description', description);

    // Compensation
    formData.append('compensation', expectedCompensation);
    formData.append(
      'compensation_type',
      compensationType?.value || compensationType,
    );

    // Location
    formData.append('street_address', streetAddress);
    formData.append('city', city);
    formData.append('state', state?.label || state);
    formData.append('zip_code', zipCode);

    // Working Schedule
    if (commitment.length > 0) {
      // Convert to API format (lowercase with underscore)
      const commitmentValue = commitment[0].toLowerCase().replace('-', '-');
      formData.append('commitment_type', commitmentValue);
    }
    if (preferredHours) formData.append('preferred_hours', preferredHours);
    if (preferredDays) formData.append('preferred_days', preferredDays);

    // Status
    formData.append('status', 'pending');

    // Skills & Requirements
    selectedSkills.forEach((skill, index) => {
      const skillMap = {
        'Childcare Experience': { key: 'childcare_experience', value: '1' },
        Cooking: { key: 'cooking_required', value: '1' },
        'Driving License': { key: 'driving_license_required', value: '1' },
        'First Aid Certified': { key: 'first_aid_certified', value: '1' },
        'Pet Care': { key: 'pet_care_required', value: '1' },
      };

      const skillData = skillMap[skill];
      if (skillData) {
        formData.append(skillData.key, skillData.value);
      }
    });

    // Additional Requirements
    if (additionalRequirements) {
      formData.append('additional_requirements', additionalRequirements);
    }

    // Required Skills
    if (selectedSkills.length > 0) {
      const skillsString = selectedSkills.join(', ');
      formData.append('required_skills', skillsString);
    }

    // Debug: Log the form data before sending
    POST_FORM_DATA(
      `${AddJob}/${editId}`,
      formData,
      success => {
        SimpleToast.show('Job posted successfullyfsdfds!', SimpleToast.SHORT);
        setLoading(false);
        navigation?.goBack();
        // navigation.navigate('MyJobPosting');
      },
      error => {
        SimpleToast.show('Failed to post jobdfsdfdsf', SimpleToast.SHORT);
        setLoading(false);
      },
      fail => {
        SimpleToast.show(
          'Network error. Please try againfsdf.',
          SimpleToast.SHORT,
        );
        setLoading(false);
      },
    );
  };

  const compensationTypeOptions = [
    // { label: 'Hourly', value: 'hourly' },
    { label: 'Monthly', value: 'monthly' },
    // { label: 'Weekly', value: 'weekly' },
    // { label: 'Daily', value: 'daily' },
    { label: 'Year', value: 'Year' },
  ];

  return (
    <CommanView>
      <HeaderForUser
        source_arrow={ImageConstant?.BackArrow}
        title={LocalizedStrings.PostNewJob.title}
        onPressLeftIcon={() => navigation?.goBack()}
        style_title={{ fontSize: 18 }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.card}>
          <SectionHeader
            icon={ImageConstant?.Briefcase}
            title={LocalizedStrings.PostNewJob.job_details}
          />
          <Input
            // placeholder="Enter job role/title"
            title={LocalizedStrings.PostNewJob.job_role_title}
            value={title}
            onChange={handleTitleChange}
            error={errors.title}
          />
          <Input
            style_input={styles.inputText}
            multiline={true}
            style_inputContainer={{ height: 130 }}
            // placeholder="Enter job description"
            title={LocalizedStrings.PostNewJob.job_description}
            value={description}
            onChange={handleDescriptionChange}
            error={errors.description}
          />
        </View>

        <View style={styles.card}>
          <SectionHeader
            icon={ImageConstant?.Dollar}
            title={LocalizedStrings.PostNewJob.compensation}
          />
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ width: '58%' }}>
              <Input
                // placeholder="Enter expected compensation"
                title={LocalizedStrings.PostNewJob.expected_compensation}
                value={expectedCompensation}
                onChange={handleCompensationChange}
                keyboardType="numeric"
                error={errors.expectedCompensation}
              />
            </View>
            <View style={{ width: '46%' }}>
              <DropdownComponent
                title={' '}
                // placeholder="Select Type"
                MainBoxStyle={{ width: '100%' }}
                style_title={{ textAlign: 'left' }}
                data={compensationTypeOptions}
                value={compensationType?.value}
                onChange={item => {
                  handleCompensationTypeChange(item);
                  if (errors.compensationType) {
                    setErrors({ ...errors, compensationType: null });
                  }
                }}
                selectedTextStyleNew={{ paddingHorizontal: 10, size: 10 }}
                marginHorizontal={0}
                error={errors.compensationType}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader
            icon={ImageConstant?.Location}
            title={LocalizedStrings.PostNewJob.location_details}
          />
          <Input
            // placeholder="Enter street address"
            title={LocalizedStrings.PostNewJob.street_address}
            value={streetAddress}
            onChange={handleStreetAddressChange}
            error={errors.streetAddress}
          />
          <Input
            // placeholder="Enter pincode"
            title={LocalizedStrings.PostNewJob.zip_code}
            value={zipCode}
            onChange={handleZipCodeChange}
            keyboardType="numeric"
            maxLength={6}
            error={errors.zipCode}
          />
          {/* City and State fields - only show when zipcode is 6 digits */}
          {zipCode.length === 6 && (
            <View style={styles.locationRow}>
              <View style={styles.cityContainer}>
                <Input
                  // placeholder="Enter city"
                  title={LocalizedStrings.PostNewJob.city}
                  value={city}
                  onChange={value => {
                    setCity(value);
                    if (errors.city) {
                      setErrors({ ...errors, city: null });
                    }
                  }}
                  error={errors.city}
                />
              </View>
              <View style={styles.stateContainer}>
                <Input
                  // placeholder="Enter state"
                  title={LocalizedStrings.PostNewJob.state}
                  value={typeof state === 'string' ? state : state?.label || ''}
                  onChange={value => {
                    setState(value);
                    if (errors.state) {
                      setErrors({ ...errors, state: null });
                    }
                  }}
                  error={errors.state}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <SectionHeader
            icon={ImageConstant?.Calendar}
            title={LocalizedStrings.PostNewJob.working_schedule}
          />
          <Input
            style_input={styles.inputText}
            multiline={true}
            style_inputContainer={{ height: 150 }}
            // placeholder={'e.g., 3PM - 7PM'}
            title={LocalizedStrings.PostNewJob.preferred_hours_days}
            value={preferredHours}
            onChange={value => {
              setPreferredHours(value);
              if (errors.preferredHours) {
                setErrors({ ...errors, preferredHours: null });
              }
            }}
            error={errors.preferredHours}
          />
          {/* <Input
            style_input={styles.inputText}
            multiline={true}
            style_inputContainer={{ height: 80 }}
            placeholder={'e.g., Monday to Friday'}
            title={'Preferred Days'}
            value={preferredDays}
            onChange={setPreferredDays}
          /> */}

          <Typography
            type={Font?.Poppins_Bold}
            size={14}
            style={{ marginTop: 15 }}
          >
            {LocalizedStrings.PostNewJob.commitment_type}
          </Typography>
          {[
            LocalizedStrings.PostNewJob.full_time,
            LocalizedStrings.PostNewJob.part_time,
            LocalizedStrings.PostNewJob.flexible,
          ].map((option, index) => {
            const isSelected = commitment.some(
              item => item.toLowerCase() === option.toLowerCase(),
            );

            return (
              <TouchableOpacity
                key={index}
                style={styles.checkboxRow}
                onPress={() => toggleCommitment(option)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Image
                      source={ImageConstant?.check}
                      style={{
                        width: 15,
                        height: 15,
                        position: 'absolute',
                        tintColor: '#fff',
                        zIndex: 99,
                      }}
                    />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{option}</Text>
              </TouchableOpacity>
            );
          })}
          {errors.commitment && (
            <Typography
              textAlign={'right'}
              style={{ color: 'red', fontSize: 12, marginTop: 5 }}
            >
              {errors.commitment}
            </Typography>
          )}
        </View>

        <View style={styles.card}>
          <SectionHeader
            icon={ImageConstant?.blub}
            title={LocalizedStrings.PostNewJob.requirements_skills}
          />
          <Input
            style_input={styles.inputText}
            multiline={true}
            style_inputContainer={{ height: 130 }}
            // placeholder={LocalizedStrings.PostNewJob.additional_requirements_placeholder}
            title={LocalizedStrings.PostNewJob.additional_requirements}
            value={additionalRequirements}
            onChange={value => {
              setAdditionalRequirements(value);
              if (errors.additionalRequirements) {
                setErrors({ ...errors, additionalRequirements: null });
              }
            }}
            error={errors.additionalRequirements}
          />
          <Typography
            type={Font?.Poppins_Bold}
            size={14}
            style={{ marginVertical: 10 }}
          >
            {LocalizedStrings.PostNewJob.required_skills}
          </Typography>
          {errors.selectedSkills && (
            <Typography
              textAlign={'right'}
              style={{ color: 'red', fontSize: 12, marginBottom: 5 }}
            >
              {errors.selectedSkills}
            </Typography>
          )}
          <View style={styles.skillsContainer}>
            {availableSkills.map((skill, index) => (
              <View>
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleSkill(skill)}
                  style={[
                    styles.skillChip,
                    selectedSkills.includes(skill) && styles.skillChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.skillText,
                      selectedSkills.includes(skill) &&
                        styles.skillTextSelected,
                    ]}
                  >
                    {skill}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={[styles.skillChip]} onPress={openAddSkill}>
              <Text>Add new skill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Button
        title={
          loading ? 'Posting...' : LocalizedStrings.PostNewJob.post_job_listing
        }
        onPress={editId ? UpdatePostJob : handlePostJob}
        style={{ marginTop: 20 }}
        disabled={loading}
      />
      {/* Add New Skill Modal */}
      <Modal
        transparent={true}
        visible={isAddSkillVisible}
        animationType="fade"
        onRequestClose={closeAddSkill}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add new skill</Text>
            <TextInput
              placeholder="Enter skill name"
              value={newSkillName}
              onChangeText={setNewSkillName}
              style={styles.modalInput}
              placeholderTextColor={'#999'}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={closeAddSkill}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={confirmAddSkill}
              >
                <Text style={styles.modalPrimaryButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CommanView>
  );
};

export default PostNewJob;

const SectionHeader = ({ icon, title }) => (
  <View
    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
  >
    <Image
      source={icon}
      tintColor={'#D98579'}
      style={{ width: 19, height: 19, resizeMode: 'contain' }}
    />
    <Typography type={Font?.Poppins_Bold} size={18} style={{ marginLeft: 10 }}>
      {title}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#EBEBEA',
    padding: 20,
    marginTop: 20,
  },
  inputText: {
    color: '#000',
    height: 130,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#D98579',
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: '#D98579',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  /* Location Row */
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cityContainer: {
    flex: 1,
    marginRight: 8,
  },
  stateContainer: {
    flex: 1,
    marginLeft: 8,
  },
  /* Skills */
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillChip: {
    borderWidth: 1,
    borderColor: '#EBEBEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    margin: 4,
  },
  skillChipSelected: {
    borderColor: '#D98579',
    backgroundColor: '#FFF5F3',
  },
  skillText: {
    fontSize: 13,
    color: '#333',
  },
  skillTextSelected: {
    color: '#D98579',
    fontWeight: '600',
  },
  /* Add Skill Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#EBEBEA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  modalButtonText: {
    color: '#555',
    fontSize: 14,
  },
  modalPrimaryButton: {
    backgroundColor: '#D98579',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  modalPrimaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
