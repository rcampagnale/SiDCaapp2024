import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import styles, { cursoCardStyles } from "../../styles/asistencia/asistencia";
import { SidcaContext } from "../_layout";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  addDoc,
  doc,
  getDoc,
  where,
  setDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConstanciaCapacitacionButton from "../../components/constancias/ConstanciaCapacitacionButton";

const localImage = require("../../assets/logos/secretaria.png");

const ASISTENCIA_DEVICE_ID_KEY = "sidca_asistencia_device_id";

const generarIdDispositivoAsistencia = () => {
  const fecha = Date.now().toString(36);
  const random1 = Math.random().toString(36).slice(2, 10);
  const random2 = Math.random().toString(36).slice(2, 10);

  return `sidca-device-${fecha}-${random1}${random2}`;
};

const getOrCreateAsistenciaDeviceId = async () => {
  const guardado = await AsyncStorage.getItem(ASISTENCIA_DEVICE_ID_KEY);

  if (guardado && guardado.trim()) {
    return guardado.trim();
  }

  const nuevoId = generarIdDispositivoAsistencia();
  await AsyncStorage.setItem(ASISTENCIA_DEVICE_ID_KEY, nuevoId);

  return nuevoId;
};

type TipoRegistroQR = "ingreso" | "salida";

const normalizarTipoRegistro = (value?: string | null): TipoRegistroQR =>
  value === "salida" ? "salida" : "ingreso";

const tieneDatoUtil = (value: any) => {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") {
    const limpio = value.trim();
    return limpio !== "" && limpio !== "-" && limpio !== "—";
  }

  if (typeof value?.toDate === "function") return true;
  if (value instanceof Date) return true;

  return !!value;
};

const tieneIngresoRegistrado = (data: any) => {
  if (!data) return false;

  if (data.ingreso?.registrado === true) return true;
  if (tieneDatoUtil(data.ingreso?.fechaHoraISO)) return true;
  if (tieneDatoUtil(data.ingreso?.fechaHora)) return true;

  if (tieneDatoUtil(data.ingresoFechaHora)) return true;
  if (tieneDatoUtil(data.horaIngreso)) return true;
  if (tieneDatoUtil(data.fechaIngreso)) return true;
  if (tieneDatoUtil(data.entrada)) return true;
  if (tieneDatoUtil(data.checkIn)) return true;

  if (typeof data.ingreso !== "object" && tieneDatoUtil(data.ingreso)) {
    return true;
  }

  // Compatibilidad con registros presenciales anteriores a la actualización,
  // donde se guardaba un único campo codigoUsado sin bloque ingreso/salida.
  if (
    data.modalidad === "presencial" &&
    data.presencial === true &&
    data.codigoUsado
  ) {
    return true;
  }

  return false;
};

const tieneSalidaRegistrada = (data: any) => {
  if (!data) return false;

  if (data.salida?.registrado === true) return true;
  if (tieneDatoUtil(data.salida?.fechaHoraISO)) return true;
  if (tieneDatoUtil(data.salida?.fechaHora)) return true;

  if (tieneDatoUtil(data.salidaFechaHora)) return true;
  if (tieneDatoUtil(data.horaSalida)) return true;
  if (tieneDatoUtil(data.fechaSalida)) return true;
  if (tieneDatoUtil(data.egreso)) return true;
  if (tieneDatoUtil(data.checkOut)) return true;

  if (typeof data.salida !== "object" && tieneDatoUtil(data.salida)) {
    return true;
  }

  return false;
};

const esAsistenciaPresente = (item: any) => {
  const modalidadItem = (item?.modalidad || "virtual").toString().toLowerCase();

  if (modalidadItem === "presencial") {
    return (
      !!item?.asistenciaValidada ||
      item?.estadoAsistencia === "validada" ||
      (!!item?.ingresoRegistrado && !!item?.salidaRegistrada)
    );
  }

  // En modalidad virtual, si el registro existe en el historial,
  // se muestra directamente como PRESENTE, aunque corresponda a otro día.
  return true;
};

const getEstadoVisual = (item: any) => {
  const modalidadItem = (item?.modalidad || "virtual").toString().toLowerCase();
  const presente = esAsistenciaPresente(item);

  if (presente) {
    return {
      label: "PRESENTE",
      bg: "#DCFCE7",
      text: "#166534",
      border: "#16A34A",
      detail:
        modalidadItem === "presencial"
          ? "Asistencia validada correctamente."
          : "Asistencia virtual registrada correctamente.",
    };
  }

  if (modalidadItem === "presencial" && item?.ingresoRegistrado && !item?.salidaRegistrada) {
    return {
      label: "PENDIENTE DE SALIDA",
      bg: "#FEF3C7",
      text: "#92400E",
      border: "#F59E0B",
      detail: "Registró el ingreso, falta registrar la salida para validar la asistencia.",
    };
  }

  return {
    label: "PENDIENTE",
    bg: "#FEE2E2",
    text: "#991B1B",
    border: "#EF4444",
    detail: modalidadItem === "presencial"
      ? "Debe registrar ingreso y salida para quedar presente."
      : "La asistencia aún no fue validada.",
  };
};

