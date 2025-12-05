// src/app/(tabs)/index.tsx
import React, { useContext, useState, useEffect } from "react";
import {
  ImageBackground,
  StatusBar,
  Text,
  View,
  Dimensions,
  Modal,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/cedential/credential-styles";
import { SidcaContext } from "../_layout";

// 🔥 Firebase
import { firebaseconn } from "@/constants/FirebaseConn";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function GetCredentialCard() {
  const { userData } = useContext(SidcaContext);

  const [isVoteModalVisible, setIsVoteModalVisible] = useState(false);
  const [showVotoButton, setShowVotoButton] = useState(false); // 👈 depende de cod/votoCredencial

  const statusBarHeight = StatusBar.currentHeight ?? 0;
  const windowHeight = Dimensions.get("window").height;

  // ===========================
  // Leer cod/votoCredencial
  // ===========================
  useEffect(() => {
    const fetchVotoConfig = async () => {
      try {
        const db = getFirestore(firebaseconn);
        const ref = doc(db, "cod", "votoCredencial");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setShowVotoButton(!!data.habilitado);
        } else {
          setShowVotoButton(false);
        }
      } catch (error) {
        console.log("[Credencial] Error leyendo cod/votoCredencial", error);
        setShowVotoButton(false);
      }
    };

    fetchVotoConfig();
  }, []);

  // Datos de votación desde usuarios / nuevoAfiliado
  const mesaVotacion = userData?.mesaNro ?? "Sin asignar";
  const lugarVotacion = userData?.lugarVotacion ?? "Sin asignar";

  // WhatsApp SIDCA
  const handleOpenWhatsapp = () => {
    const phone = "+54 9 3834 25-0139"; // número: 383420139 con prefijo de país
    const url = `https://wa.me/${phone}`;
    Linking.openURL(url).catch((err) =>
      console.log("[Credencial] Error al abrir WhatsApp", err)
    );
  };

  if (!userData) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Cargando credencial...</Text>
      </View>
    );
  }

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <ImageBackground
        style={styles.container}
        source={require("../../assets/home/credential.jpeg")}
        resizeMode="cover"
      >
        {/* Columna izquierda: datos + botón */}
        <View style={styles.viewInfoContainer}>
          <View
            style={[
              { width: windowHeight - 20 },
              styles.mainInformationContainer,
            ]}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {userData.apellido ? `${userData.apellido}, ` : ""}
              {userData.nombre}
            </Text>

            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              DNI: {userData.dni}
            </Text>

            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Departamento: {userData.departamento ?? "Sin asignar"}
            </Text>

            {/* 👇 Solo se muestra si cod/votoCredencial.habilitado === true */}
            {showVotoButton && (
              <TouchableOpacity
                style={styles.voteButton}
                activeOpacity={0.8}
                onPress={() => setIsVoteModalVisible(true)}
              >
                <View style={{ marginRight: 6 }}>
                  <Ionicons name="location-outline" size={30} color="#333" />
                </View>
                <Text style={styles.voteButtonText}>¿Dónde voto?</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Columna central: título */}
        <View style={styles.cardNameContainer}>
          <Text
            style={{
              fontSize: 25,
              fontWeight: "500",
              transform: "rotateZ(90deg)",
              width: 300,
              marginTop: 180,
              color: "#ffffff",
            }}
          >
            Credencial de Afiliado
          </Text>
        </View>

        {/* Columna derecha: logos */}
        <View style={styles.logosHeaderContainer}>{/* logos aquí */}</View>
      </ImageBackground>

      {/* ===========================
          Modal ¿Dónde voto?
         =========================== */}
      <Modal
        visible={isVoteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsVoteModalVisible(false)}
      >
        <View style={styles.voteModalOverlay}>
          <View style={styles.voteModalContent}>
            <Text style={styles.voteModalTitle}>¿Dónde voto?</Text>

            <Text style={styles.voteModalText}>
              Mesa N°:{" "}
              <Text style={styles.voteModalHighlight}>{mesaVotacion}</Text>
            </Text>

            <Text style={styles.voteModalText}>
              Lugar de votación:{" "}
              <Text style={styles.voteModalHighlight}>{lugarVotacion}</Text>
            </Text>

            <Text style={[styles.voteModalText, { marginTop: 8 }]}>
             Si la mesa o el lugar de votación que figuran aquí no coinciden con tu domicilio actual o aparecen como “Sin asignar”, y querés solicitar un cambio, comunicate con SIDCA al siguiente número.
            </Text>

            {/* Botón SiDCa WhatsApp */}
            <TouchableOpacity
              style={styles.voteModalWhatsappButton}
              onPress={handleOpenWhatsapp}
              activeOpacity={0.9}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.voteModalWhatsappButtonText}>
                SiDCa WhatsApp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.voteModalCloseButton}
              onPress={() => setIsVoteModalVisible(false)}
            >
              <Text style={styles.voteModalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
