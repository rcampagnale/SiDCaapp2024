import React, { useState, useEffect } from "react";
import {
  View,
  StatusBar,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
} from "react-native";
import styles from "../../styles/links/links-styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import { firebaseconn } from "@/constants/FirebaseConn";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const BackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={{
        width: "100%",
        backgroundColor: "#fea200", // Color de fondo naranja
        paddingVertical: 10, // Ajusta el tamaño vertical del botón
        flexDirection: "row", // Alinea el ícono a la izquierda del texto
        justifyContent: "flex-start", // Alinea los elementos al inicio (a la izquierda)
        alignItems: "center", // Centra verticalmente los elementos dentro del botón
        marginBottom: 20, // Espacio debajo del botón
      }}
      onPress={onPress}
    >
      {/* Ícono a la izquierda */}
      <AntDesign name="back" size={24} color="black" />
      {/* Texto "Volver" */}
      <Text style={{ fontSize: 18, marginLeft: 5 }}>Volver</Text>
    </TouchableOpacity>
  );
};

export default function ReferenceLinks() {
  const statusBarHeight: number | undefined = StatusBar.currentHeight;
  const [linkTo, setLinksTo] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // Estado para manejar la opción seleccionada
  const db = getFirestore(firebaseconn);
  const enlacesCollection = collection(db, "enlaces");

  const openInformation = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  useEffect(() => {
    const seeData = async () => {
      if (selectedOption === "Link Docente") {
        // Solo carga los enlaces si se selecciona "Link Docente"
        try {
          setLoading(true);
          const queryFirebase = query(
            enlacesCollection,
            where("prioridad", "!=", 0)
          );
          const querySnapshot = (await getDocs(queryFirebase)).docs;
          setLinksTo(querySnapshot);
        } catch (error) {
          alert("Ocurrió un error");
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };
    seeData();
  }, [selectedOption]);

  if (!selectedOption) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#091d24", // Color de fondo especificado
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: StatusBar.currentHeight || 0, // Ajuste para no cubrir la cámara
          marginTop: StatusBar.currentHeight || 20, // Espaciado desde la parte superior
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: 30,
            textAlign: "center",
            top: -90, // Alineamos el rectángulo en la parte superior
          }}
        >
          Red de Contactos e Información para el Docente
        </Text>
        {/* Rectángulo naranja */}
        <View
          style={{
            width: "200%", // Ancho completo
            height: 250, // Altura del rectángulo
            backgroundColor: "#fea200", // Color de fondo naranja
            marginBottom: 2, // Espacio debajo del rectángulo
            position: "absolute", // Fijamos la posición para que quede detrás de los botones
            top: 200, // Alineamos el rectángulo en la parte superior
            zIndex: -1, // Colocamos el rectángulo detrás de los botones
          }}
        />

        <View
          style={{
            width: "100%",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            gap: 20,
            zIndex: 1, // Aseguramos que los botones queden encima
          }}
        >
          {/* Botón Mi App Catamarca */}
          <TouchableOpacity
            style={{
              width: "100%",
              padding: 20,
              borderRadius: 10,
              backgroundColor: "#005CFE", // Color gris para el estado deshabilitado
              alignItems: "center",
              elevation: 5,
            }}
            onPress={() => {}}
            disabled={true} // Deshabilita el botón
          >
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Mi Catamarca
            </Text>
          </TouchableOpacity>

          {/* Botón Link Docente */}
          <TouchableOpacity
            style={{
              width: "100%",
              padding: 20,
              borderRadius: 10,
              backgroundColor: "#005CFE",
              alignItems: "center",
              elevation: 5,
            }}
            onPress={() => setSelectedOption("Link Docente")}
          >
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Directorio de Contactos Docentes
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontSize: 15,
            color: "#091d24",
            marginTop: 170,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Selecciona una opción para continuar
        </Text>
        {/* Imagen debajo del rectángulo */}
        <Image
          style={{ width: 500, height: 140 }}
          source={require("../../assets/somos/link.jpg")} // Ruta local de la imagen
          resizeMode="cover"
        />
      </View>
    );
  }

  // Funcionalidad de "Servicio Docente"
  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <BackButton onPress={() => setSelectedOption(null)} />
        <ScrollView
          contentContainerStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 10,
            rowGap: 10,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              color: "#ffffff",
            }}
          >
            Directorio de Contactos Docentes
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            linkTo.map((e: any, i: number) => (
              <View style={styles.coursesDoneBox} key={i}>
                <Text
                  style={{
                    fontWeight: "bold",
                    width: "90%",
                    textAlign: "center",
                  }}
                >
                  {e.data().titulo}
                </Text>
                <Text style={{ fontSize: 18, width: "90%" }}>
                  {e.data().descripcion}
                </Text>
                <TouchableOpacity
                  style={styles.btnGetLink}
                  onPress={() => openInformation(e.data().link)}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: "#ffffff",
                      fontWeight: "bold",
                    }}
                  >
                    Ver Información
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
