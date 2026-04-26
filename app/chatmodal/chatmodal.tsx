import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
import { Audio } from "expo-av";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

import { SidcaContext } from "../_layout";
import styles from "@/styles/chatmodal/chatmodal";

import { firebaseconn } from "@/constants/FirebaseConn";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import { loadJsonFolderFromStorageUrl } from "../../components/chatbot/chatbotStorage";

import {
  normalizarContenido,
  resolverConsultaLocalNormativa,
  buscarInteligente,
  type RegistroNormativa,
  detectarDominioBackend,
  esCoincidenciaLocalConfiable,
} from "../../components/chatbot/chatbotSearch";

import {
  consultarLicenciasEnBackend,
  construirMensajeDesdeBackend,
  type BackendRespuestaLicencias,
} from "../../components/chatbot/chatbotApi";

import ChatbotBackendResponseCard from "../../components/chatbot/ChatbotBackendResponseCard";

type Mensaje = {
  id: string;
  texto: string;
  tipo: "bot" | "usuario";
  backendData?: BackendRespuestaLicencias | null;
  isAudio?: boolean;
  audioUri?: string | null;
  audioDurationMs?: number;
  transcript?: string;
};

const db = getFirestore(firebaseconn);
const MIN_AUDIO_DURATION_MS = 350;
const SPEECH_LANGUAGES = ["es-AR", "es-ES", "es-MX", "es-US"];
const SPEECH_TRANSCRIPT_WAIT_MS = 1800;

