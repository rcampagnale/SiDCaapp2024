import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import {
  getDocs,
  query,
  collection,
  where,
  getFirestore,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
import { AntDesign } from "@expo/vector-icons";
import styles from "@/styles/courses/certificados";

const analytics = getFirestore(firebaseconn);
const { width, height } = Dimensions.get("window");

export default function Certificados() {
  type RouteParams = {
    params: {
      courseName: string;
      userName: string;
      userLastName: string;
      userDni: string;
    };
  };

  const route = useRoute<RouteProp<RouteParams, "params">>();
  const { courseName, userName, userLastName, userDni } = route.params;
  const navigation = useNavigation();

  const [certificadoData, setCertificadoData] = useState({
    resolucion: "",
    modalidad: "",
    fecha: "",
    dias: "",
    cargaHoraria: "",
    imagen: "",
  });

  useEffect(() => {
    const fetchCertificadoData = async () => {
      const certificadosQuery = query(
        collection(analytics, "certificados"),
        where("titulo", "==", courseName)
      );
      const certificadosSnapshot = await getDocs(certificadosQuery);

      if (!certificadosSnapshot.empty) {
        const certificadoDoc = certificadosSnapshot.docs[0].data();
        setCertificadoData({
          resolucion: certificadoDoc.resolucion,
          modalidad: certificadoDoc.modalidad,
          fecha: certificadoDoc.fecha,
          dias: certificadoDoc.dias,
          cargaHoraria: certificadoDoc.cargaHoraria,
          imagen: certificadoDoc.imagen,
        });
      }
    };

    fetchCertificadoData();
  }, [courseName]);

  const statusBarHeight = StatusBar.currentHeight || 0;

  const handlePrint = () => {
    Alert.alert(
      "Imprimir Certificado",
      "La opción de imprimir aún no está disponible."
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f0f0f0"
        translucent={false}
      />

      {/* Botón Volver */}
      <View style={styles.btnBackToOptions}>
        <TouchableOpacity
          style={[styles.btnBack, { marginTop: statusBarHeight - 9 }]}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="back" size={24} color="black" />
          <Text style={{ fontSize: 18, marginLeft: 5 }}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Botón Imprimir Certificado */}
      <View style={styles.btnPrintContainer}>
        <TouchableOpacity style={styles.btnPrint} onPress={handlePrint}>
          <AntDesign name="printer" size={24} color="#ffffff" />
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "600" }}>
            Imprimir Certificado
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fondo de certificado */}
      <View style={styles.background} />
      <View style={{ width: "100%", height: "100%" }}>
        <Image
          source={require("../../assets/home/certificadocursosidca.png")}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </View>

      {/* Título del curso */}
      <View style={styles.rotatedTextContainer}>
        <Text style={styles.rotatedText}>{courseName}</Text>
      </View>

      {/* Nombre y DNI */}
      <View style={{ position: "absolute", left: "27.8%", top: 557 }}>
        <Text style={styles.tituloUsuario}>
          {userLastName} {userName}
        </Text>
      </View>
      <View style={{ position: "absolute", left: "27.5%", top: 806 }}>
        <Text style={styles.tituloUsuario}>: {userDni}</Text>
      </View>

      {/* Datos adicionales */}
      <View
        style={{ position: "absolute", bottom: 50, left: "13.7%", top: 675 }}
      >
        <Text style={styles.fieldText}>{certificadoData.dias}</Text>
      </View>
      <View
        style={{ position: "absolute", bottom: 50, left: "13.7%", top: 465 }}
      >
        <Text style={styles.fieldText}>{certificadoData.modalidad}</Text>
      </View>
      <View
        style={{ position: "absolute", bottom: 50, left: "10.5%", top: 675 }}
      >
        <Text style={styles.fieldText}>{certificadoData.cargaHoraria}</Text>
      </View>
      <View
        style={{ position: "absolute", bottom: 50, left: "-1.4%", top: 780 }}
      >
        <Text style={styles.fieldText}>{certificadoData.resolucion}</Text>
      </View>
      <View
        style={{ position: "absolute", bottom: 50, left: "-5.6%", top: 760 }}
      >
        <Text style={styles.fieldText}>{certificadoData.fecha}</Text>
      </View>

      {/* Firma */}
      <View style={styles.imageContainer}>
        {certificadoData.imagen ? (
          <Image
            source={{ uri: certificadoData.imagen }}
            style={styles.rotatedImage}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </View>
  );
}
