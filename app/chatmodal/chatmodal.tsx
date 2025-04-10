import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SidcaContext } from "../_layout";
import styles from "@/styles/chatmodal/chatmodal";
import Fuse from "fuse.js";

export default function ChatbotModal() {
  const { userData } = useContext(SidcaContext);
  const fullName = userData?.apellido && userData?.nombre
    ? `${userData.apellido}, ${userData.nombre}`
    : userData?.nombre || "Usuario";

  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectorVisible, setSelectorVisible] = useState(true);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [modoConsulta, setModoConsulta] = useState("");
  const [loading, setLoading] = useState(false);
  const [contenidoUnificado, setContenidoUnificado] = useState<any[]>([]);

  const welcomeMessage = {
    id: "bienvenida",
    texto: `¡Hola ${fullName}! Soy el asistente virtual de SiDCa. Podés consultarme sobre capacitaciones, beneficios, Estatuto Docente, Licencia o cualquier duda que tengas 📚💬`,
    tipo: "bot",
  };

  const preguntaSistemaMessage = {
    id: "pregunta-sistema",
    texto: "Antes de continuar, por favor seleccioná a qué sistema educativo perteneces:",
    tipo: "bot",
  };

  const buscarInteligente = (consulta, datos) => {
    const fuse = new Fuse(datos, {
      keys: ["contenido", "pregunta", "respuesta"],
      threshold: 0.3,
      minMatchCharLength: 3,
      includeScore: true,
      ignoreLocation: true,
    });
    const resultados = fuse.search(consulta);
    return resultados.length > 0 ? [resultados[0].item] : [];
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
          const estatutoRes = await fetch("https://raw.githubusercontent.com/rcampagnale/sidca-chatbot-docs/main/texto_provincial_para_firestore.json");
          const estatutoJson = (await estatutoRes.json()).map(item => ({ ...item, origen: 'estatuto' }));

          const licenciaRes = await fetch("https://raw.githubusercontent.com/rcampagnale/sidca-chatbot-docs/main/regimen_licencias_docentes.json");
          const licenciaJson = (await licenciaRes.json()).map(item => ({ ...item, origen: 'licencia' }));

          const generalRes = await fetch("https://raw.githubusercontent.com/rcampagnale/sidca-chatbot-docs/main/consultas_generales.json");
          const generalJson = (await generalRes.json()).map(item => ({ ...item, origen: 'general' }));

          setContenidoUnificado([...estatutoJson, ...licenciaJson, ...generalJson]);
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

  const handleSendMessage = async (text: string) => {
    if (text.trim() === "") return;
    const newUserMessage = { id: Date.now().toString(), texto: text, tipo: "usuario" };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setLoading(true);

    const inputLower = text.toLowerCase();

    if (inputLower.includes("provincial") || inputLower.includes("municipal")) {
      setSelectorVisible(false);
      setMostrarOpciones(true);
      setMessages((prev) => [...prev, { id: `respuesta-opciones`, texto: `Seleccioná una opción para continuar:`, tipo: "bot" }]);
      setLoading(false);
    } else if (mostrarOpciones && modoConsulta === "") {
      if (inputLower.includes("licencia")) {
        setModoConsulta("licencia");
        setMessages((prev) => [...prev, { id: "modo-licencia", texto: "Has seleccionado Régimen de Licencia. Ahora podés escribir tu consulta específica.", tipo: "bot" }]);
      } else if (inputLower.includes("estatuto")) {
        setModoConsulta("estatuto");
        setMessages((prev) => [...prev, { id: "modo-estatuto", texto: "Has seleccionado Estatuto del Docente. Ahora podés escribir tu consulta específica.", tipo: "bot" }]);
      } else if (inputLower.includes("consulta")) {
        setModoConsulta("general");
        setMessages((prev) => [...prev, { id: "modo-general", texto: "Has seleccionado Consulta General. Ahora podés escribir tu consulta específica.", tipo: "bot" }]);
      }
      setLoading(false);
    } else if (modoConsulta) {
      const resultados = buscarInteligente(text, contenidoUnificado.filter(item => item.origen === modoConsulta));

      const respuesta = resultados.length > 0
        ? resultados[0].contenido
        : "No encontré una respuesta clara para tu consulta.";

      setMessages((prev) => [...prev, { id: `respuesta-${Date.now()}`, texto: respuesta, tipo: "bot" }]);
      setLoading(false);
    }

    Keyboard.dismiss();
  };

  const renderSelector = () => selectorVisible && (
    <View style={styles.selectorContainer}>
      <TouchableOpacity style={styles.selectorButton} onPress={() => handleSendMessage("Provincial")}>
        <Text style={styles.selectorButtonText}>Provincial</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.selectorButton} onPress={() => handleSendMessage("Municipal")}>
        <Text style={styles.selectorButtonText}>Municipal</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOpcionesConsulta = () => mostrarOpciones && !modoConsulta && (
    <View style={styles.selectorContainer}>
      <TouchableOpacity style={styles.selectorButton} onPress={() => handleSendMessage("Régimen de Licencia")}>
        <Text style={styles.selectorButtonText}>Régimen de Licencia</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.selectorButton} onPress={() => handleSendMessage("Estatuto del Docente")}>
        <Text style={styles.selectorButtonText}>Estatuto del Docente</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.selectorButton} onPress={() => handleSendMessage("Consulta General")}>
        <Text style={styles.selectorButtonText}>Consulta General</Text>
      </TouchableOpacity>
    </View>
  );

  const volverAlMenuPrincipal = () => {
    setSelectorVisible(true);
    setMostrarOpciones(false);
    setModoConsulta("");
    setMessages([welcomeMessage, preguntaSistemaMessage]);
    setInputText("");
    Keyboard.dismiss();
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={toggleModal}>
        <Image source={require("@/assets/logos/Chatboot3.png")} style={{ width: 150, height: 150 }} resizeMode="contain" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.header}>{`🤖 Bienvenido al Asistente Virtual SiDCa 🤖`}</Text>

            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.messageRow, item.tipo === "usuario" ? styles.userRow : styles.botRow]}>
                  <Image
                    source={
                      item.tipo === "usuario"
                        ? require("@/assets/logos/chatdocente.png")
                        : require("@/assets/logos/Chatboot4.png")
                    }
                    style={styles.avatar}
                  />
                  <View style={[styles.messageBubble, item.tipo === "usuario" ? styles.userBubble : styles.botBubble]}>
                  <Text
  style={[
    styles.messageText,
    item.tipo === "usuario" && styles.userText
  ]}
>
  {item.texto}
</Text>

                  </View>
                </View>
              )}
              
            />

            {loading && <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 10 }} />}

            {renderSelector()}
            {renderOpcionesConsulta()}

            {!selectorVisible && (
              <TouchableOpacity style={{ alignSelf: "flex-end", marginRight: 8, marginBottom: 1 }} onPress={volverAlMenuPrincipal}>
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
                <TouchableOpacity style={styles.iconSendButton} onPress={() => handleSendMessage(inputText)}>
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