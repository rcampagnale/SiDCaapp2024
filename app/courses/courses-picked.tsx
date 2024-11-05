import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import styles from "../../styles/courses/courses-styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
import { useContext, useEffect, useState } from "react";
import { SidcaContext } from "../_layout";

interface HandleOptionsCourse {
  setActionType: (value: null | string) => void;
}

export default function CoursesTakenByMe({
  setActionType,
}: HandleOptionsCourse) {
  const [courseAproved, setCourseAproved] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkData, setCheckData] = useState<number>(0);
  const { userData } = useContext(SidcaContext);
  const analytics = getFirestore(firebaseconn);

  useEffect(() => {
    const seeInfo = async () => {
      try {
        if (!userData) return;

        // Consulta directa para obtener el usuario con el dni específico
        const userQuery = query(
          collection(analytics, "usuarios"),
          where("dni", "==", userData.dni)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          // Obtenemos el documento del usuario encontrado
          const userDoc = userSnapshot.docs[0];

          // Consulta para obtener los cursos terminados de este usuario
          const cursosQuery = query(
            collection(analytics, "usuarios", userDoc.id, "cursos"),
            where("estado", "==", "terminado")
          );
          const cursosSnapshot = await getDocs(cursosQuery);

          // Guardamos los cursos aprobados en el estado
          setCourseAproved(cursosSnapshot.docs);
        } else {
          setCheckData(1); // No se encontraron cursos terminados
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
      <View style={styles.btnBackToOptions}>
        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => setActionType(null)}
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
        style={{ width: "95%", height: "80%", margin: "auto", paddingTop: 20 }}
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
        ) : (
          courseAproved.map((e: any, i: number) => (
            <View style={styles.coursesDoneBox} key={i}>
              <Text style={{ fontWeight: "bold", width: "90%",textAlign:'center',height:'auto',paddingBottom:5 }}>
                {e.data().titulo}
              </Text>
              <Image
                src={e.data().imagen}
                style={{ width: '80%', height: '70%' }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {e.data().aprobo === true
                  ? "Curso Aprobado"
                  : "Curso NO Aprobado"}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
