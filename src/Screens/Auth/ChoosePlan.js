import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import { ImageConstant } from '../../Constants/ImageConstant';
import { Font } from '../../Constants/Font';
import Typography from '../../Component/UI/Typography';
import Button from '../../Component/Button';
import { POST_WITH_TOKEN } from '../../Backend/Backend';
import { SUBSCRIPTIONS_BY_ROLE, SUBSCRIBE_PLAN } from '../../Backend/api_routes';
import { useSelector, useDispatch } from 'react-redux';
import SimpleToast from 'react-native-simple-toast';
import LocalizedStrings from '../../Constants/localization';
import { processMembershipPayment } from '../../Services/RazorpayService';
import { isAuth } from '../../Redux/action';

const ChoosePlan = ({ navigation, route }) => {
  const userDetail = useSelector(store => store?.userDetails);
  const userTypeFromRoute = route?.params?.userType;
  const userTypeFromStore = useSelector(store => store?.userType);
  const currentUserType = userTypeFromRoute || userTypeFromStore;

  const Dispatch = useDispatch();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = () => {
    setLoading(true);
    const payload = { role_id: currentUserType };
    POST_WITH_TOKEN(
      SUBSCRIPTIONS_BY_ROLE,
      payload,
      success => {
        setLoading(false);
        if (success?.data && Array.isArray(success.data)) {
          setSubscriptions(success.data);
        } else {
          setSubscriptions([]);
        }
      },
      error => {
        setLoading(false);
        SimpleToast.show(
          error?.message || 'Failed to fetch subscriptions',
          SimpleToast.SHORT,
        );
        setSubscriptions([]);
      },
      fail => {
        setLoading(false);
        SimpleToast.show(
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

  const proceedToApp = () => {
    Dispatch(isAuth(true));
  };

  const handleSelectPlan = async subscription => {
    if (
      !subscription.price ||
      subscription.price === '0' ||
      subscription.price === '0.00'
    ) {
      subscribeToPlan(subscription, null);
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `You are about to purchase ${subscription.subscription_name} for ₹${subscription.price}. Do you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => processPayment(subscription) },
      ],
    );
  };

  const processPayment = async subscription => {
    setPaymentLoading(true);
    setSelectedPlanId(subscription.id);

    try {
      const plan = {
        id: subscription.id,
        name: subscription.subscription_name,
        price: subscription.price,
        validity: subscription.validity,
      };

      const result = await processMembershipPayment(plan, userDetail);

      if (result.success) {
        subscribeToPlan(subscription, result);
      } else {
        setPaymentLoading(false);
        setSelectedPlanId(null);
        if (result.code === 0 || result.code === 2) {
          SimpleToast.show('Payment cancelled', SimpleToast.SHORT);
        } else {
          SimpleToast.show(
            result.description || 'Payment failed. Please try again.',
            SimpleToast.SHORT,
          );
        }
      }
    } catch (error) {
      setPaymentLoading(false);
      setSelectedPlanId(null);
      SimpleToast.show('Payment failed. Please try again.', SimpleToast.SHORT);
    }
  };

  const subscribeToPlan = (subscription, paymentResult) => {
    const payload = {
      subscription_id: subscription.id,
      payment_id: paymentResult?.paymentId || null,
      payment_status: paymentResult ? 'success' : 'free',
      amount: subscription.price || '0',
    };

    POST_WITH_TOKEN(
      SUBSCRIBE_PLAN,
      payload,
      success => {
        setPaymentLoading(false);
        setSelectedPlanId(null);
        SimpleToast.show(
          'Subscription activated successfully!',
          SimpleToast.LONG,
        );
        proceedToApp();
      },
      error => {
        setPaymentLoading(false);
        setSelectedPlanId(null);
        SimpleToast.show(
          error?.message || 'Failed to activate subscription',
          SimpleToast.SHORT,
        );
      },
      fail => {
        setPaymentLoading(false);
        setSelectedPlanId(null);
        SimpleToast.show(
          'Network error. Please try again.',
          SimpleToast.SHORT,
        );
      },
    );
  };

  return (
    <CommanView>
      <HeaderForUser
        title={
          LocalizedStrings.EditProfile?.Choose_Plan || 'Choose Your Plan'
        }
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation?.goBack()}
        style_title={styles.headerTitle}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D98579" />
        </View>
      ) : subscriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Typography type={Font.Poppins_Medium} style={styles.emptyText}>
            {'No subscriptions available'}
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
                      {subscription.subscription_name || 'Plan'}
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
                    No features listed
                  </Typography>
                )}

                <View style={styles.planButtons}>
                  <Button
                    title={
                      paymentLoading && selectedPlanId === subscription.id
                        ? 'Processing...'
                        : 'Select Plan'
                    }
                    main_style={styles.upgradeBtn}
                    onPress={() => handleSelectPlan(subscription)}
                    loader={
                      paymentLoading && selectedPlanId === subscription.id
                    }
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

export default ChoosePlan;

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
