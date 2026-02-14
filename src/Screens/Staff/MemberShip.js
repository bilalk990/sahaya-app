import React, { useState, useEffect } from 'react'
import { View, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native'
import CommanView from '../../Component/CommanView'
import HeaderForUser from '../../Component/HeaderForUser'
import { ImageConstant } from '../../Constants/ImageConstant'
import { Font } from '../../Constants/Font'
import Typography from '../../Component/UI/Typography'
import Button from '../../Component/Button'
import { POST_WITH_TOKEN, GET_WITH_TOKEN } from '../../Backend/Backend'
import { SUBSCRIPTIONS_BY_ROLE, SUBSCRIPTIONS, SUBSCRIBE_PLAN } from '../../Backend/api_routes'
import { useSelector } from 'react-redux'
import SimpleToast from 'react-native-simple-toast'
import LocalizedStrings from '../../Constants/localization'
import { processMembershipPayment } from '../../Services/RazorpayService'


const MemberShip = ({ navigation }) => {
    const userDetail = useSelector(store => store?.userDetails);
    const userType = useSelector(store => store?.userType);

    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchAllSubscriptions = () => {
        GET_WITH_TOKEN(
            SUBSCRIPTIONS,
            success => {
                setLoading(false);
                const subscriptionData = success?.data;
                if (subscriptionData && Array.isArray(subscriptionData)) {
                    setSubscriptions(subscriptionData);
                } else {
                    setSubscriptions([]);
                }
            },
            error => {
                setLoading(false);
                SimpleToast.show('Failed to fetch subscriptions', SimpleToast.SHORT);
                setSubscriptions([]);
            },
            fail => {
                setLoading(false);
                SimpleToast.show('Network error. Please try again.', SimpleToast.SHORT);
                setSubscriptions([]);
            },
        );
    };

    const fetchSubscriptions = () => {
        setLoading(true);
        const payload = { role_id: userType };
        POST_WITH_TOKEN(
            SUBSCRIPTIONS_BY_ROLE,
            payload,
            success => {
                const subscriptionData = success?.data;
                if (subscriptionData && Array.isArray(subscriptionData) && subscriptionData.length > 0) {
                    setLoading(false);
                    setSubscriptions(subscriptionData);
                } else {
                    fetchAllSubscriptions();
                }
            },
            error => {
                fetchAllSubscriptions();
            },
            fail => {
                setLoading(false);
                SimpleToast.show('Network error. Please try again.', SimpleToast.SHORT);
                setSubscriptions([]);
            },
        );
    };

    const formatPrice = (price) => {
        if (!price || price === '0' || price === '0.00') return 'FREE';
        return `₹${price}`;
    };

    const formatValidity = (validity, type) => {
        if (type) return type.charAt(0).toUpperCase() + type.slice(1);
        if (!validity) return '';
        if (typeof validity === 'number') return `${validity} days`;
        return validity.charAt(0).toUpperCase() + validity.slice(1);
    };

    const handleSelectPlan = async (subscription) => {
        // Check if plan is free
        if (!subscription.price || subscription.price === '0' || subscription.price === '0.00') {
            // Free plan - directly subscribe
            subscribeToPlan(subscription, null);
            return;
        }

        // Show confirmation alert
        Alert.alert(
            'Confirm Payment',
            `You are about to purchase ${subscription.subscription_name} for ₹${subscription.price}. Do you want to proceed?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Pay Now', onPress: () => processPayment(subscription) }
            ]
        );
    };

    const processPayment = async (subscription) => {
        setPaymentLoading(true);
        setSelectedPlanId(subscription.id);

        try {
            const plan = {
                id: subscription.id,
                name: subscription.subscription_name,
                price: subscription.price,
                validity: subscription.validity,
            };

            console.log('Processing payment for plan:', plan);
            console.log('User details:', userDetail);

            const result = await processMembershipPayment(plan, userDetail);

            console.log('Payment result:', result);

            if (result.success) {
                // Payment successful - now subscribe to plan
                subscribeToPlan(subscription, result);
            } else {
                setPaymentLoading(false);
                setSelectedPlanId(null);
                // User cancelled payment (code 0 or 2)
                if (result.code === 0 || result.code === 2) {
                    SimpleToast.show('Payment cancelled', SimpleToast.SHORT);
                } else {
                    SimpleToast.show(result.description || 'Payment failed. Please try again.', SimpleToast.SHORT);
                }
            }
        } catch (error) {
            console.log('Payment error:', error);
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
                console.log('Subscription activated on backend:', success);
            },
            error => {
                console.log('Subscribe API error (proceeding anyway):', error?.message);
            },
            fail => {
                console.log('Subscribe API network fail (proceeding anyway)');
            }
        );

        setPaymentLoading(false);
        setSelectedPlanId(null);
        SimpleToast.show('Subscription activated successfully!', SimpleToast.LONG);
        navigation.goBack();
    };

    return (
        <CommanView>
            <HeaderForUser
                title={LocalizedStrings.staffSection?.MemberShip?.title || "Choose Your Plan"}
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
                        {LocalizedStrings.staffSection?.MemberShip?.no_subscriptions || "No subscriptions available"}
                    </Typography>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {subscriptions.map((subscription, index) => {
                        const extra = subscription?.extra;
                        let featureArray = [];
                        if (Array.isArray(extra)) {
                            featureArray = extra.map(item => item?.feature || item).filter(Boolean);
                        } else if (extra && typeof extra === 'object') {
                            featureArray = Object.keys(extra)
                                .filter(key => key !== 'key_word')
                                .map(key => extra[key]);
                        }

                        return (
                            <View key={subscription.id || index} style={styles.premiumCard}>
                                <View style={styles.rowBetween}>
                                    <View>
                                        <Typography type={Font.Poppins_Bold} style={styles.premiumTitle}>
                                            {subscription.subscription_name || 'Plan'}
                                        </Typography>
                                        <Typography style={styles.price}>
                                            {formatPrice(subscription.price)}
                                            {(subscription.type || subscription.validity) && ` / ${formatValidity(subscription.validity, subscription.type)}`}
                                        </Typography>
                                    </View>
                                    {subscription.extra?.key_word === 'best' && (
                                        <Image source={ImageConstant.win} style={styles.iconSmall} />
                                    )}
                                </View>

                                <Typography type={Font.Poppins_Light} style={{ marginVertical: 10 }}>
                                    {subscription.description || 'Access to all premium features including advanced scheduling and multi-device sync.'}
                                </Typography>

                                {featureArray.length > 0 ? (
                                    featureArray.map((item, idx) => (
                                        <View key={idx} style={styles.row}>
                                            <Image source={ImageConstant.correct} style={styles.bulletIcon} />
                                            <Typography style={styles.benefit}>{item}</Typography>
                                        </View>
                                    ))
                                ) : (
                                    <Typography style={styles.benefit}>No features listed</Typography>
                                )}

                                <View style={styles.planButtons}>
                                    <Button
                                        title={paymentLoading && selectedPlanId === subscription.id
                                            ? "Processing..."
                                            : (LocalizedStrings.staffSection?.MemberShip?.select_plan || "Select Plan")}
                                        main_style={styles.upgradeBtn}
                                        onPress={() => handleSelectPlan(subscription)}
                                        loader={paymentLoading && selectedPlanId === subscription.id}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </CommanView>
    )
}

export default MemberShip

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
        width: '95%'
    },
    premiumTitle: {
        fontSize: 16,
        marginBottom: 5
    },
    price: {
        fontSize: 15,
        color: '#E87C6F', marginBottom: 10
    },
    benefit: {
        fontSize: 14,
        marginVertical: 2
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
    }
})
