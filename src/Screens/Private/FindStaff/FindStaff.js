
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Typography from '../../../Component/UI/Typography';
import DropdownComponent from '../../../Component/DropdownComponent';
import { Font } from '../../../Constants/Font';
import { ImageConstant } from '../../../Constants/ImageConstant';
import Button from '../../../Component/Button';
import HeaderForUser from '../../../Component/HeaderForUser';
import CommanView from '../../../Component/CommanView';
import LocalizedStrings from '../../../Constants/localization';

const FindStaff = ({ navigation }) => {
  const candidates = [
    {
      id: 1,
      name: 'Aisha Rahman',
      role: 'Professional Housekeeper',
      tags: ['Deep Cleaning', 'Laundry', 'Pet Care', 'Song'],
      location: 'Bengaluru, Karnataka',
      experience: '8 Years Experience',
      verified: true,
      gender: 'Female',
      age: '30-35',
      salary: '₹90,000 - ₹110,000',
      image: ImageConstant.user,
    },
    {
      id: 2,
      name: 'Dopinder Singh',
      role: 'Experienced Driver',
      tags: ['Advanced Driving', 'Route Planning', 'Logistics', 'Dancing'],
      location: 'Bengaluru, Karnataka',
      experience: '6 Years Experience',
      verified: true,
      gender: 'Male',
      age: '30-35',
      salary: '₹80,000 - ₹100,000',
      image: ImageConstant.user2,
    },
  ];

  const dropdownProps = {
    style_dropdown: { marginHorizontal: 0, width: '100%' },
    selectedTextStyleNew: { marginLeft: 10 },
    style_title: { textAlign: 'left' },
    marginHorizontal: 0,
  };

  return (
    <CommanView>
      <HeaderForUser
        title={LocalizedStrings.FindStaff.title}
        source_logo={ImageConstant?.notification}
        // Profile_icon={ImageConstant?.user}
        style_title={{ fontSize: 18 }}

        onPressRightIcon={() => navigation.navigate('Notification')}
      />
      <View style={styles.filterCard}>
        <Typography
          type={Font?.Poppins_SemiBold}
          size={16}
          style={{ marginBottom: 10 }}
        >
          {LocalizedStrings.FindStaff.Filter_Options}
        </Typography>

        <View style={styles.filterRow}>
          <DropdownComponent
            leftIcons={ImageConstant?.Briefcase}
            leftIconsShow
            size={40}
            placeholder={LocalizedStrings.FindStaff.Job_Role}
            data={[]}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Calendar}
            leftIconsShow
            size={40}
            placeholder={LocalizedStrings.FindStaff.Experience}
            data={[]}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        <View style={styles.filterRow}>
          <DropdownComponent
            leftIcons={ImageConstant?.Location}
            leftIconsShow
            size={40}
            placeholder={LocalizedStrings.FindStaff.Region}
            {...dropdownProps}
            data={[]}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Location}
            leftIconsShow
            size={40}
            placeholder={LocalizedStrings.FindStaff.Area_Pincode}
            {...dropdownProps}
            data={[]}
            MainBoxStyle={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        <View style={styles.filterRow}>
          <DropdownComponent
            leftIcons={ImageConstant?.Verify}
            leftIconsShow
            size={40}
            placeholder={LocalizedStrings.FindStaff.Verification}
            {...dropdownProps}
            data={[]}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Users}
            leftIconsShow
            size={40}
            placeholder={LocalizedStrings.FindStaff.Gender}
            {...dropdownProps}
            data={[]}
            MainBoxStyle={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        <View style={styles.filterRow}>
          <DropdownComponent
            leftIcons={ImageConstant?.Calendar}
            leftIconsShow
            size={40}
            placeholder={LocalizedStrings.FindStaff.Age_Range}
            {...dropdownProps}
            data={[]}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Dollar}
            leftIconsShow
            size={40}
            placeholder={LocalizedStrings.FindStaff.Expected_Salary}
            {...dropdownProps}
            data={[]}
            MainBoxStyle={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.resetBtn}>
            <Typography color="#000" type={Font?.Poppins_Medium}>
              {LocalizedStrings.FindStaff.Reset_Filters}
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn}>
            <Typography color="#fff" type={Font?.Poppins_Medium}>
              {LocalizedStrings.FindStaff.Apply_Filters}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Candidates */}
      <Typography size={14} style={{ marginVertical: 20 }}>
        {candidates.length} {LocalizedStrings.FindStaff.Matching_Candidates}
      </Typography>

      {candidates.map(c => (
        <View key={c.id} style={styles.card}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, paddingHorizontal: 20 }}>
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Image source={c.image} style={styles.avatar} />
                <View style={{ justifyContent: 'center', marginLeft: 8 }}>
                  <Typography type={Font?.Poppins_SemiBold} size={17}>
                    {c.name}
                  </Typography>
                  <Typography size={13} color="#555">
                    {c.role}
                  </Typography>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagRow}>
                {c.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Typography size={11}>{tag}</Typography>
                  </View>
                ))}
              </View>

              {/* Info with Icons */}
              <View style={[styles.infoRow, { marginTop: 15 }]}>
                <Image source={ImageConstant.Location} style={styles.icon} />
                <Typography margin={3} size={14}>
                  {c.location}
                </Typography>
              </View>

              <View style={styles.infoRow}>
                <Image source={ImageConstant.Briefcase} style={styles.icon} />
                <Typography margin={3} size={14}>
                  {c.experience}
                </Typography>
              </View>

              <View style={styles.infoRow}>
                <Image source={ImageConstant.Verify} style={styles.icon} />
                <Typography margin={3} size={14}>
                  {LocalizedStrings.FindStaff.Police_Verification}:{' '}
                  <Typography color="green">
                    {c.verified ? LocalizedStrings.FindStaff.Verified : LocalizedStrings.FindStaff.Unverified}
                  </Typography>
                </Typography>
              </View>

              <View style={styles.infoRow}>
                <Image source={ImageConstant.Users} style={styles.icon} />
                <Typography margin={3} size={14}>
                  {c.gender}
                </Typography>
              </View>

              <View style={styles.infoRow}>
                <Image source={ImageConstant.Calendar} style={styles.icon} />
                <Typography margin={3} size={14}>
                  {c.age}
                </Typography>
              </View>

              <View style={[styles.infoRow, { marginBottom: 15 }]}>
                <Image source={ImageConstant.Dollar} style={styles.icon} />
                <Typography margin={3} size={14}>
                  {c.salary}
                </Typography>
              </View>
            </View>
          </View>
          <Button
            title={LocalizedStrings.FindStaff.Contact}
            style={{ width: '90%', margin: 'auto' }}
          />
        </View>
      ))}
    </CommanView>
  );
};

export default FindStaff;

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  resetBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
    borderColor: '#D98579',
    borderWidth: 1,
    height: 40,
  },
  applyBtn: {
    backgroundColor: '#D98579',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 16,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  tag: {
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 6,
    resizeMode: 'contain',
  },
});
