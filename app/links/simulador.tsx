import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
} from "react-native";
import styles from "../../styles/links/links-styles"; // Asegúrate de tener los estilos correctamente importados
import { Picker } from "@react-native-picker/picker";
import { firebaseconn } from "@/constants/FirebaseConn";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import AntDesign from "@expo/vector-icons/AntDesign";

const SimuladorSueldo = ({ modalVisible, setModalVisible }) => {
  const [sueldoBasico, setSueldoBasico] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [adicAntiguedad, setAdicAntiguedad] = useState("0");
  const [zonaPagar, setZonaPagar] = useState("0.00");
  const [zonaFrontera, setZonaFrontera] = useState("");
  const [cantidadHoras, setCantidadHoras] = useState("");
  const [sueldoCalculado, setSueldoCalculado] = useState(0);
  const [finalSueldo, setFinalSueldo] = useState("0.00");
  const [totalDescuentos, setTotalDescuentos] = useState(0);
  const [totalHaberes, setTotalHaberes] = useState(0);
  const [jubilacion, setJubilacion] = useState(0);
  const [fondoEspecial, setFondoEspecial] = useState(0);
  const [descuentoOSEP, setDescuentoOSEP] = useState(0);
  const [regPrevEspDocente, setRegPrevEspDocente] = useState(0);
  const [nomencladorUrl, setNomencladorUrl] = useState(null);

  // Estado para manejar los cargos agregados
  const [cargos, setCargos] = useState<any[]>([]);

  const analytics = getFirestore(firebaseconn);

  const fetchNomenclador = async () => {
    try {
      const db = getFirestore();
      const snapshot = await getDocs(
        query(collection(db, "asesoramiento"), where("categoria", "==", "escala_salarial"))
      );
      const results = snapshot.docs
        .map((doc) => doc.data())
        .filter((doc) => doc.titulo === "NOMENCLADOR DE CARGO DOCENTE - ACUERDO SALARIAL");
      if (results.length > 0) {
        setNomencladorUrl(results[0].link);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNomenclador();
  }, []);

  useEffect(() => {
    if ((selectedOption === "catedra" || selectedOption === "superior") && cantidadHoras && sueldoBasico) {
      const sueldoBaseCalculado = parseFloat(cantidadHoras) * parseFloat(sueldoBasico);
      setSueldoCalculado(sueldoBaseCalculado);
    } else {
      setSueldoCalculado(parseFloat(sueldoBasico) || 0);
    }
  }, [selectedOption, cantidadHoras, sueldoBasico]);

  // Calcular adicional por antigüedad con base en el porcentaje seleccionado
  const antiguedadAPagar = sueldoCalculado * (parseFloat(adicAntiguedad) / 100);
  const descuentoSindical = (sueldoCalculado * 0.02).toFixed(2);

  useEffect(() => {
    if (sueldoCalculado && zonaFrontera) {
      const zona = parseFloat(zonaFrontera) / 100;
      const adicionalZona = (sueldoCalculado * zona).toFixed(2);
      setZonaPagar(adicionalZona);
    } else {
      setZonaPagar("0.00");
    }
  }, [sueldoCalculado, zonaFrontera]);

  const seguroVidaObligatorio = 1000;
  const subsidioSepelio = 1500;

  const handleSimulateSalary = () => {
    const haberes = sueldoCalculado + antiguedadAPagar + parseFloat(zonaPagar);
    setTotalHaberes(haberes);
    const nuevaJubilacion = (haberes * 0.11).toFixed(2);
    setJubilacion(nuevaJubilacion);
    const nuevoFondoEspecial = (haberes * 0.005).toFixed(2);
    setFondoEspecial(nuevoFondoEspecial);
    const nuevoDescuentoOSEP = (haberes * 0.045).toFixed(2);
    setDescuentoOSEP(nuevoDescuentoOSEP);
    const nuevoRegPrevEspDocente = (haberes * 0.02).toFixed(2);
    setRegPrevEspDocente(nuevoRegPrevEspDocente);
    const descuentos =
      parseFloat(nuevaJubilacion) +
      parseFloat(nuevoFondoEspecial) +
      parseFloat(nuevoDescuentoOSEP) +
      parseFloat(descuentoSindical) +
      parseFloat(nuevoRegPrevEspDocente) +
      seguroVidaObligatorio +
      subsidioSepelio;
    setTotalDescuentos(descuentos);
    const sueldoFinal = haberes - descuentos;
    setFinalSueldo(sueldoFinal.toFixed(2));
  };

  const handleCloseModal = () => {
    setSueldoBasico("");
    setCantidadHoras("");
    setSelectedOption("cargo");
    setSueldoCalculado(0);
    setFinalSueldo("0.00");
    setAdicAntiguedad("0");
    setZonaFrontera("0.00");
    setModalVisible(false);
  };

  const handleOptionChange = (itemValue) => {
    setSelectedOption(itemValue);
    setSueldoBasico("");
    setCantidadHoras("");
    setSueldoCalculado(0);
  };

  // Función para agregar un nuevo cargo al estado
  const handleAddCargo = () => {
    const nuevoCargo = {
      sueldoBasico,
      cantidadHoras,
      selectedOption,
      adicAntiguedad,
      zonaFrontera,
      sueldoCalculado,
      finalSueldo,
    };

    // Agregar el nuevo cargo al array de cargos
    setCargos((prevState) => [...prevState, nuevoCargo]);

    // Limpiar los campos del formulario
    setSueldoBasico("");
    setCantidadHoras("");
    setSelectedOption("");
    setAdicAntiguedad("0");
    setZonaFrontera("");
    setSueldoCalculado(0);
    setFinalSueldo("0.00");
  };

  return (
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Simulador de Recibo de Sueldo</Text>
          <View style={styles.separator} />
          <Text style={styles.modalDescription}>
            Este simulador proporciona una estimación aproximada del sueldo docente, considerando las horas trabajadas, el tipo de cargo
            (Maestro/a de grado, Nivel Inicial, Asesor, Preceptor, etc.) y las horas cátedra correspondientes para Nivel Secundario o Superior.
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

                <TextInput
                  style={[styles.input, { paddingLeft: 10 }]}
                  keyboardType="numeric"
                  placeholder="Ingrese Sueldo Base"
                  value={sueldoBasico}
                  onChangeText={setSueldoBasico}
                />

                {selectedOption === "catedra" && (
                  <TextInput
                    style={[styles.input, { paddingLeft: 10, marginTop: 10 }]}
                    keyboardType="numeric"
                    placeholder="Cantidad de Hs."
                    value={cantidadHoras}
                    onChangeText={setCantidadHoras}
                  />
                )}

                {selectedOption === "superior" && (
                  <TextInput
                    style={[styles.input, { paddingLeft: 10, marginTop: 10 }]}
                    keyboardType="numeric"
                    placeholder="Cantidad de Hs."
                    value={cantidadHoras}
                    onChangeText={setCantidadHoras}
                  />
                )}

                <View style={styles.separator} />

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
              
              {/* Sección de Remunerativos */}
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
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.simularButton}
                onPress={handleAddCargo} // Llama a la función para agregar un cargo
              >
                <Text style={styles.simularButtonText}>Agregar Cargo</Text>
              </TouchableOpacity>
              
              {/* Sección de descuentos */}
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
                <View style={[styles.rowContainer, { padding: 15 }]}>
                  <Text style={styles.titulodeopciones}>
                    Aportes Jubilatorios:
                  </Text>
                  <Text style={styles.sueldo}>$ {jubilacion}</Text>
                </View>
                <View style={[styles.rowContainer, { padding: 15 }]}>
                  <Text style={styles.titulodeopciones}>
                    Fondo Esp. Trasplantes y Trat. Oncol. (O.S.E.P.):
                  </Text>
                  <Text style={styles.sueldo}>$ {fondoEspecial}</Text>
                </View>
                <View style={[styles.rowContainer, { padding: 15 }]}>
                  <Text style={styles.titulodeopciones}>Descuento OSEP:</Text>
                  <Text style={styles.sueldo}>$ {descuentoOSEP}</Text>
                </View>
                <View style={[styles.rowContainer, { padding: 15 }]}>
                  <Text style={styles.titulodeopciones}>
                    Descuento SiDCa. (Sindicato):
                  </Text>
                  <Text style={styles.sueldo}>$ {descuentoSindical}</Text>
                </View>
                <View style={[styles.rowContainer, { padding: 15 }]}>
                  <Text style={styles.titulodeopciones}>
                    Reg.Prev.Esp. Docente:
                  </Text>
                  <Text style={styles.sueldo}>$ {regPrevEspDocente}</Text>
                </View>
                <View style={[styles.rowContainer, { padding: 15 }]}>
                  <Text style={styles.titulodeopciones}>
                    Seguro de Vida Obligatorio:
                  </Text>
                  <Text style={styles.sueldo}>$ {seguroVidaObligatorio}</Text>
                </View>
                <View style={[styles.rowContainer, { padding: 15 }]}>
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

              {/* Sueldo a cobrar */}
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
                <View style={[styles.rowContainer, { padding: 15 }]}>
                  <Text style={styles.titulodeopciones}>Sueldo a Cobrar:</Text>
                  <Text style={styles.sueldo}>$ {finalSueldo}</Text>
                </View>
              </View>

              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal} // Cierra el modal
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SimuladorSueldo;