const quitarMarkdownBasico = (texto: string) => {
  return (texto || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const obtenerFuenteFormal = (dominio: string) => {
  switch (dominio) {
    case "licencias":
      return "Decreto Acuerdo Nº 1092/2015 – Régimen de Licencias Docentes";
    case "estatuto":
      return "Ley 3122 – Estatuto del Docente Provincial";
    case "coberturas":
      return "Dcto. Acdo. N° 636 – Apruébase e Implementase el Nuevo Sistema de Asamblea Pública de Coberturas de Cargos y Horas Cátedras para el Personal Docente de la Provincia de Catamarca";
    default:
      return "";
  }
};

const construirRespuestaLocalFinal = (textoBase: string, dominio: string) => {
  const limpio = quitarMarkdownBasico(textoBase);
  const fuente = obtenerFuenteFormal(dominio);

  let salida = limpio;

  if (fuente) {
    salida += `\n\nFuente consultada: ${fuente}.`;
  }

  return salida.trim();
};

const esErrorDeCuota = (texto: string) => {
  const t = String(texto || "").toLowerCase();
  return (
    t.includes("429") ||
    t.includes("quota") ||
    t.includes("insufficient_quota") ||
    t.includes("billing") ||
    t.includes("credit")
  );
};

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
  const [contenidoUnificado, setContenidoUnificado] = useState<
    RegistroNormativa[]
  >([]);
  const [cargandoBase, setCargandoBase] = useState(false);

  const flatListRef = useRef<FlatList<Mensaje>>(null);

  const [speechListening, setSpeechListening] = useState(false);
  const [speechDuration, setSpeechDuration] = useState(0);
  const [speechWorking, setSpeechWorking] = useState(false);

  const transcriptRef = useRef("");
  const audioUriRef = useRef<string | null>(null);
  const speechStartedAtRef = useRef<number | null>(null);
  const micPressingRef = useRef(false);
  const stopInProgressRef = useRef(false);
  const speechLanguageIndexRef = useRef(0);
  const speechErrorRef = useRef<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const activeRequestRef = useRef(0);
  const modalOpenRef = useRef(false);

  const welcomeMessage: Mensaje = {
    id: "bienvenida",
    texto: `Hola ${fullName} 👋
Soy el Asistente Virtual de SiDCa.
Podés preguntarme sobre el Estatuto Docente provincial, el Régimen de Licencias y Coberturas.

Escribí tu consulta o mantené presionado el botón de audio 🎙️.`,
    tipo: "bot",
    backendData: null,
  };

  const isCurrentRequest = useCallback((requestId: number) => {
    return modalOpenRef.current && activeRequestRef.current === requestId;
  }, []);

  useSpeechRecognitionEvent("start", () => {
    setSpeechListening(true);
    setSpeechDuration(0);
    speechStartedAtRef.current = Date.now();
  });

  useSpeechRecognitionEvent("end", () => {
    setSpeechListening(false);
  });

  useSpeechRecognitionEvent("result", (event: any) => {
    const results = event?.results || [];

    const best =
      results?.[0]?.transcript ||
      results?.[0]?.alternatives?.[0]?.transcript ||
      event?.transcript ||
      "";

    if (best && String(best).trim()) {
      transcriptRef.current = String(best).trim();
    }
  });

  useSpeechRecognitionEvent("audioend", (event: any) => {
    if (event?.uri) {
      audioUriRef.current = event.uri;
    }
  });

  useSpeechRecognitionEvent("error", (event: any) => {
    const error = String(event?.error || "");
    const message = String(event?.message || "");

    speechErrorRef.current = `${error} ${message}`.trim();

    console.log("[SpeechRecognition] error:", error, message);
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (speechListening) {
      interval = setInterval(() => {
        if (speechStartedAtRef.current) {
          setSpeechDuration(Date.now() - speechStartedAtRef.current);
        }
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [speechListening]);

  const cleanupSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (e) {
      console.warn("Error limpiando sonido", e);
    } finally {
      setPlayingMessageId(null);
    }
  };

  const resetSpeechState = () => {
    transcriptRef.current = "";
    audioUriRef.current = null;
    speechStartedAtRef.current = null;
    micPressingRef.current = false;
    stopInProgressRef.current = false;
    speechErrorRef.current = null;

    setSpeechListening(false);
    setSpeechDuration(0);
    setSpeechWorking(false);
  };

  const abortSpeech = () => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {}
    resetSpeechState();
  };

  const closeChatbot = async () => {
    activeRequestRef.current += 1;
    modalOpenRef.current = false;

    setLoading(false);
    setCargandoBase(false);
    setSpeechWorking(false);

    abortSpeech();
    await cleanupSound();

    setVisible(false);
    setMessages([]);
    setInputText("");
  };

  const toggleModal = async () => {
    if (!visible) {
      modalOpenRef.current = true;
      activeRequestRef.current += 1;
      setMessages([welcomeMessage]);
      setInputText("");
      setVisible(true);
    } else {
      await closeChatbot();
    }
  };

  useEffect(() => {
    return () => {
      modalOpenRef.current = false;
      activeRequestRef.current += 1;
      abortSpeech();
      cleanupSound();
    };
  }, []);

  useEffect(() => {
    const loadContenido = async () => {
      if (!visible) return;
      if (contenidoUnificado.length > 0) return;

      try {
        setCargandoBase(true);

        const provincialRef = doc(db, "Chatboot", "Provincial");
        const snap = await getDoc(provincialRef);

        if (!snap.exists()) {
          console.warn("⚠️ No existe Chatboot/Provincial en Firestore");
          return;
        }

        const data = snap.data() || {};
        const estatutoUrl = data.Estatuto_Docente as string | undefined;
        const licenciaUrl = data.Licencia_Docente as string | undefined;

        if (!estatutoUrl || !licenciaUrl) {
          console.warn("⚠️ Faltan URLs de Estatuto_Docente o Licencia_Docente");
          return;
        }

        const [estatutoJsonRaw, licenciaJsonRaw] = await Promise.all([
          loadJsonFolderFromStorageUrl(estatutoUrl),
          loadJsonFolderFromStorageUrl(licenciaUrl),
        ]);

        const estatutoJson = (estatutoJsonRaw || []).map((item: any) => ({
          ...item,
          origen: "estatuto" as const,
        }));

        const licenciaJson = (licenciaJsonRaw || []).map((item: any) => ({
          ...item,
          origen: "licencia" as const,
        }));

        setContenidoUnificado([...estatutoJson, ...licenciaJson]);
      } catch (error) {
        console.error("❌ Error al cargar contenido desde Firebase:", error);
      } finally {
        if (modalOpenRef.current) {
          setCargandoBase(false);
        }
      }
    };

    loadContenido();
  }, [visible, contenidoUnificado.length]);

  const resolverLocal = (
    trimmed: string,
    dominioBackend: string
  ): Mensaje | null => {
    if (contenidoUnificado.length <= 0) return null;

    const respuestaLocal = resolverConsultaLocalNormativa(
      trimmed,
      contenidoUnificado
    );

    if (respuestaLocal) {
      return {
        id: `respuesta-local-${Date.now()}`,
        texto: construirRespuestaLocalFinal(respuestaLocal, dominioBackend),
        tipo: "bot",
        backendData: null,
      };
    }

    let datosFiltrados: RegistroNormativa[] = contenidoUnificado;

    if (dominioBackend === "licencias") {
      datosFiltrados = contenidoUnificado.filter(
        (item) => item.origen === "licencia"
      );
    } else if (dominioBackend === "estatuto") {
      datosFiltrados = contenidoUnificado.filter(
        (item) => item.origen === "estatuto"
      );
    }

    const resultadosLocales = buscarInteligente(trimmed, datosFiltrados);

    if (
      resultadosLocales.length > 0 &&
      esCoincidenciaLocalConfiable(resultadosLocales[0])
    ) {
      const mejor = resultadosLocales[0];
      const normativa =
        normalizarContenido(mejor) ||
        "Encontré información relacionada, pero no tengo un texto claro para mostrar.";

      return {
        id: `respuesta-local-amplia-${Date.now()}`,
        texto: construirRespuestaLocalFinal(normativa, dominioBackend),
        tipo: "bot",
        backendData: null,
      };
    }

    return null;
  };

  const procesarConsulta = async (trimmed: string) => {
    const requestId = ++activeRequestRef.current;
    const dominioBackend = detectarDominioBackend(trimmed);

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 160));

    if (!isCurrentRequest(requestId)) return;

    try {
      const respBackend = await consultarLicenciasEnBackend(
        trimmed,
        dominioBackend
      );
      const mensajeBot = construirMensajeDesdeBackend(respBackend);

      if (!isCurrentRequest(requestId)) return;

      if (respBackend.ok && mensajeBot && mensajeBot.trim().length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: `backend-${Date.now()}`,
            texto: mensajeBot.trim(),
            tipo: "bot",
            backendData: respBackend,
          },
        ]);
        setLoading(false);
        Keyboard.dismiss();
        return;
      }

      const backendError = String(respBackend?.error || "");
      const backendSinCuota = esErrorDeCuota(backendError);

      if (backendSinCuota) {
        const localMsg = resolverLocal(trimmed, dominioBackend);

        if (!isCurrentRequest(requestId)) return;

        if (localMsg) {
          setMessages((prev) => [...prev, localMsg]);
          setLoading(false);
          Keyboard.dismiss();
          return;
        }
      }

      if (!isCurrentRequest(requestId)) return;

      setMessages((prev) => [
        ...prev,
        {
          id: `sin-respuesta-${Date.now()}`,
          texto: "Servicio no disponible por el momento.",
          tipo: "bot",
          backendData: null,
        },
      ]);

      setLoading(false);
      Keyboard.dismiss();
    } catch (error: any) {
      if (!isCurrentRequest(requestId)) return;

      const backendSinCuota = esErrorDeCuota(error?.message || "");

      if (backendSinCuota) {
        const localMsg = resolverLocal(trimmed, dominioBackend);

        if (localMsg) {
          setMessages((prev) => [...prev, localMsg]);
          setLoading(false);
          Keyboard.dismiss();
          return;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `sin-respuesta-${Date.now()}`,
          texto: "Servicio no disponible por el momento.",
          tipo: "bot",
          backendData: null,
        },
      ]);

      setLoading(false);
      Keyboard.dismiss();
    }
  };

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        texto: trimmed,
        tipo: "usuario",
        backendData: null,
      },
    ]);

    setInputText("");
    await procesarConsulta(trimmed);
  };

  const formatMillisToTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const waitForTranscript = async (maxWaitMs = SPEECH_TRANSCRIPT_WAIT_MS) => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < maxWaitMs) {
      const transcript = transcriptRef.current.trim();

      if (transcript.length > 0) {
        return transcript;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return transcriptRef.current.trim();
  };

  const startSpeechRecognition = async () => {
    try {
      if (
        speechListening ||
        speechWorking ||
        loading ||
        cargandoBase ||
        inputText.trim().length > 0
      ) {
        return;
      }

      const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();

      if (!available) {
        setMessages((prev) => [
          ...prev,
          {
            id: `speech-unavailable-${Date.now()}`,
            texto:
              "El reconocimiento de voz no está disponible en este dispositivo. Podés escribir tu consulta manualmente.",
            tipo: "bot",
            backendData: null,
          },
        ]);
        return;
      }

      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        setMessages((prev) => [
          ...prev,
          {
            id: `speech-permission-${Date.now()}`,
            texto:
              "Para usar el audio, necesitás habilitar el permiso del micrófono.",
            tipo: "bot",
            backendData: null,
          },
        ]);
        return;
      }

      transcriptRef.current = "";
      audioUriRef.current = null;
      speechErrorRef.current = null;
      speechStartedAtRef.current = Date.now();
      micPressingRef.current = true;
      stopInProgressRef.current = false;

      setSpeechWorking(true);
      setSpeechListening(true);
      setSpeechDuration(0);

      const lang = SPEECH_LANGUAGES[speechLanguageIndexRef.current] || "es-ES";

      console.log("[SpeechRecognition] start lang:", lang);

      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        requiresOnDeviceRecognition: false,
        recordingOptions: ExpoSpeechRecognitionModule.supportsRecording()
          ? {
              persist: true,
            }
          : undefined,
      });
    } catch (error) {
      console.error("Error al iniciar reconocimiento", error);
      resetSpeechState();

      setMessages((prev) => [
        ...prev,
        {
          id: `speech-error-${Date.now()}`,
          texto:
            "No pude iniciar el reconocimiento de voz. Probá nuevamente o escribí tu consulta.",
          tipo: "bot",
          backendData: null,
        },
      ]);
    }
  };

  const stopSpeechRecognitionAndSend = async () => {
    try {
      if (stopInProgressRef.current) return;
      if (!speechListening && !speechWorking) return;

      stopInProgressRef.current = true;

      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (error) {
        console.warn("[SpeechRecognition] stop error:", error);
      }

      const transcript = await waitForTranscript();
      const audioUri = audioUriRef.current;
      const durationMs =
        speechStartedAtRef.current != null
          ? Date.now() - speechStartedAtRef.current
          : speechDuration;

      if (durationMs < MIN_AUDIO_DURATION_MS) {
        resetSpeechState();
        return;
      }

      const speechError = String(speechErrorRef.current || "").toLowerCase();
      const languageNotSupported =
        speechError.includes("language-not-supported") ||
        speechError.includes("language not supported");

      if (!transcript && languageNotSupported) {
        speechLanguageIndexRef.current =
          (speechLanguageIndexRef.current + 1) % SPEECH_LANGUAGES.length;

        resetSpeechState();

        setMessages((prev) => [
          ...prev,
          {
            id: `speech-lang-error-${Date.now()}`,
            texto:
              "No pude reconocer el audio con el idioma actual. Probá nuevamente; voy a intentar con otra configuración de español.",
            tipo: "bot",
            backendData: null,
          },
        ]);

        return;
      }

      if (!transcript) {
        resetSpeechState();

        setMessages((prev) => [
          ...prev,
          {
            id: `speech-empty-${Date.now()}`,
            texto:
              "No pude interpretar el audio. Probá hablar un poco más claro, mantené presionado el micrófono y soltalo al terminar.",
            tipo: "bot",
            backendData: null,
          },
        ]);

        return;
      }

      const audioMessageId = `audio-user-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: audioMessageId,
          texto: transcript,
          tipo: "usuario",
          backendData: null,
          isAudio: !!audioUri,
          audioUri: audioUri || null,
          audioDurationMs: durationMs,
          transcript,
        },
      ]);

      resetSpeechState();

      await procesarConsulta(transcript);
    } catch (error) {
      console.error("Error al detener reconocimiento", error);
      resetSpeechState();

      setMessages((prev) => [
        ...prev,
        {
          id: `speech-stop-error-${Date.now()}`,
          texto:
            "No pude procesar el audio. Probá nuevamente o escribí tu consulta.",
          tipo: "bot",
          backendData: null,
        },
      ]);
    }
  };

  const handleMicPressIn = async () => {
    await startSpeechRecognition();
  };

  const handleMicPressOut = async () => {
    if (!micPressingRef.current) return;
    micPressingRef.current = false;
    await stopSpeechRecognitionAndSend();
  };

  const toggleAudioPlayback = async (
    messageId: string,
    uri?: string | null
  ) => {
    if (!uri) return;

    try {
      if (playingMessageId === messageId && soundRef.current) {
        await cleanupSound();
        return;
      }

      await cleanupSound();

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setPlayingMessageId(messageId);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (!status?.isLoaded) return;
        if (status.didJustFinish) {
          cleanupSound();
        }
      });
    } catch {
      await cleanupSound();
    }
  };

  const renderActionButton = () => {
    const hasText = inputText.trim().length > 0;

    if (hasText) {
      return (
        <TouchableOpacity
          onPress={() => handleSendMessage(inputText)}
          activeOpacity={0.9}
          disabled={loading || cargandoBase}
          style={[
            styles.audioActionButton,
            (loading || cargandoBase) && styles.audioActionButtonDisabled,
          ]}
        >
          <Ionicons size={18} name="send" color="#fff" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPressIn={handleMicPressIn}
        onPressOut={handleMicPressOut}
        activeOpacity={0.9}
        disabled={loading || cargandoBase}
        style={[
          styles.audioActionButton,
          speechListening && styles.audioActionButtonRecording,
          (loading || cargandoBase) && styles.audioActionButtonDisabled,
        ]}
      >
        <Ionicons size={18} name="mic" color="#fff" />
      </TouchableOpacity>
    );
  };

  const renderWaveBars = () => {
    const heights = [8, 12, 10, 16, 9, 14, 18, 11, 13, 17, 9, 15, 10, 14, 8];

    return (
      <View style={styles.audioWaveRow}>
        {heights.map((h, idx) => (
          <View key={idx} style={[styles.audioWaveBar, { height: h }]} />
        ))}
      </View>
    );
  };

  const renderAudioBubble = (item: Mensaje) => {
    const isPlaying = playingMessageId === item.id;
    const durationText = formatMillisToTime(item.audioDurationMs || 0);

    return (
      <View
        style={[
          styles.audioMessageBubble,
          item.tipo === "usuario"
            ? styles.userAudioBubble
            : styles.botAudioBubble,
        ]}
      >
        <TouchableOpacity
          style={styles.audioPlayButton}
          onPress={() => toggleAudioPlayback(item.id, item.audioUri)}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color={item.tipo === "usuario" ? "#fff" : "#333"}
          />
        </TouchableOpacity>

        <View style={styles.audioCenterBlock}>
          {renderWaveBars()}
          <Text
            style={[
              styles.audioDurationText,
              item.tipo === "usuario" && styles.audioDurationTextUser,
            ]}
          >
            {durationText}
          </Text>
        </View>
      </View>
    );
  };

  const inputPlaceholder = speechListening ? "" : "Escribí tu consulta...";

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={toggleModal}>
        <Image
          source={require("@/assets/logos/Chatboot3.png")}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={closeChatbot}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.chatHeaderRow}>
              <Text style={styles.header}>Asistente Virtual SiDCa</Text>
            </View>

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesContent}
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
                  {item.tipo === "bot" ? (
                    <Image
                      source={require("@/assets/logos/Chatboot4.png")}
                      style={styles.avatar}
                    />
                  ) : null}

                  {item.tipo === "bot" && item.backendData ? (
                    <View style={{ width: "100%" }}>
                      <ChatbotBackendResponseCard data={item.backendData} />
                    </View>
                  ) : item.isAudio ? (
                    <View style={styles.audioWrapper}>
                      {renderAudioBubble(item)}
                      {item.transcript ? (
                        <Text style={styles.audioTranscriptText}>
                          {item.transcript}
                        </Text>
                      ) : null}
                    </View>
                  ) : (
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
                  )}
                </View>
              )}
            />

            {(loading || speechWorking || cargandoBase) && (
              <View style={styles.consultingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.consultingText}>
                  Consultando asistente IA y normativa...
                </Text>
              </View>
            )}

            <View style={styles.footerBar}>
              <View style={styles.inputContainer}>
                {speechListening ? (
                  <View style={styles.inlineRecordingPill}>
                    <View style={styles.inlineRecordingLeft}>
                      <View style={styles.recordingDot} />
                      <Text style={styles.inlineRecordingText}>Escuchando...</Text>
                    </View>

                    <Text style={styles.inlineRecordingTimer}>
                      {formatMillisToTime(speechDuration)}
                    </Text>
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder={inputPlaceholder}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={() => handleSendMessage(inputText)}
                    editable={!speechWorking && !cargandoBase}
                  />
                )}

                {renderActionButton()}
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={closeChatbot}>
                <Text style={styles.closeText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}