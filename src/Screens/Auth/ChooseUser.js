import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import CommanView from '../../Component/CommanView';
import Header from '../../Component/Header';
import { Font } from '../../Constants/Font';
import { ImageConstant } from '../../Constants/ImageConstant';
import Typography from '../../Component/UI/Typography';
import Button from '../../Component/Button';
import { useDispatch, useSelector } from 'react-redux';
import { isAuth, userType } from '../../Redux/action';
import LocalizedStrings from '../../Constants/localization';
import { POST_FORM_DATA } from '../../Backend/Backend';
import { PROFILE_UPDATE } from '../../Backend/api_routes';

const ChooseUser = ({ navigation }) => {
  const userTypes = useSelector(store => store?.userType);
  const [user, setUser] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const Dispatch = useDispatch();

  // During signup flow always show ChoosePlan so user can pick a plan
  // and then see the referral code screen (ApplyReferral) afterwards.
  // Staff (role 2) get autoFreeOnMount=true so they are auto-subscribed
  // to the free plan without needing to manually tap "Select Plan".
  const checkSubscriptionAndProceed = (roleId) => {
    navigation.navigate('ChoosePlan', {
      userType: roleId,
      autoFreeOnMount: String(roleId) === '2',
    });
  };

  const SendStepsApi = (type) => {
    const formData = new FormData();
    formData.append('user_role_id', type);
    formData.append('is_edit', 0);
    POST_FORM_DATA(
      PROFILE_UPDATE,
      formData,
      sucess => {
        console.log('SendStepsApi---sucess====', sucess);
      },
      errorResponse => {
        console.log('errorResponse===', errorResponse);
      },
      fail => {
        console.log('fail====', fail);
      },
    );
  };

  return (
    <CommanView>
      {/* Header */}
      <Header
        title={LocalizedStrings.ChooseUser?.title || 'Choose Role'}
        style_title={{ fontFamily: Font?.Manrope_SemiBold }}
        centerIcon={true}
        centerIconSource={ImageConstant?.logo}
      />

      {/* Middle Content */}
      <View style={styles.container}>
        <Typography
          size={20}
          type={Font?.Poppins_SemiBold}
          style={{ marginBottom: 30 }}
        >
          {LocalizedStrings.ChooseUser?.continue_as || 'Continue as'}
        </Typography>

        {/* House Owner Button */}
        <TouchableOpacity
          style={[
            styles.button,
            user == 3 ? styles.filledButton : styles?.outlinedButton,
          ]}
          onPress={() => {
            SendStepsApi(3);
            setUser(3), Dispatch(userType(3));
          }}
        >
          <Typography
            type={Font?.Poppins_Medium}
            size={16}
            color={user == 3 ? '#fff' : '#D98579'}
          >
            {LocalizedStrings.ChooseUser?.house_owner || 'House Owner'}
          </Typography>
        </TouchableOpacity>

        {/* Staff Button */}
        <TouchableOpacity
          style={[
            styles.button,
            user == 2 ? styles.filledButton : styles?.outlinedButton,
          ]}
          onPress={() => {
            SendStepsApi(2);
            setUser(2), Dispatch(userType(2));
          }}
        >
          <Typography
            type={Font?.Poppins_Medium}
            size={16}
            color={user == 2 ? '#fff' : '#D98579'}
          >
            {LocalizedStrings.ChooseUser?.staff || 'Staff'}
          </Typography>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1,
          width: '100%',
          alignItems: 'center',
          bottom: 0,
          justifyContent: 'flex-end',
        }}
      >
        <Button
          title={LocalizedStrings.ChooseUser?.continue || 'Continue'}
          onPress={() => {
            Dispatch(userType(user));
            checkSubscriptionAndProceed(user);
          }}
          main_style={{ marginTop: 20, width: '80%' }}
          disabled={isLoading}
          loader={isLoading}
        />
      </View>
    </CommanView>
  );
};

export default ChooseUser;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  button: {
    paddingVertical: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
  },
  filledButton: {
    backgroundColor: '#D98579',
  },
  outlinedButton: {
    borderWidth: 1,
    borderColor: '#D98579',
    backgroundColor: '#fff',
  },
});
