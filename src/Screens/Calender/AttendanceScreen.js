import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";

import CommanView from "../../Component/CommanView";
import HeaderForUser from "../../Component/HeaderForUser";
import Typography from "../../Component/UI/Typography";
import { Font } from "../../Constants/Font";
import { Calendar } from "react-native-calendars";
import { ImageConstant } from "../../Constants/ImageConstant";
import DropdownComponent from "../../Component/DropdownComponent";
import LocalizedStrings from "../../Constants/localization";

const AttendanceScreen = ({navigation}) => {
  const [selected, setSelected] = useState("");

  const markedDates = {
    "2025-08-01": { selected: true, marked: true, selectedColor: "#4CAF50" }, 
    "2025-08-02": { selected: true, marked: true, selectedColor: "#FFC107" }, 
    "2025-08-03": { selected: true, marked: true, selectedColor: "#2196F3" }, 
    "2025-08-06": { selected: true, marked: true, selectedColor: "#F44336" },
    "2025-08-09": { selected: true, marked: true, selectedColor: "#9E9E9E" }, 
  };

  return (
    <CommanView>
      <HeaderForUser title={LocalizedStrings.Dashboard?.Attendance || "Attendance"}
              onPressLeftIcon={() => navigation?.goBack()}
              style_title={{ fontSize: 18 }}
      />

      <View style={styles.container}>
       
           <DropdownComponent
                  title={LocalizedStrings.Dashboard?.Attendance || "Staff Attendance"}
                  placeholder={LocalizedStrings.Dashboard_model?.Leave_Type || "Select leave type"}
                  width={'100%'}
                  style_dropdown={{ marginHorizontal: 0 , height:45}}
                  selectedTextStyleNew={{ marginLeft: 10, fontFamily: Font.Poppins_Regular }}
                  marginHorizontal={0}
                  style_title={{ fontFamily: Font.Poppins_Regular }}
                  data={[
                  
                  ]}
                />
        

        <Calendar
          monthFormat={"MMMM yyyy"}
          hideExtraDays={true}
          onDayPress={(day) => setSelected(day.dateString)}
          markedDates={{
            ...markedDates,
            [selected]: { selected: true, selectedColor: "#000" },
          }}
          theme={{
            todayTextColor: "#2196F3",
            arrowColor: "#2196F3",
            textDayFontFamily: Font.Poppins_Regular,
            textMonthFontFamily: Font.Poppins_Bold,
            textDayHeaderFontFamily: Font.Poppins_Medium,
          }}
        />

   
        <View style={styles.summary}>
          <Typography size={16} type={Font.Poppins_Bold} style={styles.summaryTitle}>
            {LocalizedStrings.AttendanceStatistics?.Summary || 'Summary'}
          </Typography>

          <View style={styles.summaryRow}>
            <Typography size={14} type={Font.Poppins_Regular}>
              {LocalizedStrings.AttendanceStatistics?.Total_Days_Worked || 'Total Days Worked'}
            </Typography>
            <Typography size={14} type={Font.Poppins_Bold}>
              13
            </Typography>
          </View>

          <View style={styles.summaryRow}>
            <Typography size={14} type={Font.Poppins_Regular}>
              {LocalizedStrings.AttendanceStatistics?.Absent_Days || 'Absent Days'}
            </Typography>
            <Typography size={14} type={Font.Poppins_Bold}>
              4
            </Typography>
          </View>

          <View style={styles.summaryRow}>
            <Typography size={14} type={Font.Poppins_Regular}>
              {LocalizedStrings.AttendanceStatistics?.Leave_Days || 'Leave Days'}
            </Typography>
            <Typography size={14} type={Font.Poppins_Bold}>
              4
            </Typography>
          </View>
        </View>
        <View style={styles.legendContainer}>
          <Typography size={16} type={Font.Poppins_Bold} style={styles.legendTitle}>
            {LocalizedStrings.AttendanceStatistics?.Legend || 'Legend'}
          </Typography>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, {  backgroundColor: "#4CAF50"  }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.Present || 'Present'}
              </Typography>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, {  backgroundColor: "#FFC107"  }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.On_Leave || 'On Leave'}
              </Typography>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, {  backgroundColor: "#2196F3"  }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.Holiday || 'Holiday'}
              </Typography>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, {  backgroundColor: "#F44336"  }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.Absent || 'Absent'}
              </Typography>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, {  backgroundColor: "#9E9E9E"  }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.Weekend || 'Weekend'}
              </Typography>
            </View>
          </View>
        </View>
        <View style={{height:100}}/>
      </View>
    </CommanView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: "#fff" },
  subHeader: { textAlign: "center", color: "#333" },
  summary: {
    marginTop: 20,
    backgroundColor: "#FAFAFB",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  summaryTitle: { marginBottom: 10, color: "#000" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom:10,
    borderBottomColor:'#DEE1E6',
    borderBottomWidth:1
  },
  legendContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FAFAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  legendTitle: { marginBottom: 10, color: "#000" },
  legend: { flexDirection: "row", flexWrap: "wrap" },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 38,
    marginBottom: 10,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
});
