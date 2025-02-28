import React, { useState, useEffect } from "react";
import {
  View,
  StatusBar,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
  Modal,
} from "react-native";
import styles from "../../styles/links/links-styles"; // Importando estilos
import AntDesign from "@expo/vector-icons/AntDesign";
import { firebaseconn } from "@/constants/FirebaseConn";
import { Picker } from "@react-native-picker/picker";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const BackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={styles.backButton} // Usamos el estilo extraído
      onPress={onPress}
    >
      <AntDesign name="back" size={24} color="black" />
      <Text style={styles.backButtonText}>Volver</Text>
    </TouchableOpacity>
  );
};
const SimuladorSueldo = ({ modalVisible, setModalVisible }) => {
  const [tipoCargo, setTipoCargo] = useState("");
  const [sueldoBasico] = useState(500000);
  const [adicAntiguedad, setAdicAntiguedad] = useState("");
  const [zonaFrontera, setZonaFrontera] = useState("");
  const [descuentoOSEP] = useState(15000);

  return (
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Simulador de Recibo de Sueldo</Text>
          <View style={styles.separator} />
          <Text style={styles.modalDescription}>
            Selecciona los valores para calcular el sueldo.
          </Text>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={styles.rowContainer}>
              <Text style={styles.titulodeopciones}>Tipo de Cargo:</Text>
              <Picker
                selectedValue={tipoCargo}
                onValueChange={(itemValue) => setTipoCargo(itemValue)}
                style={styles.pickerContainer}
              >
                <Picker.Item label="Seleccione un cargo" value="" />
                <Picker.Item label="Maestra/o de grado" value="maestra" />
                <Picker.Item label="Horas cátedra" value="horas" />
                <Picker.Item label="Director" value="director" />
              </Picker>
            </View>
            <View style={styles.separator} />
            <View style={styles.rowContainer}>
              <Text style={styles.titulodeopciones}>
                Sueldo Básico Docente:
              </Text>
              <Text style={styles.sueldo}>$ {sueldoBasico}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.rowContainer}>
              <Text style={styles.titulodeopciones}>
                Adicional por Antigüedad Docente:
              </Text>
              <Picker
                selectedValue={adicAntiguedad}
                onValueChange={(itemValue) => setAdicAntiguedad(itemValue)}
                style={styles.pickerContainer}
              >
                <Picker.Item label="Seleccione una antigüedad" value="" />
                <Picker.Item label="0 año - 0%" value="0" />
                <Picker.Item label="1 año - 10%" value="10" />
                <Picker.Item label="2 años - 15%" value="15" />
                <Picker.Item label="5 años - 30%" value="30" />
                <Picker.Item label="7 años - 40%" value="40" />
                <Picker.Item label="10 años - 30%" value="50" />
                <Picker.Item label="12 años - 60%" value="60" />
                <Picker.Item label="15 años - 70%" value="70" />
                <Picker.Item label="17 años - 80%" value="80" />
                <Picker.Item label="20 años - 100%" value="100" />
                <Picker.Item label="22 años - 110%" value="110" />
                <Picker.Item label="24 años - 120%" value="120" />
                <Picker.Item label="25 años - 125%" value="125" />
                <Picker.Item label="28 años o más- 130%" value="130" />
              </Picker>
            </View>
            <View style={styles.separator} />
            <View style={styles.rowContainer}>
              <Text style={styles.titulodeopciones}>Zona Frontera:</Text>
              <Picker
                selectedValue={zonaFrontera}
                onValueChange={(itemValue) => setZonaFrontera(itemValue)}
                style={styles.pickerContainer}
              >
                <Picker.Item label="Seleccione una zona" value="" />
                <Picker.Item label="0%" value="0" />
                <Picker.Item label="40%" value="40" />
                <Picker.Item label="60%" value="60" />
              </Picker>
            </View>
            <View style={styles.separator} />
            <View style={styles.rowContainer}>
              <Text style={styles.titulodeopciones}>Descuento OSEP:</Text>
              <Text style={styles.sueldo}>$ {descuentoOSEP}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.rowContainer}>
              <TouchableOpacity
                onPress={() => handleSueldoCobrar()}
                disabled={true} // Deshabilita el botón
              >
                <Text style={styles.buttonText1}>Sueldo a {"\n"}Cobrar</Text>
              </TouchableOpacity>
              <Text style={styles.sueldo}>$ {descuentoOSEP}</Text>
            </View>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function ReferenceLinks() {
  const statusBarHeight: number | undefined = StatusBar.currentHeight;
  const [linkTo, setLinksTo] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const db = getFirestore(firebaseconn);
  const enlacesCollection = collection(db, "enlaces");

  const openInformation = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  const miCatamarcaUrl =
    "https://api-mi.catamarca.gob.ar/accounts/login/?next=/openid/authorize%3Fclient_id%3D990406%26redirect_uri%3Dhttp%253A%252F%252Fmi.catamarca.gob.ar%252F%26response_type%3Dcode%26scope%3Dopenid%2Bprofile%2Bemail%26state%3Db326f7a361474c4697adcd201c4dc0ff%26code_challenge%3D1bUgdLkTi1TAwZLid6RoaVa_HaKLBLd1jrS0f3w8-90%26code_challenge_method%3DS256%26response_mode%3Dquery";

  useEffect(() => {
    const seeData = async () => {
      if (selectedOption === "Link Docente") {
        try {
          setLoading(true);
          const queryFirebase = query(
            enlacesCollection,
            where("prioridad", "!=", 0)
          );
          const querySnapshot = (await getDocs(queryFirebase)).docs;
          setLinksTo(querySnapshot);
        } catch (error) {
          alert("Ocurrió un error");
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };
    seeData();
  }, [selectedOption]);

  if (!selectedOption) {
    return (
      <View style={[styles.container, { paddingTop: statusBarHeight }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent={true}
        />

        <Text style={styles.title1}>
          Red de Contactos e Información para el Docente
        </Text>

        <View style={styles.orangeRectangle}></View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => openInformation(miCatamarcaUrl)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/logos/logo_i1.png")}
                style={{
                  width: 35,
                  height: 35,
                  marginRight: 10,
                  borderRadius: 10,
                }}
              />
              <Text style={styles.buttonText}>Mi Catamarca</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setSelectedOption("Link Docente")}
          >
            <Text style={styles.buttonText}>
              Directorio de Contactos Docentes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Simulador de Recibo de Sueldo</Text>
          </TouchableOpacity>
        </View>

        <Image
          style={styles.image}
          source={require("../../assets/somos/link.jpg")}
          resizeMode="contain"
        />

        {/* Aquí agregamos el componente del simulador de sueldo */}
        <SimuladorSueldo
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </View>
    );
  }

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <BackButton onPress={() => setSelectedOption(null)} />
        <ScrollView
          contentContainerStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 10,
            rowGap: 10,
          }}
        >
          <Text style={styles.title}>Directorio de Contactos Docentes</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            linkTo.map((e: any, i: number) => (
              <View style={styles.coursesDoneBox} key={i}>
                <Text
                  style={{
                    fontWeight: "bold",
                    width: "90%",
                    textAlign: "center",
                  }}
                >
                  {e.data().titulo}
                </Text>
                <Text style={{ fontSize: 18, width: "90%" }}>
                  {e.data().descripcion}
                </Text>
                <TouchableOpacity
                  onPress={() => openInformation(e.data().link)}
                >
                  <Text style={styles.btnText}>Ver Información</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
