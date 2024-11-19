import {
  View,
  Text,
  StatusBar,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
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

  const analytics = getFirestore(firebaseconn);
  const coursesCollection = collection(analytics, "cursos"); // Colección de cursos
  const registroPruebaCollection = collection(analytics, "registro_prueba"); // Colección de prueba para registros de asistencia

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

  // Obtener la fecha actual
  useEffect(() => {
    const date = new Date();
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
    setCurrentDate(formattedDate);
  }, []);

  // Función para registrar la asistencia (en la colección de prueba)
  const registerAttendance = async () => {
    try {
      if (!selectedCourse || !selectedLevel) {
        alert("Por favor, seleccione un curso y un nivel educativo.");
        return;
      }

      // Agregar los datos de la asistencia a la colección de prueba en Firebase
      await addDoc(registroPruebaCollection, {
        apellido: userData?.apellido,
        nombre: userData?.nombre,
        dni: userData?.dni,
        departamento: userData?.departamento,
        nivel: selectedLevel,
        curso: selectedCourse,
        fecha: currentDate,
      });

      // Mostrar mensaje de éxito
      alert("Asistencia cargada con éxito");

      // Cerrar el modal después de registrar la asistencia
      toggleModal();
    } catch (error) {
      console.error("Error al registrar la asistencia:", error);
      alert("Error al registrar la asistencia. Intente nuevamente.");
    }
  };

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
                <View style={styles.modalContent}>
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
                    <Picker.Item label="Nivel Inicial" value="Nivel Inicial" />
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
                    onValueChange={(itemValue) => setSelectedCourse(itemValue)}
                  >
                    <Picker.Item label="Seleccione un curso" value="" />
                    {dataTravel.length === 0 ? (
                      <Picker.Item label="No se encontraron cursos" value="" />
                    ) : (
                      dataTravel.map((course: any) => (
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
                    style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}
                  >
                    Fecha: {currentDate}
                  </Text>

                  <TouchableOpacity
                    style={styles.btnCommon}
                    onPress={registerAttendance} // Registrar asistencia
                  >
                    <Text style={styles.commonBtnText}>
                      Registrar Asistencia
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
