import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { Profiler } from 'react';
import { Colors } from '../Constants/Colors';
import { Font } from '../Constants/Font';
import Typography from './UI/Typography';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

const HeaderForUser = ({
  onPress,
  style_img,
  style_backarrow,
  style_title,
  title,
  source_arrow,
  source_logo,
  containerStyle,
  centerIcon = false,
  backgroundColor = Colors.white,
  centerIconSource,
  centerIconTitle,
  onPressRightIcon = () => {},
  onPressLangIcon = () => {},
  onPressLeftIcon = () => {},
  onPressProfileIcon = () => {},
  back_img,
  Lang_icon,
  Profile_icon,
}) => {
  const navigation = useNavigation();
  return (
    <View style={[styles.container, containerStyle]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.backContainer}>
        <TouchableOpacity
          onPress={() => {
            onPressLeftIcon();
          }}
        >
          <Image
            source={source_arrow}
            style={[styles.back_img, style_backarrow]}
          />
        </TouchableOpacity>
        <Typography
          type={Font.Poppins_Medium}
          style={[styles.txt_style, style_title]}
        >
          {title}
        </Typography>
        {Lang_icon && (
          <TouchableOpacity onPress={onPressLangIcon} style={{ right: 15 }}>
            <Image
              source={Lang_icon}
              style={[styles.back_img, { tintColor: '#fff' }, back_img]}
            />
          </TouchableOpacity>
        )}
        {source_logo && (
          <TouchableOpacity onPress={onPressRightIcon} style={{ right: 10 }}>
            <Image source={source_logo} style={[styles.back_img, back_img]} />
          </TouchableOpacity>
        )}

        {Profile_icon && (
          <TouchableOpacity onPress={onPressProfileIcon}>
            <Image
              source={
                Profile_icon ? { uri: Profile_icon } : ImageConstant?.user
              }
              style={[
                styles.back_img,
                { height: 35, width: 35, borderRadius: 40 ,resizeMode: 'cover'},
                back_img,
              ]}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HeaderForUser;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // borderBottomRightRadius: 30,
    // borderBottomLeftRadius: 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#EBEBEA',
  },
  backContainer: {
    flexDirection: 'row',
    //paddingTop: heightPercentageToDP(7),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  back_img: {
    height: 30,
    width: 30,
    resizeMode: 'center',
  },
  txt_style: {
    color: Colors?.black,
    fontSize: 15,
    textAlign: 'center',
    flex: 1,
  },
});
