import React from 'react';
import { useSelector } from 'react-redux';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { isIos } from '../Backend/Utility';
import { Colors } from '../Constants/Colors';
import { ImageConstant } from '../Constants/ImageConstant';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import Typography from '../Component/UI/Typography';
import { Font } from '../Constants/Font';
import StaffDashboard from '../Screens/Staff/StaffDashboard';
import StaffAttendance from './../Screens/Staff/StaffAttendance';
import StaffMore from '../Screens/Staff/StaffMore';
import MyWork from './../Screens/Staff/MyWork';

const Tab = createBottomTabNavigator();

export const bottomTabHeight = isIos ? 90 : 70;

export const TabNavigationForStaff = () => {
  const commonOptions = {
    headerShown: false,
  };
  const navigation = useNavigation();
  const lang_code = useSelector(store => store.langCode);

  const LinearImage = ({ image = ImageConstant?.home, isFocused = false }) => {
    return (
      <Image
        source={image}
        style={{ width: 17.5, height: 17.5, top: 5, marginBottom: 7.5 }}
        resizeMode={'contain'}
        tintColor={isFocused ? '#D98579' : Colors?.black}
      />
    );
  };
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.black,
        tabBarStyle: {
          height: bottomTabHeight,
          elevation: 10,
          backgroundColor: Colors.white,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 5,
        },
        tabBarButton: props => (
          <TouchableOpacity activeOpacity={0.7} {...props}>
            {props.children}
          </TouchableOpacity>
        ),
      }}
      initialRouteName="DashboardHome"
    >
      <Tab.Screen
        name="DashboardHome"
        component={StaffDashboard}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tab, {}]}>
              <LinearImage
                isFocused={focused}
                image={ImageConstant?.Dashboard}
              />
              <Typography
                lineHeight={16.5}
                size={11}
                color={focused ? '#D98579' : Colors?.black}
                type={focused ? Font.Poppins_SemiBold : Font.Poppins_Regular}
                style={styles.text}
                numberOfLines={1}
                textAlign={'center'}
              >
                Dashboard
              </Typography>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="My Work"
        component={MyWork}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tab, {}]}>
              <LinearImage
                isFocused={focused}
                image={ImageConstant?.Briefcase}
              />
              <Typography
                size={focused ? 12 : 10}
                color={focused ? '#D98579' : Colors?.black}
                type={focused ? Font.Poppins_SemiBold : Font.Poppins_Regular}
                style={styles.text}
                numberOfLines={1}
                textAlign={'center'}
              >
                My Work
              </Typography>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Leaves"
        component={StaffAttendance}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tab]}>
              <LinearImage
                isFocused={focused}
                image={ImageConstant?.Calendar}
              />
              <Typography
                size={focused ? 12 : 10}
                color={focused ? '#D98579' : Colors?.black}
                type={focused ? Font.Poppins_SemiBold : Font.Poppins_Regular}
                style={styles.text}
                numberOfLines={1}
                textAlign={'center'}
              >
                Leaves
              </Typography>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={StaffMore}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tab]}>
              <LinearImage isFocused={focused} image={ImageConstant?.More} />
              <Typography
                size={focused ? 12 : 10}
                color={focused ? '#D98579' : Colors?.black}
                type={focused ? Font.Poppins_SemiBold : Font.Poppins_Regular}
                style={styles.text}
                numberOfLines={1}
                textAlign={'center'}
              >
                More
              </Typography>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tab: {
    marginTop: 10,
    paddingHorizontal: 25,
    borderColor: Colors?.blue_icon,
    borderTopColor: Colors.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
    width: widthPercentageToDP(20),
    height: 55,
    justifyContent: 'flex-end',
  },
  text: {
    width: widthPercentageToDP(20),
  },
});
