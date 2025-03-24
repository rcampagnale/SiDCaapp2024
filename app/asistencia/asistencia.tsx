import {
  View,
  Text,
  StatusBar,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import styles from "../../styles/asistencia/asistencia";
import { SidcaContext } from "../_layout";
import { useContext, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  addDoc,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";

const localImage = require("../../assets/logos/secretaria.png");

export default function HandleCampusTeachers() {
  const { userData } = useContext(SidcaContext); // Obtener datos del contexto
  const statusBarHeight = StatusBar.currentHeight;
  const windowHeight = Dimensions.get("window").height;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataTravel, setDataTravel] = useState<any>([]); // Cursos
  const [selectedCourse, setSelectedCourse] = useState(""); // Curso seleccionado
  const [selectedLevel, setSelectedLevel] = useState(""); // Nivel educativo seleccionado
  const [currentDate, setCurrentDate] = useState<string>(""); // Fecha actual
  const [isButtonEnabled, setIsButtonEnabled] = useState(false); // Estado del botón
  const [attendances, setAttendances] = useState([]); // Esto crea un estado vacío para las asistencias.

  const analytics = getFirestore(firebaseconn);
  const coursesCollection = collection(analytics, "cursos"); // Colección de cursos
  const asistenciaCollection = collection(analytics, "asistencia");
  const codCollection = collection(analytics, "cod");

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // Cargar los cursos desde Firebase
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const q = query(coursesCollection);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No se encontraron cursos en Firebase.");
          setDataTravel([]); // Limpia la lista si no hay cursos
        } else {
          const courses = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            titulo: doc.data().titulo, // Extrae el campo 'titulo'
          }));
          setDataTravel(courses); // Almacena los cursos en el estado
        }
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
        alert(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Verificar el estado del botón al cargar el modal
  useEffect(() => {
    const fetchButtonState = async () => {
      try {
        const docRef = doc(codCollection, "boton"); // Referencia al documento en 'cuotas'
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.warn(
            "El documento 'boton' no existe en la colección 'cuotas'."
          );
          setIsButtonEnabled(false); // Deshabilitar si el documento no existe
          return;
        }

        const cargarValue = docSnap.data().cargar;

        // Verificar el valor del campo 'cargar'
        if (cargarValue === "si") {
          setIsButtonEnabled(true); // Habilitar botón
        } else if (cargarValue === "no") {
          setIsButtonEnabled(false); // Deshabilitar botón
        } else {
          console.warn(`Valor inesperado para 'cargar': ${cargarValue}`);
          setIsButtonEnabled(false); // Manejar valores inesperados
        }
      } catch (error) {
        console.error("Error al verificar el estado del botón:", error);
        setIsButtonEnabled(false); // Deshabilitar en caso de error
      }
    };

    fetchButtonState(); // Llamar a la función
  }, [isModalVisible]); // Solo se ejecuta cuando el modal cambia de estado

  // Obtener la fecha actual
  useEffect(() => {
    const date = new Date();
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
    setCurrentDate(formattedDate);
  }, []);

  // Obtener las asistencias del usuario por DNI
  useEffect(() => {
    const fetchAttendancesByDni = async () => {
      try {
        const q = query(
          asistenciaCollection,
          where("dni", "==", userData?.dni)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
           setAttendances([]); // Limpia la lista si no hay asistencias
        } else {
          const asistenciaDocs = querySnapshot.docs.map((doc) => ({
            curso: doc.data().curso,
            fecha: doc.data().fecha,
          }));
          setAttendances(asistenciaDocs); // Almacena las asistencias en el estado
          }
      } catch (error) {
        
      }
    };

    if (userData?.dni) {
      fetchAttendancesByDni(); // Solo hace la consulta si el DNI está disponible
    }
  }, [userData?.dni]); // Dependiendo de los cambios en el DNI

  const registerAttendance = async () => {
    try {
      if (!selectedCourse || !selectedLevel) {
        alert("Por favor, seleccione un curso y un nivel educativo.");
        return;
      }

      if (!userData?.dni) {
        alert("No se encontró el DNI del usuario.");
        return;
      }

      // Consultar si ya existe una asistencia para el mismo DNI, curso y fecha
      const querySnapshot = await getDocs(
        query(
          asistenciaCollection,
          where("dni", "==", userData.dni),
          where("curso", "==", selectedCourse),
          where("fecha", "==", currentDate)
        )
      );

      if (!querySnapshot.empty) {
        alert("Ya has registrado asistencia para este curso el día de hoy.");
        return;
      }

      // Preparar datos con valores predeterminados para evitar errores en Firebase
      const asistencia = {
        apellido: userData?.apellido || "Sin apellido",
        nombre: userData?.nombre || "Sin nombre",
        dni: userData?.dni || "Sin DNI",
        departamento: userData?.departamento || "Sin departamento",
        nivelEducativo: selectedLevel,
        curso: selectedCourse,
        fecha: currentDate,
      };

      // Guardar en Firebase
      await addDoc(asistenciaCollection, asistencia);

      alert("Asistencia registrada con éxito");
      toggleModal(); // Cerrar el modal automáticamente después de registrar la asistencia
    } catch (error) {
      console.error("Error al registrar la asistencia:", error);
      alert("Error al registrar la asistencia. Intente nuevamente.");
    }
  };

  const renderAssistanceItem = ({ item }) => (
    <View
      style={{
        marginBottom: 15,
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
        <strong>Curso:</strong> {item.curso}
      </Text>
      <Text style={{ fontSize: 14, color: "#555" }}>
        <strong>Fecha:</strong> {item.fecha}
      </Text>
    </View>
  );

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
            <View style={[styles.modalContainer, { margin: 20 }]}>
              {loading ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                  <View
                    style={{
                      borderColor: "black",
                      borderWidth: 2,
                      borderRadius: 8,
                      padding: 10,
                    }}
                  >
                    <View style={styles.mainInformationContainer}>
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        Afiliado:{" "}
                        {userData?.apellido !== undefined
                          ? `${userData.apellido},`
                          : null}{" "}
                        {userData?.nombre}
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        D.N.I.: {userData?.dni}
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        Departamento:{" "}
                        {userData?.departamento === undefined
                          ? "Sin asignar"
                          : userData?.departamento}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.separator} />
                  <View
                    style={{
                      borderColor: "black",
                      borderWidth: 2,
                      borderRadius: 8,
                      padding: 20,
                    }}
                  >
                    {/* Selección de nivel educativo */}
                    <Text style={styles.modalText}>Nivel Educativo:</Text>
                    <Picker
                      selectedValue={selectedLevel}
                      style={styles.input}
                      onValueChange={(itemValue) => setSelectedLevel(itemValue)}
                    >
                      <Picker.Item
                        label="Seleccione un nivel educativo"
                        value=""
                      />
                      <Picker.Item
                        label="Nivel Inicial"
                        value="Nivel Inicial"
                      />
                      <Picker.Item
                        label="Nivel Primario"
                        value="Nivel Primario"
                      />
                      <Picker.Item
                        label="Nivel Secundario"
                        value="Nivel Secundario"
                      />
                      <Picker.Item
                        label="Nivel Superior"
                        value="Nivel Superior"
                      />
                    </Picker>

                    {/* Selección del curso */}
                    <Text style={styles.modalText}>Seleccionar Curso:</Text>
                    <Picker
                      selectedValue={selectedCourse}
                      style={styles.input}
                      onValueChange={(itemValue) =>
                        setSelectedCourse(itemValue)
                      }
                    >
                      <Picker.Item label="Seleccione un curso" value="" />
                      {dataTravel.length === 0 ? (
                        <Picker.Item
                          label="No se encontraron cursos"
                          value=""
                        />
                      ) : (
                        dataTravel.map((course) => (
                          <Picker.Item
                            key={course.id}
                            label={course.titulo}
                            value={course.titulo}
                          />
                        ))
                      )}
                    </Picker>

                    {/* Mostrar la fecha debajo de la lista de cursos */}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        marginTop: -8,
                      }}
                    >
                      Fecha: {currentDate}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.btnCommon,
                        {
                          backgroundColor: isButtonEnabled
                            ? "#005CFE"
                            : "#A9A9A9",
                        },
                      ]}
                      onPress={isButtonEnabled ? registerAttendance : null}
                      activeOpacity={isButtonEnabled ? 0.7 : 1}
                    >
                      <Text style={styles.commonBtnText}>
                        Registrar Asistencia
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.separator} />

                  {/* Mostrar las asistencias cargadas */}
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
                    Asistencias cargadas:
                  </Text>
                  <View
                    style={{
                      borderColor: "black",
                      borderWidth: 2,
                      borderRadius: 8,
                      padding: 10,
                    }}
                  >
                    {Object.entries(
                      attendances
                        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar por fecha descendente
                        .reduce((acc, item) => {
                          if (!acc[item.curso]) {
                            acc[item.curso] = [];
                          }
                          acc[item.curso].push(item);
                          return acc;
                        }, {})
                    ).map(([curso, asistencias], index) => (
                      <View
                        key={index}
                        style={{
                          marginTop: 10,
                          padding: 10,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                          Curso: {curso}
                        </Text>
                        {asistencias.map((item, i) => (
                          <Text key={i} style={{ fontSize: 14, color: "#555" }}>
                            Fecha: {item.fecha}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
              <View style={styles.separator} />
              <TouchableOpacity style={styles.btnCommon} onPress={toggleModal}>
                <Text style={styles.commonBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
