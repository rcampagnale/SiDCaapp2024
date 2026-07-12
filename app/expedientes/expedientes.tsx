import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  LayoutAnimation,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  orderBy,
  getCountFromServer,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
import { SidcaContext } from "../_layout";
import styles from "../../styles/expedientes/expedientes";

type Expediente = {
  id: string;
  dni?: string;
  apellidoNombre?: string;
  departamento?: string;
  nivel?: string;
  dependencia?: string;
  estado?: string;
  estadoSueldo?: string;
  observacionActual?: string;
  expediente?: string;
  fechaInicio?: any;
  finalizado?: boolean;
  fechaFinalizacion?: any;
  mensajeFinalizacion?: string;
  haberFinalizacionMes?: string;
  cobroFinalizacionMes?: string;
  createdAt?: any;
  updatedAt?: any;
};

type Movimiento = {
  id: string;
  tipo?: string;
  fecha?: any;
  observacion?: string;
  dependenciaAnterior?: string;
  dependenciaNueva?: string;
  estadoSueldoAnterior?: string;
  estadoSueldoNuevo?: string;
  usuarioDni?: string;
  usuarioNombre?: string;
  usuarioUid?: string;
};

type Badge = { bg: string; text: string; border: string };

const ESTADO_LABELS: Record<string, string> = {
  ALTA_DE_SERVICIO: "Alta de servicio",
  RECLAMO: "Reclamo",
  DEUDA: "Deuda",
  VARIOS: "Varios",
  SOLICITUD: "Solicitud",
};

