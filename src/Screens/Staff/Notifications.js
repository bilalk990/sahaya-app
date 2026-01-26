import { StyleSheet, View, FlatList } from 'react-native';
import React from 'react';
import Typography from '../../Component/UI/Typography';
import { Font } from '../../Constants/Font';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import { ImageConstant } from '../../Constants/ImageConstant';
import LocalizedStrings from '../../Constants/localization';



const notification = [
  { id: '1', message: 'Approved leave for Sarah Johnson.', time: '5 minutes ago' },
  { id: '2', message: 'New staff member, David Lee, onboarded.', time: '1 hour ago' },
  { id: '3', message: 'Salary for Maria Garcia processed.', time: 'Yesterday' },
];

const Notifications = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Typography type={Font.Poppins_Medium} style={styles.message}>
        {item.message}
      </Typography>
      <Typography type={Font.Poppins_Regular} style={styles.time}>
        {item.time}
      </Typography>
    </View>
  );

  return (
    <CommanView>

      <HeaderForUser title={LocalizedStrings.NotificationsActivities?.title || "Notifications & Activities"}
        onPressLeftIcon={() => navigation?.goBack()}
        source_arrow={ImageConstant?.BackArrow}
        style_title={{ fontSize: 18 }}
      />
      <FlatList
        data={notification}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </CommanView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    marginHorizontal: 15,
  },
  message: {
    fontSize: 15,
    color: '#000',
  },
  time: {
    fontSize: 12,
    color: 'gray',
    marginTop: 3,
  },
});
