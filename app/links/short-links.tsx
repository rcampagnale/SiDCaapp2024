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
  StyleSheet,
  ImageStyle,
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
  const [selectedOption, setSelectedOption] = useState("");
  const [adicAntiguedad, setAdicAntiguedad] = useState("");
  const [zonaPagar, setZonaPagar] = useState("0.00"); // Nuevo estado
  const [zonaFrontera, setZonaFrontera] = useState("");
  const [cantidadHoras, setCantidadHoras] = useState("");
  const [sueldoCalculado, setSueldoCalculado] = useState(0);
  const [finalSueldo, setFinalSueldo] = useState("0.00"); // Definir la variable de estado para el sueldo final
  const [totalDescuentos, setTotalDescuentos] = useState(0); // Valor inicial en 0
  const [totalHaberes, setTotalHaberes] = useState(0); // Valor inicial en 0
  const [jubilacion, setJubilacion] = useState(0); // Estado para la jubilación
  const [fondoEspecial, setFondoEspecial] = useState(0); // Estado para el fondo especial
  const [descuentoOSEP, setDescuentoOSEP] = useState(0); // Estado para el descuento OSEP
  const [regPrevEspDocente, setRegPrevEspDocente] = useState(0); // Estado para "Reg.Prev.Esp. Docente"
  const [nomencladorUrl, setNomencladorUrl] = useState(null);
  const analytics = getFirestore(firebaseconn);
  const data = collection(analytics, "asesoramiento");

  // Función para buscar el documento en Firebase
  const fetchNomenclador = async () => {
    try {
      const db = getFirestore();
      const snapshot = await getDocs(
        query(
          collection(db, "asesoramiento"),
          where("categoria", "==", "escala_salarial")
        )
      );

      const results = snapshot.docs
        .map((doc) => doc.data())
        .filter(
          (doc) =>
            doc.titulo === "NOMENCLADOR DE CARGO DOCENTE - ACUERDO SALARIAL"
        );

      if (results.length > 0) {
        setNomencladorUrl(results[0].link);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchNomenclador(); // Se ejecuta al montar el componente
  }, []);

  useEffect(() => {
    // Si la opción seleccionada es "catedra" o "superior", calcular el sueldo base
    if (
      (selectedOption === "catedra" || selectedOption === "superior") &&
      cantidadHoras &&
      sueldoBasico
    ) {
      const sueldoBaseCalculado =
        parseFloat(cantidadHoras) * parseFloat(sueldoBasico);
      setSueldoCalculado(sueldoBaseCalculado);
    } else {
      // Si no hay cantidad de horas o sueldo básico, solo se muestra el sueldo básico
      setSueldoCalculado(parseFloat(sueldoBasico) || 0);
    }
  }, [selectedOption, cantidadHoras, sueldoBasico]);

  // Convertir sueldo básico a número seguro
  const sueldoNumerico = sueldoBasico ? parseFloat(sueldoBasico) : 0;

  // Calcular adicional por antigüedad
  const antiguedadAPagar = sueldoCalculado * (parseFloat(adicAntiguedad) / 100);

  // Calcular descuento SiDCa. (Sindicato) - 2% de descuento sobre el sueldo básico
  const descuentoSindical = (sueldoCalculado * 0.02) // Aplica el 2% solo sobre el sueldo básico
    .toFixed(2);

  // Calcular el adicional por zona frontera
  useEffect(() => {
    if (sueldoCalculado && zonaFrontera) {
      const sueldo = parseFloat(sueldoCalculado); // Usar sueldoCalculado en lugar de sueldoBasico
      const zona = parseFloat(zonaFrontera) / 100;
      const adicionalZona = (sueldo * zona).toFixed(2); // Calcular el adicional por zona
      setZonaPagar(adicionalZona); // Establecer el adicional de zona
    } else {
      setZonaPagar("0.00"); // Si no hay sueldo calculado o zona, establecer 0.00
    }
  }, [sueldoCalculado, zonaFrontera]); // Dependencias: sueldoCalculado y zonaFrontera

  const seguroVidaObligatorio = 1000; // Monto fijo de Seguro de Vida Obligatorio

  const subsidioSepelio = 1500; // Monto fijo de Subsidio por Sepelio

  // Función que maneja el cálculo del sueldo
  const handleSimulateSalary = () => {
    // Total haberes
    const haberes = sueldoCalculado + antiguedadAPagar + parseFloat(zonaPagar);
    setTotalHaberes(haberes); // Ahora totalHaberes se guarda en el estado

    // Calcular jubilación basado en haberes y actualizar el estado
    const nuevaJubilacion = (haberes * 0.11).toFixed(2);
    setJubilacion(nuevaJubilacion); // Ahora la jubilación se almacena en el estado
    // Calcular fondo especial y actualizar el estado
    const nuevoFondoEspecial = (haberes * 0.005).toFixed(2);
    setFondoEspecial(nuevoFondoEspecial);

    // Calcular descuento OSEP basado en haberes y actualizar el estado
    const nuevoDescuentoOSEP = (haberes * 0.045).toFixed(2);
    setDescuentoOSEP(nuevoDescuentoOSEP); // Ahora el descuento OSEP se almacena en el estado

    // Calcular "Reg.Prev.Esp. Docente" basado en haberes y actualizar el estado
    const nuevoRegPrevEspDocente = (haberes * 0.02).toFixed(2);
    setRegPrevEspDocente(nuevoRegPrevEspDocente);

    // Sumar todos los descuentos
    const descuentos =
      parseFloat(nuevaJubilacion) +
      parseFloat(nuevoFondoEspecial) +
      parseFloat(nuevoDescuentoOSEP) +
      parseFloat(descuentoSindical) +
      parseFloat(nuevoRegPrevEspDocente) +
      seguroVidaObligatorio +
      subsidioSepelio;
    setTotalDescuentos(descuentos); // Ahora totalDescuentos se guarda en el estado

    // Calcular sueldo final a cobrar
    const sueldoFinal = haberes - descuentos;
    setFinalSueldo(sueldoFinal.toFixed(2)); // Ahora el sueldo final se actualiza correctamente
  };

  // Función para limpiar los valores cuando el modal se cierre
  const handleCloseModal = () => {
    setSueldoBasico("");
    setCantidadHoras(""); // Limpiar cantidad de horas
    setSelectedOption("cargo"); // Resetear opción seleccionada
    setSueldoCalculado(0); // Resetear sueldo calculado
    setFinalSueldo("0.00"); // Limpiar el valor de finalSueldo
    setAdicAntiguedad("0.00"); // Limpiar el valor de adicAntiguedad
    setZonaFrontera("0.00"); // Limpiar el valor de zonaFrontera
    setModalVisible(false); // Cerrar modal
  };
  // Función para manejar el cambio de opción y limpiar los valores
  const handleOptionChange = (itemValue) => {
    setSelectedOption(itemValue);

    // Limpiar los valores cuando se cambia de opción
    setSueldoBasico("");
    setCantidadHoras("");
    setSueldoCalculado(0);
  };

  return (
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Simulador de Recibo de Sueldo</Text>
          <View style={styles.separator} />
          <Text style={styles.modalDescription}>
            Este simulador proporciona una estimación aproximada del sueldo
            docente, considerando las horas trabajadas, el tipo de cargo
            (Maestro/a de grado, Nivel Inicial, Asesor, Preceptor, etc.) y las
            horas cátedra correspondientes para Nivel Secundario o Superior.
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
              style={{
                borderColor: "black",
                borderWidth: 2,
                borderRadius: 8,
                padding: 10,
              }}
            >
              <View
                style={[
                  styles.rowContainer,
                  {
                    borderColor: "black",
                    borderWidth: 2,
                    borderRadius: 8,
                    padding: 15,
                    marginBottom: 10,
                    flexDirection: "column",
                  },
                ]}
              >
                {/* Lista Desplegable con el texto como opciones */}
                <Text style={styles.titulodeopciones}>
                  Seleccione tipo de Cargo/Hs Cátedra:
                </Text>
                <Picker
                  selectedValue={selectedOption}
                  onValueChange={handleOptionChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Cargo/Maestro/Inicial" value="cargo" />
                  <Picker.Item label="Hs. Cátedra Secundaria" value="catedra" />
                  <Picker.Item label="Hs. Cátedra Superior" value="superior" />
                </Picker>

                {/* Ingreso de Monto */}
                <TextInput
                  style={[styles.input, { paddingLeft: 10 }]}
                  keyboardType="numeric"
                  placeholder="Ingrese Sueldo Base"
                  value={sueldoBasico}
                  onChangeText={setSueldoBasico}
                />

                {/* Campo de cantidad de horas (se muestra solo si se elige "Hs Cátedra") */}
                {selectedOption === "catedra" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <TextInput
                      style={[styles.input, { paddingLeft: 10, flex: 1 }]}
                      keyboardType="numeric"
                      placeholder="Cantidad de Hs."
                      value={cantidadHoras}
                      onChangeText={setCantidadHoras}
                    />

                    {/* Cuadro con borde negro y texto adentro */}
                    <View
                      style={{
                        borderColor: "black",
                        borderWidth: 2,
                        borderRadius: 5,
                        padding: 10,
                        marginLeft: 20, // Espacio entre el TextInput y el cuadro
                        minWidth: 50, // Ancho mínimo del cuadro
                        alignItems: "center",
                        justifyContent: "center",
                        
                      }}
                    >
                      <Text>Texto aquí</Text>
                    </View>
                  </View>
                )}

                {/* Campo de cantidad de horas (se muestra solo si se elige "Hs Superior") */}
                {selectedOption === "superior" && (
                  <TextInput
                    style={[styles.input, { paddingLeft: 10, marginTop: 10 }]}
                    keyboardType="numeric"
                    placeholder="Cantidad de Hs."
                    value={cantidadHoras}
                    onChangeText={setCantidadHoras}
                  />
                )}
                {/* Separador */}
                <View style={styles.separator} />

                {/* Sueldo Base Calculado */}
                <View style={styles.rowContainer}>
                  <Text style={styles.titulodeopciones}>Sueldo Base:</Text>
                  <Text style={styles.sueldo}>
                    $ {sueldoCalculado.toFixed(2)}
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
                  <Text style={styles.titulodeopciones}>
                    Antigüedad a pagar:
                  </Text>
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
                    <Picker.Item label="Urbano 0 %" value="0" />
                    <Picker.Item
                      label="Alejado Radio Urbano (ARU) 40 %"
                      value="40"
                    />
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
                  styles.modalDescription1,
                  {
                    alignSelf: "flex-end",
                    borderColor: "black",
                    borderWidth: 2,
                    borderRadius: 5,
                    padding: 5,
                    marginBottom: 5,
                    backgroundColor: "#f0f0f0", // Cambia el color de fondo aquí
                  },
                ]}
              >
                Remunerativos:
                <Text style={styles.sueldo}>$ {totalHaberes}</Text>
              </Text>
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
              style={{
                borderColor: "black",
                borderWidth: 2,
                borderRadius: 8,
                padding: 10,
              }}
            >
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
                  Aportes Jubilatorios:
                </Text>
                <Text style={styles.sueldo}>$ {jubilacion}</Text>
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
                <Text style={styles.sueldo}>$ {fondoEspecial}</Text>
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
                <Text style={styles.titulodeopciones}>
                  Reg.Prev.Esp. Docente:
                </Text>
                <Text style={styles.sueldo}>$ {regPrevEspDocente}</Text>
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
                <Text style={styles.sueldo}>$ {seguroVidaObligatorio}</Text>
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
                  Subsidio por Sepelio:
                </Text>
                <Text style={styles.sueldo}>$ {subsidioSepelio}</Text>
              </View>
              <View style={styles.separator} />
              <Text
                style={[
                  styles.modalDescription1,
                  {
                    alignSelf: "flex-end",
                    borderColor: "black",
                    borderWidth: 2,
                    borderRadius: 5,
                    padding: 5,
                    marginBottom: 5,
                    backgroundColor: "#f0f0f0", // Cambia el color de fondo aquí
                  },
                ]}
              >
                Descuentos:{" "}
                <Text style={styles.sueldo}>$ {totalDescuentos}</Text>
              </Text>
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
              style={{
                borderColor: "black",
                borderWidth: 2,
                borderRadius: 8,
                padding: 10,
              }}
            >
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
                <Text style={styles.sueldo}>$ {finalSueldo}</Text>
              </View>

              {/* Botón "Simular Sueldo" */}
              <TouchableOpacity
                style={styles.simularButton}
                onPress={handleSimulateSalary} // Llama a la función handleSimulateSalary
              >
                <Text style={styles.simularButtonText}>Simular Sueldo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.separator} />
            <View
              style={[
                styles.rowContainer,
                {
                  borderColor: "black",
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                  flexDirection: "column", // Asegura que los elementos se apilen verticalmente
                  justifyContent: "flex-start", // Alinea los elementos desde el inicio
                },
              ]}
            >
              {/* Texto arriba del nomenclador */}
              <Text style={styles.titulodeopciones1}>
                Si tienes duda sobre el valor de tu básico, puedes consultar
                aquí.
              </Text>

              {/* Botón con icono de PDF, alineado abajo */}
              <TouchableOpacity
                style={styles.buttonText2}
                onPress={() => {
                  if (nomencladorUrl) {
                    Linking.openURL(nomencladorUrl); // Abre el PDF usando la URL
                  }
                }}
              >
                <Text style={styles.buttonText2}>
                  Nomenclador de Cargo Docente{" "}
                  <AntDesign name="pdffile1" size={35} color="#0034ab" />
                </Text>
              </TouchableOpacity>
              <Text style={styles.simuladorTexto}>
                Advertencia: Este simulador proporciona una estimación
                aproximada del sueldo docente, y puede no reflejar el sueldo
                real en su totalidad. Factores como la Bonificación Incentivo a
                la Asistencia Docente (BIAD) u otros descuentos aplicables no
                están considerados en este cálculo. El sindicato no se
                responsabiliza por errores en los cálculos ni por el uso de los
                resultados obtenidos.
              </Text>
            </View>
          </ScrollView>
          <View style={styles.separator} />
          <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal} // Llama a la función de cierre y limpieza
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
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
  const [hsSecundariaModalVisible, setHsSecundariaModalVisible] =
    useState(false);
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
      <View style={[styles.container, { paddingTop: statusBarHeight,display:'flex',flexDirection:'column',justifyContent:'space-around',alignItems:'center' }]}>
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
            <Text style={styles.buttonText}>
              Simulador de Sueldo Provincial
            </Text>
          </TouchableOpacity>
        </View>

        <Image
          style={styles.image as ImageStyle}
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
