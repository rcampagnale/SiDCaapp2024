import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  GestureResponderEvent,
  Linking,
} from "react-native";
import styles from "../../styles/links/links-styles";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { AntDesign } from "@expo/vector-icons";
import { firebaseconn } from "@/constants/FirebaseConn";

const SimuladorSueldo = ({ modalVisible, setModalVisible }) => {
  const [nomencladorUrl, setNomencladorUrl] = useState(null);
  const [cargos, setCargos] = useState<
    Array<{
      name: string;
      selectedOption: string;
      sueldoBasico: string;
      cantidadHoras: string;
      adicAntiguedad: string;
      antiguedadAPagar: number;
      zonaFrontera: string;
      zonaPagar: number;
      sueldoBaseCalculado: number;
    }>
  >([]); // Estado para manejar cargos individuales
  const [zonaFrontera, setZonaFrontera] = useState("");
  const [cuatrimestral, setCuatrimestral] = useState(""); // Define cuatrimestral state
  const [anual, setAnual] = useState(""); // Define anual state
  const [valor, setValor] = useState(""); // Define valor state
  const [regPrevEspDocente, setRegPrevEspDocente] = useState(0); // Define regPrevEspDocente with an initial value
  const [descuentoSindical, setDescuentoSindical] = useState(0); // Define descuentoSindical with an initial value
  const [descuentoOSEP, setDescuentoOSEP] = useState(0); // Define descuentoOSEP with an initial value
  const [fondoEspecial, setFondoEspecial] = useState(0); // Define fondoEspecial with an initial value
  const [jubilacion, setJubilacion] = useState(0); // Define jubilacion with an initial value
  const [subsidioSepelio, setSubsidioSepelio] = useState(0); // Define subsidioSepelio with an initial value
  const [seguroVidaObligatorio, setSeguroVidaObligatorio] = useState(0); // Define seguroVidaObligatorio with an initial value

  // Fetch nomenclador URL from Firestore
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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNomenclador();
  }, []);

  // valor Hs cátedra secundario
  const fetchValor = async () => {
    try {
      const db = getFirestore();
      const docRef = doc(db, "cod", "secundaria"); // Obtén el documento "secundaria" de la colección "cod"
      const docSnap = await getDoc(docRef); // Obtén el documento

      if (docSnap.exists()) {
        // Verifica si el documento existe y luego accede al campo 'valor'
        const valorRecibido = docSnap.data().valor;
        setValor(valorRecibido); // Establece el valor en el estado
      } else {
        console.log("El documento no existe");
      }
    } catch (error) {
      console.error("Error al obtener el valor: ", error);
    }
  };

  // Función para obtener valores de Firestore desde el documento "superior" en la colección "cod"
  const fetchValoresSuperior = async () => {
    try {
      const db = getFirestore(); // Obtener la instancia de Firestore
      const docRef = doc(db, "cod", "superior"); // Obtener referencia al documento "superior"
      const docSnap = await getDoc(docRef); // Obtener el documento de Firestore

      if (docSnap.exists()) {
        // Verifica si el documento existe
        const datos = docSnap.data(); // Obtener los datos del documento
        const anualRecibido = datos.anual; // Obtener el campo 'anual'
        const cuatrimestralRecibido = datos.cuatrimestral; // Obtener el campo 'cuatrimestral'

        // Establecer los valores en el estado
        setAnual(anualRecibido);
        setCuatrimestral(cuatrimestralRecibido);
      } else {
        console.log("El documento 'superior' no existe en Firestore.");
      }
    } catch (error) {
      // Si ocurre un error, lo mostramos en la consola
      console.error("Error al obtener los valores desde Firestore: ", error);
    }
  };

  // Fetch subsidioSepelio y seguroVidaObligatorio from Firestore
  const fetchValores = async () => {
    try {
      const db = getFirestore(firebaseconn); // Asegúrate de que firebaseconn esté bien configurado

      // Obtener el documento 'subsidioSepelio'
      const docRefSubsidioSepelio = doc(db, "cod", "subsidioSepelio"); // Referencia al documento 'subsidioSepelio'
      const docSnapSubsidioSepelio = await getDoc(docRefSubsidioSepelio); // Obtener el documento

      if (docSnapSubsidioSepelio.exists()) {
        const valorSubsidioSepelio = docSnapSubsidioSepelio.data().valor;
        setSubsidioSepelio(valorSubsidioSepelio); // Establece el valor de 'subsidioSepelio'
      } else {
        console.log("El documento 'subsidioSepelio' no existe");
      }

      // Obtener el documento 'seguroVidaObligatorio'
      const docRefSeguroVidaObligatorio = doc(
        db,
        "cod",
        "seguroVidaObligatorio"
      ); // Referencia al documento 'seguroVidaObligatorio'
      const docSnapSeguroVidaObligatorio = await getDoc(
        docRefSeguroVidaObligatorio
      ); // Obtener el documento

      if (docSnapSeguroVidaObligatorio.exists()) {
        const valorSeguroVidaObligatorio =
          docSnapSeguroVidaObligatorio.data().valor;
        setSeguroVidaObligatorio(valorSeguroVidaObligatorio); // Establece el valor de 'seguroVidaObligatorio'
      } else {
        console.log("El documento 'seguroVidaObligatorio' no existe");
      }
    } catch (error) {
      console.error("Error al obtener los valores: ", error);
    }
  };

  useEffect(() => {
    fetchValoresSuperior(); // Llamada a la función para obtener los valores
  }, []); // Se ejecuta una sola vez al montar el componente

  useEffect(() => {
    fetchValores(); // Llamada a la función para obtener los valores
  }, []); // Se ejecuta una sola vez al montar el componente

  useEffect(() => {
    fetchValor(); // Llamada a la función para obtener el valor
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  useEffect(() => {
    fetchValor(); // Llamada a la función para obtener el valor
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  // Function to delete a cargo
  const handleDeleteCargo = (index: number) => {
    // Recalcular los nombres de los cargos para que sean secuenciales
    const updatedCargos = cargos.filter((_, idx) => idx !== index); // Remove the cargo at the specified index
    const updatedCargosWithNames = updatedCargos.map((cargo, idx) => ({
      ...cargo,
      name: `Cargo ${idx + 1}`, // Adjust the name of the cargo based on the index
    }));

    setCargos(updatedCargosWithNames);
  };

  function handleCloseModal(event: GestureResponderEvent): void {
    setModalVisible(false); // Cierra el modal al cambiar el estado
  }

  function handleCargoChange(
    index: number,
    field: string,
    value: string
  ): void {
    const updatedCargos = [...cargos];
    const cargoToUpdate = { ...updatedCargos[index], [field]: value };

    // Update calculated fields if necessary
    if (field === "sueldoBasico" || field === "cantidadHoras") {
      const sueldoBasico = parseFloat(cargoToUpdate.sueldoBasico) || 0;
      const cantidadHoras = parseFloat(cargoToUpdate.cantidadHoras) || 0;

      if (
        cargoToUpdate.selectedOption === "catedra" ||
        cargoToUpdate.selectedOption === "superior"
      ) {
        cargoToUpdate.sueldoBaseCalculado = sueldoBasico * cantidadHoras;
      } else {
        cargoToUpdate.sueldoBaseCalculado = sueldoBasico;
      }
    }

    if (field === "adicAntiguedad") {
      const antiguedadPercentage = parseFloat(value) || 0;
      cargoToUpdate.antiguedadAPagar =
        (cargoToUpdate.sueldoBaseCalculado * antiguedadPercentage) / 100;
    }

    if (field === "zonaFrontera") {
      const zonaPercentage = parseFloat(value) || 0;
      cargoToUpdate.zonaPagar =
        (cargoToUpdate.sueldoBaseCalculado * zonaPercentage) / 100;
    }

    updatedCargos[index] = cargoToUpdate;
    setCargos(updatedCargos);
  }

  // Cálculo de los aportes jubilatorios: Sumar los remunerativos por cada cargo y aplicar el 11%
  const totalRemunerativos = cargos.reduce((total, cargo) => {
    const remunerativo =
      cargo.sueldoBaseCalculado + cargo.antiguedadAPagar + cargo.zonaPagar;
    return total + remunerativo;
  }, 0);

  // Cálculo de los aportes jubilatorios (11% de los remunerativos)
  const aportesJubilatorios = totalRemunerativos * 0.11;

  // Cálculo del fondo especial (0.5% de los remunerativos)
  const fondoEspecialCalculado = totalRemunerativos * 0.005;

  // Cálculo del descuento OSEP (4.5% de los remunerativos)
  const descuentoOSEPCalculado = totalRemunerativos * 0.045;

  // Sumar todos los sueldos base calculados (sueldo base * cantidad de horas si aplica)
  const totalSueldoBase = cargos.reduce((total, cargo) => {
    const sueldoBaseCalculado = cargo.sueldoBaseCalculado || 0; // Usamos sueldoBaseCalculado
    return total + sueldoBaseCalculado;
  }, 0);

  // Calcular el descuento SiDCa (2% de la suma de todos los sueldos base calculados)
  const descuentoSiDCaCalculado = totalSueldoBase * 0.02;

  // Cálculo del Reg.Prev.Esp. Docente (2% de los remunerativos)
  const regPrevEspDocenteCalculado = totalRemunerativos * 0.02;

  function handleAddCargo(event: GestureResponderEvent): void {
    const newCargo = {
      name: `Cargo ${cargos.length + 1}`,
      selectedOption: "cargo",
      sueldoBasico: "",
      cantidadHoras: "",
      adicAntiguedad: "",
      antiguedadAPagar: 0,
      zonaFrontera: "",
      zonaPagar: 0,
      sueldoBaseCalculado: 0,
    };
    setCargos([...cargos, newCargo]);
  }

  const totalDescuentos =
    (Number(aportesJubilatorios) || 0) +
    (Number(fondoEspecialCalculado) || 0) +
    (Number(descuentoOSEPCalculado) || 0) +
    (Number(descuentoSiDCaCalculado) || 0) +
    (Number(regPrevEspDocenteCalculado) || 0) +
    (Number(seguroVidaObligatorio) || 0) +
    (Number(subsidioSepelio) || 0);

  // Calcular el sueldo final (remunerativos - descuentos)
  const finalSueldo = totalRemunerativos - totalDescuentos;

  // Función para formatear números como moneda con toLocaleString
  const formatCurrency = (amount) => {
    return amount
      .toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(" ", ""); // Elimina el espacio adicional en el símbolo de la moneda
  };
  // Funciones para limpiar todos los valores y resetear el estado
  const resetAllStates = () => {
    setCargos([]);
    setZonaFrontera("");
    setRegPrevEspDocente(0);
    setDescuentoSindical(0);
    setDescuentoOSEP(0);
    setFondoEspecial(0);
    setJubilacion(0);
  };

  return (
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Simulador de Recibo de Sueldo</Text>
          <View style={styles.separator} />
          <Text style={styles.modalDescription}>
            Tutorial de uso del simulador de sueldo para cargos docentes. Si
            desea consultar el sueldo base, podrá acceder al Nomenclador de
            Cargo Docente, que se encuentra disponible al final de la página del
            simulador.{"\n"}
            <Text
              style={{ color: "blue", textDecorationLine: "underline" ,}}
              onPress={() =>
                Linking.openURL(
                  "https://youtube.com/shorts/aY5WMLpTqlQ?feature=share"
                )
              }
            >
              <AntDesign name="youtube" size={30} color="red" /> Ver Tutorial del Simulador
            </Text>
          </Text>
          <View style={styles.separator} />
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Button to add a new "cargo" */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleAddCargo}
            >
              <Text style={styles.closeButtonText}>Agregar Cargo</Text>
            </TouchableOpacity>

            <View style={styles.separator} />
            {/* Show added cargos */}
            {cargos.map((cargo, index) => (
              <View key={index}>
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
                      backgroundColor: "#f0f0f0",
                    },
                  ]}
                >
                  {cargo.name}
                </Text>

                {/* Options for the added cargo */}
                <View
                  style={{
                    borderColor: "black",
                    borderWidth: 2,
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  <Text style={styles.titulodeopciones}>
                    Seleccione tipo de Cargo/Hs Cátedra:
                  </Text>
                  <Picker
                    selectedValue={cargo.selectedOption}
                    onValueChange={(value) =>
                      handleCargoChange(index, "selectedOption", value)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Cargo/Maestro/Inicial" value="cargo" />
                    <Picker.Item
                      label="Hs. Cátedra Secundaria"
                      value="catedra"
                    />
                    <Picker.Item
                      label="Hs. Cátedra Superior"
                      value="superior"
                    />
                  </Picker>

                  <TextInput
                    style={[styles.input, { paddingLeft: 10 }]}
                    keyboardType="numeric"
                    placeholder="Ingrese Sueldo Base"
                    value={cargo.sueldoBasico}
                    onChangeText={(value) =>
                      handleCargoChange(index, "sueldoBasico", value)
                    }
                  />

                  {/* Field for hours (only if "Hs Cátedra" is selected) */}
                  {cargo.selectedOption === "catedra" && (
                    <TextInput
                      style={[styles.input, { paddingLeft: 10, marginTop: 10 }]}
                      keyboardType="numeric"
                      placeholder="Cantidad de Hs."
                      value={cargo.cantidadHoras}
                      onChangeText={(value) =>
                        handleCargoChange(index, "cantidadHoras", value)
                      }
                    />
                  )}

                  {/* Field for hours (only if "Hs Superior" is selected) */}
                  {cargo.selectedOption === "superior" && (
                    <TextInput
                      style={[styles.input, { paddingLeft: 10, marginTop: 10 }]}
                      keyboardType="numeric"
                      placeholder="Cantidad de Hs."
                      value={cargo.cantidadHoras}
                      onChangeText={(value) =>
                        handleCargoChange(index, "cantidadHoras", value)
                      }
                    />
                  )}

                  {/* Help Icon and Message for "Hs Cátedra Secundaria" */}
                  {cargo.selectedOption === "catedra" && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <AntDesign name="warning" size={30} color="black" />

                      <Text style={styles.helpMessage}>
                        Valor Hs Cátedra Nivel Secundario:{"\n"}{" "}
                        {valor || "Cargando..."}
                      </Text>
                    </View>
                  )}

                  {/* Help Icon and Message for "Hs Cátedra Superior" */}
                  {cargo.selectedOption === "superior" && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <AntDesign name="warning" size={30} color="black" />

                      <Text style={styles.helpMessage}>
                        Valor de Horas Cátedra Nivel Superior:
                        {"\n"}*Hs Cátedra Cuatrimestral: {"\n"}{" "}
                        {cuatrimestral || "Cargando..."} {"\n"}*Hs Cátedra
                        Anual:{"\n"}
                        {anual || "Cargando..."}
                      </Text>
                    </View>
                  )}

                  <View style={styles.separator} />
                  {/* Sueldo Base Calculated */}
                  <View style={styles.rowContainer}>
                    <Text style={styles.titulodeopciones}>Sueldo Base:</Text>
                    <Text style={styles.sueldo}>
                      $ {cargo.sueldoBaseCalculado.toFixed(2)}
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
                      selectedValue={cargo.adicAntiguedad}
                      onValueChange={(value) =>
                        handleCargoChange(index, "adicAntiguedad", value)
                      }
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
                      $ {cargo.antiguedadAPagar.toFixed(2)}
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
                    <Text style={styles.titulodeopciones}>Ubicación Geográfica(Zona):</Text>
                    <Picker
                      selectedValue={cargo.zonaFrontera}
                      onValueChange={(value) =>
                        handleCargoChange(index, "zonaFrontera", value)
                      }
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
                    <Text style={styles.sueldo}>
                      $ {cargo.zonaPagar.toFixed(2)}
                    </Text>
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
                    <Text style={styles.sueldo}>
                      ${" "}
                      {(
                        cargo.sueldoBaseCalculado +
                        cargo.antiguedadAPagar +
                        cargo.zonaPagar
                      ).toFixed(2)}
                    </Text>
                  </Text>
                </View>

                {/* Button to delete the cargo */}
                <TouchableOpacity
                  style={styles.simularButton}
                  onPress={() => handleDeleteCargo(index)}
                >
                  <Text style={styles.simularButtonText}>Eliminar Cargo</Text>
                </TouchableOpacity>
                <View style={styles.separator} />
              </View>
            ))}
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
                <Text style={styles.sueldo}>
                  $ {aportesJubilatorios.toFixed(2)}
                </Text>
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
                <Text style={styles.sueldo}>
                  $ {fondoEspecialCalculado.toFixed(2)}
                </Text>
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
                <Text style={styles.sueldo}>
                  $ {descuentoOSEPCalculado.toFixed(2)}
                </Text>
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
                <Text style={styles.sueldo}>
                  $ {descuentoSiDCaCalculado.toFixed(2)}
                </Text>
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
                <Text style={styles.sueldo}>
                  $ {regPrevEspDocenteCalculado.toFixed(2)}
                </Text>
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
                <Text style={styles.sueldo}>
                  $ {totalDescuentos.toFixed(2)}
                </Text>
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
            <View>
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
                <Text style={styles.sueldo}>$ {finalSueldo.toFixed(2)}</Text>
              </View>
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
            onPress={handleCloseModal}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SimuladorSueldo;
