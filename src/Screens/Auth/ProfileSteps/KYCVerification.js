import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import UploadBox from '../../../Component/UploadBox';
import { ImageConstant } from '../../../Constants/ImageConstant';
import { Font } from '../../../Constants/Font';
import CommanView from '../../../Component/CommanView';
import Typography from '../../../Component/UI/Typography';
import LocalizedStrings from '../../../Constants/localization';

const KYCVerification = () => {
  return (
<>
<CommanView>
      <View style={styles.wrap}>
      <Typography style={styles.heading}>{LocalizedStrings.StaffProfile?.KYC_Status || 'KYC & Verification'}</Typography>

      <View style={styles.row}>
        <UploadBox title={LocalizedStrings.AddStaffPhoto?.Staff_Photo || 'Upload Your Photo'} icon={ImageConstant.NewCamera } onPress={() => {}} />
        <UploadBox title={LocalizedStrings.NewStaffForm?.Police_Clearance_Certificate || 'Upload Police Verification Certificate'} icon={ImageConstant.Verify} onPress={() => {}} />
      </View>

      <View style={styles.row}>
        <UploadBox title={LocalizedStrings.NewStaffForm?.Aadhaar_Card_Details + ' Front' || 'Upload Aadhaar Front Image'} icon={ImageConstant.Doc} onPress={() => {}} />
        <UploadBox title={LocalizedStrings.NewStaffForm?.Aadhaar_Card_Details + ' Back' || 'Upload Aadhaar Back Image'} icon={ImageConstant.Doc} onPress={() => {}} />
      </View>

      </View>
      </CommanView>
    </>
  );
};

export default KYCVerification;

const styles = StyleSheet.create({
  heading: {
    fontFamily: Font?.Manrope_Bold,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding:10
  },
  wrap:{
    borderWidth:1,
    borderColor:'#EBEBEA',
    padding:20,
    borderRadius:10,
    marginTop:20
  }
});
