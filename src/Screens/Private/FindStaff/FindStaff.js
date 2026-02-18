
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Typography from '../../../Component/UI/Typography';
import DropdownComponent from '../../../Component/DropdownComponent';
import { Font } from '../../../Constants/Font';
import { ImageConstant } from '../../../Constants/ImageConstant';
import Button from '../../../Component/Button';
import HeaderForUser from '../../../Component/HeaderForUser';
import CommanView from '../../../Component/CommanView';
import LocalizedStrings from '../../../Constants/localization';
import { POST_WITH_TOKEN, API } from '../../../Backend/Backend';
import { StaffGetAIData } from '../../../Backend/api_routes';

const FindStaff = ({ navigation, route }) => {
  const description = route?.params?.description || '';
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    fetchCandidates();
  }, []);

  const getImageUrl = (img) => {
    if (!img || img.includes('noimage')) return null;
    if (img.startsWith('http')) return img;
    const baseUrl = API.replace('/api/', '');
    return `${baseUrl}${img}`;
  };

  const formatSalary = (salary) => {
    if (!salary) return '';
    const num = Number(salary);
    if (isNaN(num)) return salary;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getAge = (dob) => {
    if (!dob) return '';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age <= 0) return '';
    const lower = Math.floor(age / 5) * 5;
    const upper = lower + 5;
    return `${lower}-${upper}`;
  };

  const fetchCandidates = () => {
    setIsLoading(true);
    POST_WITH_TOKEN(
      StaffGetAIData,
      { query: description },
      (response) => {
        const data = response?.data || [];
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map((item) => {
          const workInfo = item?.user_work_info || {};
          return {
            id: item?.id,
            name: item?.name || `${item?.first_name || ''} ${item?.last_name || ''}`.trim() || 'Unknown',
            role: Array.isArray(workInfo?.primary_role) ? workInfo.primary_role.join(', ') : '',
            tags: Array.isArray(workInfo?.skills) ? workInfo.skills : [],
            location: item?.location || '',
            experience: workInfo?.total_experience || (item?.year_of_experience ? `${item.year_of_experience} Years Experience` : ''),
            verified: item?.is_verified || false,
            gender: item?.gender || '',
            age: getAge(item?.dob),
            salary: formatSalary(workInfo?.salary),
            image: getImageUrl(item?.image),
            raw: item,
          };
        });
        setCandidates(mapped);
        setIsLoading(false);
      },
      (error) => {
        console.error('FindStaff API error:', error);
        setCandidates([]);
        setIsLoading(false);
      },
      () => {
        setCandidates([]);
        setIsLoading(false);
      },
    );
  };

  const dropdownProps = {
    style_dropdown: { marginHorizontal: 0, width: '100%' },
    selectedTextStyleNew: { marginLeft: 4 , fontSize: 14 },
    style_title: { textAlign: 'left' },
    marginHorizontal: 0,
  };

  return (
    <CommanView>
      <HeaderForUser
        title={LocalizedStrings.FindStaff.title}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation.goBack()}
        source_logo={ImageConstant?.notification}
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
            size={30}
            placeholder={LocalizedStrings.FindStaff.Job_Role}
            data={[]}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Calendar}
            leftIconsShow
            size={30}
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
            size={30}
            placeholder={LocalizedStrings.FindStaff.Region}
            {...dropdownProps}
            data={[]}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Location}
            leftIconsShow
            size={30}
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
            size={30}
            placeholder={LocalizedStrings.FindStaff.Verification}
            {...dropdownProps}
            data={[]}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Users}
            leftIconsShow
            size={30}
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
            size={30}
            placeholder={LocalizedStrings.FindStaff.Age_Range}
            {...dropdownProps}
            data={[]}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Dollar}
            leftIconsShow
            size={30}
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
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#379AE6" />
          <Typography size={14} style={{ marginTop: 10 }} color="#555">
            Finding matching staff...
          </Typography>
        </View>
      ) : (
        <>
          <Typography size={14} style={{ marginVertical: 20 }}>
            {candidates.length} {LocalizedStrings.FindStaff.Matching_Candidates}
          </Typography>

          {candidates.length === 0 && (
            <View style={styles.emptyContainer}>
              <Typography size={14} color="#555" textAlign="center">
                No matching candidates found. Try adjusting your search.
              </Typography>
            </View>
          )}

          {candidates.map(c => (
            <View key={c.id} style={styles.card}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                  <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                    <Image
                      source={
                        c.image && !failedImages[c.id]
                          ? { uri: c.image }
                          : ImageConstant.user
                      }
                      defaultSource={ImageConstant.user}
                      onError={() => setFailedImages(prev => ({ ...prev, [c.id]: true }))}
                      style={styles.avatar}
                    />
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
                  {c.tags && c.tags.length > 0 && (
                    <View style={styles.tagRow}>
                      {c.tags.map((tag, i) => (
                        <View key={i} style={styles.tag}>
                          <Typography size={11}>{tag}</Typography>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Info with Icons */}
                  <View style={[styles.infoRow, { marginTop: 15 }]}>
                    <Image source={ImageConstant.Location} style={styles.icon} />
                    <Typography margin={3} size={14}>
                      {c.location || 'Not Available'}
                    </Typography>
                  </View>

                  <View style={styles.infoRow}>
                    <Image source={ImageConstant.Briefcase} style={styles.icon} />
                    <Typography margin={3} size={14}>
                      {c.experience || 'Not Available'}
                    </Typography>
                  </View>

                  <View style={styles.infoRow}>
                    <Image source={ImageConstant.Verify} style={styles.icon} />
                    <Typography margin={3} size={14}>
                      {LocalizedStrings.FindStaff.Police_Verification}:{' '}
                      <Typography color={c.verified ? 'green' : 'red'}>
                        {c.verified ? LocalizedStrings.FindStaff.Verified : LocalizedStrings.FindStaff.Unverified}
                      </Typography>
                    </Typography>
                  </View>

                  {(c.gender || c.age) ? (
                    <View style={[styles.infoRow, { justifyContent: 'space-between' }]}>
                      {c.gender ? (
                        <View style={styles.infoRow}>
                          <Image source={ImageConstant.Users} style={styles.icon} />
                          <Typography margin={3} size={14}>
                            {c.gender}
                          </Typography>
                        </View>
                      ) : null}
                      {c.age ? (
                        <View style={styles.infoRow}>
                          <Image source={ImageConstant.Calendar} style={styles.icon} />
                          <Typography margin={3} size={14}>
                            {c.age}
                          </Typography>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {c.salary ? (
                    <View style={[styles.infoRow, { marginBottom: 15 }]}>
                      <Image source={ImageConstant.Dollar} style={styles.icon} />
                      <Typography margin={3} size={14}>
                        {c.salary}
                      </Typography>
                    </View>
                  ) : null}
                </View>
              </View>
              <Button
                title={LocalizedStrings.FindStaff.Contact}
                style={{ width: '90%', margin: 'auto' }}
                onPress={() => navigation.navigate('HouseHoldStaffProfile', { item: c.raw })}
              />
            </View>
          ))}
        </>
      )}
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
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
});
