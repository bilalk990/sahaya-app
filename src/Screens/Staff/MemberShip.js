import React, { useState, useEffect } from 'react'
import { View, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native'
import CommanView from '../../Component/CommanView'
import HeaderForUser from '../../Component/HeaderForUser'
import { ImageConstant } from '../../Constants/ImageConstant'
import { Font } from '../../Constants/Font'
import Typography from '../../Component/UI/Typography'
import Button from '../../Component/Button'
import { POST_WITH_TOKEN, GET_WITH_TOKEN } from '../../Backend/Backend'
import { SUBSCRIPTIONS_BY_ROLE, SUBSCRIPTIONS, SUBSCRIBE_PLAN, SUBSCRIPTION_USER_CURRENT } from '../../Backend/api_routes'
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
    const [currentSub, setCurrentSub] = useState(null);
    const [currentSubLoading, setCurrentSubLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
        fetchCurrentSubscription();
    }, []);

    const fetchCurrentSubscription = () => {
        setCurrentSubLoading(true);
        GET_WITH_TOKEN(
            SUBSCRIPTION_USER_CURRENT,
            success => {
                setCurrentSubLoading(false);
                const subscription = success?.subscription || success?.data?.subscription || success?.data;
                if (subscription && typeof subscription === 'object' && !Array.isArray(subscription)) {
                    setCurrentSub({ ...subscription, is_active: success?.is_active });
                } else if (Array.isArray(subscription) && subscription.length > 0) {
                    setCurrentSub({ ...subscription[0], is_active: success?.is_active });
                } else {
                    setCurrentSub(null);
                }
            },
            error => {
                setCurrentSubLoading(false);
                setCurrentSub(null);
            },
            fail => {
                setCurrentSubLoading(false);
                setCurrentSub(null);
            },
        );
    };

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

            const result = await processMembershipPayment(plan, userDetail);

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
            },
            error => {
            },
            fail => {
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

            {/* Current Subscription Section */}
            {currentSubLoading ? (
                <View style={styles.currentSubLoader}>
                    <ActivityIndicator size="small" color="#D98579" />
                </View>
            ) : currentSub ? (
                <View style={styles.currentSubCard}>
                    <View style={styles.currentSubHeader}>
                        <Typography type={Font.Poppins_SemiBold} style={{ fontSize: 15, color: '#333' }}>
                            {LocalizedStrings.staffSection?.MemberShip?.current_plan || "Current Plan"}
                        </Typography>
                        <View style={styles.activeBadge}>
                            <Typography type={Font.Poppins_Medium} style={{ fontSize: 11, color: '#0F5132' }}>
                                {currentSub?.status || "Active"}
                            </Typography>
                        </View>
                    </View>
                    <Typography type={Font.Poppins_Bold} style={{ fontSize: 18, marginTop: 6 }}>
                        {currentSub?.subscription_name || currentSub?.name || '--'}
                    </Typography>
                    {(currentSub?.price !== undefined && currentSub?.price !== null) && (
                        <Typography type={Font.Poppins_Medium} style={{ fontSize: 14, color: '#E87C6F', marginTop: 2 }}>
                            {formatPrice(currentSub?.price)}
                            {(currentSub?.type || currentSub?.validity) && ` / ${formatValidity(currentSub?.validity, currentSub?.type)}`}
                        </Typography>
                    )}
                    <View style={styles.currentSubDates}>
                        {currentSub?.start_date && (
                            <View style={styles.dateItem}>
                                <Typography type={Font.Poppins_Regular} style={{ fontSize: 11, color: '#999' }}>
                                    {LocalizedStrings.staffSection?.MemberShip?.start_date || "Start Date"}
                                </Typography>
                                <Typography type={Font.Poppins_Medium} style={{ fontSize: 13 }}>
                                    {currentSub?.start_date}
                                </Typography>
                            </View>
                        )}
                        {currentSub?.end_date && (
                            <View style={styles.dateItem}>
                                <Typography type={Font.Poppins_Regular} style={{ fontSize: 11, color: '#999' }}>
                                    {LocalizedStrings.staffSection?.MemberShip?.end_date || "End Date"}
                                </Typography>
                                <Typography type={Font.Poppins_Medium} style={{ fontSize: 13 }}>
                                    {currentSub?.end_date}
                                </Typography>
                            </View>
                        )}
                    </View>
                </View>
            ) : (
                <View style={styles.noSubCard}>
                    <Typography type={Font.Poppins_SemiBold} style={{ fontSize: 15, color: '#333' }}>
                        {LocalizedStrings.staffSection?.MemberShip?.current_plan || "Current Plan"}
                    </Typography>
                    <Typography type={Font.Poppins_Regular} style={{ fontSize: 13, color: '#999', marginTop: 6 }}>
                        {"No active subscription. Choose a plan below to get started."}
                    </Typography>
                </View>
            )}

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
    },
    currentSubLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    currentSubCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 15,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#D98579',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    currentSubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeBadge: {
        backgroundColor: '#D1E7DD',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A3CFBB',
    },
    currentSubDates: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 20,
    },
    dateItem: {
        flex: 1,
    },
    noSubCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginTop: 15,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#EBEBEA',
        borderStyle: 'dashed',
    },
})
