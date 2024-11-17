import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import styles from "../../styles/convenio/convenio-styles";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";

export default function HandleCampusTeachers() {
  const statusBarHeight = StatusBar.currentHeight;

  // Estado para manejar la visibilidad del modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Estado para controlar la carga de datos
  const [dataTravel, setDataTravel] = useState<any>([]); // Cambié el tipo de estado para ser un array

  const analytics = getFirestore(firebaseconn);
  const data = collection(analytics, "novedades"); // Colección de novedades

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
        const res = await getDocs(filteredData); // Usamos la consulta filtrada
        const dataList = res.docs.map((doc) => doc.data());

        // Asegúrate de que los datos sean un array
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
            Red de Convenio
          </Text>
        </View>
        <View style={styles.viewInformation}>
          <Text style={styles.text}>
            El Sindicato de Docentes de Catamarca ha firmado convenios con
            diversas empresas de la ciudad, ofreciendo a sus afiliados
            descuentos especiales y condiciones preferenciales en diferentes
            sectores comerciales. Presentando la credencial digital a través de
            la app, los afiliados podrán acceder fácilmente a estos beneficios.
            Estos convenios reflejan el compromiso del sindicato con el
            bienestar de sus miembros, brindando ventajas adicionales en
            productos y servicios de calidad. ¡No pierdas la oportunidad de
            aprovechar estos beneficios exclusivos que solo los afiliados pueden
            disfrutar!
          </Text>
        </View>

        {/* Carrusel de imágenes (se mantienen las imágenes estáticas) */}
        <View style={styles.carruselContainer}>
          <ScrollView
            style={styles.carrusel}
            contentContainerStyle={{
              justifyContent: "space-between",
              alignItems: "center",
              columnGap: 15,
            }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio1.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio2.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio3.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio4.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio5.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio6.jpg")}
              resizeMode="cover"
            />
          </ScrollView>
        </View>

        {/* Botón para ver la lista de comercios adheridos */}
        <TouchableOpacity
          style={styles.btnNews}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <Text>Lista de Comercios Adheridos</Text>
        </TouchableOpacity>

        {/* Modal con la lista de comercios */}
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
                              style={styles.btnCommon} // Estilo común para botones
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
                  style={styles.btnCommon} // Estilo común para botones
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
