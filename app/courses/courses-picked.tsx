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

  // Estado para guardar el nombre del curso
  const [courseName, setCourseName] = useState("");

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

  // Función para descargar el certificado
  const downloadFile = async (courseCode, dni, title) => {
    try {
      if (!dni || typeof dni !== "string") {
        alert("El DNI no es válido.");
        console.log("Error: DNI inválido:", dni);
        return;
      }

      const course = courseAproved.find(
        (curso) => curso.data().curso === courseCode
      );
      if (!course || course.data().aprobo !== true) {
        alert("Este curso no está aprobado o no existe.");
        return;
      }

      setCourseName(title);

      const fileName = `${courseCode}_${dni}.pdf`;
      const fileRef = ref(
        storage,
        `certificados_digitales/${courseCode}/${fileName}`
      );

      console.log(
        "Buscando archivo en Firebase en la ruta: ",
        `certificados_digitales/${courseCode}/${fileName}`
      );

      // Intentar obtener la URL del archivo
      let certificadoURL;
      try {
        certificadoURL = await getDownloadURL(fileRef);
        console.log("URL del certificado encontrada:", certificadoURL);
      } catch (error) {
        if (error.code === "storage/object-not-found") {
          alert("El certificado no existe en el servidor.");
        } else if (error.code === "storage/unauthorized") {
          alert("No tienes permisos para acceder al certificado.");
        } else {
          console.error("Error inesperado al buscar el certificado:", error);
        }
        return; // Salir si no se puede obtener la URL
      }

      const fileUri = FileSystem.documentDirectory + fileName;
      const response = await FileSystem.downloadAsync(certificadoURL, fileUri);

      if (response.status === 200) {
        alert("Archivo descargado con éxito: " + fileName);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          alert("No se puede compartir el archivo en este dispositivo.");
        }

        // Guardar el enlace del certificado en Firestore
        const courseId = course.id;
        const courseDocRef = doc(
          analytics,
          "usuarios",
          userData.id,
          "cursos",
          courseId
        );

        await setDoc(
          courseDocRef,
          {
            certificadoURL: certificadoURL,
            actualizadoEl: new Date(),
          },
          { merge: true }
        );

        console.log("Enlace del certificado guardado en Firestore.");
      } else {
        alert("Error al descargar el archivo: " + response.status);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      alert("Hubo un error inesperado. Por favor, intente nuevamente.");
    }
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
                onPress={() => {
                  const cursoCode = e.data().curso?.trim(); // Limpiar espacios en blanco
                  console.log("Código del curso obtenido:", cursoCode);
                  downloadFile(cursoCode, userData.dni, e.data().titulo); // Pasar título como argumento
                }}
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
