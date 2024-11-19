import {
  View,
  Text,
  StatusBar,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import styles from "../../styles/asistencia/asistencia";
import { SidcaContext } from "../_layout";
import { useContext, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";

// Importación de la imagen local
const localImage = require("../../assets/logos/secretaria.png");

export default function HandleCampusTeachers() {
  const { userData } = useContext(SidcaContext); // Obtener datos del contexto
  const statusBarHeight = StatusBar.currentHeight;
  const windowHeight = Dimensions.get("window").height;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataTravel, setDataTravel] = useState<any>([]);
  const [courseName, setCourseName] = useState("");

  const analytics = getFirestore(firebaseconn);
  const coursesCollection = collection(analytics, "cursos");

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await getDocs(
          query(coursesCollection, where("categoria", "==", "titulo"))
        );
        const coursesList = res.docs.map((doc) => doc.data());
        setDataTravel(coursesList);
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
        alert(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={{ fontSize: 24, color: "#ffffff" }}>
            Registro de Asistencia
          </Text>
        </View>

        <View style={styles.viewInformation}>
          <Text style={styles.text}>
            El Sindicato de Docentes de Catamarca ha implementado un sistema
            innovador para el registro de asistencia en sus capacitaciones,
            talleres, cursos y congresos. A través de la modalidad presencial o
            virtual sincrónica, los participantes podrán registrar su asistencia
            de forma ágil mediante la app del sindicato, accediendo al apartado
            "Registro de Asistencia". Además, ofrece a los afiliados la
            posibilidad de realizar un seguimiento continuo de su participación
            en actividades formativas, contribuyendo a su desarrollo profesional
            y garantizando un registro completo de su formación. ¡Una
            herramienta más que fortalece la gestión eficiente y el compromiso
            con la calidad educativa!
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={localImage}
            style={styles.imageOutsideText}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.btnNews}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <Text style={{ color: "#ffffff", fontSize: 19 }}>
            Registrar Asistencia al Curso
          </Text>
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <View style={styles.modalContent}>
                  {/* Información del usuario desde Firebase */}
                  <View
                    style={[
                      { width: windowHeight - 20 },
                      styles.mainInformationContainer,
                    ]}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {userData?.apellido !== undefined
                        ? `${userData.apellido},`
                        : null}{" "}
                      {userData?.nombre}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      DNI: {userData?.dni}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      Departamento:{" "}
                      {userData?.departamento === undefined
                        ? "Sin asignar"
                        : userData?.departamento}
                    </Text>
                  </View>

                  {/* Entrada de datos adicionales */}
                  <Text style={styles.modalText}>Nombre del Curso:</Text>
                  <TextInput
                    style={styles.input}
                    value={courseName}
                    onChangeText={setCourseName}
                    placeholder="Nombre del curso"
                  />

                  <TouchableOpacity
                    style={styles.btnCommon}
                    onPress={() => alert("Registro enviado con éxito")}
                  >
                    <Text style={styles.commonBtnText}>
                      Registrar Asistencia
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.btnCommon} onPress={toggleModal}>
                <Text style={styles.commonBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
