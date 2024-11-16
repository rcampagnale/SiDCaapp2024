import {
  ActivityIndicator,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
  Linking,
} from "react-native";
import styles from "../../styles/quota/quota-styles";
import { firebaseconn } from "@/constants/FirebaseConn";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";

export default function FileForQuotaPayment() {
  const statusBarHeight = StatusBar.currentHeight;
  const [quotaData, setQuotaData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const analytics = getFirestore(firebaseconn);
  const data = collection(analytics, "cuotas");
  const openWspNumber = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = (await getDocs(data)).docs;
        setQuotaData(res[0].data());
      } catch (error) {
        alert(`Error:${error}`);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(quotaData.alias);
  };
  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <View style={styles.quotaBox}>
            <Image
              src={quotaData.imagen}
              style={{ width: "95%", height: "65%" }}
              resizeMode="contain"
            />
            <Text
              style={{ textAlign: "justify", width: "90%", height: "auto" }}
            >
              {quotaData.descripcion}
            </Text>
            <TouchableOpacity
              style={styles.btnGetAlias}
              onPress={copyToClipboard}
            >
              <Text
                style={{
                  textAlign: "justify",
                  fontSize: 18,
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              >
                Copiar Alias
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.btnWhatsApp}
          activeOpacity={1}
          onPress={() => openWspNumber("https://wa.me/5493834539754")}
        >
          <Text style={{ fontSize: 18, marginLeft: 10 }}>
            Afiliado Adherente
          </Text>
          <Image
            style={{ width: 30, height: 30, marginRight: 10 }}
            source={require("../../assets/logos/whatsapp.png")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
