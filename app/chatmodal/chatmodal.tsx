// app/chatmodal/chatmodal.tsx
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
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import { SidcaContext } from "../_layout";
import styles from "@/styles/chatmodal/chatmodal";

import { firebaseconn } from "@/constants/FirebaseConn";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import { loadJsonFolderFromStorageUrl } from "../../components/chatbot/chatbotStorage";

import {
  normalizarContenido,
  resolverConsultaEspecial,
  resolverConsultaGenericaLicencias,
  buscarInteligente,
  RegistroNormativa,
} from "../../components/chatbot/chatbotSearch";

import {
  consultarLicenciasEnN8n,
  construirMensajeDesdeN8n,
} from "../../components/chatbot/n8nChatbot";

type Mensaje = {
  id: string;
  texto: string;
  tipo: "bot" | "usuario";
};

const db = getFirestore(firebaseconn);

// 🔊 Endpoint STT (placeholder)
const STT_ENDPOINT = "https://tu-endpoint-stt.com/stt";

export default function ChatbotModal() {
  const { userData } = useContext(SidcaContext) as any;

  const fullName =
    userData?.apellido && userData?.nombre
      ? `${userData.apellido}, ${userData.nombre}`
      : userData?.nombre || "docente";

  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [contenidoUnificado, setContenidoUnificado] = useState<RegistroNormativa[]>([]);
  const [cargandoBase, setCargandoBase] = useState(false);

  const flatListRef = useRef<FlatList<Mensaje>>(null);

  // Audio / STT
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sttLoading, setSttLoading] = useState(false);
  const [lockRecording, setLockRecording] = useState(false);
  const [cancelRecordingState, setCancelRecordingState] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const welcomeMessage: Mensaje = {
    id: "bienvenida",
    texto: `Hola ${fullName} 👋\nSoy el Asistente Virtual de SiDCa.\nPodés preguntarme sobre el *Estatuto Docente provincial* o el *Régimen de Licencias*.\n\nEscribí tu consulta o usá el botón de audio 🎙️ (mantené presionado, deslizá hacia arriba para bloquear o hacia la izquierda para cancelar).`,
    tipo: "bot",
  };

  const cleanupRecording = async () => {
    try {
      if (recording) await recording.stopAndUnloadAsync();
    } catch (e) {
      console.warn("Error limpiando grabación previa", e);
    } finally {
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
      setLockRecording(false);
      setCancelRecordingState(false);
    }
  };

  const toggleModal = async () => {
    if (!visible) {
      console.log("[Chatbot] Abriendo modal. Limpiando mensajes y preparando bienvenida.");
      setMessages([welcomeMessage]);
      setInputText("");
      setVisible(true);
    } else {
      console.log("[Chatbot] Cerrando modal. Limpieza de grabación y estado.");
      await cleanupRecording();
      setVisible(false);
      setMessages([]);
      setInputText("");
      setSttLoading(false);
    }
  };

  // Carga de base desde Firebase (se usa como respaldo local)
  useEffect(() => {
    const loadContenido = async () => {
      if (!visible) return;
      if (contenidoUnificado.length > 0) {
        console.log(
          "[Chatbot] Base ya cargada. Registros en contenidoUnificado:",
          contenidoUnificado.length
        );
        return;
      }

      try {
        console.log("[Chatbot] Iniciando carga de contenido desde Firestore/Storage...");
        setCargandoBase(true);

        const provincialRef = doc(db, "Chatboot", "Provincial");
        console.log("[Chatbot] getDoc( Chatboot/Provincial )...");
        const snap = await getDoc(provincialRef);

        console.log("[Chatbot] snap.exists():", snap.exists());
        if (!snap.exists()) {
          console.warn("⚠️ No existe Chatboot/Provincial en Firestore");
          setCargandoBase(false);
          return;
        }

        const data = snap.data() || {};
        console.log("[Chatbot] Data de Firestore (Provincial):", data);

        const estatutoUrl = data.Estatuto_Docente as string | undefined;
        const licenciaUrl = data.Licencia_Docente as string | undefined;

        console.log("[Chatbot] URLs leídas de Firestore:", {
          estatutoUrl,
          licenciaUrl,
        });

        if (!estatutoUrl || !licenciaUrl) {
          console.warn("⚠️ Faltan URLs de Estatuto_Docente o Licencia_Docente");
          setCargandoBase(false);
          return;
        }

        console.log("[Chatbot] Cargando Estatuto y Licencias desde Storage...");
        const [estatutoJsonRaw, licenciaJsonRaw] = await Promise.all([
          loadJsonFolderFromStorageUrl(estatutoUrl),
          loadJsonFolderFromStorageUrl(licenciaUrl),
        ]);

        console.log("[Chatbot] Resultado carga Storage:", {
          estatutoTipo: Array.isArray(estatutoJsonRaw) ? "array" : typeof estatutoJsonRaw,
          estatutoLen: Array.isArray(estatutoJsonRaw) ? estatutoJsonRaw.length : "n/a",
          licenciaTipo: Array.isArray(licenciaJsonRaw) ? "array" : typeof licenciaJsonRaw,
          licenciaLen: Array.isArray(licenciaJsonRaw) ? licenciaJsonRaw.length : "n/a",
        });

        const estatutoJson = (estatutoJsonRaw || []).map((item: any) => ({
          ...item,
          origen: "estatuto" as const,
        }));
        const licenciaJson = (licenciaJsonRaw || []).map((item: any) => ({
          ...item,
          origen: "licencia" as const,
        }));

        console.log("[Chatbot] estatutoJson con origen:", estatutoJson.length);
        console.log("[Chatbot] licenciaJson con origen:", licenciaJson.length);

        const unificado = [...estatutoJson, ...licenciaJson];
        console.log("[Chatbot] contenidoUnificado total:", unificado.length);

        setContenidoUnificado(unificado);
      } catch (error) {
        console.error("❌ Error al cargar contenido desde Firebase:", error);
      } finally {
        setCargandoBase(false);
        console.log("[Chatbot] Fin carga de base. cargandoBase = false");
      }
    };

    loadContenido();
  }, [visible, contenidoUnificado.length]);

  // Envío de mensaje de texto
  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    console.log("========================================");
    console.log("[Chatbot] Nueva consulta:", trimmed);
    console.log(
      "[Chatbot] contenidoUnificado length al momento de consultar:",
      contenidoUnificado.length
    );

    const userMsg: Mensaje = {
      id: Date.now().toString(),
      texto: trimmed,
      tipo: "usuario",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    // pequeña pausa para que se vea el estado "Consultando..."
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 👉 0) PRIMERO intentamos responder con n8n
    try {
  console.log("[Chatbot] Consultando a n8n via webhook...");

  // Llamamos a n8n con la pregunta ya recortada
  const respN8n = await consultarLicenciasEnN8n(trimmed);

  // Construimos el texto que verá el usuario
  const mensajeBot = construirMensajeDesdeN8n(respN8n);
  console.log("[Chatbot] Mensaje construido desde n8n:", mensajeBot);

  if (mensajeBot && mensajeBot.trim().length > 0) {
    setMessages((prev) => [
      ...prev,
      {
        id: `n8n-${Date.now()}`,
        texto: mensajeBot.trim(),
        tipo: "bot",
      },
    ]);

    setLoading(false);
    Keyboard.dismiss();

    // ✅ n8n respondió bien, no seguimos con la lógica local
    return;
  } else {
    console.log(
      "[Chatbot] n8n no devolvió un mensaje útil, se usa lógica local como respaldo."
    );
    // acá sigue la lógica local de respaldo (no hacemos return)
  }
} catch (error) {
  console.error(
    "[Chatbot] Error al consultar n8n, se usa lógica local como respaldo:",
    error
  );
  // No hacemos return: después de este bloque seguirá el fallback local
}


    // === 1) A partir de acá queda la lógica LOCAL previa como BACKUP ===

    if (!contenidoUnificado.length) {
      console.log(
        "[Chatbot] contenidoUnificado vacío. Base local todavía no disponible."
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `sin-datos-${Date.now()}`,
          texto:
            "En este momento no puedo acceder a la base local del Estatuto y el Régimen de Licencias 📄. Probá enviar de nuevo tu consulta en unos instantes.",
          tipo: "bot",
        },
      ]);
      setLoading(false);
      return;
    }

    // 1) Casos especiales (fallecimiento, largo tratamiento, maternidad) – respaldo local
    const respuestaEspecial = resolverConsultaEspecial(
      trimmed,
      contenidoUnificado
    );
    console.log("[Chatbot] respuestaEspecial (fallback local):", !!respuestaEspecial);
    if (respuestaEspecial) {
      setMessages((prev) => [
        ...prev,
        {
          id: `respuesta-especial-${Date.now()}`,
          texto: respuestaEspecial,
          tipo: "bot",
        },
      ]);
      setLoading(false);
      Keyboard.dismiss();
      return;
    }

    // 1.b) Resolver genérico para TODAS las licencias – respaldo local
    const respuestaGenericaLic = resolverConsultaGenericaLicencias(
      trimmed,
      contenidoUnificado
    );
    console.log(
      "[Chatbot] respuestaGenericaLic (fallback local):",
      !!respuestaGenericaLic
    );

    if (respuestaGenericaLic) {
      setMessages((prev) => [
        ...prev,
        {
          id: `respuesta-generica-lic-${Date.now()}`,
          texto: respuestaGenericaLic,
          tipo: "bot",
        },
      ]);
      setLoading(false);
      Keyboard.dismiss();
      return;
    }

    // 2) Búsqueda general con Fuse (Estatuto + Licencias filtrado por tema) – respaldo local
    const t = trimmed.toLowerCase();
    let datosFiltrados: RegistroNormativa[] = contenidoUnificado;

    if (
      t.includes("licencia") ||
      t.includes("enfermedad") ||
      t.includes("maternidad") ||
      t.includes("fallecimiento") ||
      t.includes("duelo")
    ) {
      datosFiltrados = contenidoUnificado.filter(
        (item) => item.origen === "licencia"
      );
      console.log(
        "[Chatbot] Filtro por LICENCIAS (fallback local). Cantidad:",
        datosFiltrados.length
      );
    } else if (
      t.includes("estatuto") ||
      t.includes("derechos") ||
      t.includes("deberes") ||
      t.includes("obligaciones") ||
      t.includes("cargo") ||
      t.includes("situación de revista") ||
      t.includes("situacion de revista")
    ) {
      datosFiltrados = contenidoUnificado.filter(
        (item) => item.origen === "estatuto"
      );
      console.log(
        "[Chatbot] Filtro por ESTATUTO (fallback local). Cantidad:",
        datosFiltrados.length
      );
    } else {
      console.log(
        "[Chatbot] Sin filtro específico, uso Estatuto + Licencias (fallback local). Cantidad:",
        datosFiltrados.length
      );
    }

    const resultados = buscarInteligente(trimmed, datosFiltrados);
    console.log(
      "[Chatbot] Resultados buscarInteligente (fallback local):",
      resultados.length,
      resultados[0]
        ? {
            articulo: resultados[0].articulo,
            origen: resultados[0].origen,
            titulo: resultados[0].titulo,
          }
        : null
    );

    let respuestaTexto: string;

    if (resultados.length > 0) {
      const mejor = resultados[0];
      const normativa =
        normalizarContenido(mejor) ||
        "Encontré información relacionada, pero no tengo un texto claro para mostrar.";

      respuestaTexto =
        "Te comento lo que indica la normativa sobre este tema (búsqueda local de respaldo):\n\n" +
        normativa +
        "\n\nSi querés, podés preguntarme algo más puntual sobre esta licencia o artículo 🙂.";
    } else {
      respuestaTexto =
        "No encontré una respuesta exacta a tu consulta en la base local 🤔.\nProbá con otras palabras, por ejemplo el nombre de la licencia o el artículo del Estatuto.";
    }

    setMessages((prev) => [
      ...prev,
      { id: `respuesta-${Date.now()}`, texto: respuestaTexto, tipo: "bot" },
    ]);

    setLoading(false);
    Keyboard.dismiss();
  };

  // ===== Audio / STT (simulado) =====

  const formatMillisToTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!recording) return;
    recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording && status.durationMillis != null) {
        setRecordingDuration(status.durationMillis);
      }
    });
  }, [recording]);

  const sendAudioToSttApi = async (fileUri: string): Promise<string> => {
    try {
      console.log("👉 STT placeholder, fileUri:", { fileUri, STT_ENDPOINT });
      // Cuando tengas backend real, reemplazás esto por el fetch al endpoint
      return "enfermedad largo tratamiento"; // texto simulado
    } catch (error) {
      console.error("Error en STT placeholder", error);
      return "";
    }
  };

  const startRecording = async () => {
    try {
      if (isRecording) return;

      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) {
          console.warn("Error deteniendo grabación previa en startRecording", e);
        }
        setRecording(null);
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        alert("Necesito permisos de micrófono para grabar audio.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      setLockRecording(false);
      setCancelRecordingState(false);
    } catch (error) {
      console.error("Error al iniciar la grabación", error);
    }
  };

  const cancelCurrentRecording = async () => {
    if (!recording || !isRecording) return;
    setCancelRecordingState(true);
    await cleanupRecording();
  };

  const stopRecordingAndSend = async () => {
    try {
      if (!recording) return;
      setIsRecording(false);

      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        console.warn("Error al detener grabación en stopRecordingAndSend", e);
      }

      const uri = recording.getURI();
      const wasCancelled = cancelRecordingState;

      setRecording(null);
      setRecordingDuration(0);
      setLockRecording(false);
      setCancelRecordingState(false);

      if (!uri || wasCancelled) return;

      setSttLoading(true);
      const textoReconocido = await sendAudioToSttApi(uri);
      setSttLoading(false);

      if (textoReconocido && textoReconocido.trim().length > 0) {
        handleSendMessage(textoReconocido);
      }
    } catch (error) {
      console.error("Error al detener/mandar audio", error);
      await cleanupRecording();
      setSttLoading(false);
    }
  };

  const handleTouchStart = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (inputText.trim().length > 0) return;
    touchStartRef.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    };
    startRecording();
  };

  const handleTouchMove = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (!isRecording || lockRecording || cancelRecordingState) return;
    const start = touchStartRef.current;
    if (!start) return;

    const dx = e.nativeEvent.pageX - start.x;
    const dy = e.nativeEvent.pageY - start.y;

    if (dy < -40 && !lockRecording) {
      setLockRecording(true);
    }

    if (dx < -40 && !cancelRecordingState) {
      setCancelRecordingState(true);
      cancelCurrentRecording();
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    if (isRecording && !lockRecording && !cancelRecordingState) {
      stopRecordingAndSend();
    }
  };

  const renderActionButton = () => {
    const hasText = inputText.trim().length > 0;

    const iconName: keyof typeof Ionicons.glyphMap =
      hasText ? "send" : lockRecording && isRecording ? "stop" : "mic";

    const onPress = () => {
      if (hasText) {
        handleSendMessage(inputText);
      } else if (lockRecording && isRecording) {
        stopRecordingAndSend();
      }
    };

    return (
      <View
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: isRecording ? "#1DA851" : "#25D366",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
          }}
        >
          <Ionicons size={22} name={iconName} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const inputPlaceholder = isRecording ? "" : "Escribí tu consulta...";

  return (
    <>
      {/* FAB flotante */}
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
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: 0.5,
                borderColor: "#ddd",
              }}
            >
              <Image
                source={require("@/assets/logos/Chatboot4.png")}
                style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
              />
              <Text style={styles.header}>Asistente Virtual SiDCa</Text>
            </View>

            {/* Mensajes */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 90 }}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              renderItem={({ item }) => (
                <View
                  style={[
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

            {/* Indicador de "Consultando..." */}
            {(loading || sttLoading || cargandoBase) && (
              <View style={styles.consultingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.consultingText}>
                  Consultando, buscando la mejor respuesta...
                </Text>
              </View>
            )}

            {/* Input + botón */}
            <View style={styles.inputContainer}>
              {isRecording ? (
                <View style={styles.recordingBanner}>
                  <Ionicons
                    name="recording"
                    size={18}
                    color="#D32F2F"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.recordingText}>
                    {lockRecording
                      ? `Grabando (bloqueado)... ${formatMillisToTime(
                          recordingDuration
                        )}  — deslizá a la izquierda para cancelar`
                      : `Grabando... ${formatMillisToTime(
                          recordingDuration
                        )}  — deslizá arriba para bloquear o a la izquierda para cancelar`}
                  </Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder={inputPlaceholder}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => handleSendMessage(inputText)}
                  editable={!sttLoading && !cargandoBase}
                />
              )}

              {renderActionButton()}
            </View>

            {/* Cerrar */}
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}