const ESTADO_COLORS: Record<string, Badge> = {
  ALTA_DE_SERVICIO: { bg: "#DBEAFE", text: "#1E40AF", border: "#3B82F6" },
  RECLAMO: { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
  DEUDA: { bg: "#FEE2E2", text: "#991B1B", border: "#EF4444" },
  VARIOS: { bg: "#E5E7EB", text: "#374151", border: "#9CA3AF" },
  SOLICITUD: { bg: "#DCFCE7", text: "#166534", border: "#22C55E" },
};

const TIPO_MOVIMIENTO_LABELS: Record<string, string> = {
  observacion: "Observación",
  edicion_expediente: "Edición del expediente",
  cambio_dependencia: "Cambio de dependencia",
  cambio_estado_sueldo: "Cambio de estado de sueldo",
  finalizacion_expediente: "Finalización del expediente",
};

const TIPO_MOVIMIENTO_ICONOS: Record<string, string> = {
  observacion: "comment-o",
  edicion_expediente: "pencil",
  cambio_dependencia: "exchange",
  cambio_estado_sueldo: "money",
  finalizacion_expediente: "flag-checkered",
};

const TIPO_MOVIMIENTO_COLORES: Record<string, string> = {
  observacion: "#3B82F6",
  edicion_expediente: "#8B5CF6",
  cambio_dependencia: "#F59E0B",
  cambio_estado_sueldo: "#10B981",
  finalizacion_expediente: "#22C55E",
};

const COLOR_MOVIMIENTO_DEFAULT = "#6B7280";
const ICONO_MOVIMIENTO_DEFAULT = "info";

const capitalizar = (texto: string) =>
  texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : texto;

const formatearEstadoGenerico = (valor?: string) =>
  valor ? capitalizar(String(valor).replace(/_/g, " ")) : "";

const formatearTipoMovimiento = (tipo?: string) => {
  if (!tipo) return "Movimiento";
  return TIPO_MOVIMIENTO_LABELS[tipo] || capitalizar(tipo.replace(/_/g, " "));
};

const formatearFecha = (value: any) => {
  if (!value) return "—";
  const d = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatearFechaHora = (value: any) => {
  if (!value) return "—";
  const d = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ESTADOS_QUE_OCULTAN_OBSERVACION_ACTUAL = ["finalizado", "alta"];

// Considera finalizado tanto el flag booleano existente como los valores de
// "estado" que en la práctica representan un expediente cerrado (sin
// distinguir mayúsculas/minúsculas).
const esExpedienteFinalizado = (expediente: Expediente) => {
  if (expediente.finalizado === true) return true;

  const estadoNormalizado = String(expediente.estado || "")
    .trim()
    .toLowerCase();

  return ESTADOS_QUE_OCULTAN_OBSERVACION_ACTUAL.includes(estadoNormalizado);
};

const Badge = ({ label, colors }: { label: string; colors: Badge }) => (
  <View
    style={[
      styles.badge,
      { backgroundColor: colors.bg, borderColor: colors.border },
    ]}
  >
    <Text style={[styles.badgeText, { color: colors.text }]}>{label}</Text>
  </View>
);

export default function Expedientes() {
  const statusBarHeight = StatusBar.currentHeight || 0;
  const { userData } = useContext(SidcaContext);
  const db = getFirestore(firebaseconn);

  const dni = String(userData?.dni ?? "").trim();

  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [expedienteExpandidoId, setExpedienteExpandidoId] = useState<
    string | null
  >(null);
  const [movimientosCount, setMovimientosCount] = useState<
    Record<string, number>
  >({});

  const [historialVisible, setHistorialVisible] = useState(false);
  const [expedienteSeleccionado, setExpedienteSeleccionado] =
    useState<Expediente | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  useEffect(() => {
    const cargarExpedientes = async () => {
      if (!dni) {
        setExpedientes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const ref = collection(
          db,
          "expedientes",
          "sueldo",
          "registros",
          dni,
          "expedientes",
        );

        const snap = await getDocs(ref);

        const data = snap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Expediente)
          .sort((a, b) => {
            const fechaA = a?.createdAt?.toDate?.()?.getTime?.() || 0;
            const fechaB = b?.createdAt?.toDate?.()?.getTime?.() || 0;
            return fechaB - fechaA;
          });

        setExpedientes(data);
        setMovimientosCount({});

        // Conteo de movimientos por expediente: se resuelve en paralelo y no
        // bloquea la lista principal, cada badge aparece a medida que llega.
        data.forEach((exp) => {
          const movimientosRef = collection(
            db,
            "expedientes",
            "sueldo",
            "registros",
            dni,
            "expedientes",
            exp.id,
            "movimientos",
          );

          getCountFromServer(movimientosRef)
            .then((countSnap) => {
              setMovimientosCount((prev) => ({
                ...prev,
                [exp.id]: countSnap.data().count,
              }));
            })
            .catch(() => {});
        });
      } catch (error) {
        console.error("Error al cargar expedientes:", error);
        setExpedientes([]);
      } finally {
        setLoading(false);
      }
    };

    cargarExpedientes();
  }, [dni]);

  const verHistorial = async (expediente: Expediente) => {
    setExpedienteSeleccionado(expediente);
    setHistorialVisible(true);
    setMovimientos([]);
    setCargandoHistorial(true);

    try {
      const ref = collection(
        db,
        "expedientes",
        "sueldo",
        "registros",
        dni,
        "expedientes",
        expediente.id,
        "movimientos",
      );

      const movimientosQuery = query(ref, orderBy("fecha", "desc"));
      const snap = await getDocs(movimientosQuery);

      setMovimientos(
        snap.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Movimiento,
        ),
      );
    } catch (error) {
      console.error("Error al cargar historial del expediente:", error);
      setMovimientos([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cerrarHistorial = () => {
    setHistorialVisible(false);
    setExpedienteSeleccionado(null);
    setMovimientos([]);
  };

  const toggleExpedienteExpandido = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpedienteExpandidoId((prev) => (prev === id ? null : id));
  };

  const renderMovimiento = (movimiento: Movimiento) => {
    const detalles: string[] = [];

    if (movimiento.dependenciaAnterior || movimiento.dependenciaNueva) {
      detalles.push(
        `Dependencia: ${movimiento.dependenciaAnterior || "—"} → ${
          movimiento.dependenciaNueva || "—"
        }`,
      );
    }

    const color =
      TIPO_MOVIMIENTO_COLORES[movimiento.tipo || ""] || COLOR_MOVIMIENTO_DEFAULT;
    const icono =
      TIPO_MOVIMIENTO_ICONOS[movimiento.tipo || ""] || ICONO_MOVIMIENTO_DEFAULT;

    return (
      <View key={movimiento.id} style={styles.movimientoRow}>
        <View style={[styles.movimientoIconBox, { backgroundColor: color }]}>
          <FontAwesome name={icono as any} size={14} color="#ffffff" />
        </View>

        <View style={[styles.movimientoItem, { borderLeftColor: color }]}>
          <View style={styles.movimientoHeader}>
            <Text style={styles.movimientoTipo}>
              {formatearTipoMovimiento(movimiento.tipo)}
            </Text>
            <Text style={styles.movimientoFecha}>
              {formatearFechaHora(movimiento.fecha)}
            </Text>
          </View>

          {!!movimiento.observacion && (
            <Text style={styles.movimientoTexto}>{movimiento.observacion}</Text>
          )}

          {detalles.map((detalle, index) => (
            <View key={index} style={styles.movimientoChip}>
              <Text style={styles.movimientoChipText}>{detalle}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: statusBarHeight }]}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={styles.title}>Gestión de Expediente</Text>
        </View>

        <View style={styles.viewInformation}>
          <View style={styles.informationIconBox}>
            <FontAwesome name="folder-open-o" size={21} color="#FEA200" />
          </View>
          <View style={styles.informationTextBox}>
            <Text style={styles.informationTitle}>Tus trámites, en un solo lugar</Text>
            <Text style={styles.text}>
              Consultá el estado actual y revisá cada movimiento registrado.
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Cargando expedientes...</Text>
            </View>
          ) : expedientes.length === 0 ? (
            <View style={styles.emptyBox}>
              <FontAwesome name="folder-open-o" size={32} color="#ffffff" />
              <Text style={styles.emptyTitle}>No tenés expedientes cargados</Text>
              <Text style={styles.emptyText}>
                Cuando se registre un expediente o trámite a tu nombre, vas a
                poder verlo y seguir su historial en este espacio.
              </Text>
            </View>
          ) : (
            expedientes.map((expediente) => {
              const estadoColors =
                ESTADO_COLORS[expediente.estado || ""] || ESTADO_COLORS.VARIOS;
              const estadoLabel =
                ESTADO_LABELS[expediente.estado || ""] ||
                formatearEstadoGenerico(expediente.estado) ||
                "Sin estado";

              const expandido = expedienteExpandidoId === expediente.id;
              const finalizado = esExpedienteFinalizado(expediente);
              const cantidadMovimientos = movimientosCount[expediente.id] || 0;

              return (
                <View key={expediente.id} style={styles.expedienteCard}>
                  <TouchableOpacity
                    style={styles.cardHeader}
                    activeOpacity={0.7}
                    onPress={() => toggleExpedienteExpandido(expediente.id)}
                  >
                    <View style={styles.cardTitleBox}>
                      <Text style={styles.cardEyebrow}>EXPEDIENTE</Text>
                      <Text style={styles.cardTitle}>
                        {expediente.expediente || expediente.id}
                      </Text>
                      <Text style={styles.cardMeta} numberOfLines={1}>
                        Iniciado el {formatearFecha(expediente.fechaInicio)}
                        {expediente.dependencia
                          ? ` · ${expediente.dependencia}`
                          : ""}
                      </Text>
                    </View>

                    <View style={styles.cardHeaderIndicators}>
                      {finalizado ? (
                        <View style={styles.finalizadoIndicator}>
                          <FontAwesome
                            name="check-circle"
                            size={13}
                            color="#166534"
                          />
                          <Text style={styles.finalizadoIndicatorText}>
                            Finalizado
                          </Text>
                        </View>
                      ) : (
                        cantidadMovimientos > 0 && (
                          <View style={styles.movimientosIndicator}>
                            <FontAwesome name="bell" size={11} color="#ffffff" />
                            <Text style={styles.movimientosIndicatorText}>
                              {cantidadMovimientos}
                            </Text>
                          </View>
                        )
                      )}

                      <View style={styles.expandIconBox}>
                        <FontAwesome
                          name={expandido ? "chevron-up" : "chevron-down"}
                          size={13}
                          color="#ffffff"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {expandido && (
                    <View style={styles.cardBody}>
                      <View style={styles.badgesRow}>
                        <Badge label={estadoLabel} colors={estadoColors} />

                        <Badge
                          label={
                            expediente.finalizado ? "Finalizado" : "En trámite"
                          }
                          colors={
                            expediente.finalizado
                              ? { bg: "#DCFCE7", text: "#166534", border: "#22C55E" }
                              : { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" }
                          }
                        />
                      </View>

                      <View style={styles.infoBox}>
                        {!!expediente.departamento && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Departamento:</Text>
                            <Text style={styles.infoValue}>
                              {expediente.departamento}
                            </Text>
                          </View>
                        )}

                        {!!expediente.dependencia && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Dependencia:</Text>
                            <Text style={styles.infoValue}>
                              {expediente.dependencia}
                            </Text>
                          </View>
                        )}

                        {!!expediente.nivel && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Nivel:</Text>
                            <Text style={styles.infoValue}>
                              {expediente.nivel}
                            </Text>
                          </View>
                        )}

                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Fecha inicio:</Text>
                          <Text style={styles.infoValue}>
                            {formatearFecha(expediente.fechaInicio)}
                          </Text>
                        </View>
                      </View>

                      {!!expediente.observacionActual &&
                        !esExpedienteFinalizado(expediente) && (
                          <View style={styles.observacionBox}>
                            <Text style={styles.observacionLabel}>
                              Observación actual
                            </Text>
                            <Text style={styles.observacionText}>
                              {expediente.observacionActual}
                            </Text>
                          </View>
                        )}

                      {!!expediente.finalizado && (
                        <View style={styles.finalizacionBox}>
                          <Text style={styles.finalizacionTitle}>
                            Finalizado el{" "}
                            {formatearFecha(expediente.fechaFinalizacion)}
                          </Text>

                          {!!expediente.mensajeFinalizacion && (
                            <Text style={styles.finalizacionText}>
                              {expediente.mensajeFinalizacion}
                            </Text>
                          )}
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.btnHistorial}
                        activeOpacity={0.8}
                        onPress={() => verHistorial(expediente)}
                      >
                        <FontAwesome name="history" size={16} color="#ffffff" />
                        <Text style={styles.btnHistorialText}>
                          Ver historial
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        <Modal
          visible={historialVisible}
          animationType="slide"
          transparent
          onRequestClose={cerrarHistorial}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTextBox}>
                  <Text style={styles.modalTitle}>
                    Expediente{" "}
                    {expedienteSeleccionado?.expediente ||
                      expedienteSeleccionado?.id ||
                      ""}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {cargandoHistorial
                      ? "Cargando historial..."
                      : `${movimientos.length} ${
                          movimientos.length === 1 ? "movimiento" : "movimientos"
                        } registrados`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={cerrarHistorial}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="close" size={18} color="#000000" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                {cargandoHistorial ? (
                  <View style={styles.modalLoadingBox}>
                    <ActivityIndicator size="large" color="#000000" />
                  </View>
                ) : movimientos.length === 0 ? (
                  <View style={styles.modalEmptyBox}>
                    <FontAwesome name="clock-o" size={26} color="#7a4a00" />
                    <Text style={styles.modalEmptyText}>
                      Todavía no hay movimientos registrados para este
                      expediente.
                    </Text>
                  </View>
                ) : (
                  movimientos.map((movimiento) => renderMovimiento(movimiento))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
