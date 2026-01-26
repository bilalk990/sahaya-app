import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import HeaderForUser from '../../Component/HeaderForUser';
import CommanView from '../../Component/CommanView';
import { Font } from '../../Constants/Font';
import Typography from '../../Component/UI/Typography';
import { ImageConstant } from '../../Constants/ImageConstant';
import Button from '../../Component/Button';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import { SUBSCRIPTIONS } from '../../Backend/api_routes';
import { useSelector } from 'react-redux';
import SimpleToast from 'react-native-simple-toast';
import LocalizedStrings from '../../Constants/localization';

const HouseholdManager = ({ navigation }) => {
  const userDetail = useSelector(store => store?.userDetails);
  const userType = useSelector(store => store?.userType);

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = () => {
    setLoading(true);
    GET_WITH_TOKEN(
      SUBSCRIPTIONS,
      success => {
        setLoading(false);
        if (success?.data && Array.isArray(success.data)) {
          // Filter subscriptions based on user type
          // userType 2 = Staff (vendor), userType 1 = Household (customer)
          const typeFilter = userType === 2 ? 'vendor' : 'customer';
          const filteredSubs = success.data.filter(
            sub => sub.type === typeFilter,
          );
          setSubscriptions(filteredSubs);
        } else {
          setSubscriptions([]);
        }
      },
      error => {
        setLoading(false);
        SimpleToast.show(
          error?.message ||
            LocalizedStrings.Auth?.failed_to_fetch ||
            'Failed to fetch subscriptions',
          SimpleToast.SHORT,
        );
        setSubscriptions([]);
      },
      fail => {
        setLoading(false);
        SimpleToast.show(
          LocalizedStrings.Auth?.network_error ||
            'Network error. Please try again.',
          SimpleToast.SHORT,
        );
        setSubscriptions([]);
      },
    );
  };

  const formatPrice = price => {
    if (!price || price === '0' || price === '0.00') return 'FREE';
    return `₹${price}`;
  };

  const formatValidity = validity => {
    if (!validity) return '';
    return validity.charAt(0).toUpperCase() + validity.slice(1);
  };

  const handleSelectPlan = subscription => {
    // Handle plan selection logic here
    SimpleToast.show(
      `${LocalizedStrings.EditProfile?.Selected || 'Selected'} ${
        subscription.subscription_name
      }`,
      SimpleToast.SHORT,
    );
  };

  return (
    <CommanView>
      <HeaderForUser
        title={LocalizedStrings.EditProfile?.Choose_Plan || 'Choose Your Plan'}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation?.goBack()}
        source_logo={ImageConstant?.notification}
        onPressRightIcon={() => navigation.navigate('Notification')}
        style_title={styles.headerTitle}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D98579" />
        </View>
      ) : subscriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Typography type={Font.Poppins_Medium} style={styles.emptyText}>
            {LocalizedStrings.EditProfile?.No_subscriptions ||
              'No subscriptions available'}
          </Typography>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {subscriptions.map((subscription, index) => {
            const features = subscription?.extra || {};
            const featureArray = Object.keys(features)
              .filter(key => key !== 'key_word')
              .map(key => features[key]);

            return (
              <View key={subscription.id || index} style={styles.premiumCard}>
                <View style={styles.rowBetween}>
                  <View>
                    <Typography
                      type={Font.Poppins_Bold}
                      style={styles.premiumTitle}
                    >
                      {subscription.subscription_name ||
                        LocalizedStrings.EditProfile?.Plan ||
                        'Plan'}
                    </Typography>
                    <Typography style={styles.price}>
                      {formatPrice(subscription.price)}
                      {subscription.validity &&
                        ` / ${formatValidity(subscription.validity)}`}
                    </Typography>
                  </View>
                  {subscription.extra?.key_word === 'best' && (
                    <Image
                      source={ImageConstant.win}
                      style={styles.iconSmall}
                    />
                  )}
                </View>

                <Typography
                  type={Font.Poppins_Light}
                  style={{ marginVertical: 10 }}
                >
                  {subscription.description ||
                    LocalizedStrings.EditProfile?.Access_Features ||
                    'Access to all premium features including advanced scheduling and multi-device sync.'}
                </Typography>

                {featureArray.length > 0 ? (
                  featureArray.map((item, idx) => (
                    <View key={idx} style={styles.row}>
                      <Image
                        source={ImageConstant.correct}
                        style={styles.bulletIcon}
                      />
                      <Typography style={styles.benefit}>{item}</Typography>
                    </View>
                  ))
                ) : (
                  <Typography style={styles.benefit}>
                    {LocalizedStrings.EditProfile?.No_features ||
                      'No features listed'}
                  </Typography>
                )}

                <View style={styles.planButtons}>
                  <Button
                    title={
                      LocalizedStrings.EditProfile?.Select_Plan || 'Select Plan'
                    }
                    main_style={styles.upgradeBtn}
                    onPress={() => handleSelectPlan(subscription)}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </CommanView>
  );
};

export default HouseholdManager;

const styles = StyleSheet.create({
  headerTitle: { fontSize: 18 },
  scrollContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  premiumCard: {
    backgroundColor: '#EBEBEA',
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
    marginBottom: 10,
    width: '95%',
  },
  premiumTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  price: {
    fontSize: 15,
    color: '#E87C6F',
    marginBottom: 10,
  },
  benefit: {
    fontSize: 14,
    marginVertical: 2,
  },

  planButtons: {
    marginTop: 15,
  },
  upgradeBtn: { width: '100%' },

  bulletIcon: {
    width: 15,
    height: 15,
    tintColor: '#D98579',
    marginRight: 6,
  },
  iconSmall: {
    width: 20,
    height: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
