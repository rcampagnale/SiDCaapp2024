import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Pdf from "react-native-pdf";
import {
  CertificadoApiError,
  consultarCertificadoEmitido,
  obtenerPdfCertificado,
  obtenerPreviewCertificado,
} from "./certificadoApi";
import styles from "./CertificadoEmitidoButton.styles";

type ValidacionCertificado = {
  registrado: boolean;
  fecha?: string;
  validadoPor?: string;
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
    setLoadingConsulta(true);
    try {
      const certificado = await consultarCertificadoEmitido(cursoId, dni);
      setValidacion(certificado.validacion || null);
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
  };

  const finalizarCargaPdf = () => {
    setPdfCargando(false);
  };

  const fechaValidacion = validacion?.fecha
    ? formatearFechaValidacion(validacion.fecha)
    : null;
  const certificadoValidado = validacion?.registrado === true;

  const descargarOficial = async () => {
    if (loadingDescarga || !cursoId || !dni) return;
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
            <Text style={styles.titulo}>Vista previa del certificado</Text>
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
            </View>
            <View
              style={[
                styles.validacionCard,
                certificadoValidado
                  ? styles.validacionCardValidada
                  : styles.validacionCardPendiente,
              ]}
            >
              <Text
                style={[
                  styles.validacionEstado,
                  certificadoValidado
                    ? styles.validacionEstadoValidada
                    : styles.validacionEstadoPendiente,
                ]}
              >
                {certificadoValidado
                  ? "✓ CERTIFICADO VALIDADO"
                  : "◷ CERTIFICADO PENDIENTE DE VALIDACIÓN"}
              </Text>
              {certificadoValidado ? (
                <>
                  {validacion?.validadoPor ? (
                    <>
                      <Text style={styles.validacionEtiqueta}>Registrado por</Text>
                      <Text style={styles.validacionNombre}>{validacion.validadoPor}</Text>
                    </>
                  ) : null}
                  {fechaValidacion ? (
                    <Text style={styles.validacionFecha}>{fechaValidacion}</Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.validacionMensaje}>
                  Este certificado todavía no fue registrado mediante el sistema de validación.
                </Text>
              )}
            </View>
            <View style={styles.acciones}>
              <Pressable style={styles.botonCerrar} onPress={cerrarPreview} disabled={loadingDescarga}>
                <Text style={styles.textoCerrar}>Cerrar</Text>
              </Pressable>
              <Pressable style={[styles.botonDescargar, loadingDescarga && styles.deshabilitado]} onPress={descargarOficial} disabled={loadingDescarga}>
                {loadingDescarga ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.textoDescargar}>Descargar PDF</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
