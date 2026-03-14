import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import { ImageConstant } from '../../Constants/ImageConstant';
import Typography from '../../Component/UI/Typography';
import { Font } from '../../Constants/Font';
import Input from '../../Component/Input';
import Button from '../../Component/Button';

const AIJobSearch = ({navigation}) => {
  const [Describe, setDescribe] = useState('');
  const suggestions = [
    "Housekeeper job near me",
    "Driver job with good salary",
    "Chef job in Bengaluru",
    "Part-time babysitter role",
    "Cook with North Indian cuisine",
  ];
  return (
    <CommanView>
      <HeaderForUser
        title={'AI Job Matching'}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation.goBack()}
        source_logo={ImageConstant?.notification}
        style_title={{ fontSize: 18 }}
        onPressRightIcon={() => navigation.navigate('Notifications')}
      />
      <View style={styles.welcome}>
        <Typography
          type={Font?.Poppins_Medium}
          color="#171A1F"
          lineHeight={30}
          size={27}
          style={styles.text}
        >
          Find your perfect job match
        </Typography>
        <Typography
          type={Font?.Poppins_Medium}
          color="#171A1F"
          size={13}
          textAlign={'center'}
          style={{ color: '#323743' }}
        >
          Describe the kind of job you're looking for. Try including roles, location, salary expectations or work type.
        </Typography>
        <Input
          mainStyle={{ width: '100%' }}
          style_input={styles.inputText}
          placeholder={'Describe what kind of job you want'}
          multiline={true}
          value={Describe}
          onChange={(text) => setDescribe(text)}
          style_inputContainer={{ height: 130 }}
        />
        <View style={styles.suggestionContainer}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => setDescribe(item)}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.Button}>
        <Button
          onPress={() => {
            console.log('AIJobSearch - Passing description:', Describe);
            navigation.navigate("AIJobResults", { description: Describe });
          }}
          linerColor={['#379AE6', '#3737E6']}
          title={'Find Jobs'}
          main_style={{ width: '100%' }}
        />
      </View>
    </CommanView>
  );
};

export default AIJobSearch;

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
    marginBottom: 10,
  },
  inputText: {
    color: '#000',
    height: 130,
  },
  suggestionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    flex: 0.3,
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
  Button: {
    marginBottom: 10,
    alignItems: 'center',
  },
});
