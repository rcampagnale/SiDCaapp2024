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
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";

export default function HandleCampusTeachers() {
  const statusBarHeight = StatusBar.currentHeight;

  // Estado para controlar la carga de datos
  const [loading, setLoading] = useState(true);
  const [dataTravel, setDataTravel] = useState<any>(null); // Cambié el tipo de estado para un solo objeto

  const analytics = getFirestore(firebaseconn);
  const docRef = doc(analytics, "cuotas", "sala"); // Accede al documento "sala" dentro de la colección "cuotas"

  // Cargar datos desde Firebase
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const docSnap = await getDoc(docRef); // Obtén el documento "sala"

        if (docSnap.exists()) {
          setDataTravel(docSnap.data()); // Si existe, guarda los datos del documento
        } else {
          alert("El documento 'sala' no existe en la colección 'cuotas'.");
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        alert(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // Verificar si el botón debe estar habilitado
  const isButtonEnabled = dataTravel && dataTravel.link;

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
            puden discutir temas de interés, tomar decisiones colectivas que
            puedan fortalecer la unidad. Equipada para facilitar reuniones y
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
              source={require("../../assets/sala/sala5.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala6.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala7.jpg")}
              resizeMode="cover"
            />
          </ScrollView>
        </View>

        {/* Mostrar descripción si existe */}
        {dataTravel && dataTravel.descripcion && (
          <View style={styles.viewInformation}>
            <Text style={styles.descripcionText}>{dataTravel.descripcion}</Text>
          </View>
        )}

        {/* Botón para ingresar a la reunión */}
        {loading ? (
          <Text>Cargando...</Text>
        ) : (
          <TouchableOpacity
            style={[
              styles.btnNews,
              {
                backgroundColor: isButtonEnabled ? "#005CFE" : "#A9A9A9",
              },
            ]}
            onPress={
              isButtonEnabled ? () => Linking.openURL(dataTravel.link) : null
            }
            activeOpacity={isButtonEnabled ? 0.7 : 1}
          >
            <Text style={styles.btnText}>Unirse a la Reunión</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
