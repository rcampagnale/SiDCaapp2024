import React, { useState, useEffect } from "react";
import { View, Text, Image, StatusBar, Dimensions, TouchableOpacity } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
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
import { useNavigation } from '@react-navigation/native';  // Importa el hook de navegación

const analytics = getFirestore(firebaseconn);

// Obtenemos las dimensiones de la pantalla para la adaptación del contenido
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
  const navigation = useNavigation(); // Usamos el hook de navegación

  const [certificadoData, setCertificadoData] = useState({
    resolucion: "",
    modalidad: "",
    fecha: "",
    dias: "",
    cargaHoraria: "",
    imagen: "", // Added the 'imagen' property
  });

  useEffect(() => {
    const fetchCertificadoData = async () => {
      try {
        // Consulta en la colección 'certificados' con el nombre del curso
        const certificadosQuery = query(
          collection(analytics, "certificados"),
          where("titulo", "==", courseName) // Buscamos por el nombre del curso
        );
        const certificadosSnapshot = await getDocs(certificadosQuery);

        if (!certificadosSnapshot.empty) {
          const certificadoDoc = certificadosSnapshot.docs[0].data();

          // Establecemos el estado con todos los campos, incluyendo la imagen
          setCertificadoData({
            resolucion: certificadoDoc.resolucion || "No disponible",
            modalidad: certificadoDoc.modalidad || "No disponible",
            fecha: certificadoDoc.fecha || "No disponible",
            dias: certificadoDoc.dias || "No disponible",
            cargaHoraria: certificadoDoc.cargaHoraria || "No disponible",
            imagen: certificadoDoc.imagen || "No disponible", // Aquí agregamos el campo imagen
          });
        } else {
          console.log("No se encontró el certificado para este curso");
        }
      } catch (error) {
        console.error("Error al obtener datos del certificado:", error);
      }
    };

    fetchCertificadoData();
  }, [courseName]);

  const statusBarHeight = StatusBar.currentHeight || 0; // Altura de la barra de estado con valor predeterminado

  return (
    <View style={styles.container}>
      {/* Establecer el color de fondo del StatusBar */}
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" translucent={false} />

      {/* Botón Volver */}
      <View style={styles.btnBackToOptions}>
        <TouchableOpacity
         style={[styles.btnBack, { marginTop: statusBarHeight + 5 }]}
          onPress={() => navigation.goBack()}  // Aquí utilizamos navigation.goBack() para volver atrás
        >
          <AntDesign name="back" size={24} color="black" />
          <Text style={{ fontSize: 18, marginLeft: 5 }}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Fondo de color */}
      <View style={styles.background} />
      <View style={{ width: "100%", height: "100%" }}>
        <Image
          source={require("../../assets/home/certificadocursosidca.png")}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </View>

      {/* Información adicional fija en la pantalla (con rotación) */}
      <View style={styles.rotatedTextContainer}>
        <Text style={styles.rotatedText}>{courseName}</Text>
      </View>

      {/* Información del usuario con rotación */}
      <View
        style={{
          position: "absolute",
          top: 425,
          left: "46.5%",
          transform: [{ rotate: "90deg" }],
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "bold" }}>
          {userLastName ? `${userLastName},` : null} {userName}
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          top: 648,
          left: "56.5%",
          transform: [{ rotate: "90deg" }],
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "bold" }}>
          : {userDni || "Sin asignar"}
        </Text>
      </View>

      {/* Información adicional con rotación para los nuevos campos */}
      <View
        style={{ position: "absolute", bottom: 50, left: "13.7%", top: 635 }}
      >
        <Text style={styles.fieldText}>
          {certificadoData.dias || "Días no especificados"}
        </Text>
      </View>

      <View
        style={{ position: "absolute", bottom: 50, left: "13.7%", top: 430 }}
      >
        <Text style={styles.fieldText}>
          {certificadoData.modalidad || "Modalidad no especificada"}
        </Text>
      </View>

      <View
        style={{ position: "absolute", bottom: 50, left: "10.5%", top: 625 }}
      >
        <Text style={styles.fieldText}>
          {certificadoData.cargaHoraria || "Carga horaria no especificada"}
        </Text>
      </View>

      <View
        style={{ position: "absolute", bottom: 50, left: "-1.4%", top: 745 }}
      >
        <Text style={styles.fieldText}>
          {certificadoData.resolucion || "Resolución no especificada"}
        </Text>
      </View>

      <View
        style={{ position: "absolute", bottom: 50, left: "-5.6%", top: 725 }}
      >
        <Text style={styles.fieldText}>
          {certificadoData.fecha || "Fecha no especificada"}
        </Text>
      </View>

      {/* Imagen con fondo */}
      <View style={styles.imageContainer}>
        {certificadoData.imagen &&
        certificadoData.imagen !== "No disponible" ? (
          <Image
            source={{ uri: certificadoData.imagen }}
            style={styles.rotatedImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.imageFallbackText}>Firma no disponible</Text>
        )}
      </View>
    </View>
  );
}
