import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SidcaContext } from "../_layout";
import styles from "@/styles/chatmodal/chatmodal";

export default function ChatbotModal() {
  const { userData } = useContext(SidcaContext);
  const fullName =
    userData?.apellido && userData?.nombre
      ? `${userData.apellido}, ${userData.nombre}`
      : userData?.nombre || "Usuario";

  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectorVisible, setSelectorVisible] = useState(true);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [contenidoProvincial, setContenidoProvincial] = useState("");
  const [contenidoLicencia, setContenidoLicencia] = useState("");
  const [contenidoGeneral, setContenidoGeneral] = useState("");
  const [modoConsulta, setModoConsulta] = useState("");
  const [loading, setLoading] = useState(false);

  const welcomeMessage = {
    id: "bienvenida",
    texto: `¡Hola ${fullName}! Soy el asistente virtual de SiDCa. Podés consultarme sobre capacitaciones, Beneficios, Estatuto Docente, Licencia o cualquier duda que tengas 📚💬`,
    tipo: "bot",
  };

  const preguntaSistemaMessage = {
    id: "pregunta-sistema",
    texto: "Antes de continuar, por favor seleccioná a qué sistema educativo perteneces:",
    tipo: "bot",
  };

  const toggleModal = () => {
    if (!visible) {
      setVisible(true);
      setMessages([welcomeMessage, preguntaSistemaMessage]);
      setSelectorVisible(true);
      setMostrarOpciones(false);
      setModoConsulta("");
      setInputText("");

      setTimeout(async () => {
        try {
          const estatutoRes = await fetch("https://raw.githubusercontent.com/rcampagnale/sidca-chatbot-docs/main/texto_provincial_para_firestore.txt");
          const estatutoText = await estatutoRes.text();
          setContenidoProvincial(estatutoText);

          const licenciaRes = await fetch("https://raw.githubusercontent.com/rcampagnale/sidca-chatbot-docs/main/REGIMEN_LICENCIAS_DOCENTES_COMPLETO.txt");
          const licenciaText = await licenciaRes.text();
          setContenidoLicencia(licenciaText);

          const generalRes = await fetch("https://raw.githubusercontent.com/rcampagnale/sidca-chatbot-docs/main/consultas%20generales.txt");
          const generalText = await generalRes.text();
          setContenidoGeneral(generalText);
        } catch (error) {
          console.error("❌ Error al cargar los archivos desde GitHub:", error);
        }
      }, 200);
    } else {
      setVisible(false);
      setMessages([]);
      setInputText("");
      setSelectorVisible(true);
      setMostrarOpciones(false);
      setModoConsulta("");
    }
  };

  const volverAlMenuPrincipal = () => {
    setMessages([welcomeMessage, preguntaSistemaMessage]);
    setSelectorVisible(true);
    setMostrarOpciones(false);
    setModoConsulta("");
  };

  const handleSendMessage = async (text: string) => {
    if (text.trim() === "") return;

    const newUserMessage = {
      id: Date.now().toString(),
      texto: text,
      tipo: "usuario",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setLoading(true);

    const inputLower = text.toLowerCase();

    if (inputLower.includes("provincial") || inputLower.includes("municipal")) {
      setSelectorVisible(false);
      setMostrarOpciones(true);

      const botResponse = {
        id: `respuesta-opciones`,
        texto: `Seleccioná una opción para continuar:`,
        tipo: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    } else if (mostrarOpciones && modoConsulta === "") {
      if (inputLower.includes("licencia")) {
        setModoConsulta("licencia");
        setMessages((prev) => [...prev, {
          id: "modo-licencia",
          texto: "Has seleccionado Régimen de Licencia. Ahora podés escribir tu consulta específica.",
          tipo: "bot",
        }]);
      } else if (inputLower.includes("estatuto")) {
        setModoConsulta("estatuto");
        setMessages((prev) => [...prev, {
          id: "modo-estatuto",
          texto: "Has seleccionado Estatuto del Docente. Ahora podés escribir tu consulta específica.",
          tipo: "bot",
        }]);
      } else if (inputLower.includes("consulta")) {
        setModoConsulta("general");
        setMessages((prev) => [...prev, {
          id: "modo-general",
          texto: "Has seleccionado Consulta General. Ahora podés escribir tu consulta específica.",
          tipo: "bot",
        }]);
      }
      setLoading(false);
    } else if (modoConsulta) {
      let textoUnificado = "";
      if (modoConsulta === "licencia") {
        textoUnificado = contenidoLicencia;
      } else if (modoConsulta === "estatuto") {
        textoUnificado = contenidoProvincial;
      } else {
        textoUnificado = contenidoGeneral;
      }

      let respuesta = buscarPorArticulo(text, textoUnificado);
      if (!respuesta) respuesta = buscarEnTexto(text, textoUnificado);

      const botResponse = {
        id: `respuesta-opcion-${Date.now()}`,
        texto: respuesta || "No encontré una respuesta clara para tu consulta.",
        tipo: "bot",
      };

      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    }
  };

  const buscarPorArticulo = (consulta: string, texto: string) => {
    const match = consulta.match(/art[íi]culo\s*(\d{1,3})/i);
    if (!match) return null;

    const numero = match[1];
    const regex = new RegExp(`art[íi]culo\\s*${numero}\\D`, "i");

    const secciones = texto.split(/(?=art[íi]culo\s*\d{1,3})/i);
    for (const s of secciones) {
      if (regex.test(s)) return s.trim();
    }

    return null;
  };

  const buscarEnTexto = (consulta: string, texto: string) => {
    const consultaLimpia = consulta.toLowerCase().trim();
    const lineas = texto.split("\n");

    const coincidenciasExactas = lineas.filter((linea) =>
      linea.toLowerCase().includes(consultaLimpia)
    );
    if (coincidenciasExactas.length > 0) {
      return coincidenciasExactas.slice(0, 5).join("\n");
    }

    const palabrasClave = consultaLimpia.split(" ");
    const coincidenciasParciales = lineas.filter((linea) =>
      palabrasClave.every((palabra) => linea.toLowerCase().includes(palabra))
    );

    if (coincidenciasParciales.length > 0) {
      return coincidenciasParciales.slice(0, 5).join("\n");
    }

    return null;
  };

  const renderSelector = () => {
    if (!selectorVisible) return null;
    return (
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => handleSendMessage("Provincial")}
        >
          <Text style={styles.selectorButtonText}>Provincial</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => handleSendMessage("Municipal")}
        >
          <Text style={styles.selectorButtonText}>Municipal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOpcionesConsulta = () => {
    if (!mostrarOpciones || modoConsulta) return null;
    return (
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => handleSendMessage("Régimen de Licencia")}
        >
          <Text style={styles.selectorButtonText}>Régimen de Licencia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => handleSendMessage("Estatuto del Docente")}
        >
          <Text style={styles.selectorButtonText}>Estatuto del Docente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => handleSendMessage("Consulta General")}
        >
          <Text style={styles.selectorButtonText}>Consulta General</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={toggleModal}>
        <Image
          source={require("@/assets/logos/Chatboot3.png")}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.header}>
              {`👋 Bienvenido al Asistente Virtual SiDCa 👋`}
            </Text>

            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const animatedValue = new Animated.Value(0);
                Animated.timing(animatedValue, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();

                const animatedStyle = {
                  opacity: animatedValue,
                  transform: [{ scale: animatedValue }],
                };

                return (
                  <Animated.View
                    style={[
                      animatedStyle,
                      styles.messageRow,
                      item.tipo === "usuario" ? styles.userRow : styles.botRow,
                    ]}
                  >
                    <Image
                      source={
                        item.tipo === "usuario"
                          ? require("@/assets/logos/chatdocente.png")
                          : require("@/assets/logos/Chatboot4.png")
                      }
                      style={styles.avatar}
                    />
                    <View
                      style={[
                        styles.messageBubble,
                        item.tipo === "usuario"
                          ? styles.userBubble
                          : styles.botBubble,
                      ]}
                    >
                      <Text style={styles.messageText}>{item.texto}</Text>
                    </View>
                  </Animated.View>
                );
              }}
            />

            {loading && (
              <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 10 }} />
            )}

            {renderSelector()}
            {renderOpcionesConsulta()}

            {!selectorVisible && (
              <TouchableOpacity
                style={{ alignSelf: "flex-end", marginRight: 8, marginBottom: 1 }}
                onPress={volverAlMenuPrincipal}
              >
                <Ionicons name="home" size={26} color="#007AFF" />
              </TouchableOpacity>
            )}

            {(modoConsulta !== "" || (!selectorVisible && !mostrarOpciones)) && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Escribí tu consulta..."
                  value={inputText}
                  onChangeText={setInputText}
                />
                <TouchableOpacity
                  style={styles.iconSendButton}
                  onPress={() => handleSendMessage(inputText)}
                >
                  <Ionicons name="send" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
