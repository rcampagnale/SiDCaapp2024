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
import styles from "../../styles/links/links-styles"; // Importando estilos
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
      style={styles.backButton} // Usamos el estilo extraído
      onPress={onPress}
    >
      <AntDesign name="back" size={24} color="black" />
      <Text style={styles.backButtonText}>Volver</Text>
    </TouchableOpacity>
  );
};

export default function ReferenceLinks() {
  const statusBarHeight: number | undefined = StatusBar.currentHeight;
  const [linkTo, setLinksTo] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const db = getFirestore(firebaseconn);
  const enlacesCollection = collection(db, "enlaces");

  const openInformation = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  // URL para el botón "Mi Catamarca"
  const miCatamarcaUrl =
    "https://api-mi.catamarca.gob.ar/accounts/login/?next=/openid/authorize%3Fclient_id%3D990406%26redirect_uri%3Dhttp%253A%252F%252Fmi.catamarca.gob.ar%252F%26response_type%3Dcode%26scope%3Dopenid%2Bprofile%2Bemail%26state%3Db326f7a361474c4697adcd201c4dc0ff%26code_challenge%3D1bUgdLkTi1TAwZLid6RoaVa_HaKLBLd1jrS0f3w8-90%26code_challenge_method%3DS256%26response_mode%3Dquery";

  useEffect(() => {
    const seeData = async () => {
      if (selectedOption === "Link Docente") {
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
      <View style={[styles.container, { paddingTop: statusBarHeight }]}>
        {/* Agregamos el StatusBar con fondo blanco y translucido */}
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent={true} // Hacer la barra de estado translucida
        />

        <Text style={styles.title1}>
          Red de Contactos e Información para el Docente
        </Text>

        {/* Agregando el rectángulo naranja */}
        <View style={styles.orangeRectangle}></View>

        <View style={styles.buttonWrapper}>
          {/* Botón "Mi Catamarca" */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => openInformation(miCatamarcaUrl)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/logos/logo_i1.png")} // Imagen como ícono
                style={{
                  width: 35,
                  height: 35,
                  marginRight: 10,
                  borderRadius: 10,
                }} // Ajustando tamaño y margen
              />
              <Text style={styles.buttonText}>Mi Catamarca</Text>
            </View>
          </TouchableOpacity>

          {/* Botón para el directorio de contactos docentes */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setSelectedOption("Link Docente")}
          >
            <Text style={styles.buttonText}>
              Directorio de Contactos Docentes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ajustando la imagen al ancho de la pantalla */}
        <Image
          style={styles.image}
          source={require("../../assets/somos/link.jpg")}
          resizeMode="contain" // Ajuste automático de la imagen
        />
      </View>
    );
  }

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
          <Text style={styles.title}>Directorio de Contactos Docentes</Text>
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
                  onPress={() => openInformation(e.data().link)}
                >
                  <Text style={styles.btnText}>Ver Información</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
