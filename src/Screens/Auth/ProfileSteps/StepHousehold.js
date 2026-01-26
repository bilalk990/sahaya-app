import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import Input from '../../../Component/Input';
import DropdownComponent from '../../../Component/DropdownComponent';
import { Font } from '../../../Constants/Font';
import Typography from '../../../Component/UI/Typography';
import { validators } from '../../../Backend/Validator';
import { isValidForm } from '../../../Backend/Utility';
import LocalizedStrings from '../../../Constants/localization';

const StepHousehold = React.forwardRef((props, ref) => {
  const [error, setError] = useState({});

  // Household states
  const [residenceType, setResidenceType] = useState(null);
  const [numberOfRooms, setNumberOfRooms] = useState('');
  const [languagesSpoken, setLanguagesSpoken] = useState([]);
  const [adultsCount, setAdultsCount] = useState('');
  const [childrenCount, setChildrenCount] = useState('');
  const [elderlyCount, setElderlyCount] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [pets, setPets] = useState([{ type: '', count: '' }]);

  // Languages list from Langvage.js
  const languagesList = [
    'English',
    ' Hindi',
    'Telugu',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Gujarati',
    'Bengali',
    'Punjabi',
    'Odia',
    'Assamese',
    'Urdu',
    'Nepali',
  ];

  // Convert languages to dropdown format
  const languagesDropdownData = languagesList.map((lang, index) => ({
    label: lang,
    value: lang,
    id: index,
  }));

  // Handle language selection
  const handleLanguageChange = item => {
    if (item) {
      setLanguagesSpoken(item);
      if (error?.languagesSpoken) {
        setError({ ...error, languagesSpoken: null });
      }
    }
  };

  const addPet = () => {
    setPets([...pets, { type: '', count: '' }]);
  };

  const removePet = index => {
    if (pets.length > 1) {
      const newPets = pets.filter((_, i) => i !== index);
      setPets(newPets);
    }
  };

  const updatePet = (index, field, value) => {
    const newPets = [...pets];
    newPets[index][field] = value;
    setPets(newPets);
    // Clear error when user starts typing
    if (error?.[`petType${index}`] || error?.[`petCount${index}`]) {
      const newError = { ...error };
      if (field === 'type' && newError[`petType${index}`]) {
        newError[`petType${index}`] = null;
      }
      if (field === 'count' && newError[`petCount${index}`]) {
        newError[`petCount${index}`] = null;
      }
      setError(newError);
    }
  };

  // Validation function for household fields
  const validateHousehold = () => {
    let errors = {
      residenceType: validators.checkRequire(
        LocalizedStrings.EditProfile?.Residence_Type ||
          LocalizedStrings.CompleteProfile?.residence_type ||
          'Residence Type',
        residenceType?.value,
      ),
      numberOfRooms: validators.checkRequire(
        LocalizedStrings.EditProfile?.Number_of_Rooms ||
          LocalizedStrings.CompleteProfile?.number_of_rooms ||
          'Number of Rooms',
        numberOfRooms,
      ),
      languagesSpoken: validators.checkRequire(
        LocalizedStrings.EditProfile?.Languages_Spoken || 'Languages Spoken',
        languagesSpoken?.length ? languagesSpoken.join(',') : '',
      ),
      adultsCount: validators.checkRequire(
        LocalizedStrings.EditProfile?.Adults ||
          LocalizedStrings.CompleteProfile?.adults ||
          'Adults Count',
        adultsCount,
      ),
      childrenCount: validators.checkRequire(
        LocalizedStrings.EditProfile?.Children ||
          LocalizedStrings.CompleteProfile?.children ||
          'Children Count',
        childrenCount,
      ),
      // Elderly Count and Special Requirements are optional (not required)
      elderlyCount: null,
      specialRequirements: null,
    };

    // Validate pets - optional; only enforce when user fills one of the fields
    pets.forEach((pet, index) => {
      if (pet.type || pet.count) {
        // If either field is filled, both are required
        errors[`petType${index}`] = validators.checkRequire(
          LocalizedStrings.EditProfile?.Pet_Type ||
            LocalizedStrings.CompleteProfile?.pet_details ||
            'Pet Type',
          pet.type,
        );
        errors[`petCount${index}`] = validators.checkRequire(
          LocalizedStrings.EditProfile?.Count ||
            LocalizedStrings.CompleteProfile?.count ||
            'Pet Count',
          pet.count,
        );
      }
    });

    setError(errors);
    return isValidForm(errors);
  };

  // Function to get household data
  const getHouseholdData = () => {
    const petDetails = pets
      .filter(pet => pet.type && pet.count)
      .map(pet => ({
        pet_type: pet.type,
        pet_count: pet.count,
      }));

    // Convert languages_spoken to array format
    let languagesArray = [];
    if (languagesSpoken?.value) {
      languagesArray = [languagesSpoken.value];
    } else if (languagesSpoken) {
      // If it's a string, wrap in array
      languagesArray = [languagesSpoken];
    }

    return {
      residence_type: residenceType?.value,
      number_of_rooms: numberOfRooms,
      languages_spoken: languagesSpoken,
      adults_count: adultsCount,
      children_count: childrenCount,
      elderly_count: elderlyCount,
      special_requirements: specialRequirements,
      pet_details: petDetails,
    };
  };

  // Get localized residence type options
  const getResidenceTypeOptions = () => {
    return [
      {
        label:
          LocalizedStrings.CompleteProfile?.apartment ||
          LocalizedStrings.EditProfile?.Apartment ||
          'Apartment',
        value: 'apartment',
      },
      {
        label:
          LocalizedStrings.CompleteProfile?.villa ||
          LocalizedStrings.EditProfile?.Villa ||
          'Villa',
        value: 'villa',
      },
      {
        label:
          LocalizedStrings.CompleteProfile?.independent_house ||
          LocalizedStrings.EditProfile?.Independent_House ||
          'Independent House',
        value: 'independent',
      },
    ];
  };

  // Expose validation and data functions to parent component
  React.useImperativeHandle(ref, () => ({
    validateHousehold,
    getHouseholdData,
  }));

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.wrap}>
        <Typography type={Font?.Poppins_SemiBold} size={18}>
          {LocalizedStrings.EditProfile?.Household_Information ||
            LocalizedStrings.CompleteProfile?.household_information ||
            'Household Information'}
        </Typography>
        <DropdownComponent
          title={
            LocalizedStrings.EditProfile?.Residence_Type ||
            LocalizedStrings.CompleteProfile?.residence_type ||
            'Residence Type'
          }
          placeholder={
            LocalizedStrings.CompleteProfile?.select_residence_type ||
            LocalizedStrings.EditProfile?.select_residence_type ||
            'Select Type'
          }
          width={'100%'}
          style_dropdown={styles.dropdownStyle}
          selectedTextStyleNew={styles.selectedTextStyle}
          marginHorizontal={0}
          value={residenceType?.value}
          style_title={styles.dropdownTitle}
          data={getResidenceTypeOptions()}
          onChange={item => {
            setResidenceType(item || null);
            if (error?.residenceType) {
              setError({ ...error, residenceType: null });
            }
          }}
          error={error?.residenceType}
        />
        <Input
          title={
            LocalizedStrings.EditProfile?.Number_of_Rooms ||
            LocalizedStrings.CompleteProfile?.number_of_rooms ||
            'Number of Rooms'
          }
          placeholder=""
          keyboardType="numeric"
          value={numberOfRooms}
          onChange={text => {
            setNumberOfRooms(text);
            if (error?.numberOfRooms)
              setError({ ...error, numberOfRooms: null });
          }}
          error={error?.numberOfRooms}
        />
        {/* <Typography type={Font?.Poppins_Medium} size={14} style={{ marginBottom: 6 }}>
  {LocalizedStrings.EditProfile?.Languages_Spoken || LocalizedStrings.CompleteProfile?.languages_spoken || 'Languages Spoken'}
</Typography>

<View style={{
  borderWidth: 1,
  borderColor: error?.languagesSpoken ? 'red' : '#ccc',
  borderRadius: 8,
  padding: 10,
}}>
  {languagesDropdownData.map((item) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => {
        if (languagesSpoken.includes(item.value)) {
          setLanguagesSpoken(languagesSpoken.filter(lang => lang !== item.value));
        } else {
          setLanguagesSpoken([...languagesSpoken, item.value]);
        }

        if (error?.languagesSpoken) {
          setError({...error, languagesSpoken: null});
        }
      }}
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
    >
      <View style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#555',
        marginRight: 10,
        backgroundColor: languagesSpoken.includes(item.value) ? '#D98579' : 'transparent',
      }} />
      <Typography>{item.label}</Typography>
    </TouchableOpacity>
  ))}
</View>

{error?.languagesSpoken && (
  <Typography size={12} color="red" style={{ marginTop: 5 }}>
    {error.languagesSpoken}
  </Typography>
)} */}

        <Typography
          type={Font?.Poppins_Medium}
          size={14}
          style={{ marginBottom: 6, marginTop: 12 }}
        >
          {LocalizedStrings.EditProfile?.Languages_Spoken ||
            LocalizedStrings.CompleteProfile?.languages_spoken ||
            'Languages Spoken'}
        </Typography>

        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}
        >
          {languagesList.map((language, index) => {
            const isSelected = languagesSpoken.includes(language);

            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (isSelected) {
                    setLanguagesSpoken(
                      languagesSpoken.filter(item => item !== language),
                    );
                  } else {
                    setLanguagesSpoken([...languagesSpoken, language]);
                  }
                  if (error?.languagesSpoken) {
                    setError({ ...error, languagesSpoken: null });
                  }
                }}
                style={{
                  backgroundColor: isSelected ? '#D98579' : '#F3F4F6',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: isSelected ? '#FFFFFF' : '#333',
                  }}
                >
                  {language}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error?.languagesSpoken && (
          <Typography size={12} color="red" style={{ marginTop: 5 }}>
            {error.languagesSpoken}
          </Typography>
        )}

        <Typography type={Font?.Poppins_Medium} size={14}>
          {LocalizedStrings.EditProfile?.Number_of_Occupants ||
            LocalizedStrings.CompleteProfile?.number_of_occupants ||
            'Number of Occupants'}
        </Typography>
        <View style={styles.row}>
          <View style={styles.adultsContainer}>
            <Input
              title={
                LocalizedStrings.EditProfile?.Adults ||
                LocalizedStrings.CompleteProfile?.adults ||
                'Adults'
              }
              placeholder=""
              keyboardType="numeric"
              value={adultsCount}
              onChange={text => {
                setAdultsCount(text);
                if (error?.adultsCount)
                  setError({ ...error, adultsCount: null });
              }}
              error={error?.adultsCount}
            />
          </View>
          <View style={styles.childrenContainer}>
            <Input
              title={
                LocalizedStrings.EditProfile?.Children ||
                LocalizedStrings.CompleteProfile?.children ||
                'Children'
              }
              placeholder=""
              keyboardType="numeric"
              value={childrenCount}
              onChange={text => {
                setChildrenCount(text);
                if (error?.childrenCount)
                  setError({ ...error, childrenCount: null });
              }}
              error={error?.childrenCount}
            />
          </View>
          <View style={styles.elderlyContainer}>
            <Input
              title={`${
                LocalizedStrings.EditProfile?.Elderly ||
                LocalizedStrings.CompleteProfile?.elderly ||
                'Elderly'
              }`}
              placeholder=""
              keyboardType="numeric"
              value={elderlyCount}
              onChange={text => {
                setElderlyCount(text);
                if (error?.elderlyCount)
                  setError({ ...error, elderlyCount: null });
              }}
              error={error?.elderlyCount}
            />
          </View>
        </View>

        <Typography type={Font?.Poppins_Medium} size={14}>
          {LocalizedStrings.EditProfile?.Pet_Details ||
            LocalizedStrings.CompleteProfile?.pet_details ||
            'Pet Details'}
        </Typography>
        {pets.map((pet, index) => (
          <View key={index} style={[styles.row, { marginBottom: 10 }]}>
            <View style={styles.petTypeContainer}>
              <Input
                title={
                  LocalizedStrings.EditProfile?.Pet_Type ||
                  LocalizedStrings.CompleteProfile?.pet_type ||
                  'Type'
                }
                placeholder=""
                value={pet.type}
                onChange={value => updatePet(index, 'type', value)}
                error={error?.[`petType${index}`]}
              />
            </View>
            <View style={styles.petCountContainer}>
              <Input
                title={
                  LocalizedStrings.EditProfile?.Count ||
                  LocalizedStrings.CompleteProfile?.count ||
                  'Count'
                }
                placeholder=""
                keyboardType="numeric"
                value={pet.count}
                onChange={value => updatePet(index, 'count', value)}
                error={error?.[`petCount${index}`]}
              />
            </View>
            {pets.length > 1 && (
              <TouchableOpacity
                style={styles.removePetButton}
                onPress={() => removePet(index)}
              >
                <Typography color="red" size={12}>
                  {LocalizedStrings.EditProfile?.Remove ||
                    LocalizedStrings.CompleteProfile?.remove ||
                    'Remove'}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={addPet}>
          <Typography
            type={Font?.Poppins_Medium}
            size={14}
            textAlign={'center'}
            color="#D98579"
          >
            +{' '}
            {LocalizedStrings.EditProfile?.Add_Another_Pet ||
              LocalizedStrings.CompleteProfile?.add_another_pet ||
              'Add Another Pet'}
          </Typography>
        </TouchableOpacity>
        <Input
          title={`${
            LocalizedStrings.EditProfile?.Special_Requirements ||
            LocalizedStrings.CompleteProfile?.special_requirements ||
            'Special Requirements'
          } (${LocalizedStrings.CompleteProfile?.optional || 'Optional'})`}
          placeholder={
            LocalizedStrings.EditProfile?.special_requirements_placeholder ||
            LocalizedStrings.CompleteProfile
              ?.special_requirements_placeholder ||
            'Looking for staff comfortable with pets...'
          }
          multiline
          value={specialRequirements}
          onChange={value => {
            setSpecialRequirements(value);
            if (error?.specialRequirements) {
              setError({ ...error, specialRequirements: null });
            }
          }}
          error={error?.specialRequirements}
        />
      </View>
    </ScrollView>
  );
});

StepHousehold.displayName = 'StepHousehold';

export default StepHousehold;

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: Font?.Manrope_Bold,
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    fontFamily: Font?.Manrope_SemiBold,
    fontSize: 14,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrap: {
    borderWidth: 1,
    borderColor: '#EBEBEA',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  dropdownStyle: {
    marginHorizontal: 0,
  },
  selectedTextStyle: {
    marginLeft: 10,
  },
  dropdownTitle: {
    textAlign: 'left',
  },
  adultsContainer: {
    flex: 1,
    marginRight: 8,
  },
  childrenContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  elderlyContainer: {
    flex: 1,
    marginLeft: 8,
  },
  petTypeContainer: {
    flex: 1,
    marginRight: 8,
  },
  petCountContainer: {
    width: 80,
  },
  removePetButton: {
    padding: 5,
    marginLeft: 5,
  },
  addPet: {
    color: '#D98579',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'center',
  },
  proceedBtn: {
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 6,
    backgroundColor: '#E57373',
  },
});
