import React from 'react';
import { StyleSheet, View, ImageBackground, StatusBar } from 'react-native';
import { ImageConstant } from '../../Constants/ImageConstant';
import Typography from '../../Component/UI/Typography';
import Button from '../../Component/Button';
import { Font } from '../../Constants/Font';
import { useDispatch } from 'react-redux';
import { isAuth } from '../../Redux/action';
import LocalizedStrings from '../../Constants/localization';

const SocialLogin = ({ navigation }) => {
  const dispatch = useDispatch()
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground
        source={ImageConstant?.BackGroundImage} // Ensure this is the diya image from Figma
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Title Section */}
          <View style={styles.titleWrapper}>
            <Typography
              color="#fff"
              type={Font?.Manrope_Regular}
              size={36}
              lineHeight={50}
            >
              {LocalizedStrings.Auth?.login || 'Sign In'}
            </Typography>
            <Typography
              color="#fff"
              size={16}
              type={Font?.Poppins_Regular}
              style={styles.subtitle}
            >
              {LocalizedStrings.Auth?.welcome_back || 'Welcome back!'}
            </Typography>
            <Typography color="#fff" size={16}>
              {LocalizedStrings.Auth?.sign_in_continue || 'Please sign in to continue.'}
            </Typography>
          </View>

          {/* Buttons Section */}
          <View style={styles.buttonWrapper}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Button
                  onPress={() => {
                    navigation?.navigate('SiginUp');
                  }}
                  icon={ImageConstant?.Google}
                  linerColor={['#FFFFFF', '#FFFFFF']}
                  title={'Google'}
                  title_style={{ color: '#000000' }}
                />
              </View>
              <View style={styles.halfWidth}>
                <Button
                 onPress={() => {
                    navigation?.navigate('SiginUp');
                  }}
                  icon={ImageConstant?.Apple}
                  linerColor={['#FFFFFF', '#FFFFFF']}
                  title={'Apple'}
                  title_style={{ color: '#000000' }}
                />
              </View>
            </View>
            <View style={styles.fullWidth}>
              <Button
               onPress={() => {
                    dispatch(isAuth(true))
                  }}
                icon={ImageConstant?.FaceBook}
                linerColor={['#FFFFFF', '#FFFFFF']}
                title={'Facebook'}
                title_style={{ color: '#000000' }}
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </>
  );
};

export default SocialLogin;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between', // Keep space between title and buttons,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end', // This centers vertically within available space
    bottom: 50,
  },
  subtitle: {
    marginVertical: 4,
  },
  buttonWrapper: {
    marginBottom: 60,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  fullWidth: {
    width: '100%',
  },
});
