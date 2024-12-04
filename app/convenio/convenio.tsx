import React, { useState, useEffect } from "react";
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
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import styles from "../../styles/convenio/convenio-styles";
import { firebaseconn } from "@/constants/FirebaseConn";

export default function HandleCampusTeachers() {
  const statusBarHeight = StatusBar.currentHeight;

  // Estados para manejar la visibilidad de los modales
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);

  // Estados para manejar la carga y los datos de cada modal
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  const [dataPredio, setDataPredio] = useState<any[]>([]);
  const [dataCasa, setDataCasa] = useState<any[]>([]);

  const analytics = getFirestore(firebaseconn);
  const data = collection(analytics, "novedades");

  // Función para abrir enlaces externos
  const openOtherData = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  // Función para abrir o cerrar los modales
  const toggleModal1 = () => {
    setIsModalVisible1(!isModalVisible1);
  };

  const toggleModal2 = () => {
    setIsModalVisible2(!isModalVisible2);
  };

  // Cargar datos de la categoría "predio"
  useEffect(() => {
    const getDataPredio = async () => {
      try {
        setLoading1(true);
        const filteredData = query(data, where("categoria", "==", "predio"));
        const res = await getDocs(filteredData);
        const dataList = res.docs.map((doc) => doc.data());
        setDataPredio(dataList);
      } catch (error) {
        console.error("Error al cargar datos de predio:", error);
        alert(`Error: ${error}`);
      } finally {
        setLoading1(false);
      }
    };
    getDataPredio();
  }, []);

  // Cargar datos de la categoría "casa"
  useEffect(() => {
    const getDataCasa = async () => {
      try {
        setLoading2(true);
        const filteredData = query(data, where("categoria", "==", "casa"));
        const res = await getDocs(filteredData);
        const dataList = res.docs.map((doc) => doc.data());
        setDataCasa(dataList);
      } catch (error) {
        console.error("Error al cargar datos de casa:", error);
        alert(`Error: ${error}`);
      } finally {
        setLoading2(false);
      }
    };
    getDataCasa();
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
            diversas empresas de la ciudad y hoteles en diferentes provincias
            del país, ofreciendo a sus afiliados descuentos especiales y
            condiciones preferenciales en distintos sectores comerciales.
            Presentando la credencial digital a través de la aplicación, los
            afiliados podrán acceder fácilmente a estos beneficios. Estos
            convenios reflejan el compromiso del Sindicato con el bienestar de
            sus miembros, brindando acceso a productos y servicios de calidad en
            condiciones exclusivas. ¡No pierdas la oportunidad de disfrutar de
            estos beneficios reservados solo para los afiliados!
          </Text>
        </View>

        {/* Carrusel de imágenes */}
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
              source={require("../../assets/convenio/convenio1.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/convenio/convenio2.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/convenio/convenio3.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/convenio/convenio4.jpg")}
              resizeMode="cover"
            />
          </ScrollView>
        </View>

        {/* Botón 1 para ver la lista de comercios adheridos */}
        <TouchableOpacity
          style={styles.btnNews}
          activeOpacity={1}
          onPress={toggleModal1}
        >
          <Text style={styles.btnText1}>Lista de Comercios Adheridos</Text>
        </TouchableOpacity>

        {/* Modal 1 */}
        <Modal
          visible={isModalVisible1}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {loading1 ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <ScrollView style={styles.modalContent}>
                  {dataPredio.length > 0 ? (
                    dataPredio.map((item, index) => (
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
                    ))
                  ) : (
                    <Text style={styles.Textmodal}>
                      Actualmente no disponemos de convenios activos.
                    </Text>
                  )}
                </ScrollView>
              )}
              <View style={styles.btnsBox}>
                <TouchableOpacity
                  style={styles.btnCommon}
                  onPress={toggleModal1}
                >
                  <Text style={styles.commonBtnText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Botón 2 para ver la lista de convenios de casas */}
        <TouchableOpacity
          style={styles.btnNews}
          activeOpacity={1}
          onPress={toggleModal2}
        >
          <Text style={styles.btnText1}>Convenios - Hoteles Provinciales</Text>
        </TouchableOpacity>

        {/* Modal 2 */}
        <Modal
          visible={isModalVisible2}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {loading2 ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <ScrollView style={styles.modalContent}>
                  {dataCasa.length > 0 ? (
                    dataCasa.map((item, index) => (
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
                    ))
                  ) : (
                    <Text style={styles.Textmodal}>
                      Actualmente no disponemos de convenios activos.
                    </Text>
                  )}
                </ScrollView>
              )}
              <View style={styles.btnsBox}>
                <TouchableOpacity
                  style={styles.btnCommon}
                  onPress={toggleModal2}
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
