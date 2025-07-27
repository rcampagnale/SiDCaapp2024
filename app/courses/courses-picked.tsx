import { useState, useContext, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { SidcaContext } from "../_layout";
import { firebaseconn } from "@/constants/FirebaseConn";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import styles from "../../styles/courses/courses-styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";

export default function CoursesTakenByMe() {
  const [courseAproved, setCourseAproved] = useState<
    {
      id: string;
      titulo: string;
      imagen: string;
      aprobo: boolean;
      resolucion: string;
      modalidad: string;
      fecha: string;
      dias: string;
      cargaHoraria: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [checkData, setCheckData] = useState(0);
  const { userData } = useContext(SidcaContext);
  const analytics = getFirestore(firebaseconn);
  const [loadingCertificadoId, setLoadingCertificadoId] = useState<
    string | null
  >(null);

  const navigation = useNavigation();

  useEffect(() => {
    const seeInfo = async () => {
      try {
        if (!userData) return;

        const userQuery = query(
          collection(analytics, "usuarios"),
          where("dni", "==", userData.dni)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const cursosQuery = query(
            collection(analytics, "usuarios", userDoc.id, "cursos"),
            where("estado", "==", "terminado")
          );
          const cursosSnapshot = await getDocs(cursosQuery);

          const mappedCourses = await Promise.all(
            cursosSnapshot.docs.map(async (doc) => {
              const courseData = doc.data();
              const certificadosQuery = query(
                collection(analytics, "certificados"),
                where("cursoId", "==", doc.id)
              );
              const certificadosSnapshot = await getDocs(certificadosQuery);

              if (!certificadosSnapshot.empty) {
                const certificadoData = certificadosSnapshot.docs[0].data();

                return {
                  id: doc.id,
                  titulo: courseData.titulo || "",
                  imagen: certificadoData.imagen || courseData.imagen || "",
                  aprobo: courseData.aprobo || false,
                };
              } else {
                return {
                  id: doc.id,
                  titulo: courseData.titulo || "",
                  imagen: courseData.imagen || "",
                  aprobo: courseData.aprobo || false,
                };
              }
            })
          );

          setCourseAproved(mappedCourses);
        } else {
          setCheckData(1);
        }
      } catch (error) {
        alert(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    seeInfo();
  }, [userData]);

  return (
    <View style={{ height: "100%", width: "100%", backgroundColor: "#091d24" }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View
        style={[
          styles.btnBackToOptions,
          { marginTop: StatusBar.currentHeight || 35 },
        ]}
      >
        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="back" size={24} color="black" />
          <Text style={{ fontSize: 18, marginLeft: 5 }}>Volver</Text>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 20,
          color: "#ffffff",
          width: "90%",
          marginHorizontal: "auto",
          height: "auto",
        }}
      >
        {checkData === 1 ? "No has finalizado ningún curso" : null}
      </Text>

      <ScrollView
        style={{ width: "95%", height: "80%", margin: "auto", paddingTop: 1 }}
        contentContainerStyle={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          rowGap: 15,
          paddingBottom: 40,
        }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : courseAproved.length === 0 ? (
          <Text
            style={{
              color: "#ffffff",
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 45,
            }}
          >
            No tienes Cursos Aprobados.
          </Text>
        ) : (
          courseAproved.map((e, i) => (
            <View style={styles.coursesDoneBox} key={i}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 17,
                  width: "100%",
                  textAlign: "center",
                  paddingBottom: 5,
                }}
              >
                {e.titulo}
              </Text>
              <Image
                source={{ uri: e.imagen }}
                style={{ width: "80%", height: "70%" }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                {e.aprobo === true ? "Curso Aprobado" : "Curso NO Aprobado"}
              </Text>
              <View style={styles.separator1} />

              {/* se urlizará el certificado digital en el futuro
              {e.aprobo && (
                <TouchableOpacity
                  style={styles.viewCertificateButton}
                  onPress={async () => {
                    setLoadingCertificadoId(e.id);
                    try {
                      const certificadosQuery = query(
                        collection(analytics, "certificados"),
                        where("titulo", "==", e.titulo)
                      );
                      const snapshot = await getDocs(certificadosQuery);

                      if (!snapshot.empty) {
                        router.push({
                          pathname: "/courses/certificados",
                          params: {
                            courseName: e.titulo,
                            userName: userData.nombre,
                            userLastName: userData.apellido,
                            userDni: userData.dni,
                          },
                        });
                      } else {
                        Alert.alert(
                          "Certificado Digital",
                          "El Certificado Digital no está disponible por el momento.",
                          [{ text: "Aceptar" }],
                          { cancelable: false }
                        );
                      }
                    } catch (error) {
                      console.error("Error al verificar certificado:", error);
                      Alert.alert(
                        "Error",
                        "Ocurrió un problema al buscar el certificado."
                      );
                    } finally {
                      setLoadingCertificadoId(null);
                    }
                  }}
                >
                  {loadingCertificadoId === e.id ? (
                    <ActivityIndicator size={30} color="#ffffff" />
                  ) : (
                    <Text style={{ color: "#ffffff", fontSize: 18 }}>
                      Ver Certificado
                    </Text>
                  )}
                </TouchableOpacity>
              )}
                */}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
