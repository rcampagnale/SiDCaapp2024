import { useState, useContext, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing"; // Importamos expo-sharing
import { SidcaContext } from "../_layout";
import { firebaseconn } from "@/constants/FirebaseConn";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import styles from "../../styles/courses/courses-styles";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function CoursesTakenByMe({ setActionType }) {
  const [courseAproved, setCourseAproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkData, setCheckData] = useState(0);
  const { userData } = useContext(SidcaContext);
  const analytics = getFirestore(firebaseconn);
  const storage = getStorage(firebaseconn);

  // Solicitar permisos para acceder a la biblioteca de medios (si es necesario)
  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
    }
  };

  useEffect(() => {
    // Solicitar permisos cuando el componente se monta
    requestPermission();

    const seeInfo = async () => {
      try {
        if (!userData) return;

        const userQuery = query(
          collection(analytics, "usuarios"),
          where("dni", "==", userData.dni)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];

          const cursosQuery = query(
            collection(analytics, "usuarios", userDoc.id, "cursos"),
            where("estado", "==", "terminado")
          );
          const cursosSnapshot = await getDocs(cursosQuery);

          setCourseAproved(cursosSnapshot.docs);
        } else {
          setCheckData(1);
        }
      } catch (error) {
        alert(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    seeInfo();
  }, [userData]);

  // Función para mostrar el mensaje de mantenimiento en lugar de descargar
  const downloadFile = async (courseCode, dni) => {
    alert(
      "Servicio en mantenimiento, no es posible descargar el certificado en este momento."
    );
    // Si necesitas realizar una acción de mantenimiento en lugar de la descarga:
    // Puedes descomentar el siguiente código para mantener la estructura de la función

    // try {
    //   const fileRef = ref(
    //     storage,
    //     `certificados_digitales/${courseCode}/${courseCode}_${dni}.pdf`
    //   );
    //   const url = await getDownloadURL(fileRef);
    //   console.log("URL de descarga obtenida:", url);

    //   const fileUri = FileSystem.documentDirectory + `${courseCode}_${dni}.pdf`;
    //   console.log("Ruta de archivo local:", fileUri);

    //   const response = await FileSystem.downloadAsync(url, fileUri);

    //   if (response.status === 200) {
    //     alert("Archivo descargado con éxito: " + `${courseCode}_${dni}.pdf`);
    //     if (await Sharing.isAvailableAsync()) {
    //       await Sharing.shareAsync(fileUri);
    //     } else {
    //       alert("No se puede compartir el archivo en este dispositivo.");
    //     }
    //   } else {
    //     alert("Error al descargar el archivo: " + response.status);
    //   }
    // } catch (error) {
    //   console.error("Error al descargar el archivo:", error);
    //   alert("Error al descargar el archivo");
    // }
  };

  return (
    <View style={{ height: "100%", width: "100%", backgroundColor: "#091d24" }}>
      <View style={styles.btnBackToOptions}>
        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => setActionType(null)}
        >
          <AntDesign name="back" size={24} color="black" />
          <Text style={{ fontSize: 18, marginLeft: 5 }}>Volver</Text>
        </TouchableOpacity>
      </View>
      <Text
        style={{
          fontSize: 20,
          color: "#ffffff",
          width: "90%",
          marginHorizontal: "auto",
          height: "auto",
        }}
      >
        {checkData === 1 ? "No has finalizado ningún curso" : null}
      </Text>
      <ScrollView
        style={{ width: "95%", height: "80%", margin: "auto", paddingTop: 20 }}
        contentContainerStyle={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          rowGap: 15,
          paddingBottom: 40,
        }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          courseAproved.map((e, i) => (
            <View style={styles.coursesDoneBox} key={i}>
              <Text
                style={{
                  fontWeight: "bold",
                  width: "90%",
                  textAlign: "center",
                  paddingBottom: 5,
                }}
              >
                {e.data().titulo}
              </Text>
              <Image
                source={{ uri: e.data().imagen }}
                style={{ width: "80%", height: "70%" }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {e.data().aprobo === true
                  ? "Curso Aprobado"
                  : "Curso NO Aprobado"}
              </Text>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => downloadFile(e.data().curso, userData.dni)}
              >
                <Text style={styles.downloadButtonText}>
                  Descargar Certificado Digital
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
