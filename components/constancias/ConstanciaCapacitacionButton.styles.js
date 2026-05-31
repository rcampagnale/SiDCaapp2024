import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 12,
    marginBottom: 8,
    alignItems: "center",
  },

  botonPrincipal: {
    width: "100%",
    backgroundColor: "#0b7a3b",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  botonDescargar: {
    flex: 1,
    backgroundColor: "#0b7a3b",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  botonSecundario: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0b7a3b",
    alignItems: "center",
    justifyContent: "center",
  },

  botonPresionado: {
    opacity: 0.85,
  },

  botonDeshabilitado: {
    opacity: 0.65,
  },

  textoBotonPrincipal: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  textoBotonSecundario: {
    color: "#0b7a3b",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  modalContainer: {
    width: "96%",
    maxHeight: "94%",
    backgroundColor: "#f4f4f4",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },

  modalTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },

  previewScroll: {
    width: "100%",
  },

  previewScrollContent: {
    alignItems: "center",
    paddingBottom: 10,
  },

  previewPage: {
    backgroundColor: "#ffffff",
    borderRadius: 4,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  plantilla: {
    width: "100%",
    height: "100%",
    position: "relative",
  },

  textoSobrePlantilla: {
  position: "absolute",
  color: "#000000",
  fontSize: 12,
  fontWeight: "700",
  lineHeight: 14,
  zIndex: 10,
},

  docente: {
  left: "56.2%",
  top: "27.9%",
  width: "40.7%",
  fontSize: 12,
  fontWeight: "700",
  lineHeight: 14,
},

  dni: {
    left: "10.7%",
    top: "35.3%",
    width: "24%",
  },

  curso: {
    left: "-1.7%",
    top: "39.8%",
    width: "88.6%",
    textTransform: "uppercase",
    textAlign: "center",
  },

  resolucion: {
    left: "55.8%",
    top: "44.4%",
    width: "38%",
  },

  diasCurso: {
    left: "14.7%",
    top: "50.1%",
    width: "57%",
  },

  fechaEmision: {
    left: "5.2%",
    top: "58.2%",
    width: "72%",
  },

  accionesModal: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  marcaAguaNoValido: {
  position: "absolute",
  left: "-12%",
  top: "43%",
  width: "124%",
  textAlign: "center",
  color: "rgba(0, 0, 0, 0.16)",
  fontSize: 30,
  fontWeight: "900",
  letterSpacing: 2,
  textTransform: "uppercase",
  transform: [{ rotate: "-32deg" }],
  zIndex: 6,
},
});

export default styles;