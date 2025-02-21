import { useState, useContext, useEffect } from "react";
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
} from "react-native";
import styles from "../../styles/courses/courses-styles";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function CoursesTakenByMe({ setActionType }) {
  const [courseAproved, setCourseAproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkData, setCheckData] = useState(0);
  const { userData } = useContext(SidcaContext);
  const analytics = getFirestore(firebaseconn);

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

          setCourseAproved(cursosSnapshot.docs);
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
          courseAproved.map((e, i) => (
            <View style={styles.coursesDoneBox} key={i}>
              <Text
                style={{
                  fontWeight: "bold",
                  width: "90%",
                  textAlign: "center",
                  paddingBottom: 5,
                }}
              >
                {e.data().titulo}
              </Text>
              <Image
                source={{ uri: e.data().imagen }}
                style={{ width: "80%", height: "70%" }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 22, fontWeight: "bold" }}>
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
