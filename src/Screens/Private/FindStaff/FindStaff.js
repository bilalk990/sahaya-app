
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

const EXPERIENCE_OPTIONS = [
  { label: '0-1 Years', value: '0-1' },
  { label: '1-3 Years', value: '1-3' },
  { label: '3-5 Years', value: '3-5' },
  { label: '5-10 Years', value: '5-10' },
  { label: '10+ Years', value: '10+' },
];

const VERIFICATION_OPTIONS = [
  { label: 'Verified', value: 'verified' },
  { label: 'Unverified', value: 'unverified' },
];

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const AGE_OPTIONS = [
  { label: '18-25', value: '18-25' },
  { label: '25-30', value: '25-30' },
  { label: '30-35', value: '30-35' },
  { label: '35-40', value: '35-40' },
  { label: '40-50', value: '40-50' },
  { label: '50+', value: '50+' },
];

const SALARY_OPTIONS = [
  { label: 'Below ₹5,000', value: '0-5000' },
  { label: '₹5,000 - ₹10,000', value: '5000-10000' },
  { label: '₹10,000 - ₹20,000', value: '10000-20000' },
  { label: '₹20,000 - ₹50,000', value: '20000-50000' },
  { label: 'Above ₹50,000', value: '50000+' },
];

const FindStaff = ({ navigation, route }) => {
  const description = route?.params?.description || '';
  const [allCandidates, setAllCandidates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedImages, setFailedImages] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const [filterRole, setFilterRole] = useState(null);
  const [filterExperience, setFilterExperience] = useState(null);
  const [filterRegion, setFilterRegion] = useState(null);
  const [filterArea, setFilterArea] = useState(null);
  const [filterVerification, setFilterVerification] = useState(null);
  const [filterGender, setFilterGender] = useState(null);
  const [filterAge, setFilterAge] = useState(null);
  const [filterSalary, setFilterSalary] = useState(null);

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
    setErrorMessage('');

    POST_WITH_TOKEN(
      StaffGetAIData,
      { query: description },
      (response) => {

        if (response?.success === false) {
          setErrorMessage(response?.message || 'Something went wrong. Please try again.');
          setCandidates([]);
          setIsLoading(false);
          return;
        }
        const data = response?.data || [];
        const list = Array.isArray(data) ? data : [];

        const mapped = list.map((item) => {
          const workInfo = item?.user_work_info || {};
          return {
            id: item?.id,
            name: `${item?.first_name || ''} ${item?.last_name || ''}`.trim() || item?.name || 'Unknown',
            role: Array.isArray(workInfo?.primary_role) ? workInfo.primary_role.join(', ') : (workInfo?.primary_role || ''),
            tags: Array.isArray(workInfo?.skills) ? workInfo.skills : [],
            location: item?.addresses?.[0]?.city || item?.location || '',
            experience: workInfo?.total_experience || workInfo?.experience || (item?.year_of_experience ? `${item.year_of_experience} Years Experience` : ''),
            verified: item?.is_verified || false,
            gender: item?.gender || '',
            age: getAge(item?.dob),
            salaryNum: Number(workInfo?.salary) || 0,
            salary: formatSalary(workInfo?.salary),
            image: getImageUrl(item?.image),
            raw: item,
          };
        });
        setAllCandidates(mapped);
        setCandidates(mapped);
        setIsLoading(false);
      },
      (error) => {

        setCandidates([]);
        setIsLoading(false);
      },
      () => {

        setCandidates([]);
        setIsLoading(false);
      },
    );
  };

  const roleOptions = React.useMemo(() => {
    const roles = new Set();
    allCandidates.forEach(c => {
      if (c.role) c.role.split(', ').forEach(r => roles.add(r.trim()));
    });
    return [...roles].filter(Boolean).map(r => ({ label: r, value: r }));
  }, [allCandidates]);

  const regionOptions = React.useMemo(() => {
    const regions = new Set();
    allCandidates.forEach(c => {
      if (c.location) regions.add(c.location);
    });
    return [...regions].filter(Boolean).map(r => ({ label: r, value: r }));
  }, [allCandidates]);

  const parseExpYears = (exp) => {
    if (!exp) return 0;
    const match = String(exp).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const applyFilters = () => {
    let filtered = [...allCandidates];

    if (filterRole) {
      filtered = filtered.filter(c => c.role && c.role.toLowerCase().includes(filterRole.toLowerCase()));
    }

    if (filterExperience) {
      filtered = filtered.filter(c => {
        const years = parseExpYears(c.experience);
        if (filterExperience === '10+') return years >= 10;
        const [min, max] = filterExperience.split('-').map(Number);
        return years >= min && years <= max;
      });
    }

    if (filterRegion) {
      filtered = filtered.filter(c => c.location && c.location.toLowerCase().includes(filterRegion.toLowerCase()));
    }

    if (filterArea) {
      filtered = filtered.filter(c => c.location && c.location.toLowerCase().includes(filterArea.toLowerCase()));
    }

    if (filterVerification) {
      filtered = filtered.filter(c =>
        filterVerification === 'verified' ? c.verified : !c.verified
      );
    }

    if (filterGender) {
      filtered = filtered.filter(c => c.gender && c.gender.toLowerCase() === filterGender.toLowerCase());
    }

    if (filterAge) {
      filtered = filtered.filter(c => {
        if (!c.age) return false;
        if (filterAge === '50+') {
          const lower = parseInt(c.age.split('-')[0], 10);
          return lower >= 50;
        }
        const [fMin, fMax] = filterAge.split('-').map(Number);
        const ageLower = parseInt(c.age.split('-')[0], 10);
        return ageLower >= fMin && ageLower < fMax;
      });
    }

    if (filterSalary) {
      filtered = filtered.filter(c => {
        if (!c.salaryNum) return false;
        if (filterSalary === '50000+') return c.salaryNum >= 50000;
        const [min, max] = filterSalary.split('-').map(Number);
        return c.salaryNum >= min && c.salaryNum <= max;
      });
    }

    setCandidates(filtered);
  };

  const resetFilters = () => {
    setFilterRole(null);
    setFilterExperience(null);
    setFilterRegion(null);
    setFilterArea(null);
    setFilterVerification(null);
    setFilterGender(null);
    setFilterAge(null);
    setFilterSalary(null);
    setCandidates(allCandidates);
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
            data={roleOptions}
            value={filterRole}
            onChange={(item) => setFilterRole(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Calendar}
            leftIconsShow
            size={30}
            placeholder={LocalizedStrings.FindStaff.Experience}
            data={EXPERIENCE_OPTIONS}
            value={filterExperience}
            onChange={(item) => setFilterExperience(item.value)}
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
            data={regionOptions}
            value={filterRegion}
            onChange={(item) => setFilterRegion(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Location}
            leftIconsShow
            size={30}
            placeholder={LocalizedStrings.FindStaff.Area_Pincode}
            data={regionOptions}
            value={filterArea}
            onChange={(item) => setFilterArea(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        <View style={styles.filterRow}>
          <DropdownComponent
            leftIcons={ImageConstant?.Verify}
            leftIconsShow
            size={30}
            placeholder={LocalizedStrings.FindStaff.Verification}
            data={VERIFICATION_OPTIONS}
            value={filterVerification}
            onChange={(item) => setFilterVerification(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Users}
            leftIconsShow
            size={30}
            placeholder={LocalizedStrings.FindStaff.Gender}
            data={GENDER_OPTIONS}
            value={filterGender}
            onChange={(item) => setFilterGender(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        <View style={styles.filterRow}>
          <DropdownComponent
            leftIcons={ImageConstant?.Calendar}
            leftIconsShow
            size={30}
            placeholder={LocalizedStrings.FindStaff.Age_Range}
            data={AGE_OPTIONS}
            value={filterAge}
            onChange={(item) => setFilterAge(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Dollar}
            leftIconsShow
            size={30}
            placeholder={LocalizedStrings.FindStaff.Expected_Salary}
            data={SALARY_OPTIONS}
            value={filterSalary}
            onChange={(item) => setFilterSalary(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
            <Typography color="#000" type={Font?.Poppins_Medium}>
              {LocalizedStrings.FindStaff.Reset_Filters}
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
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

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Typography size={14} color="#D98579" textAlign="center">
                {errorMessage}
              </Typography>
            </View>
          ) : candidates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typography size={14} color="#555" textAlign="center">
                No matching candidates found. Try adjusting your search.
              </Typography>
            </View>
          ) : null}

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
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFF5F4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D98579',
    marginTop: 10,
    paddingHorizontal: 16,
  },
});
