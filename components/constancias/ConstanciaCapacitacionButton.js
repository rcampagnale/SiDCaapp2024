import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { generarConstanciaCapacitacionPDF } from "./generarConstanciaCapacitacionPDF";
import styles from "./ConstanciaCapacitacionButton.styles";

const plantillaConstancia = require("../../assets/cursos/constancia_capacitacion.png");

/* ============================================================
   HELPERS GENERALES
   ============================================================ */

const limpiarTexto = (valor) => {
  if (valor === null || valor === undefined) return "";

  if (typeof valor === "object") {
    if (valor?.fechaHora) return String(valor.fechaHora).trim();
    if (valor?.fechaHoraISO) return String(valor.fechaHoraISO).trim();
    if (valor?.hora) return String(valor.hora).trim();
    if (valor?.fecha) return String(valor.fecha).trim();
    if (valor?.registrado === true) return "registrado";
    return "";
  }

  return String(valor).replace(/\s+/g, " ").trim();
};

const normalizarTextoComparacion = (valor) => {
  return limpiarTexto(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const esApellidoInvalido = (valor) => {
  const texto = normalizarTextoComparacion(valor);

  return (
    texto === "" ||
    texto === "sin apellido" ||
    texto === "s/apellido" ||
    texto === "s apellido" ||
    texto === "sin datos" ||
    texto === "no informado" ||
    texto === "no informa"
  );
};

const limpiarApellidoDocente = (valor) => {
  if (esApellidoInvalido(valor)) return "";
  return limpiarTexto(valor);
};

const limpiarNombreCompletoDocente = (valor) => {
  const texto = limpiarTexto(valor);

  if (!texto) return "";

  return texto
    .replace(
      /^\s*(sin apellido|s\/apellido|sin datos|no informado|no informa)\s*[,;-]\s*/i,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
};

const armarNombreDocente = ({ apellido, nombre, nombreCompleto }) => {
  const completo = limpiarNombreCompletoDocente(nombreCompleto);
  const ap = limpiarApellidoDocente(apellido);
  const nom = limpiarNombreCompletoDocente(nombre);

  if (completo) return completo;
  if (ap && nom) return `${ap}, ${nom}`;
  if (nom) return nom;
  if (ap) return ap;

  return "DOCENTE";
};

const tieneValor = (valor) => {
  const texto = limpiarTexto(valor);
  return texto !== "";
};

const obtenerIngreso = (asistencia) => {
  return (
    asistencia?.ingreso ||
    asistencia?.ingresoFechaHora ||
    asistencia?.horaIngreso ||
    asistencia?.fechaIngreso ||
    asistencia?.entrada ||
    asistencia?.checkIn ||
    asistencia?.marcaIngreso ||
    asistencia?.registroIngreso
  );
};

const obtenerSalida = (asistencia) => {
  return (
    asistencia?.salida ||
    asistencia?.salidaFechaHora ||
    asistencia?.horaSalida ||
    asistencia?.fechaSalida ||
    asistencia?.egreso ||
    asistencia?.checkOut ||
    asistencia?.marcaSalida ||
    asistencia?.registroSalida
  );
};

const obtenerModalidad = (asistencia) => {
  return String(asistencia?.modalidad || asistencia?.tipo || "")
    .toLowerCase()
    .trim();
};

const obtenerEstado = (asistencia) => {
  return String(
    asistencia?.estado ||
      asistencia?.estadoAsistencia ||
      asistencia?.asistenciaEstado ||
      "",
  )
    .toLowerCase()
    .trim();
};

const formatearFechaActualTexto = () => {
  const fecha = new Date();

  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();

  return `${dia} días del mes de ${mes} de ${anio}`;
};

const obtenerDatosConstancia = (
  asistencia = {},
  configuracionConstancia = {},
) => {
  const apellido = limpiarApellidoDocente(
    asistencia.apellido || asistencia.Apellido || asistencia.apellidos,
  );

  const nombre = limpiarNombreCompletoDocente(
    asistencia.nombre || asistencia.Nombre || asistencia.nombres,
  );

  const nombreCompleto = limpiarNombreCompletoDocente(
    asistencia.nombreCompleto ||
      asistencia.NombreCompleto ||
      asistencia.apellidoNombre ||
      asistencia.apellidoYNombre ||
      asistencia.displayName ||
      asistencia.fullName,
  );

  const dni = limpiarTexto(
    asistencia.dni || asistencia.DNI || asistencia.documento,
  );

  const cursoNombre = limpiarTexto(
    configuracionConstancia.cursoNombre ||
      configuracionConstancia.nombreCurso ||
      configuracionConstancia.curso ||
      configuracionConstancia.tituloCurso ||
      asistencia.cursoNombre ||
      asistencia.nombreCurso ||
      asistencia.cursoTitulo ||
      asistencia.curso ||
      asistencia.capacitacion ||
      asistencia.tituloCurso,
  );

  const resolucion = limpiarTexto(
    configuracionConstancia.resolucion ||
      configuracionConstancia.resolución ||
      configuracionConstancia.numeroResolucion ||
      asistencia.resolucion ||
      asistencia.resolución,
  );

  const diasCurso = limpiarTexto(
    configuracionConstancia.diasCurso ||
      configuracionConstancia.dias ||
      configuracionConstancia.fechaCurso ||
      configuracionConstancia.fechaCapacitacion ||
      asistencia.diasCurso ||
      asistencia.dias ||
      asistencia.fechaCurso ||
      asistencia.fecha,
  );

  const fechaEmision = limpiarTexto(
    configuracionConstancia.fechaEmision ||
      configuracionConstancia.textoEmision ||
      configuracionConstancia.emision ||
      asistencia.fechaEmision,
  );

  const docenteCompleto = armarNombreDocente({
    apellido,
    nombre,
    nombreCompleto,
  });

  return {
    docenteCompleto,
    dni,
    cursoNombre,
    resolucion,
    diasCurso,
    fechaEmision: fechaEmision || formatearFechaActualTexto(),
  };
};

const extraerUriPDF = (resultado) => {
  if (!resultado) return "";

  if (typeof resultado === "string") {
    return resultado;
  }

  if (typeof resultado === "object") {
    return (
      resultado.uri ||
      resultado.fileUri ||
      resultado.path ||
      resultado.url ||
      ""
    );
  }

  return "";
};

const verificarArchivoPDF = async (fileUri) => {
  if (!fileUri) {
    throw new Error("La función no devolvió una ruta válida del PDF.");
  }

  if (!String(fileUri).startsWith("file://")) {
    return true;
  }

  const info = await FileSystem.getInfoAsync(fileUri);

  if (!info.exists) {
    throw new Error("El PDF se generó, pero no se encontró el archivo.");
  }

  return true;
};

const compartirPDF = async (fileUri) => {
  const disponible = await Sharing.isAvailableAsync();

  if (!disponible) {
    Alert.alert(
      "Certificado generado",
      `El PDF fue generado correctamente.\n\nUbicación:\n${fileUri}`,
    );
    return;
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "application/pdf",
    dialogTitle: "Compartir certificado de capacitación",
    UTI: "com.adobe.pdf",
  });
};

/* ============================================================
   COMPONENTES DE VISTA PREVIA
   ============================================================ */

const TextoSobreConstancia = ({ style, children, numberOfLines = 1 }) => {
  return (
    <Text
      style={[styles.textoSobrePlantilla, style]}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
    >
      {children}
    </Text>
  );
};

const VistaPreviaConstancia = ({
  visible,
  onClose,
  asistencia,
  configuracionConstancia,
  onDescargar,
  generando,
}) => {
  const { width, height } = useWindowDimensions();

  const datos = useMemo(
    () => obtenerDatosConstancia(asistencia, configuracionConstancia),
    [asistencia, configuracionConstancia],
  );

  const previewWidth = Math.min(width - 36, 430);
  const previewHeight = previewWidth * (297 / 210);

  const maxHeight = height * 0.72;
  const finalHeight = previewHeight > maxHeight ? maxHeight : previewHeight;
  const finalWidth =
    finalHeight === maxHeight ? finalHeight * (210 / 297) : previewWidth;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitulo}>Vista previa de certificado</Text>

          <ScrollView
            style={styles.previewScroll}
            contentContainerStyle={styles.previewScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.previewPage,
                {
                  width: finalWidth,
                  height: finalHeight,
                },
              ]}
            >
              <ImageBackground
                source={plantillaConstancia}
                resizeMode="stretch"
                style={styles.plantilla}
              >
                <Text style={styles.marcaAguaNoValido}>
                  DOCUMENTO NO VÁLIDO
                </Text>

                <TextoSobreConstancia style={styles.docente} numberOfLines={2}>
                  {datos.docenteCompleto}
                </TextoSobreConstancia>

                <TextoSobreConstancia style={styles.dni}>
                  {datos.dni}
                </TextoSobreConstancia>

                <TextoSobreConstancia style={styles.curso} numberOfLines={2}>
                  {datos.cursoNombre}
                </TextoSobreConstancia>

                <TextoSobreConstancia style={styles.resolucion} numberOfLines={2}>
                  {datos.resolucion}
                </TextoSobreConstancia>

                <TextoSobreConstancia style={styles.diasCurso} numberOfLines={2}>
                  {datos.diasCurso}
                </TextoSobreConstancia>

                <TextoSobreConstancia
                  style={styles.fechaEmision}
                  numberOfLines={2}
                >
                  {datos.fechaEmision}
                </TextoSobreConstancia>
              </ImageBackground>
            </View>
          </ScrollView>

          <View style={styles.accionesModal}>
            <Pressable
              style={({ pressed }) => [
                styles.botonSecundario,
                pressed && styles.botonPresionado,
                generando && styles.botonDeshabilitado,
              ]}
              onPress={onClose}
              disabled={generando}
            >
              <Text style={styles.textoBotonSecundario}>Cerrar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.botonDescargar,
                pressed && styles.botonPresionado,
                generando && styles.botonDeshabilitado,
              ]}
              onPress={onDescargar}
              disabled={generando}
            >
              {generando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.textoBotonPrincipal}>Descargar PDF</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

