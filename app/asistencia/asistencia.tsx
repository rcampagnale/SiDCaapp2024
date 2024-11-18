import {
  View,
  Text,
  StatusBar,
  Modal,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import styles from "../../styles/asistencia/asistencia";
import { useState, useEffect } from "react";
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
  const statusBarHeight = StatusBar.currentHeight;

  // Estado para manejar la visibilidad del modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataTravel, setDataTravel] = useState<any>([]);

  const analytics = getFirestore(firebaseconn);
  const data = collection(analytics, "novedades");

  // Función para abrir el enlace
  const openOtherData = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  // Filtrar por categoría "Predio"
  const filteredData = query(data, where("categoria", "==", "predio"));

  // Función para abrir o cerrar el modal
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // Cargar datos desde Firebase
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await getDocs(filteredData);
        const dataList = res.docs.map((doc) => doc.data());
        setDataTravel(dataList);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
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
                <ScrollView style={styles.modalContent}>
                  {dataTravel.length > 0 && (
                    <>
                      {dataTravel.map((item, index) => (
                        <View key={index} style={styles.modalItem}>
                          {item.imagen && (
                            <Image
                              source={{ uri: item.imagen }}
                              style={styles.modalItemImage}
                              resizeMode="contain"
                            />
                          )}
                          {item.descripcion && (
                            <Text style={styles.textAbout}>
                              {item.descripcion}
                            </Text>
                          )}
                          {item.link && (
                            <TouchableOpacity
                              style={styles.btnCommon}
                              onPress={() => openOtherData(item.link)}
                            >
                              <Text style={styles.commonBtnText}>Contacto</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </>
                  )}
                </ScrollView>
              )}
              <View style={styles.btnsBox}>
                <TouchableOpacity
                  style={styles.btnCommon}
                  onPress={toggleModal}
                >
                  <Text style={styles.commonBtnText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
