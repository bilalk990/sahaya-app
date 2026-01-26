import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import CommanView from '../../../Component/CommanView';
import HeaderForUser from '../../../Component/HeaderForUser';
import { ImageConstant } from '../../../Constants/ImageConstant';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import Input from '../../../Component/Input';
import Button from '../../../Component/Button';
import LocalizedStrings from '../../../Constants/localization';

const AllStaff = ({navigation}) => {
  const [Describe, setDescribe] = useState('')
  const suggestions = [
    "Professional Housekeeper exp.",
    "Experienced Male Driver",
    "Senior Chef with Veg South Indian Cuisine",
    "Dog walker near me",
    "Chef with North Indian & South Indian Cuisine"
  ];
  return (
    <CommanView>
      <HeaderForUser
        title={LocalizedStrings.FindStaffAI.title}
        source_logo={ImageConstant?.notification}
        // Profile_icon={ImageConstant?.user}
        style_title={{ fontSize: 18 }}
  
                onPressRightIcon={() => navigation.navigate('Notification')}
        
      />
      <View style={styles.welcome}>
        <Typography
          type={Font?.Poppins_Medium}
          color="#171A1F"
          lineHeight={30}
          size={27}
          style={styles.text}
        >
          {LocalizedStrings.FindStaffAI.Welcome_Title}
        </Typography>
        <Typography
          type={Font?.Poppins_Medium}
          color="#171A1F"
          size={13}
          textAlign={'center'}
          style={{ color: '#323743' }}
        >
          {LocalizedStrings.FindStaffAI.Welcome_Desc}
        </Typography>
        <Input
          mainStyle={{ width: '100%' }}
          style_input={styles.inputText}
          placeholder={LocalizedStrings.FindStaffAI.Describe_Requirements}
          multiline={true}
          value={Describe}
          onChange={(text)=>setDescribe(text)}
          style_inputContainer={{ height: 130 }}
        />
     <View style={styles.suggestionContainer}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => Alert.alert('coming soon')}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.Button}>
        <Button
          onPress={()=>{navigation.navigate("FindStaff")}}
          linerColor={['#379AE6', '#3737E6']}
          title={LocalizedStrings.FindStaffAI.Find_Staff}
          main_style={{ width: '100%' }}
        />
      </View>
    </CommanView>
  );
};

export default AllStaff;

const styles = StyleSheet.create({
  welcome: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
  },
  text: {
    textAlign: 'center',
     color: '#242524',
     marginBottom: 10
  },
  inputText: {
    color: '#000',
    height: 130,
  },
  suggestionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    flex:0.3
  },
  suggestionChip: {
    backgroundColor: '#F2F4F7',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 8,
    margin: 4,
  },
  suggestionText: {
    fontSize: 11,
    color: '#344054',
    fontFamily: Font.Poppins_Medium,
  },
  Button:{
    marginBottom: 10, 
    alignItems: 'center'
  }
});
