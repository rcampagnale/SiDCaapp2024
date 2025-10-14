import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { firebaseconn } from "@/constants/FirebaseConn";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import styles from "../../styles/convenio/convenio-styles";
import ModalComponent from "./ModalComponent"; // Importar el nuevo componente del modal

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

  const openOtherData = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  const toggleModal1 = () => {
    setIsModalVisible1(!isModalVisible1);
  };

  const toggleModal2 = () => {
    setIsModalVisible2(!isModalVisible2);
  };

  const handleOpenModal1 = async () => {
    setLoading1(true);
    setIsModalVisible1(true);
    try {
      const filteredData = query(data, where("categoria", "==", "convenio_comercio"));
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

  const handleOpenModal2 = async () => {
    setLoading2(true);
    setIsModalVisible2(true);
    try {
      const filteredData = query(data, where("categoria", "==", "convenio_hoteles"));
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
        <View
          style={{
            width: "100%",
            height: "20%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            flexDirection: "column",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            style={styles.btnNews}
            activeOpacity={1}
            onPress={handleOpenModal1}
          >
            <Text style={styles.btnText1}>Lista de Comercios Adheridos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnNews1}
            activeOpacity={1}
            onPress={handleOpenModal2}
          >
            <Text style={styles.btnText2}>
              Convenio Interprovincial Hoteleros
            </Text>
          </TouchableOpacity>
        </View>
        <ModalComponent
          isModalVisible={isModalVisible1}
          toggleModal={toggleModal1}
          category="convenio_comercio"
          loading={loading1}
          data={dataPredio}
          title="Lista de Comercios Adheridos"
        />

        <ModalComponent
          isModalVisible={isModalVisible2}
          toggleModal={toggleModal2}
          category="casa"
          loading={loading2}
          data={dataCasa}
          title="Convenio Interprovincial Hoteleros"
        />
      </View>
    </View>
  );
}
