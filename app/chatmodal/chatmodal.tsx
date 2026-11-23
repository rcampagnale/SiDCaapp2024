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
  Animated,
  Easing,
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
import { normalizarNombrePersona } from "../../src/utils/personName";

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

const SPEECH_LANGUAGES = ["es-AR", "es-ES", "es-MX", "es-US"];
const SPEECH_AUTO_SEND_STABILITY_MS = 650;

const BOT_SIZE = 110;
const BOT_RIGHT = 2;
const BOT_BOTTOM = 10;

const quitarMarkdownBasico = (texto: string) => {
  return (texto || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/^\s*Respuesta breve\s*:?[ \t]*$/gim, "")
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

const unirTranscripcion = (actual: string, nueva: string): string => {
  const base = String(actual || "").trim();
  const incoming = String(nueva || "").trim();

  if (!base) return incoming;
  if (!incoming) return base;
  if (incoming === base || incoming.startsWith(base)) return incoming;
  if (base.startsWith(incoming)) return base;

  const baseWords = base.split(/\s+/);
  const incomingWords = incoming.split(/\s+/);
  const maxOverlap = Math.min(baseWords.length, incomingWords.length, 10);

  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const baseSuffix = baseWords.slice(-overlap).join(" ").toLowerCase();
    const incomingPrefix = incomingWords.slice(0, overlap).join(" ").toLowerCase();

    if (baseSuffix === incomingPrefix) {
      return `${base} ${incomingWords.slice(overlap).join(" ")}`.trim();
    }
  }

  return `${base} ${incoming}`.trim();
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

  const identidadUsuario = normalizarNombrePersona(userData);
  const nombreFuente = String(
    userData?.nombre || identidadUsuario.nombre || "",
  ).trim();
  const nombreCompletoFuente = String(
    userData?.nombreCompleto || identidadUsuario.nombreCompleto || "",
  ).trim();
  const nombreDesdeCompleto = nombreCompletoFuente.includes(",")
    ? nombreCompletoFuente.split(",").slice(1).join(",").trim()
    : nombreCompletoFuente;
  const primerNombre = (nombreFuente || nombreDesdeCompleto)
    .split(/\s+/)[0]
    ?.trim() || "";
  const nombreVisible =
    primerNombre && !/^(usuario|prueba|afiliado\/a)$/i.test(primerNombre)
      ? primerNombre
      : "";

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
  const [speechPreview, setSpeechPreview] = useState("");

  const transcriptRef = useRef("");
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const speechSegmentCountRef = useRef(0);
  const audioUriRef = useRef<string | null>(null);
  const speechStartedAtRef = useRef<number | null>(null);
  const speechSessionActiveRef = useRef(false);
  const speechUiStateRef = useRef<
    "idle" | "listening" | "processing" | "sending"
  >("idle");
  const speechInputCommittedRef = useRef(false);
  const committedSpeechTextRef = useRef("");
  const hasAutoSentRef = useRef(false);
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSendMessageRef = useRef<((text: string) => Promise<void>) | null>(
    null,
  );
  const speechLanguageIndexRef = useRef(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const activeRequestRef = useRef(0);
  const modalOpenRef = useRef(false);

  const cargaContenidoRef = useRef<Promise<void> | null>(null);
  const contenidoUnificadoRef = useRef<RegistroNormativa[]>([]);
  const contenidoFuentesCargadasRef = useRef(false);
  const estatutoUrlRef = useRef<string | null>(null);
  const licenciaUrlRef = useRef<string | null>(null);
  const cargaInicialAnimacion = useRef(new Animated.Value(0)).current;

  const cargaInicialTranslateX = cargaInicialAnimacion.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 300],
  });

  useEffect(() => {
    contenidoUnificadoRef.current = contenidoUnificado;
  }, [contenidoUnificado]);

  useEffect(() => {
    if (!cargandoBase) {
      cargaInicialAnimacion.stopAnimation();
      cargaInicialAnimacion.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(cargaInicialAnimacion, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [cargandoBase, cargaInicialAnimacion]);

  const cargarContenidoLocal = useCallback(
    async (mostrarLoader: boolean = false) => {
      if (contenidoFuentesCargadasRef.current) {
        if (!mostrarLoader || !estatutoUrlRef.current || !licenciaUrlRef.current) {
          return;
        }

        setCargandoBase(true);
        try {
          await Promise.all([
            loadJsonFolderFromStorageUrl(estatutoUrlRef.current),
            loadJsonFolderFromStorageUrl(licenciaUrlRef.current),
          ]);
        } finally {
          setCargandoBase(false);
        }
        return;
      }

      if (mostrarLoader) {
        setCargandoBase(true);
      }

      if (!cargaContenidoRef.current) {
        cargaContenidoRef.current = (async () => {
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
            console.warn(
              "⚠️ Faltan URLs de Estatuto_Docente o Licencia_Docente",
            );
            return;
          }

          estatutoUrlRef.current = estatutoUrl;
          licenciaUrlRef.current = licenciaUrl;

          const [estatutoResult, licenciaResult] = await Promise.allSettled([
            loadJsonFolderFromStorageUrl(estatutoUrl),
            loadJsonFolderFromStorageUrl(licenciaUrl),
          ]);

          contenidoFuentesCargadasRef.current =
            estatutoResult.status === "fulfilled" &&
            licenciaResult.status === "fulfilled";

          if (estatutoResult.status === "rejected") {
            console.error("[Chatbot] local_source_error", {
              fuente: "estatuto",
              code: "source_unavailable",
            });
          }

          if (licenciaResult.status === "rejected") {
            console.error("[Chatbot] local_source_error", {
              fuente: "licencias",
              code: "source_unavailable",
            });
          }

          const estatutoJsonRaw =
            estatutoResult.status === "fulfilled" ? estatutoResult.value : [];
          const licenciaJsonRaw =
            licenciaResult.status === "fulfilled" ? licenciaResult.value : [];

          const estatutoJson = (estatutoJsonRaw || []).map((item: any) => ({
            ...item,
            origen: "estatuto" as const,
          }));

          const licenciaJson = (licenciaJsonRaw || []).map((item: any) => ({
            ...item,
            origen: "licencia" as const,
          }));

          const unificado = [...estatutoJson, ...licenciaJson];

          contenidoUnificadoRef.current = unificado;
          setContenidoUnificado(unificado);
        })();
      }

      try {
        await cargaContenidoRef.current;
      } catch (error) {
        console.error("[Chatbot] local_content_error", {
          code: "local_content_unavailable",
        });
      } finally {
        cargaContenidoRef.current = null;

        if (mostrarLoader) {
          setCargandoBase(false);
        }
      }
    },
    [],
  );

  const welcomeMessage: Mensaje = {
    id: "bienvenida",
    texto: `${nombreVisible ? `Hola, ${nombreVisible} 👋` : "Hola 👋"}

Soy el Asistente SIDCA. Podés consultarme sobre licencias, estatuto docente, coberturas y servicios del sindicato.

Escribí tu consulta o usá el micrófono 🎙️`,
    tipo: "bot",
    backendData: null,
  };

  useEffect(() => {
    if (!visible || messages.length !== 1 || messages[0]?.id !== "bienvenida") {
      return;
    }

    setMessages((current) => {
      if (current.length !== 1 || current[0]?.id !== "bienvenida") {
        return current;
      }

      return [welcomeMessage];
    });
  }, [visible, messages.length, nombreVisible]);

  const isCurrentRequest = useCallback((requestId: number) => {
    return modalOpenRef.current && activeRequestRef.current === requestId;
  }, []);

  const logSpeechState = (
    from: "idle" | "listening" | "processing" | "sending",
    to: "idle" | "listening" | "processing" | "sending",
  ) => {
    if (from === to) return;
    console.log("[SpeechRecognition] state", { from, to });
  };

  const markSpeechIdle = () => {
    const previous = speechUiStateRef.current;
    speechUiStateRef.current = "idle";
    logSpeechState(previous, "idle");
    speechSessionActiveRef.current = false;
    setSpeechListening(false);
    setSpeechWorking(false);
    setSpeechPreview("");
  };

  const clearAutoSendTimer = () => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
  };

  const scheduleSpeechAutoSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || hasAutoSentRef.current) return;

    clearAutoSendTimer();
    autoSendTimerRef.current = setTimeout(async () => {
      autoSendTimerRef.current = null;

      if (hasAutoSentRef.current || !modalOpenRef.current) return;

      hasAutoSentRef.current = true;
      logSpeechState(speechUiStateRef.current, "sending");
      speechUiStateRef.current = "sending";
      console.log("[SpeechRecognition] auto_send", {
        longitud: trimmed.length,
        estado: "sending",
      });

      try {
        await handleSendMessageRef.current?.(trimmed);
      } finally {
        markSpeechIdle();
      }
    }, SPEECH_AUTO_SEND_STABILITY_MS);
  };

  const commitTranscriptToInput = () => {
    if (speechInputCommittedRef.current) return committedSpeechTextRef.current;

    const transcript = (
      finalTranscriptRef.current || transcriptRef.current
    ).trim();

    if (!transcript) {
      speechInputCommittedRef.current = true;
      committedSpeechTextRef.current = "";
      return "";
    }

    const textoExistente = inputText.trim();
    const transcripcionCompleta = unirTranscripcion(textoExistente, transcript);

    setInputText(transcripcionCompleta);
    speechInputCommittedRef.current = true;
    committedSpeechTextRef.current = transcripcionCompleta;
    console.log("[SpeechRecognition] transcript_ready", {
      longitud: transcripcionCompleta.length,
      segmentos: speechSegmentCountRef.current,
      teniaTextoExistente: Boolean(textoExistente),
    });
    return transcripcionCompleta;
  };

  useSpeechRecognitionEvent("start", () => {
    const previous = speechUiStateRef.current;
    speechUiStateRef.current = "listening";
    logSpeechState(previous, "listening");
    setSpeechListening(true);
    setSpeechWorking(false);
    setSpeechDuration(0);
    speechStartedAtRef.current = Date.now();
  });

  useSpeechRecognitionEvent("end", () => {
    setSpeechListening(false);
    const textoFinal = commitTranscriptToInput();
    markSpeechIdle();
    console.log("[SpeechRecognition] end", {
      segmentos: speechSegmentCountRef.current,
      estado: "idle",
    });

    if (finalTranscriptRef.current.trim()) {
      scheduleSpeechAutoSend(textoFinal);
    } else if (!transcriptRef.current.trim()) {
      console.log("[SpeechRecognition] no_audio", { estado: "idle" });
    }
  });

  useSpeechRecognitionEvent("result", (event: any) => {
    const results = event?.results || [];
    const result = results?.[0];
    const best =
      result?.transcript ||
      result?.alternatives?.[0]?.transcript ||
      event?.transcript ||
      "";
    const candidate = String(best).trim();
    if (!candidate) return;

    const isFinal = Boolean(event?.isFinal || result?.isFinal);
    const merged = isFinal
      ? unirTranscripcion(
          finalTranscriptRef.current || interimTranscriptRef.current,
          candidate,
        )
      : finalTranscriptRef.current
        ? unirTranscripcion(finalTranscriptRef.current, candidate)
        : candidate;

    speechSegmentCountRef.current += 1;
    transcriptRef.current = merged;
    if (isFinal) {
      finalTranscriptRef.current = merged;
      interimTranscriptRef.current = "";
      if (speechUiStateRef.current === "listening") {
        logSpeechState("listening", "processing");
        speechUiStateRef.current = "processing";
        setSpeechWorking(true);
      }
    } else {
      interimTranscriptRef.current = candidate;
    }
    setSpeechPreview(merged);

    console.log(`[SpeechRecognition] ${isFinal ? "final" : "partial"}`, {
      longitud: merged.length,
      segmentos: speechSegmentCountRef.current,
      resultados: results.length,
      isFinal,
      estado: speechUiStateRef.current,
    });
  });

  useSpeechRecognitionEvent("audioend", (event: any) => {
    if (event?.uri) {
      audioUriRef.current = event.uri;
    }
  });

  useSpeechRecognitionEvent("error", (event: any) => {
    const error = String(event?.error || "");
    const message = String(event?.message || "");
    const normalizedError = error.toLowerCase();

    if (normalizedError === "aborted") {
      clearAutoSendTimer();
      markSpeechIdle();
      console.log("[SpeechRecognition] cancelled", {
        code: "aborted",
        estado: "idle",
      });
      return;
    }

    clearAutoSendTimer();
    markSpeechIdle();

    console.warn("[SpeechRecognition] error", {
      code: error || "recognition_error",
      hasMessage: Boolean(message),
      estado: "idle",
    });
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
    } catch {
      console.warn("[Chatbot] audio_cleanup_error", {
        code: "audio_cleanup_failed",
      });
    } finally {
      setPlayingMessageId(null);
    }
  };

  const resetSpeechState = () => {
    transcriptRef.current = "";
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    speechSegmentCountRef.current = 0;
    audioUriRef.current = null;
    speechStartedAtRef.current = null;
    speechSessionActiveRef.current = false;
    speechUiStateRef.current = "idle";
    speechInputCommittedRef.current = false;
    committedSpeechTextRef.current = "";
    hasAutoSentRef.current = false;

    setSpeechListening(false);
    setSpeechDuration(0);
    setSpeechWorking(false);
    setSpeechPreview("");
  };

  const abortSpeech = () => {
    const hadActiveSession =
      speechSessionActiveRef.current || speechListening || speechWorking;
    clearAutoSendTimer();
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {}
    resetSpeechState();
    if (hadActiveSession) {
      console.log("[SpeechRecognition] cancelled", {
        code: "user",
        estado: "idle",
      });
    }
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
      cargarContenidoLocal(true);
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

  const resolverLocal = (
    trimmed: string,
    dominioBackend: string,
  ): Mensaje | null => {
    if (dominioBackend !== "licencias" && dominioBackend !== "estatuto") {
      return null;
    }

    const baseLocal =
      contenidoUnificadoRef.current.length > 0
        ? contenidoUnificadoRef.current
        : contenidoUnificado;

    if (baseLocal.length <= 0) return null;

    const respuestaLocal = resolverConsultaLocalNormativa(trimmed, baseLocal);

    if (respuestaLocal) {
      return {
        id: `respuesta-local-${Date.now()}`,
        texto: construirRespuestaLocalFinal(respuestaLocal, dominioBackend),
        tipo: "bot",
        backendData: null,
      };
    }

    let datosFiltrados: RegistroNormativa[] = baseLocal;

    if (dominioBackend === "licencias") {
      datosFiltrados = baseLocal.filter((item) => item.origen === "licencia");
    } else if (dominioBackend === "estatuto") {
      datosFiltrados = baseLocal.filter((item) => item.origen === "estatuto");
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

  const esFalloTecnicoRecuperable = (
    respuesta: BackendRespuestaLicencias,
  ): boolean => {
    const status = Number(respuesta?.status || 0);
    const error = String(respuesta?.error || "");

    return (
      error === "timeout" ||
      error === "network_error" ||
      error === "backend_unavailable" ||
      error === "workflow_error" ||
      error === "provider_rate_limit" ||
      [500, 502, 503, 504].includes(status)
    );
  };

  const procesarConsulta = async (trimmed: string) => {
    const requestId = ++activeRequestRef.current;
    const dominioBackend = detectarDominioBackend(trimmed);

    setLoading(true);
    void cargarContenidoLocal(false);

    if (!isCurrentRequest(requestId)) return;

    try {
      const respBackend = await consultarLicenciasEnBackend(
        trimmed,
        dominioBackend,
      );
      const backendStatus = Number(respBackend?.status || 0);
      const backendErrorCode = String(respBackend?.error || "");

      if (backendStatus === 429 || backendErrorCode === "rate_limit") {
        if (!isCurrentRequest(requestId)) return;

        setMessages((prev) => [
          ...prev,
          {
            id: `rate-limit-${Date.now()}`,
            texto:
              "Hay muchas consultas en este momento. Esperá unos segundos e intentá nuevamente.",
            tipo: "bot",
            backendData: null,
          },
        ]);
        setLoading(false);
        Keyboard.dismiss();
        return;
      }

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
      const backendFalloRecuperable =
        backendSinCuota || esFalloTecnicoRecuperable(respBackend);

      if (backendFalloRecuperable) {
        await cargarContenidoLocal(false);
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

      const esErrorFuncional =
        backendError === "invalid_request" ||
        backendError === "question_too_long";

      setMessages((prev) => [
        ...prev,
        {
          id: `sin-respuesta-${Date.now()}`,
          texto: esErrorFuncional
            ? respBackend.respuesta
            : "Servicio no disponible por el momento.",
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
        await cargarContenidoLocal(false);
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

    clearAutoSendTimer();

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

  handleSendMessageRef.current = handleSendMessage;

  const formatMillisToTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const startSpeechRecognition = async () => {
    try {
      if (
        speechSessionActiveRef.current ||
        speechListening ||
        speechWorking ||
        loading ||
        cargandoBase
      ) {
        return;
      }

      speechSessionActiveRef.current = true;

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
        resetSpeechState();
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
        resetSpeechState();
        return;
      }

      if (!speechSessionActiveRef.current) {
        resetSpeechState();
        return;
      }

      transcriptRef.current = "";
      finalTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      speechSegmentCountRef.current = 0;
      speechInputCommittedRef.current = false;
      committedSpeechTextRef.current = "";
      hasAutoSentRef.current = false;
      clearAutoSendTimer();
      logSpeechState(speechUiStateRef.current, "listening");
      speechUiStateRef.current = "listening";
      setSpeechPreview("");
      audioUriRef.current = null;
      speechStartedAtRef.current = Date.now();

      setSpeechWorking(false);
      setSpeechListening(true);
      setSpeechDuration(0);

      const lang = SPEECH_LANGUAGES[speechLanguageIndexRef.current] || "es-ES";

      console.log("[SpeechRecognition] start", {
        lang,
        estado: "listening",
      });

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
    } catch {
      console.error("[SpeechRecognition] start_error", {
        code: "recognition_start_failed",
      });
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

  const toggleSpeechRecognition = async () => {
    if (speechSessionActiveRef.current || speechListening || speechWorking) {
      abortSpeech();
      return;
    }

    await startSpeechRecognition();
  };

  const toggleAudioPlayback = async (
    messageId: string,
    uri?: string | null,
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
        { shouldPlay: true },
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

    const micButton = (
      <TouchableOpacity
        onPress={toggleSpeechRecognition}
        activeOpacity={0.9}
        disabled={
          loading ||
          cargandoBase ||
          (speechWorking && !speechListening)
        }
        style={[
          styles.audioActionButton,
          speechListening && styles.audioActionButtonRecording,
          (loading || cargandoBase || (speechWorking && !speechListening)) &&
            styles.audioActionButtonDisabled,
        ]}
      >
        <Ionicons size={18} name="mic" color="#fff" />
      </TouchableOpacity>
    );

    if (speechListening) return micButton;

    if (hasText) {
      return (
        <>
          <TouchableOpacity
            onPress={() => handleSendMessage(inputText)}
            activeOpacity={0.9}
            disabled={loading || cargandoBase || speechWorking}
            style={[
              styles.audioActionButton,
              (loading || cargandoBase || speechWorking) &&
                styles.audioActionButtonDisabled,
            ]}
          >
            <Ionicons size={18} name="send" color="#fff" />
          </TouchableOpacity>
          {micButton}
        </>
      );
    }

    return micButton;
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
      <View
        pointerEvents={visible ? "none" : "auto"}
        style={[
          {
            position: "absolute",
            right: BOT_RIGHT,
            bottom: BOT_BOTTOM,
            zIndex: 20,
            elevation: 10,
          },
        ]}
      >
        <TouchableOpacity
          onPress={toggleModal}
          activeOpacity={0.85}
          style={{
            width: BOT_SIZE,
            height: BOT_SIZE,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("@/assets/logos/Chatboot5.png")}
            style={{
              width: BOT_SIZE,
              height: BOT_SIZE,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={closeChatbot}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.chatHeaderRow}>
              <View style={styles.headerContent}>
                <Image
                  source={require("@/assets/logos/Chatboot5.png")}
                  style={styles.headerAvatar}
                  resizeMode="contain"
                />
                <View style={styles.headerTextBlock}>
                  <Text style={styles.header}>Asistente SIDCA</Text>
                  <Text style={styles.headerSubtitle}>Tu asistente gremial</Text>
                </View>
                <TouchableOpacity
                  onPress={closeChatbot}
                  activeOpacity={0.8}
                  style={styles.headerCloseButton}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar asistente"
                >
                  <Ionicons name="close" size={27} color="#17242A" />
                </TouchableOpacity>
              </View>
            </View>

            {cargandoBase ? (
              <View style={styles.initialProgressTrack}>
                <Animated.View
                  style={[
                    styles.initialProgressIndicator,
                    { transform: [{ translateX: cargaInicialTranslateX }] },
                  ]}
                />
              </View>
            ) : null}

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
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
                          item.id === "bienvenida" && styles.welcomeMessageText,
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

            {(loading || speechWorking) && (
              <View style={styles.consultingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.consultingText}>
                  {speechWorking && !loading
                    ? "Procesando dictado..."
                    : "Consultando asistente IA y normativa..."}
                </Text>
              </View>
            )}

            <View style={styles.footerBar}>
              <View style={styles.inputContainer}>
                {speechListening ? (
                  <View style={styles.inlineRecordingPill}>
                    <View style={styles.inlineRecordingLeft}>
                      <View style={styles.recordingDot} />
                      <Text style={styles.inlineRecordingText} numberOfLines={2}>
                        {speechPreview || "Escuchando..."}
                      </Text>
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

            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
