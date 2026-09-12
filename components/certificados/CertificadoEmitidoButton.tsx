import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Pdf from "react-native-pdf";
import {
  CertificadoApiError,
  RegistroValidacion,
  consultarCertificadoEmitido,
  obtenerQrCertificado,
  obtenerPdfCertificado,
  obtenerPreviewCertificado,
  obtenerCertificadoPrecargado,
} from "./certificadoApi";
import styles from "./CertificadoEmitidoButton.styles";

type ValidacionCertificado = {
  registrado: boolean;
  registros: RegistroValidacion[];
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
      const [certificadoActual, precargado] = await Promise.all([
        consultarCertificadoEmitido(cursoId, dni),
        obtenerCertificadoPrecargado(cursoId, dni).catch(() => null),
      ]);
      setValidacion(certificadoActual.validacion || null);
      setDescargaHabilitada(certificadoActual.descargaHabilitada !== false);
      setLoadingConsulta(false);

      if (precargado) {
        setPreviewLocalUri(precargado.previewLocalUri);
        setMostrarPreview(true);
        return;
      }

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

  const registrosValidacion = Array.isArray(validacion?.registros)
    ? validacion.registros
    : [];
  const certificadoValidado =
    validacion?.registrado === true && registrosValidacion.length > 0;

  const descargarOficial = async () => {
    if (!descargaHabilitada || loadingDescarga || !cursoId || !dni) return;
    setLoadingDescarga(true);
    try {
      const certificadoActual = await consultarCertificadoEmitido(cursoId, dni);
      if (certificadoActual.descargaHabilitada === false) {
        setDescargaHabilitada(false);
        Alert.alert(
          "Descarga no disponible",
          "La descarga de este certificado fue deshabilitada."
        );
        return;
      }

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
                      <ActivityIndicator size="small" color="#374151" />
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
                        name="qrcode-scan"
                        size={34}
                        color="#374151"
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
            <ScrollView
              style={styles.detalleScroll}
              contentContainerStyle={styles.detalleContenido}
            >
              {registrosValidacion.map((registro, indice) => (
                <View
                  key={registro.id || `registro-${indice}`}
                  style={styles.detalleRegistro}
                >
                  <Text style={styles.detalleRegistroTitulo}>{registro.titulo}</Text>
                  {/* Los campos son deliberadamente genéricos para admitir atributos futuros. */}
                  {registro.campos.map((campo, campoIndice) => (
                    <View key={`${campo.etiqueta}-${campoIndice}`}>
                      <Text style={styles.detalleEtiqueta}>{campo.etiqueta}</Text>
                      <Text style={styles.detalleValor}>{campo.valor}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
            <Pressable style={styles.qrCerrar} onPress={() => setMostrarDetalleValidacion(false)}>
              <Text style={styles.qrCerrarTexto}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