const ConstanciaCapacitacionButton = ({
  asistencia,
  configuracionConstancia = {},
  textoBoton = "Ver certificado",
}) => {
  const [generando, setGenerando] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);

  const ingreso = obtenerIngreso(asistencia);
  const salida = obtenerSalida(asistencia);
  const modalidad = obtenerModalidad(asistencia);
  const estado = obtenerEstado(asistencia);

  const esPresencial = modalidad === "presencial";
  const tieneIngresoYSalida = tieneValor(ingreso) && tieneValor(salida);

  const estaPresente =
    estado === "presente" ||
    estado === "validado" ||
    estado === "validada" ||
    estado === "asistio" ||
    estado === "asistió" ||
    asistencia?.asistenciaValidada === true ||
    tieneIngresoYSalida;

  const puedeDescargar = esPresencial && tieneIngresoYSalida && estaPresente;

  const handleAbrirPreview = () => {
    if (generando) return;

    if (!puedeDescargar) {
      Alert.alert(
        "Certificado no disponible",
        "El certificado se habilita cuando la asistencia presencial tiene ingreso y salida registrados.",
      );
      return;
    }

    setMostrarPreview(true);
  };

  const handleDescargar = async () => {
    if (generando) return;

    if (!puedeDescargar) {
      Alert.alert(
        "Certificado no disponible",
        "El certificado se habilita cuando la asistencia presencial tiene ingreso y salida registrados.",
      );
      return;
    }

    let fileUriGenerado = "";

    try {
      setGenerando(true);

      const resultado = await generarConstanciaCapacitacionPDF({
        asistencia,
        configuracionConstancia,
      });

      fileUriGenerado = extraerUriPDF(resultado);

      await verificarArchivoPDF(fileUriGenerado);

      await compartirPDF(fileUriGenerado);

      setMostrarPreview(false);
    } catch (error) {
      const mensajeError =
        error?.message ||
        error?.toString?.() ||
        "Error desconocido al generar el PDF.";

      Alert.alert(
        "Error real al generar PDF",
        mensajeError.length > 700
          ? `${mensajeError.substring(0, 700)}...`
          : mensajeError,
      );
    } finally {
      setGenerando(false);
    }
  };

  if (!puedeDescargar) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.botonPrincipal,
          pressed && styles.botonPresionado,
          generando && styles.botonDeshabilitado,
        ]}
        onPress={handleAbrirPreview}
        disabled={generando}
      >
        {generando ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.textoBotonPrincipal}>{textoBoton}</Text>
        )}
      </Pressable>

      <VistaPreviaConstancia
        visible={mostrarPreview}
        onClose={() => setMostrarPreview(false)}
        asistencia={asistencia}
        configuracionConstancia={configuracionConstancia}
        onDescargar={handleDescargar}
        generando={generando}
      />
    </View>
  );
};

export default ConstanciaCapacitacionButton;
