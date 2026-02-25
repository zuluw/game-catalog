import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function StatusModal({
  visible,
  type,
  title,
  message,
  onClose,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <LinearGradient
            colors={
              type === "success"
                ? ["#00C853", "#00E676"]
                : ["#FF3D00", "#D50000"]
            }
            style={styles.iconCircle}
          >
            <Ionicons
              name={type === "success" ? "checkmark" : "close"}
              size={50}
              color="white"
            />
          </LinearGradient>

          <Text style={styles.title}>{title.toUpperCase()}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  content: {
    backgroundColor: "#1A1A1A",
    width: "100%",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 10,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 2,
  },
  message: {
    color: "#AAA",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },
  btn: {
    backgroundColor: "#333",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
  },
  btnText: { color: "white", fontWeight: "900", letterSpacing: 1 },
});
