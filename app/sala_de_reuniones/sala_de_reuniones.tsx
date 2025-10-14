import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import styles from "../../styles/sala_de_reuniones/sala_de_reuniones";
import { useState, useEffect } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";

export default function HandleCampusTeachers() {
  const statusBarHeight = StatusBar.currentHeight;

  const [loading, setLoading] = useState<boolean>(true);
  const [dataTravel, setDataTravel] = useState<any>(null);
  const [checkRoomLink, setCheckRoomLink] = useState<boolean>(false);

  const db = getFirestore(firebaseconn);
  const docRef = doc(db, "cuotas", "sala"); // documento "sala" en colección "cuotas"

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const d = snap.data();
          setDataTravel(d);
          const url = (d?.link || "").trim();
          // habilitar botón solo si es http/https
          setCheckRoomLink(/^https?:\/\//i.test(url));
        } else {
          setCheckRoomLink(false);
          Alert.alert("Aviso", "El documento 'sala' no existe en 'cuotas'.");
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        Alert.alert("Error", String(error));
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const handleJoin = async () => {
    const url = (dataTravel?.link || "").trim();
    if (!/^https?:\/\//i.test(url)) {
      Alert.alert("Enlace inválido", "No hay un enlace válido para abrir.");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("No se pudo abrir el enlace", url);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Ocurrió un error al abrir el enlace.");
    }
  };

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={{ fontSize: 24, color: "#ffffff" }}>Sala de Reuniones</Text>
          {loading && <ActivityIndicator color="#fff" style={{ marginLeft: 8 }} />}
        </View>

        <View style={styles.viewInformation}>
          <Text style={styles.text}>
            La Sala de Reuniones para los afiliados tiene como finalidad ofrecer un
            espacio de encuentro gremial donde los miembros del sindicato plantean temas
            de interés y fortalecen la unidad. Además, sirve como lugar para resolver
            inquietudes, compartir información relevante y organizar actividades que
            beneficien a los afiliados. Este espacio contribuye al fortalecimiento del
            movimiento sindical y a la construcción de un colectivo más sólido.
          </Text>
        </View>

        <View
          style={{
            width: "100%",
            height: "45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", height: 180 }}>
            <ScrollView
              contentContainerStyle={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                columnGap: 15,
                width: "100%",
                height: 180,
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Image style={{ width: 200, height: 130 }} source={require("../../assets/sala/sala1.jpg")} resizeMode="cover" />
              <Image style={{ width: 200, height: 130 }} source={require("../../assets/sala/sala2.jpg")} resizeMode="cover" />
              <Image style={{ width: 200, height: 130 }} source={require("../../assets/sala/sala3.jpg")} resizeMode="cover" />
              <Image style={{ width: 200, height: 130 }} source={require("../../assets/sala/sala4.jpg")} resizeMode="cover" />
              <Image style={{ width: 200, height: 130 }} source={require("../../assets/sala/sala5.jpg")} resizeMode="cover" />
              <Image style={{ width: 200, height: 130 }} source={require("../../assets/sala/sala6.jpg")} resizeMode="cover" />
              <Image style={{ width: 200, height: 130 }} source={require("../../assets/sala/sala7.jpg")} resizeMode="cover" />
            </ScrollView>
          </View>

          <View style={[styles.viewInformation, { height: 60 }]}>
            <Text style={styles.descripcionText}>Descripción:</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.btnNews,
              { backgroundColor: checkRoomLink ? "#005CFE" : "#A9A9A9", marginBottom: 10 },
            ]}
            onPress={handleJoin}
            disabled={!checkRoomLink} // <-- HABILITADO cuando hay link válido
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>{checkRoomLink ? "Unirse" : "Enlace no disponible"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
