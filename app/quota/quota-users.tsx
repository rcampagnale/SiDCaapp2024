import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from "../../styles/quota/quota-styles";
export default function FileForQuotaPayment() {
  const statusBarHeight = StatusBar.currentHeight;
//Los datos para transferencia y numero de telefono de afiliado aderente
// Caja amarilla 
  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.quotaBox}>
        <TouchableOpacity style={styles.btnGetAlias}>
          <Text style={{fontSize:18,color:'#ffffff',fontWeight:'bold'}}>
            Copiar Alias
          </Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
