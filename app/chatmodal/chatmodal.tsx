import React, { useState, useContext, useEffect, useRef } from "react";
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
import Fuse, { Expression } from "fuse.js";

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
  const [modoConsulta, setModoConsulta] = useState("");
  const [loading, setLoading] = useState(false);
  const [contenidoUnificado, setContenidoUnificado] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [preguntasGenerales, setPreguntasGenerales] = useState<any[]>([]);
  const [mostrarPreguntas, setMostrarPreguntas] = useState(false);
  const [modalPreguntasVisible, setModalPreguntasVisible] = useState(false);
  const [sistemaSeleccionado, setSistemaSeleccionado] = useState<
    "provincial" | "municipal" | null
  >(null);

  const welcomeMessage = {
    id: "bienvenida",
    texto: `¡Hola ${fullName}! Soy el asistente virtual de SiDCa. Podés consultarme sobre capacitaciones, beneficios, Estatuto Docente, Licencia o cualquier duda que tengas 📚💬`,
    tipo: "bot",
  };

  const preguntaSistemaMessage = {
    id: "pregunta-sistema",
    texto:
      "Antes de continuar, por favor seleccioná a qué sistema educativo perteneces:",
    tipo: "bot",
  };

  const buscarInteligente = (consulta: string | Expression, datos: any[]) => {
    // Normalizamos los datos para que todos tengan "contenido" y "pregunta"
    const datosNormalizados = datos.map((item: any) => {
      const contenido = item.respuesta || item.contenido || "";
      const pregunta =
        item.pregunta || (item.articulo ? `Artículo ${item.articulo}` : "");
      return {
        ...item,
        contenido,
        pregunta,
      };
    });

    const fuse = new Fuse(datosNormalizados, {
      keys: ["pregunta", "contenido"],
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
      setMessages((prev) => [
        ...prev,
        {
          id: `respuesta-opciones`,
          texto: `Seleccioná una opción para continuar:`,
          tipo: "bot",
        },
      ]);
      setLoading(false);
    } else if (mostrarOpciones && modoConsulta === "") {
      if (inputLower.includes("licencia")) {
        setModoConsulta("licencia");
        setMessages((prev) => [
          ...prev,
          {
            id: "modo-licencia",
            texto:
              "Has seleccionado Régimen de Licencia. Ahora podés escribir tu consulta específica.",
            tipo: "bot",
          },
        ]);
      } else if (inputLower.includes("estatuto")) {
        setModoConsulta("estatuto");
        setMessages((prev) => [
          ...prev,
          {
            id: "modo-estatuto",
            texto:
              "Has seleccionado Estatuto del Docente. Ahora podés escribir tu consulta específica.",
            tipo: "bot",
          },
        ]);
      } else if (inputLower.includes("consulta")) {
        setModoConsulta("general");
        setMessages((prev) => [
          ...prev,
          {
            id: "modo-general",
            texto:
              "Has seleccionado Consulta General. Ahora podés escribir tu consulta específica.",
            tipo: "bot",
          },
        ]);
      }
      setLoading(false);
    } else if (modoConsulta) {
      const resultados = buscarInteligente(
        text,
        contenidoUnificado.filter((item) => item.origen === modoConsulta)
      );

      const respuesta =
        resultados.length > 0
          ? resultados[0].contenido
          : "No encontré una respuesta clara para tu consulta.";

      setMessages((prev) => [
        ...prev,
        { id: `respuesta-${Date.now()}`, texto: respuesta, tipo: "bot" },
      ]);
      setLoading(false);
    }

    Keyboard.dismiss();
  };

  const renderSelector = () =>
    selectorVisible && (
      <View style={styles.selectorContainer}>
        {/* Botón Provincial */}
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => {
            setVisible(true);
            setMessages([welcomeMessage, preguntaSistemaMessage]);
            setSelectorVisible(false);
            setMostrarOpciones(true);
            setModoConsulta("");
            setInputText("");
            setSistemaSeleccionado("provincial");

            setTimeout(async () => {
              try {
                const baseUrl =
                  "https://raw.githubusercontent.com/rcampagnale/sidca-chatbot-docs/main/";

                const estatutoRes = await fetch(
                  `${baseUrl}texto_provincial_para_firestore.json`
                );
                const estatutoJson = (await estatutoRes.json()).map(
                  (item: any) => ({
                    ...item,
                    origen: "estatuto",
                  })
                );

                const licenciaRes = await fetch(
                  `${baseUrl}regimen_licencias_docentes.json`
                );
                const licenciaJson = (await licenciaRes.json()).map(
                  (item: any) => ({
                    ...item,
                    origen: "licencia",
                  })
                );

                const generalRes = await fetch(
                  `${baseUrl}consultas_generales.json`
                );
                const generalJson = (await generalRes.json()).map(
                  (item: any) => ({
                    ...item,
                    origen: "general",
                  })
                );

                setContenidoUnificado([
                  ...estatutoJson,
                  ...licenciaJson,
                  ...generalJson,
                ]);
                setPreguntasGenerales(generalJson);
              } catch (error) {
                console.error(
                  "❌ Error al cargar los archivos desde GitHub (PROVINCIAL):",
                  error
                );
              }
            }, 200);
          }}
        >
          <Text style={styles.selectorButtonText}>Provincial</Text>
        </TouchableOpacity>

        {/* Botón Municipal */}
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={async () => {
            setVisible(true);
            setMessages([welcomeMessage, preguntaSistemaMessage]);
            setSelectorVisible(false);
            setMostrarOpciones(true);
            setModoConsulta("");
            setInputText("");
            setSistemaSeleccionado("municipal");

            try {
              const baseUrl =
                "https://raw.githubusercontent.com/rcampagnale/sidca-chatbot-docs/main/";

              const estatutoRes = await fetch(
                `${baseUrl}estatuto_docente_municipio.json`
              );
              const estatutoJson = (await estatutoRes.json()).map((item) => ({
                ...item,
                origen: "estatuto",
              }));

              const licenciaRes = await fetch(
                `${baseUrl}regimen_licencias_docentes_municipio.json`
              );
              const licenciaJson = (await licenciaRes.json()).map((item) => ({
                ...item,
                origen: "licencia",
              }));

              const generalRes = await fetch(
                `${baseUrl}consulta_general_municipio.json`
              );
              const generalJson = (await generalRes.json()).map((item) => ({
                ...item,
                origen: "general",
              }));

              setContenidoUnificado([
                ...estatutoJson,
                ...licenciaJson,
                ...generalJson,
              ]);
              setPreguntasGenerales(generalJson);
            } catch (error) {
              console.error(
                "❌ Error al cargar los archivos del sistema MUNICIPAL:",
                error
              );
            }
          }}
        >
          <Text style={styles.selectorButtonText}>Municipal</Text>
        </TouchableOpacity>
      </View>
    );

  const renderOpcionesConsulta = () =>
    mostrarOpciones &&
    !modoConsulta && (
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

        {/* Botón de preguntas frecuentes */}
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setMostrarPreguntas(!mostrarPreguntas)}
        >
          <Text style={styles.selectorButtonText}>Preguntas Frecuentes</Text>
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
              🤖 Bienvenido al Asistente Virtual SiDCa 🤖
            </Text>

            {mostrarPreguntas ? (
              <View style={styles.modalPreguntasContainer}>
                <Text style={styles.modalPreguntasTitle}>
                  Preguntas Frecuentes
                </Text>
                <FlatList
                  data={preguntasGenerales}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        handleSendMessage(item.pregunta);
                        setMostrarPreguntas(false);
                      }}
                      style={styles.modalPreguntaItem}
                    >
                      <Text style={styles.modalPreguntaTexto}>
                        {item.pregunta}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            ) : (
              <>
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingBottom: 80 }}
                  onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  renderItem={({ item }) => (
                    <View
                      style={[
                        styles.messageRow,
                        item.tipo === "usuario"
                          ? styles.userRow
                          : styles.botRow,
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
                        <Text
                          style={[
                            styles.messageText,
                            item.tipo === "usuario" && styles.userText,
                          ]}
                        >
                          {item.texto}
                        </Text>
                      </View>
                    </View>
                  )}
                />

                {loading && (
                  <ActivityIndicator
                    size="small"
                    color="#007AFF"
                    style={{ marginVertical: 10 }}
                  />
                )}

                {renderSelector()}
                {renderOpcionesConsulta()}
              </>
            )}

            {/* ✅ BOTÓN SIEMPRE VISIBLE: Volver / Home */}
            <TouchableOpacity
              style={{
                alignSelf: "flex-end",
                marginRight: 8,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                if (mostrarPreguntas) {
                  setMostrarPreguntas(false);
                } else {
                  volverAlMenuPrincipal();
                }
              }}
            >
              {mostrarPreguntas ? (
                <Text style={{ fontSize: 16, color: "#007AFF" }}>← Volver</Text>
              ) : (
                <Ionicons name="home" size={26} color="#007AFF" />
              )}
            </TouchableOpacity>

            {/* ✅ INPUT SOLO CUANDO CORRESPONDA */}
            {(modoConsulta !== "" ||
              (!selectorVisible && !mostrarOpciones)) && (
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

            {/* ✅ CERRAR MODAL */}
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
