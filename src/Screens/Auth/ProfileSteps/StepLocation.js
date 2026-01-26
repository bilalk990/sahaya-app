import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';

import { Font } from '../../../Constants/Font';
import { validators } from '../../../Backend/Validator';
import { isValidForm, fetchPincodeDetails } from '../../../Backend/Utility';

import Input from '../../../Component/Input';
import Typography from '../../../Component/UI/Typography';
import { ImageConstant } from '../../../Constants/ImageConstant';
import LocalizedStrings from '../../../Constants/localization';



const StepLocation = React.forwardRef((props, ref) => {
  const [show, setShow] = useState(false);
  const [error, setError] = useState({});
  
  // Primary address states
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  // Secondary address states
  const [street2, setStreet2] = useState('');
  const [city2, setCity2] = useState('');
  const [state2, setState2] = useState('');
  const [pinCode2, setPinCode2] = useState('');

  // Clear city and state when pincode is cleared or changed
  useEffect(() => {
    if (pinCode.length < 6) {
      setCity('');
      setState('');
    }
  }, [pinCode]);

  useEffect(() => {
    if (pinCode2.length < 6) {
      setCity2('');
      setState2('');
    }
  }, [pinCode2]);

  // Fetch pincode details for primary address
  useEffect(() => {
    const fetchDetails = async () => {
      if (pinCode && pinCode.length === 6) {
        try {
          const details = await fetchPincodeDetails(pinCode);
          if (details && details.city) {
            setCity(details.city);
            setError(prev => prev?.city ? {...prev, city: null} : prev);
          }
          if (details && details.state) {
            setState(details.state);
            setError(prev => prev?.state ? {...prev, state: null} : prev);
          }
        } catch (error) {
          console.error('Error fetching pincode details:', error);
        }
      }
    };
    
    // Small delay to avoid multiple calls
    const timer = setTimeout(() => {
      fetchDetails();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pinCode]);

  // Fetch pincode details for secondary address
  useEffect(() => {
    const fetchDetails = async () => {
      if (pinCode2 && pinCode2.length === 6) {
        try {
          const details = await fetchPincodeDetails(pinCode2);
          if (details && details.city) {
            setCity2(details.city);
            setError(prev => prev?.city2 ? {...prev, city2: null} : prev);
          }
          if (details && details.state) {
            setState2(details.state);
            setError(prev => prev?.state2 ? {...prev, state2: null} : prev);
          }
        } catch (error) {
          console.error('Error fetching pincode details:', error);
        }
      }
    };
    
    // Small delay to avoid multiple calls
    const timer = setTimeout(() => {
      fetchDetails();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pinCode2]);


  // Validation function for address fields
  const validateAddress = () => {
    let errors = {
      street: validators.checkRequire('Street', street),
      city: validators.checkAlphabet('City', 2, 50, city),
      state: validators.checkAlphabet('State', 2, 50, state),
      pinCode: validators.checkPhoneNumberWithFixLength('Pincode', 6, pinCode),
    };

    // If secondary address is shown, validate it too
    if (show) {
      errors = {
        ...errors,
        street2: validators.checkRequire('Street', street2),
        city2: validators.checkAlphabet('City', 2, 50, city2),
        state2: validators.checkAlphabet('State', 2, 50, state2),
        pinCode2: validators.checkPhoneNumberWithFixLength('Pincode', 6, pinCode2),
      };
    }

    setError(errors);
    return isValidForm(errors);
  };

  // Function to get address data
  const getAddressData = () => {
    const addresses = [{
      street,
      city,
      state,
      pinCode,
    }];

    // Add secondary address if exists
    if (show && street2 && city2 && state2 && pinCode2) {
      addresses.push({
        street: street2,
        city: city2,
        state: state2,
        pinCode: pinCode2,
      });
    }

    return addresses;
  };

  // Expose validation and data functions to parent component
  React.useImperativeHandle(ref, () => ({
    validateAddress,
    getAddressData,
  }));


  return (
    <View style={styles.container}>
      <View style={styles.wrap}>
        <Typography type={Font?.Poppins_SemiBold} size={18}>{LocalizedStrings.EditProfile?.Home_Address || LocalizedStrings.NewStaffForm?.Home_Address || 'Home Address'}</Typography>
        <Input
          title={LocalizedStrings.EditProfile?.Street || LocalizedStrings.StaffProfile?.Street || 'Street'}
          placeholder="Enter street address"
          value={street}
          onChange={(text) => {
            setStreet(text);
            if (error?.street) setError({...error, street: null});
          }}
          error={error?.street}
        />
        <Input 
          title={LocalizedStrings.EditProfile?.Pincode || LocalizedStrings.StaffProfile?.Pincode || 'Pincode'} 
          placeholder={''} 
          keyboardType="numeric"
          value={pinCode}
          onChange={(text) => {
            setPinCode(text);
            if (error?.pinCode) setError({...error, pinCode: null});
          }}
          error={error?.pinCode}
          maxLength={6}
        />
        {pinCode.length === 6 && (
          <View style={styles.row}>
            <View style={styles.cityContainer}>
              <Input 
                title={LocalizedStrings.EditProfile?.City || LocalizedStrings.StaffProfile?.City || 'City'} 
                placeholder={''}
                value={city}
                onChange={(text) => {
                  setCity(text);
                  if (error?.city) setError({...error, city: null});
                }}
                error={error?.city}
              />
            </View>
            <View style={styles.stateContainer}>
              <Input 
                title={LocalizedStrings.EditProfile?.State || LocalizedStrings.StaffProfile?.State || 'State'} 
                placeholder={''}
                value={state}
                onChange={(text) => {
                  setState(text);
                  if (error?.state) setError({...error, state: null});
                }}
                error={error?.state}
              />
            </View>
          </View>
        )}
        <TouchableOpacity onPress={() => setShow(true)}>
          <Typography color='rgba(217, 133, 121, 1)'>+ {LocalizedStrings.EditProfile?.add_more_address || 'Add more address'}</Typography>
        </TouchableOpacity>
      </View>
      {show && (
        <View style={styles.wrap}>
          <View style={styles.headerRow}>
            <Typography type={Font?.Poppins_SemiBold} size={18}>{LocalizedStrings.EditProfile?.Home_Address || LocalizedStrings.NewStaffForm?.Home_Address || 'Home Address'}</Typography>
            <TouchableOpacity onPress={() => setShow(false)}>
              <Image source={ImageConstant?.X} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <Input
            title={LocalizedStrings.EditProfile?.Street || LocalizedStrings.StaffProfile?.Street || 'Street'}
            placeholder={LocalizedStrings.EditProfile?.Street || 'Enter street address'}
            value={street2}
            onChange={(text) => {
              setStreet2(text);
              if (error?.street2) setError({...error, street2: null});
            }}
            error={error?.street2}
          />
          <Input 
            title={LocalizedStrings.EditProfile?.Pincode || LocalizedStrings.StaffProfile?.Pincode || 'Pincode'} 
            placeholder={''} 
            keyboardType="numeric"
            value={pinCode2}
            onChange={(text) => {
              setPinCode2(text);
              if (error?.pinCode2) setError({...error, pinCode2: null});
            }}
            error={error?.pinCode2}
            maxLength={6}
          />
          {pinCode2.length === 6 && (
            <View style={styles.row}>
              <View style={styles.cityContainer}>
                <Input 
                  title={LocalizedStrings.EditProfile?.City || LocalizedStrings.StaffProfile?.City || 'City'} 
                  placeholder={''}
                  value={city2}
                  onChange={(text) => {
                    setCity2(text);
                    if (error?.city2) setError({...error, city2: null});
                  }}
                  error={error?.city2}
                />
              </View>
              <View style={styles.stateContainer}>
                <Input 
                  title={LocalizedStrings.EditProfile?.State || LocalizedStrings.StaffProfile?.State || 'State'} 
                  placeholder={''}
                  value={state2}
                  onChange={(text) => {
                    setState2(text);
                    if (error?.state2) setError({...error, state2: null});
                  }}
                  error={error?.state2}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

StepLocation.displayName = 'StepLocation';

export default StepLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Font?.Manrope_Bold,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
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
  wrap: {
    borderWidth: 1,
    borderColor: '#EBEBEA',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
});
