import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from "../../styles/quota/quota-styles";
export default function FileForQuotaPayment() {
  const statusBarHeight = StatusBar.currentHeight;

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "bold" }}>
          Próximamente!!!!
        </Text>
      </View>
    </View>
  );
}
