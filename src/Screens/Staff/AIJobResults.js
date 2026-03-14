import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Typography from '../../Component/UI/Typography';
import DropdownComponent from '../../Component/DropdownComponent';
import { Font } from '../../Constants/Font';
import { ImageConstant } from '../../Constants/ImageConstant';
import Button from '../../Component/Button';
import HeaderForUser from '../../Component/HeaderForUser';
import CommanView from '../../Component/CommanView';
import { POST_WITH_TOKEN } from '../../Backend/Backend';
import { JobGetAIData } from '../../Backend/api_routes';

const COMPENSATION_TYPE_OPTIONS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Hourly', value: 'hourly' },
];

const COMMITMENT_OPTIONS = [
  { label: 'Full Time', value: 'full-time' },
  { label: 'Part Time', value: 'part-time' },
  { label: 'Live In', value: 'live-in' },
];

const SALARY_OPTIONS = [
  { label: 'Below ₹5,000', value: '0-5000' },
  { label: '₹5,000 - ₹10,000', value: '5000-10000' },
  { label: '₹10,000 - ₹20,000', value: '10000-20000' },
  { label: '₹20,000 - ₹50,000', value: '20000-50000' },
  { label: 'Above ₹50,000', value: '50000+' },
];

const AIJobResults = ({ navigation, route }) => {
  const description = route?.params?.description || '';
  console.log('AIJobResults - Received description:', description);
  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [filterRole, setFilterRole] = useState(null);
  const [filterLocation, setFilterLocation] = useState(null);
  const [filterCompType, setFilterCompType] = useState(null);
  const [filterCommitment, setFilterCommitment] = useState(null);
  const [filterSalary, setFilterSalary] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatCompensation = (job) => {
    const amount = job?.expected_compensation || job?.compensation;
    if (amount && job?.compensation_type) {
      return `₹${Number(amount).toLocaleString('en-IN')} / ${job.compensation_type}`;
    }
    return amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '';
  };

  const formatLocation = (job) => {
    if (job?.city && job?.state) {
      return `${job.city}, ${job.state}`;
    }
    return job?.city || job?.state || job?.street_address || '';
  };

  const fetchJobs = () => {
    setIsLoading(true);
    setErrorMessage('');

    console.log('AIJobResults - API Request:', { url: JobGetAIData, body: { query: description } });

    POST_WITH_TOKEN(
      JobGetAIData,
      { query: description },
      (response) => {
        console.log('AIJobResults - API Response:', JSON.stringify(response));
        if (response?.success === false) {
          setErrorMessage(response?.message || 'Something went wrong. Please try again.');
          setJobs([]);
          setIsLoading(false);
          return;
        }
        const data = response?.data || [];
        const list = Array.isArray(data) ? data : [];

        const mapped = list.map((item) => ({
          id: item?.id,
          title: item?.title || 'Untitled Job',
          description: item?.description || '',
          location: formatLocation(item),
          city: item?.city || '',
          state: item?.state || '',
          compensation: Number(item?.expected_compensation || item?.compensation) || 0,
          compensationDisplay: formatCompensation(item),
          compensationType: item?.compensation_type || '',
          commitmentType: item?.commitment_type || '',
          requiredSkills: item?.required_skills || '',
          additionalRequirements: item?.additional_requirements || '',
          preferredHours: item?.preferred_hours || '',
          raw: item,
        }));

        setAllJobs(mapped);
        setJobs(mapped);
        setIsLoading(false);
      },
      (error) => {
        console.log('AIJobResults - API Error:', JSON.stringify(error));
        setErrorMessage('Failed to load jobs. Please try again.');
        setJobs([]);
        setIsLoading(false);
      },
      (fail) => {
        console.log('AIJobResults - API Fail:', JSON.stringify(fail));
        setJobs([]);
        setIsLoading(false);
      },
    );
  };

  const roleOptions = React.useMemo(() => {
    const roles = new Set();
    allJobs.forEach(j => {
      if (j.title) roles.add(j.title);
    });
    return [...roles].filter(Boolean).map(r => ({ label: r, value: r }));
  }, [allJobs]);

  const locationOptions = React.useMemo(() => {
    const locations = new Set();
    allJobs.forEach(j => {
      if (j.location) locations.add(j.location);
    });
    return [...locations].filter(Boolean).map(r => ({ label: r, value: r }));
  }, [allJobs]);

  const applyFilters = () => {
    let filtered = [...allJobs];

    if (filterRole) {
      filtered = filtered.filter(j => j.title && j.title.toLowerCase().includes(filterRole.toLowerCase()));
    }

    if (filterLocation) {
      filtered = filtered.filter(j => j.location && j.location.toLowerCase().includes(filterLocation.toLowerCase()));
    }

    if (filterCompType) {
      filtered = filtered.filter(j => j.compensationType && j.compensationType.toLowerCase() === filterCompType.toLowerCase());
    }

    if (filterCommitment) {
      filtered = filtered.filter(j => j.commitmentType && j.commitmentType.toLowerCase() === filterCommitment.toLowerCase());
    }

    if (filterSalary) {
      filtered = filtered.filter(j => {
        if (!j.compensation) return false;
        if (filterSalary === '50000+') return j.compensation >= 50000;
        const [min, max] = filterSalary.split('-').map(Number);
        return j.compensation >= min && j.compensation <= max;
      });
    }

    setJobs(filtered);
  };

  const resetFilters = () => {
    setFilterRole(null);
    setFilterLocation(null);
    setFilterCompType(null);
    setFilterCommitment(null);
    setFilterSalary(null);
    setJobs(allJobs);
  };

  const dropdownProps = {
    style_dropdown: { marginHorizontal: 0, width: '100%' },
    selectedTextStyleNew: { marginLeft: 4, fontSize: 14 },
    style_title: { textAlign: 'left' },
    marginHorizontal: 0,
  };

  return (
    <CommanView>
      <HeaderForUser
        title={'AI Job Results'}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation.goBack()}
        source_logo={ImageConstant?.notification}
        style_title={{ fontSize: 18 }}
        onPressRightIcon={() => navigation.navigate('Notifications')}
      />
      <View style={styles.filterCard}>
        <Typography
          type={Font?.Poppins_SemiBold}
          size={16}
          style={{ marginBottom: 10 }}
        >
          Filter Options
        </Typography>

        <View style={styles.filterRow}>
          <DropdownComponent
            leftIcons={ImageConstant?.Briefcase}
            leftIconsShow
            size={30}
            placeholder={'Job Role'}
            data={roleOptions}
            value={filterRole}
            onChange={(item) => setFilterRole(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Location}
            leftIconsShow
            size={30}
            placeholder={'Location'}
            data={locationOptions}
            value={filterLocation}
            onChange={(item) => setFilterLocation(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        <View style={styles.filterRow}>
          <DropdownComponent
            leftIcons={ImageConstant?.Calendar}
            leftIconsShow
            size={30}
            placeholder={'Work Type'}
            data={COMMITMENT_OPTIONS}
            value={filterCommitment}
            onChange={(item) => setFilterCommitment(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <DropdownComponent
            leftIcons={ImageConstant?.Dollar}
            leftIconsShow
            size={30}
            placeholder={'Salary Range'}
            data={SALARY_OPTIONS}
            value={filterSalary}
            onChange={(item) => setFilterSalary(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        <View style={styles.filterRow}>
          <DropdownComponent
            leftIcons={ImageConstant?.Dollar}
            leftIconsShow
            size={30}
            placeholder={'Pay Type'}
            data={COMPENSATION_TYPE_OPTIONS}
            value={filterCompType}
            onChange={(item) => setFilterCompType(item.value)}
            {...dropdownProps}
            MainBoxStyle={{ flex: 1, marginRight: 6 }}
          />
          <View style={{ flex: 1, marginLeft: 6 }} />
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
            <Typography color="#000" type={Font?.Poppins_Medium}>
              Reset Filters
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
            <Typography color="#fff" type={Font?.Poppins_Medium}>
              Apply Filters
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Jobs */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D98579" />
          <Typography size={14} style={{ marginTop: 10 }} color="#555">
            Finding matching jobs...
          </Typography>
        </View>
      ) : (
        <>
          <Typography size={14} style={{ marginVertical: 20 }}>
            {jobs.length} Matching Jobs
          </Typography>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Typography size={14} color="#D98579" textAlign="center">
                {errorMessage}
              </Typography>
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typography size={14} color="#555" textAlign="center">
                No matching jobs found. Try adjusting your search.
              </Typography>
            </View>
          ) : null}

          {jobs.map(j => (
            <View key={j.id} style={styles.card}>
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <View style={styles.iconCircle}>
                  <Image
                    source={ImageConstant.Briefcase}
                    style={{ height: 24, width: 24, tintColor: '#D98579' }}
                  />
                </View>
                <View style={{ justifyContent: 'center', marginLeft: 12, flex: 1 }}>
                  <Typography type={Font?.Poppins_SemiBold} size={17}>
                    {j.title}
                  </Typography>
                  {j.commitmentType ? (
                    <View style={styles.commitmentBadge}>
                      <Typography size={11} color="#D98579">
                        {j.commitmentType}
                      </Typography>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Skills Tags */}
              {j.requiredSkills ? (
                <View style={styles.tagRow}>
                  {j.requiredSkills.split(',').map((skill, i) => (
                    <View key={i} style={styles.tag}>
                      <Typography size={11}>{skill.trim()}</Typography>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Info with Icons */}
              <View style={[styles.infoRow, { marginTop: 15 }]}>
                <Image source={ImageConstant.Location} style={styles.icon} />
                <Typography margin={3} size={14}>
                  {j.location || 'Not Available'}
                </Typography>
              </View>

              {j.compensationDisplay ? (
                <View style={styles.infoRow}>
                  <Image source={ImageConstant.Dollar} style={styles.icon} />
                  <Typography margin={3} size={14} color="#E87C6F" type={Font?.Poppins_SemiBold}>
                    {j.compensationDisplay}
                  </Typography>
                </View>
              ) : null}

              {j.preferredHours ? (
                <View style={styles.infoRow}>
                  <Image source={ImageConstant.Calendar} style={styles.icon} />
                  <Typography margin={3} size={14}>
                    {j.preferredHours}
                  </Typography>
                </View>
              ) : null}

              {j.description ? (
                <Typography size={12} color="#666" style={{ marginTop: 8, marginBottom: 15, paddingHorizontal: 4 }}>
                  {j.description.length > 120 ? j.description.substring(0, 120) + '...' : j.description}
                </Typography>
              ) : null}

              <Button
                title={'View Details'}
                style={{ width: '90%', margin: 'auto' }}
                onPress={() => navigation.navigate('JobDetails', { jobId: j.id })}
              />
            </View>
          ))}
        </>
      )}
    </CommanView>
  );
};

export default AIJobResults;

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
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commitmentBadge: {
    backgroundColor: '#FFF0EE',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
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