const formatDateTimeAR = (value: any) => {
  if (!value) return "—";

  if (typeof value?.toDate === "function") {
    value = value.toDate();
  }

  const d = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeAR = (value: any) => {
  if (!value) return "—";

  if (typeof value?.toDate === "function") {
    value = value.toDate();
  }

  const d = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const parseFechaARToTime = (fecha: any) => {
  if (!fecha) return 0;

  const raw = String(fecha).trim();
  const partes = raw.split(/[\/\-]/).map((n) => Number(n));

  if (partes.length === 3) {
    const [dd, mm, yyyy] = partes;
    if (
      Number.isFinite(dd) &&
      Number.isFinite(mm) &&
      Number.isFinite(yyyy) &&
      yyyy > 1900
    ) {
      return new Date(yyyy, mm - 1, dd).getTime();
    }
  }

  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const obtenerValorIngreso = (data: any) => {
  return (
    data?.ingreso?.fechaHoraISO ||
    data?.ingreso?.fechaHora ||
    data?.ingresoFechaHora ||
    data?.horaIngreso ||
    data?.fechaIngreso ||
    data?.entrada ||
    data?.checkIn ||
    (typeof data?.ingreso !== "object" ? data?.ingreso : null) ||
    data?.createdAt ||
    null
  );
};

const obtenerValorSalida = (data: any) => {
  return (
    data?.salida?.fechaHoraISO ||
    data?.salida?.fechaHora ||
    data?.salidaFechaHora ||
    data?.horaSalida ||
    data?.fechaSalida ||
    data?.egreso ||
    data?.checkOut ||
    (typeof data?.salida !== "object" ? data?.salida : null) ||
    null
  );
};

const buildAttendanceRow = (data: any) => {
  const modalidadItem = data.modalidad || "virtual";
  const ingresoRegistrado = tieneIngresoRegistrado(data);
  const salidaRegistrada = tieneSalidaRegistrada(data);

  const asistenciaValidada =
    modalidadItem !== "presencial" ||
    !!data.asistenciaValidada ||
    data.estadoAsistencia === "validada" ||
    data.estado === "Presente" ||
    data.estado === "presente" ||
    (modalidadItem === "presencial" && ingresoRegistrado && salidaRegistrada);

  const cursoNombre =
    data.curso ||
    data.cursoTitulo ||
    data.nombreCurso ||
    data.cursoNombre ||
    data.capacitacion ||
    data.tituloCurso ||
    "Curso";

  const cursoId =
    data.cursoId ||
    data.idCurso ||
    data.courseId ||
    data.cursoDocId ||
    "";

  const ingresoValor = obtenerValorIngreso(data);
  const salidaValor = obtenerValorSalida(data);

  return {
    id: data.id || null,
    apellido: data.apellido || data.Apellido || "",
    nombre: data.nombre || data.Nombre || "",
    dni: data.dni || data.DNI || data.documento || "",
    departamento: data.departamento || data.Departamento || "",
    nivelEducativo: data.nivelEducativo || data.nivel || "",

    curso: cursoNombre,
    cursoId,
    cursoNombre,
    nombreCurso: cursoNombre,
    cursoTitulo: cursoNombre,

    fecha: data.fecha || "",
    modalidad: modalidadItem,

    ingresoRegistrado,
    salidaRegistrada,

    ingresoFechaHora: ingresoValor,
    salidaFechaHora: salidaValor,
    ingreso: ingresoValor,
    salida: salidaValor,

    asistenciaValidada,
    estadoAsistencia: asistenciaValidada
      ? "validada"
      : data.estadoAsistencia || "pendiente",
    deviceId: data.deviceId || data.dispositivoAsistenciaId || "",
    dispositivoValidado: data.dispositivoValidado === true,
  };
};

const EstadoBadge = ({ item }: { item: any }) => {
  const estado = getEstadoVisual(item);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: estado.bg,
        borderColor: estado.border,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Text
        style={{
          color: estado.text,
          fontWeight: "900",
          fontSize: 12,
          letterSpacing: 0.4,
        }}
      >
        {estado.label}
      </Text>
    </View>
  );
};

const CheckChip = ({
  label,
  ok,
  hora,
}: {
  label: string;
  ok: boolean;
  hora?: string;
}) => (
  <View
    style={{
      flex: 1,
      minWidth: 130,
      backgroundColor: ok ? "#F0FDF4" : "#FEF2F2",
      borderColor: ok ? "#86EFAC" : "#FCA5A5",
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 9,
      paddingHorizontal: 10,
    }}
  >
    <Text
      style={{
        color: "#374151",
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 3,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        color: ok ? "#166534" : "#991B1B",
        fontSize: 15,
        fontWeight: "900",
      }}
    >
      {ok ? "Sí" : "No"}
      {ok && hora && hora !== "—" ? ` · ${hora}` : ""}
    </Text>
  </View>
);

/* ----- Card estético para "Curso habilitado" ----- */
type CursoCardProps = {
  titulo?: string;
  modalidad?: "virtual" | "presencial";
  habilitado: boolean;
};
const CursoHabilitadoCard: React.FC<CursoCardProps> = ({
  titulo,
  modalidad = "virtual",
  habilitado,
}) => (
  <View
    style={[cursoCardStyles.card, !habilitado && cursoCardStyles.cardDisabled]}
  >
    <View style={[!habilitado && cursoCardStyles.iconWrapDisabled]}></View>
    <View style={{ flex: 1 }}>
      <Text
        numberOfLines={2}
        style={[
          cursoCardStyles.title,
          !habilitado && cursoCardStyles.titleDisabled,
        ]}
      >
        {habilitado ? titulo : "(no hay curso habilitado)"}
      </Text>
      <View style={cursoCardStyles.chipsRow}>
        <Text
          style={[
            cursoCardStyles.chip,
            habilitado ? cursoCardStyles.chipOk : cursoCardStyles.chipWarn,
          ]}
        >
          {habilitado ? "Habilitado" : "Inactivo"}
        </Text>
        <Text style={[cursoCardStyles.chip, cursoCardStyles.chipMode]}>
          {modalidad === "virtual" ? "Virtual" : "Presencial"}
        </Text>
      </View>
    </View>
  </View>
);

export default function HandleCampusTeachers() {
  const { userData } = useContext(SidcaContext);
  const statusBarHeight = StatusBar.currentHeight;
  const windowHeight = Dimensions.get("window").height;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [procesandoRegistro, setProcesandoRegistro] = useState(false);
  const [procesandoTexto, setProcesandoTexto] = useState(
    "Procesando asistencia...",
  );

  // Config leída de cod/asistencia
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [modalidad, setModalidad] = useState<"virtual" | "presencial">(
    "virtual",
  );
  const [metodo, setMetodo] = useState<string | undefined>(undefined);
  const [sessionIdCfg, setSessionIdCfg] = useState<string | undefined>(
    undefined,
  );
  const [habilitadaCfg, setHabilitadaCfg] = useState<boolean>(false);
  const [tipoRegistroActivoCfg, setTipoRegistroActivoCfg] =
    useState<TipoRegistroQR>("ingreso");

  // Form + estado general
  const [selectedLevel, setSelectedLevel] = useState("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [attendances, setAttendances] = useState<any[]>([]);

  // Config independiente de constancias/certificados por curso.
  // No modifica la lógica de habilitar asistencia.
  const [constanciaGlobalCfg, setConstanciaGlobalCfg] = useState<any>({
    textoBotonDefault: "Ver certificado",
  });
  const [constanciasPorCurso, setConstanciasPorCurso] = useState<Record<string, any>>({});

  // Cámara (para QR presencial)
  const [, requestPermission] = useCameraPermissions();
  const [scanVisible, setScanVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedOnce, setScannedOnce] = useState(false);

  const db = getFirestore(firebaseconn);
  const asistenciaCollection = collection(db, "asistencia");
  const codCollection = collection(db, "cod");

  const toggleModal = () => setIsModalVisible(!isModalVisible);

  /* --------- Utilidades --------- */
  const friendlyError = (msg: string) => Alert.alert("Asistencia", msg);
  const nowIsBetween = (sinceISO: string, untilISO: string) => {
    const now = new Date();
    const a = new Date(sinceISO);
    const b = new Date(untilISO);
    return now >= a && now <= b;
  };
  const parseAsistenciaUrl = (urlStr: string) => {
    // sidca://asistencia?s=SESSION_ID&c=ABCD-EF12&t=ingreso|salida&v=2
    const raw = urlStr.trim();
    const qIndex = raw.indexOf("?");
    if (qIndex === -1) throw new Error("sin query");
    const queryStr = raw.slice(qIndex + 1);
    const params = new URLSearchParams(queryStr);
    const s = params.get("s") || "auto";
    const c = params.get("c") || "";
    const t = normalizarTipoRegistro(params.get("t"));
    const v = params.get("v") || "1";
    if (!s || !c) throw new Error("faltan params");
    return { sessionParam: s, codeParam: c, tipoRegistroQR: t, versionQR: v };
  };
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const normalizarDniText = (value: any) =>
    String(value ?? "")
      .replace(/\D/g, "")
      .trim();

  const coleccionesAfiliadosAsistencia = ["usuarios", "nuevoAfiliado"];

  const getDniValoresBusquedaAfiliado = (dniInput: any = userData?.dni) => {
    const rawStr = String(dniInput ?? "").trim();
    const cleanStr = normalizarDniText(dniInput);
    const values: any[] = [];

    const pushUnique = (v: any) => {
      if (v === undefined || v === null || v === "") return;

      const key = `${typeof v}:${String(v)}`;

      if (!values.some((x) => `${typeof x}:${String(x)}` === key)) {
        values.push(v);
      }
    };

    pushUnique(dniInput);
    pushUnique(rawStr);
    pushUnique(cleanStr);

    if (cleanStr && !Number.isNaN(Number(cleanStr))) {
      pushUnique(Number(cleanStr));
    }

    return values;
  };

  const getIdsPosiblesDocumentoAfiliado = () => {
    const rawDni = String(userData?.dni ?? "").trim();
    const dniClean = normalizarDniText(userData?.dni);
    const values = [
      userData?.uid,
      userData?.id,
      userData?.docId,
      userData?.documentId,
      dniClean,
      rawDni,
    ];

    return Array.from(
      new Set(
        values
          .map((v) => String(v ?? "").trim())
          .filter(Boolean),
      ),
    );
  };

  const buscarDocumentoAfiliadoPorDni = async (dniInput: any = userData?.dni) => {
    const dniClean = normalizarDniText(dniInput);
    const idsPosibles = getIdsPosiblesDocumentoAfiliado();

    for (const coleccion of coleccionesAfiliadosAsistencia) {
      for (const idDoc of idsPosibles) {
        const ref = doc(db, coleccion, idDoc);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() || {};
          const dniDoc = normalizarDniText(
            data.dni || data.DNI || data.documento || snap.id,
          );

          if (!dniClean || dniDoc === dniClean || snap.id === dniClean) {
            return {
              ref,
              data,
              id: snap.id,
              coleccion,
            };
          }
        }
      }
    }

    const camposDni = ["dni", "DNI", "documento"];
    const valoresDni = getDniValoresBusquedaAfiliado(dniInput);

    for (const coleccion of coleccionesAfiliadosAsistencia) {
      for (const campo of camposDni) {
        for (const valor of valoresDni) {
          const qAfiliado = query(
            collection(db, coleccion),
            where(campo, "==", valor),
            limit(1),
          );

          const snap = await getDocs(qAfiliado);

          if (!snap.empty) {
            const documento = snap.docs[0];

            return {
              ref: documento.ref,
              data: documento.data() || {},
              id: documento.id,
              coleccion,
            };
          }
        }
      }
    }

    return null;
  };

  const buscarOtroAfiliadoPorDeviceId = async (deviceId: string, dniActual: string) => {
    if (!deviceId) return null;

    for (const coleccion of coleccionesAfiliadosAsistencia) {
      const qDevice = query(
        collection(db, coleccion),
        where("dispositivoAsistenciaId", "==", deviceId),
        limit(5),
      );

      const snap = await getDocs(qDevice);

      for (const documento of snap.docs) {
        const data = documento.data() || {};
        const dniDoc = normalizarDniText(
          data.dni || data.DNI || data.documento || documento.id,
        );

        if (dniDoc && dniDoc !== dniActual) {
          return {
            ref: documento.ref,
            data,
            id: documento.id,
            coleccion,
          };
        }
      }
    }

    return null;
  };

  const validarDispositivoAsistencia = async () => {
    const dniClean = normalizarDniText(userData?.dni);

    if (!dniClean) {
      throw new Error("No se encontró el DNI del usuario para validar el dispositivo.");
    }

    setProcesandoTexto("Validando dispositivo autorizado...");

    const deviceId = await getOrCreateAsistenciaDeviceId();
    const afiliadoDoc = await buscarDocumentoAfiliadoPorDni(dniClean);

    if (!afiliadoDoc) {
      throw new Error(
        "No se encontró el documento del afiliado para vincular el dispositivo. Verificá que el DNI exista en usuarios o nuevoAfiliado.",
      );
    }

    const dataAfiliado = afiliadoDoc.data || {};

    if (dataAfiliado.dispositivoBloqueado === true) {
      throw new Error(
        "El dispositivo de asistencia de este DNI está bloqueado. Solicitá la revisión desde administración.",
      );
    }

    const otroAfiliadoConEsteDispositivo = await buscarOtroAfiliadoPorDeviceId(
      deviceId,
      dniClean,
    );

    if (otroAfiliadoConEsteDispositivo) {
      throw new Error(
        "Este celular ya está vinculado a otro DNI para registrar asistencia. Por seguridad, no se puede marcar asistencia de otro afiliado desde este dispositivo.",
      );
    }

    const dispositivoGuardado = String(
      dataAfiliado.dispositivoAsistenciaId || "",
    ).trim();

    const fechaValidacion = new Date().toISOString();

    if (!dispositivoGuardado) {
      setProcesandoTexto("Vinculando este celular al DNI para asistencia...");

      await setDoc(
        afiliadoDoc.ref,
        {
          dispositivoAsistenciaId: deviceId,
          asistenciaDispositivoVinculado: true,
          dispositivoVinculadoEn: fechaValidacion,
          dispositivoVinculadoDesde: "app",
          dispositivoBloqueado: false,
          dispositivoUltimaValidacionEn: fechaValidacion,
        },
        { merge: true },
      );

      return {
        deviceId,
        vinculadoAhora: true,
        afiliadoColeccion: afiliadoDoc.coleccion,
        afiliadoDocId: afiliadoDoc.id,
      };
    }

    if (dispositivoGuardado !== deviceId) {
      throw new Error(
        "No se puede registrar la asistencia. Este DNI ya está vinculado a otro dispositivo. Si cambiaste de celular, solicitá la actualización desde administración.",
      );
    }

    await setDoc(
      afiliadoDoc.ref,
      {
        asistenciaDispositivoVinculado: true,
        dispositivoBloqueado: false,
        dispositivoUltimaValidacionEn: fechaValidacion,
      },
      { merge: true },
    );

    return {
      deviceId,
      vinculadoAhora: false,
      afiliadoColeccion: afiliadoDoc.coleccion,
      afiliadoDocId: afiliadoDoc.id,
    };
  };

  const getDniQueryValues = () => {
    const raw = userData?.dni;
    const rawStr = String(raw ?? "").trim();
    const cleanStr = normalizarDniText(raw);
    const values: any[] = [];

    const pushUnique = (v: any) => {
      if (v === undefined || v === null || v === "") return;
      const key = `${typeof v}:${String(v)}`;
      if (!values.some((x) => `${typeof x}:${String(x)}` === key)) {
        values.push(v);
      }
    };

    pushUnique(raw);
    pushUnique(rawStr);
    pushUnique(cleanStr);

    if (cleanStr && !Number.isNaN(Number(cleanStr))) {
      pushUnique(Number(cleanStr));
    }

    return values;
  };

  const normalizarCurso = (value: any) =>
    String(value ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();

  const normalizarTextoClave = (value: any) =>
    normalizarCurso(value)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const obtenerCursoIdConstancia = (item: any) =>
    String(
      item?.cursoId ||
        item?.idCurso ||
        item?.courseId ||
        item?.cursoDocId ||
        "",
    ).trim();

  const obtenerNombresCursoConstancia = (item: any) =>
    [
      item?.cursoNombre,
      item?.nombreCurso,
      item?.cursoTitulo,
      item?.curso,
      item?.capacitacion,
      item?.tituloCurso,
      item?.titulo,
    ]
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);

  const pad2 = (value: number) => String(value).padStart(2, "0");

  const normalizarFechaYYYYMMDD = (value: any): string => {
    if (!value) return "";

    if (typeof value?.toDate === "function") {
      value = value.toDate();
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return "";
      return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
        value.getDate(),
      )}`;
    }

    if (typeof value === "object") {
      if (value.seconds || value._seconds) {
        const seconds = Number(value.seconds || value._seconds);
        if (Number.isFinite(seconds)) {
          return normalizarFechaYYYYMMDD(new Date(seconds * 1000));
        }
      }

      return normalizarFechaYYYYMMDD(
        value.fecha ||
          value.fechaISO ||
          value.fechaHoraISO ||
          value.fechaHora ||
          value.createdAt ||
          value.updatedAt,
      );
    }

    const raw = String(value).trim();
    if (!raw) return "";

    const yyyyMmDd = raw.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (yyyyMmDd) {
      const [, yyyy, mm, dd] = yyyyMmDd;
      return `${yyyy}-${pad2(Number(mm))}-${pad2(Number(dd))}`;
    }

    const ddMmYyyy = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (ddMmYyyy) {
      const [, dd, mm, yyyy] = ddMmYyyy;
      return `${yyyy}-${pad2(Number(mm))}-${pad2(Number(dd))}`;
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return normalizarFechaYYYYMMDD(parsed);
    }

    return "";
  };

  const normalizarArrayFechasConstancia = (value: any): string[] => {
    if (!value) return [];

    const values = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(/[;,|]/)
        : [value];

    return Array.from(
      new Set(
        values
          .map((fecha) => normalizarFechaYYYYMMDD(fecha))
          .filter(Boolean),
      ),
    );
  };

  const obtenerFechaAsistenciaYYYYMMDD = (item: any): string => {
    return (
      normalizarFechaYYYYMMDD(item?.fecha) ||
      normalizarFechaYYYYMMDD(item?.fechaAsistencia) ||
      normalizarFechaYYYYMMDD(item?.fechaRegistro) ||
      normalizarFechaYYYYMMDD(item?.ingresoFechaHora) ||
      normalizarFechaYYYYMMDD(item?.ingreso) ||
      normalizarFechaYYYYMMDD(item?.createdAt)
    );
  };

  const normalizarConfigConstanciaCurso = (cursoId: string, data: any) => {
    const fechasHabilitadasConstancia = normalizarArrayFechasConstancia(
      data?.fechasHabilitadasConstancia,
    );
    const fechasConstancia = normalizarArrayFechasConstancia(
      data?.fechasConstancia,
    );
    const fechasMostrarConstancia = normalizarArrayFechasConstancia(
      data?.fechasMostrarConstancia,
    );
    const fechaConstanciaPrincipal = normalizarFechaYYYYMMDD(
      data?.fechaConstanciaPrincipal,
    );

    const fechasPermitidas = Array.from(
      new Set([
        ...fechasHabilitadasConstancia,
        ...fechasConstancia,
        ...fechasMostrarConstancia,
        fechaConstanciaPrincipal,
      ].filter(Boolean)),
    );

    return {
      habilitado: data?.habilitado === true,
      cursoId: data?.cursoId || cursoId,
      cursoNombre:
        data?.cursoNombre ||
        data?.titulo ||
        data?.curso ||
        data?.nombreCurso ||
        "",
      resolucion: data?.resolucion || data?.resolución || "",
      diasCurso: data?.diasCurso || data?.dias || data?.fechasCurso || "",
      fechaEmision:
        data?.fechaEmision ||
        data?.textoEmision ||
        data?.emision ||
        "",
      lugarEmision:
        data?.lugarEmision || "San Fernando del Valle de Catamarca",
      textoBoton: data?.textoBoton || "Ver certificado",
      fechasConstancia,
      fechasHabilitadasConstancia,
      fechasMostrarConstancia,
      fechaConstanciaPrincipal,
      fechasPermitidas,
    };
  };

  const guardarConfigConstanciaEnMapa = (
    mapa: Record<string, any>,
    cursoId: string,
    config: any,
    dataOriginal: any = {},
  ) => {
    const ids = [
      cursoId,
      config?.cursoId,
      dataOriginal?.cursoId,
      dataOriginal?.idCurso,
      dataOriginal?.courseId,
      dataOriginal?.cursoDocId,
    ]
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);

    ids.forEach((id) => {
      mapa[id] = config;
    });

    const nombres = [
      config?.cursoNombre,
      dataOriginal?.cursoNombre,
      dataOriginal?.nombreCurso,
      dataOriginal?.cursoTitulo,
      dataOriginal?.curso,
      dataOriginal?.titulo,
    ]
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);

    nombres.forEach((nombre) => {
      const key = normalizarTextoClave(nombre);
      if (key) mapa[`nombre:${key}`] = config;
    });
  };

  const obtenerConfigConstanciaParaItem = (item: any) => {
    const cursoId = obtenerCursoIdConstancia(item);

    if (cursoId && constanciasPorCurso[cursoId]) {
      return constanciasPorCurso[cursoId];
    }

    const nombresCurso = obtenerNombresCursoConstancia(item);

    for (const nombre of nombresCurso) {
      const key = normalizarTextoClave(nombre);
      if (key && constanciasPorCurso[`nombre:${key}`]) {
        return constanciasPorCurso[`nombre:${key}`];
      }
    }

    return null;
  };

  const puedeMostrarConstanciaParaItem = (item: any) => {
    const configCurso = obtenerConfigConstanciaParaItem(item);
    const modalidadItem = String(item?.modalidad || "virtual")
      .toLowerCase()
      .trim();
    const fechaAsistenciaYYYYMMDD = obtenerFechaAsistenciaYYYYMMDD(item);

    const fechasPermitidas = Array.isArray(configCurso?.fechasPermitidas)
      ? configCurso.fechasPermitidas
      : [];

    return (
      configCurso?.habilitado === true &&
      fechasPermitidas.includes(fechaAsistenciaYYYYMMDD) &&
      modalidadItem === "presencial" &&
      !!item?.ingresoRegistrado &&
      !!item?.salidaRegistrada &&
      esAsistenciaPresente(item)
    );
  };

  const elegirDocRegistro = (docs: any[]) => {
    if (!docs.length) return null;

    return (
      docs.find((d) => tieneIngresoRegistrado(d.data())) ||
      docs.find((d) => d.data()?.presencial === true) ||
      docs[0]
    );
  };

  const obtenerDocsAsistenciaDelUsuario = async () => {
    const docsById = new Map<string, any>();

    for (const dniValue of getDniQueryValues()) {
      const qAtt = query(asistenciaCollection, where("dni", "==", dniValue));
      const snap = await getDocs(qAtt);

      snap.docs.forEach((d) => {
        docsById.set(d.id, d);
      });
    }

    return Array.from(docsById.values());
  };

  const buscarRegistroPresencialExistente = async ({
    sessionId,
    cursoTitulo,
    cursoId,
  }: {
    sessionId: string;
    cursoTitulo: string;
    cursoId?: string;
  }) => {
    const dniRaw = String(userData?.dni ?? "").trim();
    const dniClean = normalizarDniText(userData?.dni);
    const idBase = dniClean || dniRaw || userData?.uid || "sin_id";

    // Primero buscamos el documento nuevo/canónico.
    const posiblesIds = Array.from(
      new Set(
        [
          `${sessionId}_${idBase}`,
          `${sessionId}_${dniRaw}`,
          `${sessionId}_${dniClean}`,
        ].filter(Boolean),
      ),
    );

    for (const id of posiblesIds) {
      const directRef = doc(db, "asistencia", id);
      const directSnap = await getDoc(directRef);

      if (directSnap.exists()) {
        return { ref: directRef, data: directSnap.data(), id };
      }
    }

    // Luego buscamos todos los registros del afiliado y filtramos en memoria.
    // Esto evita errores por índices compuestos de Firestore y además detecta
    // registros viejos creados con addDoc() o con DNI como número/texto.
    const docsUsuario = await obtenerDocsAsistenciaDelUsuario();

    const mismoSessionId = docsUsuario.filter(
      (d) => d.data()?.sessionId === sessionId,
    );

    const elegidoPorSession = elegirDocRegistro(mismoSessionId);
    if (elegidoPorSession) {
      return {
        ref: elegidoPorSession.ref,
        data: elegidoPorSession.data(),
        id: elegidoPorSession.id,
      };
    }

    const cursoActual = normalizarCurso(cursoTitulo || selectedCourse);
    const cursoIdActual = String(cursoId || selectedCourseId || "").trim();

    const mismoCursoFecha = docsUsuario.filter((d) => {
      const data = d.data() || {};
      const cursoDoc = normalizarCurso(data.curso || data.cursoTitulo);
      const cursoIdDoc = obtenerCursoIdConstancia(data);
      const coincideCursoId =
        !!cursoIdActual && !!cursoIdDoc && cursoIdDoc === cursoIdActual;
      const coincideCursoNombre = cursoDoc === cursoActual;

      return (
        data.presencial === true &&
        data.fecha === currentDate &&
        (coincideCursoId || coincideCursoNombre)
      );
    });

    const elegidoPorCursoFecha = elegirDocRegistro(mismoCursoFecha);
    if (elegidoPorCursoFecha) {
      return {
        ref: elegidoPorCursoFecha.ref,
        data: elegidoPorCursoFecha.data(),
        id: elegidoPorCursoFecha.id,
      };
    }

    const nuevoId = `${sessionId}_${idBase}`;
    const nuevoRef = doc(db, "asistencia", nuevoId);
    return { ref: nuevoRef, data: null, id: nuevoId };
  };

  const refrescarHistorial = async () => {
    try {
      if (!userData?.dni) {
        setAttendances([]);
        return;
      }

      const docsUsuario = await obtenerDocsAsistenciaDelUsuario();

      setAttendances(
        docsUsuario.map((d) =>
          buildAttendanceRow({ id: d.id, ...(d.data() || {}) }),
        ),
      );
    } catch {
      setAttendances([]);
    }
  };

  /* --------- Fecha actual DD/MM/YYYY --------- */
  useEffect(() => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const f = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    setCurrentDate(f);
  }, []);

  /* --------- Historial por DNI --------- */
  useEffect(() => {
    refrescarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.dni]);

  /* --------- Flag general cod/boton.cargar --------- */
  useEffect(() => {
    const fetchButtonState = async () => {
      try {
        const botonRef = doc(codCollection, "boton");
        const botonSnap = await getDoc(botonRef);
        const cargar = botonSnap.exists() ? botonSnap.data()?.cargar : "no";
        setIsButtonEnabled(cargar === "si");
      } catch {
        setIsButtonEnabled(false);
      }
    };
    fetchButtonState();
  }, [isModalVisible]);

  /* --------- Leer cod/asistencia (cursoTitulo, modalidad, metodo, sessionId, habilitada) --------- */
  useEffect(() => {
    const fetchAsistenciaConfig = async () => {
      setLoading(true);
      try {
        const asisRef = doc(codCollection, "asistencia");
        const asisSnap = await getDoc(asisRef);
        if (asisSnap.exists()) {
          const data = asisSnap.data() || {};
          setSelectedCourse(data.cursoTitulo || "");
          setSelectedCourseId(
            data.cursoId || data.idCurso || data.courseId || data.cursoDocId || "",
          );
          setModalidad(
            (data.modalidad as "virtual" | "presencial") || "virtual",
          );
          setMetodo(data.metodo);
          setSessionIdCfg(data.sessionId);
          setTipoRegistroActivoCfg(normalizarTipoRegistro(data.tipoRegistro));
          setHabilitadaCfg(!!data.habilitada);
        } else {
          setSelectedCourse("");
          setSelectedCourseId("");
          setModalidad("virtual");
          setMetodo(undefined);
          setSessionIdCfg(undefined);
          setTipoRegistroActivoCfg("ingreso");
          setHabilitadaCfg(false);
        }
      } catch {
        setSelectedCourse("");
        setSelectedCourseId("");
        setModalidad("virtual");
        setMetodo(undefined);
        setSessionIdCfg(undefined);
        setTipoRegistroActivoCfg("ingreso");
        setHabilitadaCfg(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAsistenciaConfig();
  }, [isModalVisible]);

  /* --------- Leer constancias/certificados por curso --------- */
  useEffect(() => {
    const fetchConstanciasPorCurso = async () => {
      try {
        setConstanciaGlobalCfg({
          textoBotonDefault: "Ver certificado",
        });

        const cursosConstanciaRef = collection(
          db,
          "cod",
          "constancia_certificado",
          "cursos",
        );

        const cursosConstanciaSnap = await getDocs(cursosConstanciaRef);
        const configs: Record<string, any> = {};

        cursosConstanciaSnap.docs.forEach((documentoCurso) => {
          const data = documentoCurso.data() || {};
          const config = normalizarConfigConstanciaCurso(
            documentoCurso.id,
            data,
          );

          guardarConfigConstanciaEnMapa(
            configs,
            documentoCurso.id,
            config,
            data,
          );
        });

        setConstanciasPorCurso(configs);
      } catch {
        setConstanciaGlobalCfg({
          textoBotonDefault: "Ver certificado",
        });
        setConstanciasPorCurso({});
      }
    };

    fetchConstanciasPorCurso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible, attendances.length]);

  /* --------- Registrar asistencia VIRTUAL (sin QR) --------- */
  const registerAttendanceVirtual = async () => {
    try {
      if (!selectedCourse || !selectedLevel) {
        friendlyError(
          "Seleccione nivel educativo y verifique curso habilitado.",
        );
        return;
      }
      if (!userData?.dni) {
        friendlyError("No se encontró el DNI del usuario.");
        return;
      }

      setProcesandoTexto("Verificando datos y registrando asistencia virtual...");
      setProcesandoRegistro(true);

      const validacionDispositivo = await validarDispositivoAsistencia();

      setProcesandoTexto("Verificando duplicados de asistencia virtual...");

      const dupSnap = await getDocs(
        query(
          asistenciaCollection,
          where("dni", "==", userData.dni),
          where("curso", "==", selectedCourse),
          where("fecha", "==", currentDate),
        ),
      );
      if (!dupSnap.empty) {
        friendlyError("Ya registraste asistencia para este curso hoy.");
        return;
      }
      await addDoc(asistenciaCollection, {
        apellido: userData?.apellido || "Sin apellido",
        nombre: userData?.nombre || "Sin nombre",
        dni: userData?.dni || "Sin DNI",
        departamento: userData?.departamento || "Sin departamento",
        nivelEducativo: selectedLevel,
        curso: selectedCourse,
        cursoTitulo: selectedCourse,
        cursoId: selectedCourseId || null,
        fecha: currentDate,
        presencial: false,
        modalidad: "virtual",
        asistenciaValidada: true,
        estadoAsistencia: "validada",
        deviceId: validacionDispositivo.deviceId,
        dispositivoAsistenciaId: validacionDispositivo.deviceId,
        dispositivoValidado: true,
        dispositivoVinculadoAhora: validacionDispositivo.vinculadoAhora,
        dispositivoAfiliadoColeccion: validacionDispositivo.afiliadoColeccion,
        dispositivoAfiliadoDocId: validacionDispositivo.afiliadoDocId,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Asistencia", "Asistencia registrada con éxito.");
      await refrescarHistorial();
      toggleModal();
    } catch (error) {
      console.error("Asistencia virtual:", error);

      const errorMessage = error instanceof Error ? error.message : "";
      friendlyError(
        errorMessage || "Error al registrar la asistencia. Intente nuevamente.",
      );
    } finally {
      setProcesandoRegistro(false);
    }
  };

  /* --------- Registrar asistencia PRESENCIAL (QR) --------- */
  const openScanner = async () => {
    if (procesandoRegistro) return;

    if (!selectedLevel) {
      friendlyError("Seleccione un nivel educativo antes de continuar.");
      return;
    }
    if (!isButtonEnabled || !habilitadaCfg) {
      friendlyError("Asistencia deshabilitada por el organizador.");
      return;
    }
    if (!selectedCourse) {
      friendlyError("No hay curso habilitado.");
      return;
    }
    if (
      modalidad !== "presencial" ||
      (metodo !== "qr_static" && metodo !== "qr_dynamic")
    ) {
      friendlyError("Este curso no utiliza registro por QR.");
      return;
    }
    const perm = await requestPermission();
    setHasPermission(perm?.granted ?? false);
    setScannedOnce(false);
    setScanVisible(true);
  };

  const onBarcodeScan = async (result: { data: string; type: string }) => {
    if (scannedOnce) return;
    setScannedOnce(true);
    setScanVisible(false);
    setProcesandoTexto("Verificando QR y registrando asistencia...");
    setProcesandoRegistro(true);

    try {
      const { sessionParam, codeParam, tipoRegistroQR } = parseAsistenciaUrl(
        result.data,
      );
      const sessionId = sessionParam === "auto" ? sessionIdCfg : sessionParam;

      if (!sessionId) {
        friendlyError(
          "No se pudo resolver la sesión activa. Intente nuevamente.",
        );
        return;
      }

      if (!userData?.dni) {
        friendlyError("No se encontró el DNI del usuario.");
        return;
      }

      const sesRef = doc(db, "asistencia_sesiones", sessionId);
      const sesSnap = await getDoc(sesRef);

      if (!sesSnap.exists()) {
        friendlyError("Sesión de asistencia no encontrada.");
        return;
      }

      const s = sesSnap.data() as {
        estado: "abierta" | "cerrada";
        desde: string;
        hasta: string;
        codigo: string;
        cursoId?: string;
        cursoTitulo?: string;
        tipoRegistro?: TipoRegistroQR;
        requiereSalida?: boolean;
        validacionAsistencia?: string;
      };

      if (s.estado !== "abierta") {
        friendlyError("Sesión cerrada o vencida.");
        return;
      }

      if (!nowIsBetween(s.desde, s.hasta)) {
        friendlyError("Fuera de la ventana horaria de asistencia.");
        return;
      }

      if (s.codigo !== codeParam) {
        friendlyError("Código inválido o no vigente.");
        return;
      }

      const tipoActivoSesion = normalizarTipoRegistro(s.tipoRegistro);

      if (tipoActivoSesion !== tipoRegistroQR) {
        friendlyError(
          `Este QR no corresponde al registro activo. Actualmente está habilitado: ${cap(tipoActivoSesion)}.`,
        );
        return;
      }

      const cursoSesion = s.cursoTitulo || selectedCourse;
      const cursoIdSesion = s.cursoId || selectedCourseId || "";

      const validacionDispositivo = await validarDispositivoAsistencia();

      setProcesandoTexto(`Registrando ${tipoRegistroQR} de asistencia...`);

      const registroExistente = await buscarRegistroPresencialExistente({
        sessionId,
        cursoTitulo: cursoSesion,
        cursoId: cursoIdSesion,
      });

      const ref = registroExistente.ref;
      const anterior = registroExistente.data;
      const ingresoRegistrado = tieneIngresoRegistrado(anterior);
      const salidaRegistrada = tieneSalidaRegistrada(anterior);
      const nowISO = new Date().toISOString();
      const dniClean = normalizarDniText(userData.dni);
      const idUser =
        dniClean || String(userData.dni || userData?.uid || "sin_id");

      const baseRegistro = {
        sessionId,
        uid: idUser,
        dni: (dniClean || userData.dni) ?? null,
        apellido: userData?.apellido || "Sin apellido",
        nombre: userData?.nombre || "Sin nombre",
        departamento: userData?.departamento || "Sin departamento",
        nivelEducativo: selectedLevel,
        curso: cursoSesion,
        cursoTitulo: cursoSesion,
        cursoId: cursoIdSesion || null,
        fecha: currentDate,
        presencial: true,
        modalidad: "presencial",
        requiereSalida: true,
        validacionAsistencia: "ingreso_salida",
        deviceId: validacionDispositivo.deviceId,
        dispositivoAsistenciaId: validacionDispositivo.deviceId,
        dispositivoValidado: true,
        dispositivoVinculadoAhora: validacionDispositivo.vinculadoAhora,
        dispositivoAfiliadoColeccion: validacionDispositivo.afiliadoColeccion,
        dispositivoAfiliadoDocId: validacionDispositivo.afiliadoDocId,
        updatedAt: serverTimestamp(),
      };

      if (tipoRegistroQR === "ingreso") {
        if (ingresoRegistrado) {
          Alert.alert(
            "Asistencia",
            salidaRegistrada
              ? "Tu asistencia ya tiene ingreso y salida registrados."
              : "Tu ingreso ya fue registrado. Al finalizar, escaneá el QR de salida.",
          );
          return;
        }

        await setDoc(
          ref,
          {
            ...baseRegistro,
            ingreso: {
              registrado: true,
              codigoUsado: codeParam,
              fechaHoraISO: nowISO,
              deviceId: validacionDispositivo.deviceId,
              dispositivoValidado: true,
              createdAt: serverTimestamp(),
            },
            codigoIngreso: codeParam,
            asistenciaValidada: salidaRegistrada,
            estadoAsistencia: salidaRegistrada
              ? "validada"
              : "pendiente_salida",
            createdAt: anterior?.createdAt || serverTimestamp(),
          },
          { merge: true },
        );

        Alert.alert(
          "Asistencia",
          "Ingreso registrado correctamente. Para validar la asistencia completa, escaneá el QR de salida al finalizar.",
        );
      } else {
        if (!ingresoRegistrado) {
          friendlyError(
            "La app no encontró el ingreso para esta misma sesión. Verificá que el ingreso se haya registrado con el mismo DNI y en la misma sesión QR. Actualicé la búsqueda para detectar registros anteriores con ID automático.",
          );
          return;
        }

        if (salidaRegistrada) {
          Alert.alert(
            "Asistencia",
            "Tu salida ya fue registrada. La asistencia está validada.",
          );
          return;
        }

        await setDoc(
          ref,
          {
            ...baseRegistro,
            salida: {
              registrado: true,
              codigoUsado: codeParam,
              fechaHoraISO: nowISO,
              deviceId: validacionDispositivo.deviceId,
              dispositivoValidado: true,
              createdAt: serverTimestamp(),
            },
            codigoSalida: codeParam,
            asistenciaValidada: true,
            estadoAsistencia: "validada",
          },
          { merge: true },
        );

        Alert.alert(
          "Asistencia",
          "Salida registrada correctamente. Tu asistencia quedó validada.",
        );
      }

      setProcesandoTexto("Actualizando historial de asistencia...");
      await refrescarHistorial();
    } catch (error) {
      console.error("QR asistencia:", error);

      const errorMessage = error instanceof Error ? error.message : "";

      if (
        errorMessage &&
        errorMessage !== "sin query" &&
        errorMessage !== "faltan params"
      ) {
        friendlyError(errorMessage);
      } else {
        friendlyError("QR inválido.");
      }
    } finally {
      setProcesandoRegistro(false);
    }
  };

  /* --------- Habilitación de botones por modalidad --------- */
  const levelSelected = !!selectedLevel;
  const isVirtualActive =
    isButtonEnabled &&
    habilitadaCfg &&
    !!selectedCourse &&
    modalidad === "virtual" &&
    levelSelected;
  const isPresencialQRActive =
    isButtonEnabled &&
    habilitadaCfg &&
    !!selectedCourse &&
    modalidad === "presencial" &&
    (metodo === "qr_static" || metodo === "qr_dynamic") &&
    levelSelected;

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={{ fontSize: 24, color: "#ffffff" }}>
            Registro de Asistencia
          </Text>
        </View>

        <View style={styles.viewInformation}>
          <Text style={styles.text}>
            El Sindicato de Docentes de Catamarca ha implementado un sistema
            innovador para el registro de asistencia en sus capacitaciones,
            talleres, cursos y congresos. A través de la modalidad presencial o
            virtual sincrónica, los participantes podrán registrar su asistencia
            de forma ágil mediante la app del sindicato, accediendo al apartado
            "Registro de Asistencia". Además, ofrece a los afiliados la
            posibilidad de realizar un seguimiento continuo de su participación
            en actividades formativas, contribuyendo a su desarrollo profesional
            y garantizando un registro completo de su formación. ¡Una
            herramienta más que fortalece la gestión eficiente y el compromiso
            con la calidad educativa!
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={localImage}
            style={styles.imageOutsideText}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.btnNews}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <Text style={{ color: "#ffffff", fontSize: 19 }}>
            Registrar Asistencia al Curso
          </Text>
        </TouchableOpacity>

        {/* Modal principal */}
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { margin: 20 }]}>
              {loading ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                  {/* Datos afiliado */}
                  <View
                    style={{
                      borderColor: "black",
                      borderWidth: 2,
                      borderRadius: 8,
                      padding: 10,
                    }}
                  >
                    <View style={styles.mainInformationContainer}>
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        Afiliado:{" "}
                        {userData?.apellido ? `${userData.apellido}, ` : ""}
                        {userData?.nombre}
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        D.N.I.: {userData?.dni}
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        Departamento: {userData?.departamento ?? "Sin asignar"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  <View
                    style={{
                      borderColor: "black",
                      borderWidth: 2,
                      borderRadius: 8,
                      padding: 20,
                    }}
                  >
                    <Text style={styles.modalText}>Nivel Educativo:</Text>
                    <Picker
                      selectedValue={selectedLevel}
                      style={styles.input}
                      onValueChange={(v) => setSelectedLevel(v)}
                    >
                      <Picker.Item
                        label="Seleccione un nivel educativo"
                        value=""
                      />
                      <Picker.Item
                        label="Nivel Inicial"
                        value="Nivel Inicial"
                      />
                      <Picker.Item
                        label="Nivel Primario"
                        value="Nivel Primario"
                      />
                      <Picker.Item
                        label="Nivel Secundario"
                        value="Nivel Secundario"
                      />
                      <Picker.Item
                        label="Nivel Superior"
                        value="Nivel Superior"
                      />
                      <Picker.Item
                        label="Educación Técnica (Técnica/Agro/FP)"
                        value="Educación Técnica (Técnica/Agro/FP)"
                      />
                    </Picker>
                    {!selectedLevel && (
                      <Text
                        style={{
                          color: "#9B1C1C",
                          marginTop: -14,
                          marginBottom: 12,
                          fontWeight: "600",
                        }}
                      >
                        Campo obligatorio
                      </Text>
                    )}

                    {/* Curso desde cod/asistencia (sin lista) con estética mejorada */}
                    <Text style={styles.modalText}>Curso habilitado:</Text>
                    <CursoHabilitadoCard
                      titulo={selectedCourse}
                      modalidad={modalidad}
                      habilitado={!!selectedCourse}
                    />

                    {/* Fecha + Modalidad */}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        marginTop: -8,
                      }}
                    >
                      Fecha: {currentDate}
                    </Text>
                    <Text
                      style={{ fontSize: 16, fontWeight: "bold", marginTop: 2 }}
                    >
                      Modalidad: {cap(modalidad)}
                    </Text>

                    {modalidad === "presencial" && (
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "bold",
                          marginTop: 2,
                          color:
                            tipoRegistroActivoCfg === "salida"
                              ? "#9B1C1C"
                              : "#166534",
                        }}
                      >
                        QR activo:{" "}
                        {cap(tipoRegistroActivoCfg)}
                      </Text>
                    )}

                    {/* Botón según modalidad (deshabilitado si falta nivel) */}
                    {modalidad === "virtual" ? (
                      <TouchableOpacity
                        style={[
                          styles.btnCommon,
                          {
                            backgroundColor:
                              isVirtualActive && !procesandoRegistro
                                ? "#005CFE"
                                : "#A9A9A9",
                            marginTop: 12,
                          },
                        ]}
                        onPress={
                          isVirtualActive && !procesandoRegistro
                            ? registerAttendanceVirtual
                            : undefined
                        }
                        activeOpacity={isVirtualActive && !procesandoRegistro ? 0.7 : 1}
                        disabled={procesandoRegistro || !isVirtualActive}
                      >
                        <Text style={styles.commonBtnText}>
                          Registrar Asistencia virtual
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.btnCommon,
                          {
                            backgroundColor:
                              isPresencialQRActive && !procesandoRegistro
                                ? "#005CFE"
                                : "#A9A9A9",
                            marginTop: 12,
                          },
                        ]}
                        onPress={
                          isPresencialQRActive && !procesandoRegistro
                            ? openScanner
                            : undefined
                        }
                        activeOpacity={isPresencialQRActive && !procesandoRegistro ? 0.7 : 1}
                        disabled={procesandoRegistro || !isPresencialQRActive}
                      >
                        <Text style={styles.commonBtnText}>
                          Escanear QR de {cap(tipoRegistroActivoCfg)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.separator} />

                  {/* Historial */}
                  <View
                    style={{
                      alignSelf: "stretch",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: "#111827",
                        color: "#ffffff",
                        fontSize: 17,
                        fontWeight: "900",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        marginBottom: 10,
                      }}
                    >
                      Asistencias cargadas
                    </Text>

                    <View
                      style={{
                        borderColor: "#111827",
                        borderWidth: 2,
                        borderRadius: 12,
                        padding: 10,
                        backgroundColor: "rgba(255,255,255,0.25)",
                      }}
                    >
                      {attendances.length === 0 ? (
                        <View
                          style={{
                            backgroundColor: "#F9FAFB",
                            borderRadius: 12,
                            padding: 14,
                          }}
                        >
                          <Text
                            style={{
                              color: "#374151",
                              fontSize: 15,
                              textAlign: "center",
                              fontWeight: "700",
                            }}
                          >
                            Todavía no hay asistencias registradas.
                          </Text>
                        </View>
                      ) : (
                        Object.entries(
                          attendances
                            .sort(
                              (a, b) =>
                                parseFechaARToTime(b.fecha) -
                                parseFechaARToTime(a.fecha),
                            )
                            .reduce((acc: any, item: any) => {
                              if (!acc[item.curso]) acc[item.curso] = [];
                              acc[item.curso].push(item);
                              return acc;
                            }, {}),
                        ).map(([curso, asistencias]: any, idx: number) => (
                          <View
                            key={idx}
                            style={{
                              marginTop: idx === 0 ? 0 : 12,
                              padding: 12,
                              backgroundColor: "#F8FAFC",
                              borderRadius: 14,
                              borderColor: "#E5E7EB",
                              borderWidth: 1,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "900",
                                color: "#111827",
                                marginBottom: 10,
                                lineHeight: 22,
                              }}
                            >
                              Curso: {curso}
                            </Text>

                            {asistencias.map((it: any, i: number) => {
                              const estado = getEstadoVisual(it);
                              const esPresencial =
                                (it.modalidad || "virtual") === "presencial";
                              const configConstanciaCurso =
                                obtenerConfigConstanciaParaItem(it);
                              const mostrarConstancia =
                                puedeMostrarConstanciaParaItem(it);

                              return (
                                <View
                                  key={i}
                                  style={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: 12,
                                    borderColor: estado.border,
                                    borderWidth: esAsistenciaPresente(it) ? 2 : 1,
                                    padding: 12,
                                    marginTop: i === 0 ? 0 : 10,
                                  }}
                                >
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      gap: 8,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <View style={{ flex: 1, minWidth: 170 }}>
                                      <Text
                                        style={{
                                          color: "#111827",
                                          fontSize: 15,
                                          fontWeight: "900",
                                        }}
                                      >
                                        {it.fecha || "Fecha sin cargar"}
                                      </Text>
                                      <Text
                                        style={{
                                          color: "#4B5563",
                                          fontSize: 13,
                                          fontWeight: "700",
                                          marginTop: 2,
                                        }}
                                      >
                                        Modalidad: {cap(it.modalidad || "virtual")}
                                      </Text>
                                    </View>

                                    <EstadoBadge item={it} />
                                  </View>

                                  {esPresencial ? (
                                    <>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          gap: 8,
                                          flexWrap: "wrap",
                                          marginTop: 12,
                                        }}
                                      >
                                        <CheckChip
                                          label="Ingreso"
                                          ok={!!it.ingresoRegistrado}
                                          hora={formatTimeAR(it.ingresoFechaHora)}
                                        />
                                        <CheckChip
                                          label="Salida"
                                          ok={!!it.salidaRegistrada}
                                          hora={formatTimeAR(it.salidaFechaHora)}
                                        />
                                      </View>

                                      <Text
                                        style={{
                                          marginTop: 10,
                                          color: estado.text,
                                          fontSize: 13,
                                          fontWeight: "800",
                                          lineHeight: 18,
                                        }}
                                      >
                                        {estado.detail}
                                      </Text>

                                      {mostrarConstancia && configConstanciaCurso && (
                                        <ConstanciaCapacitacionButton
                                          asistencia={{
                                            ...it,
                                            apellido:
                                              it.apellido ||
                                              userData?.apellido ||
                                              "",
                                            nombre:
                                              it.nombre || userData?.nombre || "",
                                            dni: it.dni || userData?.dni || "",
                                            departamento:
                                              it.departamento ||
                                              userData?.departamento ||
                                              "",
                                            cursoId:
                                              it.cursoId ||
                                              configConstanciaCurso.cursoId ||
                                              "",
                                            cursoNombre:
                                              it.cursoNombre ||
                                              it.curso ||
                                              configConstanciaCurso.cursoNombre ||
                                              selectedCourse,
                                            nombreCurso:
                                              it.nombreCurso || it.curso || selectedCourse,
                                            cursoTitulo:
                                              it.cursoTitulo || it.curso || selectedCourse,
                                            ingreso:
                                              it.ingreso || it.ingresoFechaHora,
                                            salida:
                                              it.salida || it.salidaFechaHora,
                                            estado: esAsistenciaPresente(it)
                                              ? "presente"
                                              : it.estadoAsistencia,
                                          }}
                                          configuracionConstancia={
                                            configConstanciaCurso
                                          }
                                          textoBoton={
                                            configConstanciaCurso.textoBoton ||
                                            constanciaGlobalCfg.textoBotonDefault ||
                                            "Ver certificado"
                                          }
                                        />
                                      )}
                                    </>
                                  ) : (
                                    <Text
                                      style={{
                                        marginTop: 8,
                                        color: estado.text,
                                        fontSize: 13,
                                        fontWeight: "800",
                                      }}
                                    >
                                      {estado.detail}
                                    </Text>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        ))
                      )}
                    </View>
                  </View>

                </ScrollView>
              )}
              <View style={styles.separator} />
              <TouchableOpacity style={styles.btnCommon} onPress={toggleModal}>
                <Text style={styles.commonBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de escaneo QR para presencial */}
        <Modal visible={scanVisible} animationType="slide">
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            {hasPermission === false ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, textAlign: "center" }}
                >
                  Sin permisos de cámara. Otorgá el permiso desde Ajustes.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.btnCommon,
                    { backgroundColor: "#fff", marginTop: 16 },
                  ]}
                  onPress={() => setScanVisible(false)}
                >
                  <Text style={[styles.commonBtnText, { color: "#000" }]}>
                    Cerrar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={(e) =>
                  onBarcodeScan({ data: e.data, type: e.type as string })
                }
              />
            )}
            <View
              style={{
                position: "absolute",
                top: 50,
                left: 20,
                right: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => setScanVisible(false)}
                style={{
                  backgroundColor: "#ffffffaa",
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal procesando carga/verificación */}
        <Modal
          visible={procesandoRegistro}
          transparent
          animationType="fade"
          statusBarTranslucent
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.45)",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <View
              style={{
                width: "86%",
                maxWidth: 360,
                backgroundColor: "#ffffff",
                borderRadius: 18,
                paddingVertical: 28,
                paddingHorizontal: 22,
                alignItems: "center",
                elevation: 8,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <ActivityIndicator size="large" color="#005CFE" />
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 19,
                  fontWeight: "800",
                  color: "#111827",
                  textAlign: "center",
                }}
              >
                Procesando...
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  color: "#374151",
                  textAlign: "center",
                  lineHeight: 21,
                }}
              >
                {procesandoTexto}
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#6b7280",
                  textAlign: "center",
                }}
              >
                No cierres la app hasta que finalice el registro.
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
