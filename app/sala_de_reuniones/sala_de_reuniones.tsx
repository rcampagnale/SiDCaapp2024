import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import styles from "../../styles/sala_de_reuniones/sala_de_reuniones";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";

export default function HandleCampusTeachers() {
  const statusBarHeight = StatusBar.currentHeight;

  // Estado para controlar la carga de datos
  const [loading, setLoading] = useState(true);
  const [dataTravel, setDataTravel] = useState<any>([]); // Cambié el tipo de estado para ser un array

  const analytics = getFirestore(firebaseconn);
  const data = collection(analytics, "cuotas"); // Colección de novedades

  // Función para abrir el enlace
  const openOtherData = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  // Filtrar por categoría "Predio"
  const filteredData = query(data, where("categoria", "==", "predio"));

  // Cargar datos desde Firebase
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await getDocs(filteredData); // Usamos la consulta filtrada
        const dataList = res.docs.map((doc) => doc.data());

        // Asegúrate de que los datos sean un array
        setDataTravel(dataList);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        alert(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={{ fontSize: 24, color: "#ffffff" }}>
            Sala de Reuniones
          </Text>
        </View>
        <View style={styles.viewInformation}>
          <Text style={styles.text}>
            La Sala de Reuniones para los afiliados tiene como finalidad ofrecer
            un espacio de encuentro gremial donde los miembros del sindicato
            discutir temas de interés, tomar decisiones colectivas que puedan
            fortalecer la unidad. Equipada para facilitar reuniones y
            capacitaciones, fomenta la participación activa en asuntos laborales
            y educativos. Además, sirve como lugar para resolver inquietudes,
            compartir información relevante y organizar actividades que
            beneficien a los afiliados. Este espacio contribuye al
            fortalecimiento del movimiento sindical y a la construcción de un
            colectivo más sólido.
          </Text>
        </View>

        {/* Carrusel de imágenes (se mantienen las imágenes estáticas) */}
        <View style={styles.carruselContainer}>
          <ScrollView
            style={styles.carrusel}
            contentContainerStyle={{
              justifyContent: "space-between",
              alignItems: "center",
              columnGap: 15,
            }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala1.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala2.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala3.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala4.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio4.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio5.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio6.jpg")}
              resizeMode="cover"
            />
          </ScrollView>
        </View>

        {/* Botón para ingresar a la reunión */}
        <TouchableOpacity
          style={styles.btnNews}
          activeOpacity={1}
          onPress={() => alert("Redirigiendo a la reunión...")}
        >
          <Text>Ingresar a la Reunión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
