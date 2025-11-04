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
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
import { CameraView, useCameraPermissions } from "expo-camera";

const localImage = require("../../assets/logos/secretaria.png");

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
    <View style={[!habilitado && cursoCardStyles.iconWrapDisabled]}>
       </View>
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

  // Config leída de cod/asistencia
  const [selectedCourse, setSelectedCourse] = useState("");
  const [modalidad, setModalidad] = useState<"virtual" | "presencial">(
    "virtual"
  );
  const [metodo, setMetodo] = useState<string | undefined>(undefined);
  const [sessionIdCfg, setSessionIdCfg] = useState<string | undefined>(
    undefined
  );
  const [habilitadaCfg, setHabilitadaCfg] = useState<boolean>(false);

  // Form + estado general
  const [selectedLevel, setSelectedLevel] = useState("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [attendances, setAttendances] = useState<any[]>([]);

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
    // sidca://asistencia?s=auto&c=ABCD-EF12&v=1
    const raw = urlStr.trim();
    const qIndex = raw.indexOf("?");
    if (qIndex === -1) throw new Error("sin query");
    const queryStr = raw.slice(qIndex + 1);
    const params = new URLSearchParams(queryStr);
    const s = params.get("s") || "auto";
    const c = params.get("c") || "";
    if (!s || !c) throw new Error("faltan params");
    return { sessionParam: s, codeParam: c };
  };
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  /* --------- Fecha actual DD/MM/YYYY --------- */
  useEffect(() => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const f = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    setCurrentDate(f);
  }, []);

  /* --------- Historial por DNI --------- */
  useEffect(() => {
    const fetchAttendancesByDni = async () => {
      try {
        if (!userData?.dni) {
          setAttendances([]);
          return;
        }
        const qAtt = query(
          asistenciaCollection,
          where("dni", "==", userData.dni)
        );
        const snap = await getDocs(qAtt);
        if (snap.empty) {
          setAttendances([]);
        } else {
          const rows = snap.docs.map((d) => ({
            curso: d.data().curso,
            fecha: d.data().fecha,
            modalidad: d.data().modalidad,
          }));
          setAttendances(rows);
        }
      } catch {
        setAttendances([]);
      }
    };
    fetchAttendancesByDni();
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
          setModalidad(
            (data.modalidad as "virtual" | "presencial") || "virtual"
          );
          setMetodo(data.metodo);
          setSessionIdCfg(data.sessionId);
          setHabilitadaCfg(!!data.habilitada);
        } else {
          setSelectedCourse("");
          setModalidad("virtual");
          setMetodo(undefined);
          setSessionIdCfg(undefined);
          setHabilitadaCfg(false);
        }
      } catch {
        setSelectedCourse("");
        setModalidad("virtual");
        setMetodo(undefined);
        setSessionIdCfg(undefined);
        setHabilitadaCfg(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAsistenciaConfig();
  }, [isModalVisible]);

  /* --------- Registrar asistencia VIRTUAL (sin QR) --------- */
  const registerAttendanceVirtual = async () => {
    try {
      if (!selectedCourse || !selectedLevel) {
        friendlyError(
          "Seleccione nivel educativo y verifique curso habilitado."
        );
        return;
      }
      if (!userData?.dni) {
        friendlyError("No se encontró el DNI del usuario.");
        return;
      }
      const dupSnap = await getDocs(
        query(
          asistenciaCollection,
          where("dni", "==", userData.dni),
          where("curso", "==", selectedCourse),
          where("fecha", "==", currentDate)
        )
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
        fecha: currentDate,
        presencial: false,
        modalidad: "virtual",
      });
      Alert.alert("Asistencia", "Asistencia registrada con éxito.");
      toggleModal();
    } catch {
      friendlyError("Error al registrar la asistencia. Intente nuevamente.");
    }
  };

  /* --------- Registrar asistencia PRESENCIAL (QR) --------- */
  const openScanner = async () => {
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
    if (modalidad !== "presencial" || metodo !== "qr_static") {
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
    try {
      const { sessionParam, codeParam } = parseAsistenciaUrl(result.data);
      const sessionId = sessionParam === "auto" ? sessionIdCfg : sessionParam;
      if (!sessionId) {
        friendlyError(
          "No se pudo resolver la sesión activa. Intente nuevamente."
        );
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

      // Idempotente: docId = sessionId + "_" + DNI (o uid)
      const idUser = userData?.dni || userData?.uid || "sin_id";
      const idDoc = `${sessionId}_${idUser}`;
      const ref = doc(db, "asistencia", idDoc);
      const ex = await getDoc(ref);
      if (ex.exists()) {
        Alert.alert("Asistencia", "Asistencia ya registrada.");
        return;
      }
      await setDoc(ref, {
        sessionId,
        uid: idUser,
        dni: userData?.dni ?? null,
        apellido: userData?.apellido || "Sin apellido",
        nombre: userData?.nombre || "Sin nombre",
        departamento: userData?.departamento || "Sin departamento",
        nivelEducativo: selectedLevel,
        curso: selectedCourse,
        cursoTitulo: selectedCourse,
        codigoUsado: codeParam,
        fecha: currentDate,
        presencial: true,
        modalidad: "presencial",
        createdAt: serverTimestamp(),
      });
      Alert.alert("Asistencia", "¡Asistencia presencial registrada con éxito!");

      // refrescar historial
      const qAtt = query(
        asistenciaCollection,
        where("dni", "==", userData?.dni || "")
      );
      const snap = await getDocs(qAtt);
      const rows = snap.docs.map((d) => ({
        curso: d.data().curso,
        fecha: d.data().fecha,
        modalidad: d.data().modalidad,
      }));
      setAttendances(rows);
    } catch {
      friendlyError("QR inválido.");
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
    metodo === "qr_static" &&
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

                    {/* Botón según modalidad (deshabilitado si falta nivel) */}
                    {modalidad === "virtual" ? (
                      <TouchableOpacity
                        style={[
                          styles.btnCommon,
                          {
                            backgroundColor: isVirtualActive
                              ? "#005CFE"
                              : "#A9A9A9",
                            marginTop: 12,
                          },
                        ]}
                        onPress={
                          isVirtualActive
                            ? registerAttendanceVirtual
                            : undefined
                        }
                        activeOpacity={isVirtualActive ? 0.7 : 1}
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
                            backgroundColor: isPresencialQRActive
                              ? "#005CFE"
                              : "#A9A9A9",
                            marginTop: 12,
                          },
                        ]}
                        onPress={isPresencialQRActive ? openScanner : undefined}
                        activeOpacity={isPresencialQRActive ? 0.7 : 1}
                      >
                        <Text style={styles.commonBtnText}>
                          Registrar asistencia Presencial QR
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.separator} />

                  {/* Historial */}
                  <Text
                    style={[
                      styles.modalDescription,
                      {
                        alignSelf: "flex-start",
                        borderColor: "black",
                        borderWidth: 2,
                        borderRadius: 5,
                        padding: 5,
                        marginBottom: 5,
                        backgroundColor: "#f0f0f0",
                      },
                    ]}
                  >
                    Asistencias cargadas:
                  </Text>
                  <View
                    style={{
                      borderColor: "black",
                      borderWidth: 2,
                      borderRadius: 8,
                      padding: 10,
                    }}
                  >
                    {Object.entries(
                      attendances
                        .sort(
                          (a, b) =>
                            (new Date(b.fecha) as any) -
                            (new Date(a.fecha) as any)
                        )
                        .reduce((acc: any, item: any) => {
                          if (!acc[item.curso]) acc[item.curso] = [];
                          acc[item.curso].push(item);
                          return acc;
                        }, {})
                    ).map(([curso, asistencias]: any, idx: number) => (
                      <View
                        key={idx}
                        style={{
                          marginTop: 10,
                          padding: 10,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                          Curso: {curso}
                        </Text>
                        {asistencias.map((it: any, i: number) => (
                          <Text key={i} style={{ fontSize: 14, color: "#555" }}>
                            Fecha: {it.fecha} — Modalidad:{" "}
                            {cap(it.modalidad || "virtual")}
                          </Text>
                        ))}
                      </View>
                    ))}
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
                barcodeScannerEnabled
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
      </View>
    </View>
  );
}
