import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

import CommanView from "../../Component/CommanView";
import HeaderForUser from "../../Component/HeaderForUser";
import Typography from "../../Component/UI/Typography";
import { Font } from "../../Constants/Font";


import { Calendar } from "react-native-calendars";
import DropdownComponent from "../../Component/DropdownComponent";
import LocalizedStrings from "../../Constants/localization";
import { useIsFocused } from "@react-navigation/native";
import { GET_WITH_TOKEN } from "../../Backend/Backend";
import { ActiveTodayUser, ListStaff, HousersoldAttendance } from "../../Backend/api_routes";
import SimpleToast from "react-native-simple-toast";

const STATUS_COLORS = {
  present: "#4CAF50",
  on_leave: "#FFC107",
  leave: "#FFC107",
  holiday: "#2196F3",
  absent: "#F44336",
  weekend: "#9E9E9E",
  late: "#4CAF50",
};

const getStaffName = (item) => {
  if (item?.name) return item.name;
  if (item?.staff?.name) return item.staff.name;
  if (item?.first_name) return `${item.first_name} ${item.last_name || ''}`.trim();
  if (item?.staff?.first_name) return `${item.staff.first_name} ${item.staff.last_name || ''}`.trim();
  return `Staff #${item?.id || item?.staff?.id}`;
};

const AttendanceScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [selected, setSelected] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [summary, setSummary] = useState({ totalWorked: 0, absent: 0, leave: 0 });
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (isFocused) {
      fetchStaffList();
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedStaff) {
      fetchAttendance(selectedStaff.value, currentMonth);
    }
  }, [selectedStaff, currentMonth]);

  const fetchStaffList = () => {
    // Try ActiveTodayUser first (same as Dashboard - proven to work)
    GET_WITH_TOKEN(
      ActiveTodayUser,
      (success) => {
        const staff = success?.data || [];
        const list = Array.isArray(staff) ? staff : [];
        if (list.length > 0) {
          const formatted = list.map((item) => ({
            value: item?.staff?.id || item?.id,
            label: getStaffName(item),
          }));
          setStaffList(formatted);
        } else {
          // Fallback to ListStaff if no active staff today
          fetchStaffListFallback();
        }
      },
      (error) => {
        fetchStaffListFallback();
      },
      (fail) => {
        fetchStaffListFallback();
      }
    );
  };

  const fetchStaffListFallback = () => {
    GET_WITH_TOKEN(
      ListStaff,
      (success) => {
        const staff = success?.data?.data || success?.data || [];
        const list = Array.isArray(staff) ? staff : [];
        const formatted = list.map((item) => ({
          value: item?.id || item?.staff?.id,
          label: getStaffName(item),
        }));
        setStaffList(formatted);
      },
      (error) => {
        SimpleToast.show("Failed to load staff list", SimpleToast.SHORT);
      },
      (fail) => {
        SimpleToast.show("Network error. Please try again.", SimpleToast.SHORT);
      }
    );
  };

  const fetchAttendance = (staffId, month) => {
    setLoading(true);
    const [year, mon] = month.split("-");

    GET_WITH_TOKEN(
      `${HousersoldAttendance}?staff_id=${staffId}&month=${mon}&year=${year}`,
      (success) => {
        const records = success?.data?.attendance || success?.data || [];
        const dates = {};
        let totalWorked = 0;
        let absentCount = 0;
        let leaveCount = 0;

        if (Array.isArray(records)) {
          records.forEach((record) => {
            const dateStr = record?.date;
            const status = record?.status?.toLowerCase();
            const color = STATUS_COLORS[status] || "#9E9E9E";

            if (dateStr) {
              dates[dateStr] = {
                selected: true,
                marked: true,
                selectedColor: color,
              };
            }

            if (status === "present" || status === "late") {
              totalWorked++;
            } else if (status === "absent") {
              absentCount++;
            } else if (status === "leave" || status === "on_leave") {
              leaveCount++;
            }
          });
        }

        // If API returns summary directly, use it
        if (success?.data?.summary) {
          const s = success.data.summary;
          setSummary({
            totalWorked: s.present_days ?? s.total_days_worked ?? totalWorked,
            absent: s.absent_days ?? absentCount,
            leave: s.leave_days ?? leaveCount,
          });
        } else {
          setSummary({ totalWorked, absent: absentCount, leave: leaveCount });
        }

        setMarkedDates(dates);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        SimpleToast.show("Failed to load attendance", SimpleToast.SHORT);
      },
      (fail) => {
        setLoading(false);
        SimpleToast.show("Network error. Please try again.", SimpleToast.SHORT);
      }
    );
  };

  const handleMonthChange = (month) => {
    const newMonth = `${month.year}-${String(month.month).padStart(2, "0")}`;
    setCurrentMonth(newMonth);
  };

  return (
    <CommanView>
      <HeaderForUser
        title={LocalizedStrings.Dashboard?.Attendance || "Attendance"}
        onPressLeftIcon={() => navigation?.goBack()}
        style_title={{ fontSize: 18 }}
      />

      <View style={styles.container}>
        <DropdownComponent
          title={LocalizedStrings.Dashboard?.Attendance || "Staff Attendance"}
          placeholder={"Select Staff"}
          width={"100%"}
          style_dropdown={{ marginHorizontal: 0, height: 45 }}
          selectedTextStyleNew={{ marginLeft: 10, fontFamily: Font.Poppins_Regular }}
          marginHorizontal={0}
          style_title={{ fontFamily: Font.Poppins_Regular }}
          data={staffList}
          value={selectedStaff?.value}
          onChange={(item) => setSelectedStaff(item)}
        />

        {loading && (
          <ActivityIndicator size="small" color="#2196F3" style={{ marginVertical: 10 }} />
        )}

        <Calendar
          monthFormat={"MMMM yyyy"}
          hideExtraDays={true}
          onDayPress={(day) => setSelected(day.dateString)}
          onMonthChange={handleMonthChange}
          markedDates={{
            ...markedDates,
            ...(selected
              ? { [selected]: { ...markedDates[selected], selected: true, selectedColor: "#000" } }
              : {}),
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
            {LocalizedStrings.AttendanceStatistics?.Summary || "Summary"}
          </Typography>

          <View style={styles.summaryRow}>
            <Typography size={14} type={Font.Poppins_Regular}>
              {LocalizedStrings.AttendanceStatistics?.Total_Days_Worked || "Total Days Worked"}
            </Typography>
            <Typography size={14} type={Font.Poppins_Bold}>
              {summary.totalWorked}
            </Typography>
          </View>

          <View style={styles.summaryRow}>
            <Typography size={14} type={Font.Poppins_Regular}>
              {LocalizedStrings.AttendanceStatistics?.Absent_Days || "Absent Days"}
            </Typography>
            <Typography size={14} type={Font.Poppins_Bold}>
              {summary.absent}
            </Typography>
          </View>

          <View style={styles.summaryRow}>
            <Typography size={14} type={Font.Poppins_Regular}>
              {LocalizedStrings.AttendanceStatistics?.Leave_Days || "Leave Days"}
            </Typography>
            <Typography size={14} type={Font.Poppins_Bold}>
              {summary.leave}
            </Typography>
          </View>
        </View>

        <View style={styles.legendContainer}>
          <Typography size={16} type={Font.Poppins_Bold} style={styles.legendTitle}>
            {LocalizedStrings.AttendanceStatistics?.Legend || "Legend"}
          </Typography>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#4CAF50" }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.Present || "Present"}
              </Typography>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#FFC107" }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.On_Leave || "On Leave"}
              </Typography>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#2196F3" }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.Holiday || "Holiday"}
              </Typography>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#F44336" }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.Absent || "Absent"}
              </Typography>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#9E9E9E" }]} />
              <Typography size={14} type={Font.Poppins_Regular}>
                {LocalizedStrings.Dashboard?.Weekend || "Weekend"}
              </Typography>
            </View>
          </View>
        </View>
        <View style={{ height: 100 }} />
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
    paddingBottom: 10,
    borderBottomColor: "#DEE1E6",
    borderBottomWidth: 1,
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
