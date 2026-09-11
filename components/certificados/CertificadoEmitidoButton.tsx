import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Pdf from "react-native-pdf";
import {
  CertificadoApiError,
  consultarCertificadoEmitido,
  obtenerQrCertificado,
  obtenerPdfCertificado,
  obtenerPreviewCertificado,
} from "./certificadoApi";
import styles from "./CertificadoEmitidoButton.styles";

type ValidacionCertificado = {
  registrado: boolean;
  fecha?: string;
  validadoPor?: string;
  junta?: string;
  juntaEtiqueta?: string;
};

type Props = {
  cursoId: string;
  cursoTitulo: string;
  dni: string;
};

const nombreTemporalSeguro = (cursoId: string, prefijo: string) => {
  const seguro = String(cursoId || "curso").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${prefijo}-${seguro}.pdf`;
};

const formatearFechaValidacion = (valor: string) => {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;

  const partes = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(fecha);
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((item) => item.type === tipo)?.value || "";

  return `${parte("day")}/${parte("month")}/${parte("year")} a las ${parte("hour")}:${parte("minute")} hs`;
};

const errorVisible = (error: unknown, tipo: "preview" | "descarga") => {
  if (error instanceof CertificadoApiError && error.status === 0) {
    return ["Sin conexión", "No se pudo conectar con el servidor. Verificá tu conexión a internet e intentá nuevamente."] as const;
  }
  if (error instanceof CertificadoApiError && error.status === 404) {
    return ["Certificado no disponible", "El certificado todavía no fue emitido por la administración."] as const;
  }
  if (error instanceof CertificadoApiError && error.status === 409) {
    return ["Certificado no disponible", "Se encontró una inconsistencia en la emisión. Comunicate con SiDCa."] as const;
  }
  return tipo === "preview"
    ? ["No se pudo mostrar el certificado", "Ocurrió un problema al cargar la vista previa. Intentá nuevamente."] as const
    : ["No se pudo descargar el certificado", "Verificá tu conexión e intentá nuevamente."] as const;
};

async function descargarArchivo(url: string, nombre: string) {
  const directorio = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!directorio) throw new Error("No hay una carpeta temporal disponible.");
  const uri = `${directorio}${nombre}`;
  await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
  const resultado = await FileSystem.downloadAsync(url, uri);
  const info = await FileSystem.getInfoAsync(resultado.uri);
  if (!info.exists) throw new Error("El archivo no está disponible.");
  return resultado.uri;
}

export default function CertificadoEmitidoButton({ cursoId, cursoTitulo, dni }: Props) {
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingDescarga, setLoadingDescarga] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [previewLocalUri, setPreviewLocalUri] = useState<string | null>(null);
  const [pdfCargando, setPdfCargando] = useState(false);
  const [validacion, setValidacion] = useState<ValidacionCertificado | null>(null);
  const [descargaHabilitada, setDescargaHabilitada] = useState(true);
  const [mostrarQr, setMostrarQr] = useState(false);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [mostrarDetalleValidacion, setMostrarDetalleValidacion] = useState(false);

  const ocupado = loadingConsulta || loadingPreview || loadingDescarga;

  const mostrarError = (error: unknown, tipo: "preview" | "descarga") => {
    if (__DEV__ && !(error instanceof CertificadoApiError && error.status === 404)) {
      const detalle = error instanceof CertificadoApiError
        ? { status: error.status, message: error.message }
        : { message: error instanceof Error ? error.message : String(error) };
      console.error(`[certificado-${tipo}]`, detalle);
    }
    const [titulo, mensaje] = errorVisible(error, tipo);
    Alert.alert(titulo, mensaje);
  };

  const abrirPreview = async () => {
    if (ocupado || !cursoId || !dni) return;
    setPdfCargando(true);
    setPreviewLocalUri(null);
    setValidacion(null);
    setDescargaHabilitada(true);
    setMostrarQr(false);
    setQrUri(null);
    setLoadingQr(false);
    setMostrarDetalleValidacion(false);
    setLoadingConsulta(true);
    try {
      const certificado = await consultarCertificadoEmitido(cursoId, dni);
      setValidacion(certificado.validacion || null);
      setDescargaHabilitada(certificado.descargaHabilitada !== false);
      setLoadingConsulta(false);
      setLoadingPreview(true);
      const respuesta = await obtenerPreviewCertificado(cursoId, dni);
      const uri = await descargarArchivo(
        respuesta.url,
        nombreTemporalSeguro(cursoId, "preview-certificado")
      );
      setPreviewLocalUri(uri);
      setMostrarPreview(true);
    } catch (error) {
      setLoadingConsulta(false);
      setPdfCargando(false);
      setValidacion(null);
      mostrarError(error, "preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const cerrarPreview = () => {
    if (loadingDescarga) return;
    setMostrarPreview(false);
    setPreviewLocalUri(null);
    setPdfCargando(false);
    setValidacion(null);
    setMostrarQr(false);
    setQrUri(null);
    setLoadingQr(false);
    setMostrarDetalleValidacion(false);
  };

  const abrirQr = async () => {
    if (loadingQr || !cursoId || !dni) return;
    setLoadingQr(true);
    try {
      const respuesta = await obtenerQrCertificado(cursoId, dni);
      setQrUri(respuesta.qrDataUri);
      setLoadingQr(false);
      setMostrarQr(true);
    } catch {
      Alert.alert("No se pudo mostrar el QR", "Intentá nuevamente en unos instantes.");
    } finally {
      setLoadingQr(false);
    }
  };

  const finalizarCargaPdf = () => {
    setPdfCargando(false);
  };

  const fechaValidacion = validacion?.fecha
    ? formatearFechaValidacion(validacion.fecha)
    : null;
  const certificadoValidado = validacion?.registrado === true;

  const descargarOficial = async () => {
    if (!descargaHabilitada || loadingDescarga || !cursoId || !dni) return;
    setLoadingDescarga(true);
    try {
      const respuesta = await obtenerPdfCertificado(cursoId, dni);
      const nombre = String(respuesta.filename || nombreTemporalSeguro(cursoId, "certificado"))
        .replace(/[\\/:*?"<>|\r\n]/g, "_")
        .replace(/\.pdf$/i, "") + ".pdf";
      const uri = await descargarArchivo(respuesta.url, nombre);
      const disponible = await Sharing.isAvailableAsync();
      if (!disponible) throw new Error("El diálogo para compartir no está disponible.");
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Compartir certificado",
      });
      setMostrarPreview(false);
    } catch (error) {
      mostrarError(error, "descarga");
    } finally {
      setLoadingDescarga(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.boton, pressed && { opacity: 0.85 }, ocupado && styles.deshabilitado]}
        onPress={abrirPreview}
        disabled={ocupado}
      >
        {ocupado ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.textoBoton}>Ver certificado</Text>}
      </Pressable>

      <Modal
        visible={mostrarPreview}
        transparent
        animationType="slide"
        onRequestClose={cerrarPreview}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.titulo}>Certificado</Text>
            <View style={styles.separadorTitulo} />
            <Text style={styles.tituloCurso}>
              {cursoTitulo}
            </Text>
            <View style={styles.previewBox}>
              {previewLocalUri ? (
                <Pdf
                  key={previewLocalUri}
                  source={{ uri: previewLocalUri, cache: false }}
                  style={styles.pdf}
                  scale={1}
                  minScale={1}
                  maxScale={1}
                  enableDoubleTapZoom={false}
                  enablePaging={false}
                  trustAllCerts={false}
                  renderActivityIndicator={() => <View />}
                  onLoadComplete={finalizarCargaPdf}
                  onPageChanged={finalizarCargaPdf}
                  onError={() => {
                    finalizarCargaPdf();
                    Alert.alert("No se pudo mostrar el certificado", "Ocurrió un problema al cargar la vista previa. Intentá nuevamente.");
                  }}
                />
              ) : null}
              {pdfCargando && (
                <View style={styles.cargando}>
                  <ActivityIndicator size="large" color="#005CFE" />
                </View>
              )}
              {previewLocalUri && !pdfCargando && (
                <Pressable
                  style={styles.botonVerQr}
                  onPress={abrirQr}
                  disabled={loadingQr}
                >
                  {loadingQr ? (
                    <View style={styles.qrLoadingContainer} pointerEvents="none">
                      <ActivityIndicator size="small" color="#ffffff" />
                    </View>
                  ) : (
                    <>
                      <View style={styles.qrEtiqueta} pointerEvents="none">
                        <Text
                          style={styles.textoVerQr}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                        >
                          Mostrar QR
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="qrcode"
                        size={30}
                        color="#ffffff"
                        style={styles.qrIcono}
                      />
                    </>
                  )}
                </Pressable>
              )}
            </View>
            {certificadoValidado && (
              <View style={[styles.validacionCard, styles.validacionCardValidada]}>
                <View style={styles.validacionFila}>
                  <Text style={[styles.validacionEstado, styles.validacionEstadoValidada]}>
                    ✓ CERTIFICADO VALIDADO
                  </Text>
                  <Pressable onPress={() => setMostrarDetalleValidacion(true)}>
                    <Text style={styles.validacionDetalleLink}>Ver detalle</Text>
                  </Pressable>
                </View>
              </View>
            )}
            <View style={styles.acciones}>
              <Pressable style={styles.botonCerrar} onPress={cerrarPreview} disabled={loadingDescarga}>
                <Text style={styles.textoCerrar}>Cerrar</Text>
              </Pressable>
              {descargaHabilitada && (
                <Pressable style={[styles.botonDescargar, loadingDescarga && styles.deshabilitado]} onPress={descargarOficial} disabled={loadingDescarga}>
                  {loadingDescarga ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.textoDescargar}>Descargar PDF</Text>}
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={mostrarQr}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarQr(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.qrModal}>
            <Text style={styles.qrTitulo}>QR de validación</Text>
            {qrUri ? <Image source={{ uri: qrUri }} style={styles.qrImagen} resizeMode="contain" /> : null}
            <Text style={styles.qrLeyenda}>
              Escaneá este código desde otro celular para validar el certificado.
            </Text>
            <Pressable style={styles.qrCerrar} onPress={() => setMostrarQr(false)}>
              <Text style={styles.qrCerrarTexto}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={mostrarDetalleValidacion}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarDetalleValidacion(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.detalleModal}>
            <Text style={styles.detalleTitulo}>Detalle de validación</Text>
            <Text style={styles.detalleEtiqueta}>Junta</Text>
            <Text style={styles.detalleValor}>{validacion?.juntaEtiqueta || validacion?.junta || "No informada"}</Text>
            <Text style={styles.detalleEtiqueta}>Usuario que realizó el registro</Text>
            <Text style={styles.detalleValor}>{validacion?.validadoPor || "No informado"}</Text>
            <Text style={styles.detalleEtiqueta}>Fecha y hora</Text>
            <Text style={styles.detalleValor}>{fechaValidacion || "No informada"}</Text>
            <Pressable style={styles.qrCerrar} onPress={() => setMostrarDetalleValidacion(false)}>
              <Text style={styles.qrCerrarTexto}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
