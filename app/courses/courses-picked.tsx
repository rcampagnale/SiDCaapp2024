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
  StatusBar,
} from "react-native";
import styles from "../../styles/courses/courses-styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import CertificadoEmitidoButton from "../../components/certificados/CertificadoEmitidoButton";
import { obtenerCursosConCertificado } from "../../components/certificados/certificadoApi";

/** Resuelve el ID académico desde una referencia de Firestore o su path. */
export function resolverCursoId(courseData: any, aprobacionDocId: string): string {
  const referencia = courseData?.curso;
  const path = typeof referencia === "string"
    ? referencia
    : typeof referencia?.path === "string"
      ? referencia.path
      : typeof referencia?.referenceValue === "string"
        ? referencia.referenceValue
        : "";

  const segmentos = path
    .replace(/^projects\/[^/]+\/databases\/\(default\)\/documents\//, "")
    .split("/")
    .filter(Boolean);
  const indiceCursos = segmentos.indexOf("cursos");
  if (indiceCursos >= 0 && segmentos[indiceCursos + 1]) {
    return segmentos[segmentos.length - 1];
  }

  const cursoIdDirecto = String(courseData?.cursoId || "").trim();
  return cursoIdDirecto || aprobacionDocId;
}

export default function CoursesTakenByMe() {
  const [courseAproved, setCourseAproved] = useState<
    {
      id: string;
      cursoId: string;
      titulo: string;
      imagen: string;
      aprobo: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [checkData, setCheckData] = useState(0);
  const [cursosConCertificado, setCursosConCertificado] = useState<Set<string>>(new Set());
  const { userData } = useContext(SidcaContext);
  const analytics = getFirestore(firebaseconn);
  const navigation = useNavigation();

  useEffect(() => {
    let activo = true;

    obtenerCursosConCertificado()
      .then((cursoIds) => {
        if (activo) setCursosConCertificado(cursoIds);
      })
      .catch(() => {
        if (activo) setCursosConCertificado(new Set());
      });

    return () => {
      activo = false;
    };
  }, []);

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

          const mappedCourses = cursosSnapshot.docs.map((doc) => {
            const courseData = doc.data();
            return {
              id: doc.id,
              cursoId: resolverCursoId(courseData, doc.id),
              titulo: courseData.titulo || "",
              imagen: courseData.imagen || "",
              aprobo: courseData.aprobo === true,
            };
          });

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
                style={{ width: "80%", height: "62%" }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                {e.aprobo === true ? "Curso Aprobado" : "Curso NO Aprobado"}
              </Text>
              <View style={styles.separator1} />
              {e.aprobo === true && cursosConCertificado.has(e.cursoId) && (
                <CertificadoEmitidoButton
                  cursoId={e.cursoId}
                  cursoTitulo={e.titulo}
                  dni={String(userData?.dni || "")}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
