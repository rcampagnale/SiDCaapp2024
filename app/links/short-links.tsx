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
  TextInput,
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
  const [sueldoBasico, setSueldoBasico] = useState("");
  const [adicAntiguedad, setAdicAntiguedad] = useState("");
  const [zonaPagar, setZonaPagar] = useState("0.00"); // Nuevo estado
  const [zonaFrontera, setZonaFrontera] = useState("");

  // Convertir sueldo básico a número seguro
  const sueldoNumerico = sueldoBasico ? parseFloat(sueldoBasico) : 0;

  // Calcular adicional por antigüedad
  const antiguedadAPagar = sueldoNumerico * (parseFloat(adicAntiguedad) / 100);

  // Calcular descuento OSEP
  const descuentoOSEP = (
    (sueldoNumerico + antiguedadAPagar + parseFloat(zonaPagar)) /
    4.5
  ).toFixed(2);
  // Calcular descuento SiDCa. (Sindicato)
  const descuentoSindical = (
    (sueldoNumerico + antiguedadAPagar + parseFloat(zonaPagar)) /
    2
  ).toFixed(2);
  // Calcular el Sueldo a Cobrar
  const sueldoACobrar = (
    sueldoNumerico +
    antiguedadAPagar +
    parseFloat(zonaPagar) -
    parseFloat(descuentoOSEP) -
    parseFloat(descuentoSindical)
  ).toFixed(2);
  // Calcular el adicional por zona frontera
  useEffect(() => {
    if (sueldoBasico && zonaFrontera) {
      const sueldo = parseFloat(sueldoBasico);
      const zona = parseFloat(zonaFrontera) / 100;
      const adicionalZona = (sueldo * zona).toFixed(2);
      setZonaPagar(adicionalZona);
    } else {
      setZonaPagar("0.00");
    }
  }, [sueldoBasico, zonaFrontera]);
  // Función para limpiar los valores cuando el modal se cierre
  const handleCloseModal = () => {
    setSueldoBasico("");
    setAdicAntiguedad("");
    setZonaFrontera("");
    setZonaPagar("0.00");
    setModalVisible(false);
  };

  return (
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Simulador de Recibo de Sueldo</Text>
          <View style={styles.separator} />
          <Text style={styles.modalDescription}>
            Selecciona los valores para calcular el sueldo.
          </Text>
          <View style={styles.separator} />
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text
              style={[
                styles.modalDescription,
                {
                  alignSelf: "flex-start",
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 5,
                  padding: 5,
                  marginBottom: 5,
                  backgroundColor: "#f0f0f0", // Cambia el color de fondo aquí
                },
              ]}
            >
              Haberes
            </Text>
            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={styles.titulodeopciones}>Sueldo Básico:</Text>
              <TextInput
                style={[styles.input, { paddingLeft: 10 }]} // Agregando un poco de padding al input
                keyboardType="numeric"
                placeholder="Ingrese monto"
                value={sueldoBasico}
                onChangeText={setSueldoBasico}
              />
            </View>

            <View style={styles.separator} />
            <View
              style={{
                borderColor: "black",
                borderWidth: 2,
                borderRadius: 8,
                padding: 10,
              }}
            >
              <View style={styles.rowContainer}>
                <Text style={styles.titulodeopciones}>
                  Adicional por Antigüedad Docente:
                </Text>
                <Picker
                  selectedValue={adicAntiguedad}
                  onValueChange={setAdicAntiguedad}
                  style={styles.pickerContainer}
                >
                  <Picker.Item label="Seleccione una antigüedad" value="" />
                  <Picker.Item label="0 año - 0%" value="0" />
                  <Picker.Item label="1 año - 10%" value="10" />
                  <Picker.Item label="2 a 4 años - 15%" value="15" />
                  <Picker.Item label="5 a 6 años - 30%" value="30" />
                  <Picker.Item label="7 a 9 años - 40%" value="40" />
                  <Picker.Item label="10 a 11 años - 50%" value="50" />
                  <Picker.Item label="12 a 14 años - 60%" value="60" />
                  <Picker.Item label="15 a 16 años - 70%" value="70" />
                  <Picker.Item label="17 a 19 años - 80%" value="80" />
                  <Picker.Item label="20 a 21 años - 100%" value="100" />
                  <Picker.Item label="22 a 23 años - 110%" value="110" />
                  <Picker.Item label="24 años - 120%" value="120" />
                  <Picker.Item label="25 a 27 años - 125%" value="125" />
                  <Picker.Item label="28 años o más - 130%" value="130" />
                </Picker>
              </View>

              <View style={styles.separator} />
              <View style={styles.rowContainer}>
                <Text style={styles.titulodeopciones}>Antigüedad a pagar:</Text>
                <Text style={styles.sueldo}>
                  $ {antiguedadAPagar.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.separator} />
            <View
              style={{
                borderColor: "black",
                borderWidth: 2,
                borderRadius: 8,
                padding: 10,
              }}
            >
              <View style={styles.rowContainer}>
                <Text style={styles.titulodeopciones}>Zona Frontera:</Text>
                <Picker
                  selectedValue={zonaFrontera}
                  onValueChange={setZonaFrontera}
                  style={styles.pickerContainer}
                >
                  <Picker.Item label="Seleccione una zona" value="" />
                  <Picker.Item label="Urgano 0 %" value="0" />
                  <Picker.Item label="Alejado Radio Urbano (ARU) 40 %" value="40" />
                  <Picker.Item label="Desfavorable 75 %" value="75" />
                  <Picker.Item label="Muy Desfavorable 100 %" value="100" />
                  <Picker.Item label="Inhóspito 150 %" value="150" />
                </Picker>
              </View>

              <View style={styles.separator} />
              <View style={styles.rowContainer}>
                <Text style={styles.titulodeopciones}>Zona a Pagar:</Text>
                <Text style={styles.sueldo}>$ {zonaPagar}</Text>
              </View>
            </View>

            <View style={styles.separator} />
            <Text
              style={[
                styles.modalDescription,
                {
                  alignSelf: "flex-start",
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 5,
                  padding: 5,
                  marginBottom: 5,
                  backgroundColor: "#f0f0f0", // Cambia el color de fondo aquí
                },
              ]}
            >
              Descuentos
            </Text>
            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={styles.titulodeopciones}>Aportes Jubilatorios:</Text>
              <Text style={styles.sueldo}>$ {descuentoOSEP}</Text>
            </View>
            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={styles.titulodeopciones}>
                Fondo Esp. Trasplantes y Trat. Oncol. (O.S.E.P.):
              </Text>
              <Text style={styles.sueldo}>$ {descuentoOSEP}</Text>
            </View>

            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={styles.titulodeopciones}>Descuento OSEP:</Text>
              <Text style={styles.sueldo}>$ {descuentoOSEP}</Text>
            </View>

            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={styles.titulodeopciones}>
                Descuento SiDCa. (Sindicato):
              </Text>
              <Text style={styles.sueldo}>$ {descuentoSindical}</Text>
            </View>

            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={styles.titulodeopciones}>Reg.Prev.Esp. Docente:</Text>
              <Text style={styles.sueldo}>$ {descuentoSindical}</Text>
            </View>
            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={styles.titulodeopciones}>
                Seguro de Vida Obligatorio:
              </Text>
              <Text style={styles.sueldo}>$ {descuentoSindical}</Text>
            </View>
            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={styles.titulodeopciones}>Subsidio por Sepelio:</Text>
              <Text style={styles.sueldo}>$ {descuentoSindical}</Text>
            </View>

            <View style={styles.separator} />
            <Text
              style={[
                styles.modalDescription,
                {
                  alignSelf: "flex-start",
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 5,
                  padding: 5,
                  marginBottom: 5,
                  backgroundColor: "#f0f0f0", // Cambia el color de fondo aquí
                },
              ]}
            >
              Haberes a Cobrar
            </Text>
            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                },
              ]}
            >
              <Text style={styles.titulodeopciones}>Sueldo a Cobrar:</Text>
              <Text style={styles.sueldo}>$ {sueldoACobrar}</Text>
            </View>

            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal} // Llama a la función de cierre y limpieza
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
