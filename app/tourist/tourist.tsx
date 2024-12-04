import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Modal,
  ActivityIndicator,
} from "react-native";
import styles from "../../styles/tourist/tourist-styles";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";

export default function HandleTourist() {
  const statusBarHeight = StatusBar.currentHeight;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataTravel, setDataTravel] = useState<any[]>([]); // Ahora es un array para manejar múltiples documentos
  const analytics = getFirestore(firebaseconn);

  const openOtherData = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const dataRef = collection(analytics, "novedades");
        const q = query(dataRef, where("categoria", "==", "turismo"));
        const res = await getDocs(q);
        const filteredData = res.docs.map((doc) => doc.data());
        setDataTravel(filteredData); // Guardar todos los documentos relacionados con turismo
      } catch (error) {
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
          <Text style={{ fontSize: 24, color: "#ffffff" }}>Turismo</Text>
        </View>
        <View style={styles.viewInformation}>
          <Text style={styles.text}>
            La Secretaría de Turismo desarrolla su programa de turismo social
            para sus afiliados, con la firma de convenios con otras entidades
            gremiales a nivel país que permiten disfrutar del tiempo libre y
            vacacional mediante sus planes de paseo a corredores turísticos de
            la Argentina y Catamarca, gozando de los mejores paisajes y
            servicios. ¡Súmate a los beneficios!
          </Text>
        </View>
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
              source={require("../../assets/turismo/turismo.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo1.jpg")}
              resizeMode="cover"
            />

            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo2.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo3.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo4.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo5.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo6.jpg")}
              resizeMode="cover"
            />
          </ScrollView>
        </View>
        <View style={styles.viewGetInformation}>
          <Text style={{ fontSize: 24, fontWeight: "600" }}>
            Hace tu reserva
          </Text>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openOtherData("https://wa.me/5493834283151")}
          >
            <Text style={{ fontSize: 18 }}>Contacto</Text>
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.btnNews}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <Text style={styles.btnText1}>Pack de viajes disponible</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal} // Cuando se cierra el modal
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <ScrollView style={styles.modalContent}>
                  {dataTravel.length > 0 ? (
                    dataTravel.map((item, index) => (
                      <View key={index} style={styles.modalItem}>
                        {item.imagen && (
                          <Image
                            source={{ uri: item.imagen }}
                            style={{ width: "100%", height: 200 }}
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
                            style={styles.btnGetLink}
                            onPress={() => openOtherData(item.link)}
                          >
                            <Text
                              style={{ color: "#ffffff", fontWeight: "bold" }}
                            >
                              Reservar
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text
                      style={{
                        color: "#000000",
                        fontSize: 25,
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      Actualmente no hay viajes de Turismo disponibles
                    </Text>
                  )}
                </ScrollView>
              )}
              <TouchableOpacity style={styles.btnGetLink} onPress={toggleModal}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#ffffff" }}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
