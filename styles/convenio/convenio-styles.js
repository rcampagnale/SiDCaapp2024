import { StyleSheet } from "react-native";

const convenioStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#091d24",
  },
  viewTitle: {
    width: "100%",
    height: "10%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  viewInformation: {
    width: "100%",
    height: "auto",
    backgroundColor: "#fea200",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 1,
    paddingTop: 1,
  },
  text: {
    textAlign: "justify",
    fontSize: 16,
    color: "#000",
    width: "97%",
    
  },
  carruselContainer: {
    width: "100%",
    height: 180,
  },
  carrusel: {
    width: "100%",
    height: "100%",
  },
  viewGetInformation: {
    width: "100%",
    height: "15%",
    backgroundColor: "#fea200",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
  },

  btnNews: {
    width: "80%",
    height: 40,
    backgroundColor: "#005CFE",
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro translúcido
  },
  modalContainer: {
    width: "95%",
    height: "90%",
    padding: 20,
    backgroundColor: "#fea200",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between", // Ajustar para que haya espacio entre el contenido y el botón
    alignSelf: "center",
    paddingBottom: 0, // Asegurarse de que no haya padding extra que cause desalineación
  },
  modalContent: {
    backgroundColor: "#fea200",
    width: "100%",
    height: "auto",
    maxHeight: "80%", // Limitar la altura máxima
    borderRadius: 10,
    padding: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  modalItem: {
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    width: "100%",
  },
  modalItemText: {
    fontSize: 16,
    color: "#555",
  },

  // Estilo unificado para botones
  btnCommon: {
    width: 350,
    height: 40,
    borderRadius: 5,
    backgroundColor: "#005CFE", // El mismo color de fondo
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // Añadir algo de padding para hacerlo más visible
    marginTop: 10, // Espacio entre el contenido y el botón
    alignSelf: "center", // Asegura que el botón esté centrado
  },
  commonBtnText: {
    color: "#fff", // Color blanco para el texto
    fontWeight: "bold", // Negrita
    fontSize: 16, // Tamaño de fuente igual para ambos botones
    textAlign: "center", // Asegura que el texto esté centrado
  },

  // Nuevo estilo para aumentar el tamaño de las imágenes
  modalItemImage: {
    width: "200%", // Ajuste para que la imagen ocupe el 100% del ancho
    height: 400, // Aumento del tamaño de la imagen
    marginBottom: 10,
    alignSelf: "center", // Centrado de la imagen
  },

  // Estilos adicionales para el contenido
  textAbout: {
    width: "95%",
    height: "auto",
    textAlign: "justify",
    fontSize: 16,
  },
  btnsBox: {
    width: "100%",
    marginTop: 10,
    alignItems: "center", // Asegurar que el botón esté centrado
    paddingBottom: 25, // Espacio en la parte inferior
  },
  btnGetLink: {
    width: "auto", // Deja el ancho automático para ajustarse al contenido
    height: 40,
    borderRadius: 5,
    backgroundColor: "#005CFE",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // Añadir algo de padding para hacerlo más visible
    marginTop: 10, // Espacio entre el contenido y el botón
    alignSelf: "center", // Asegura que el botón esté centrado
  },
  btnText1: {
    color: "#ffffff", // Color blanco
    fontSize: 16,
    fontWeight: "bold",
  },
  btnText2: {
    color: "#ffffff", // Color blanco
    fontSize: 16,
    fontWeight: "bold",
  },

  Textmodal: {
    fontSize: 22,
    color: "#000000", // Cambia el color según el fondo de tu modal
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 20,
  },
  btnHotelConv: {
    width: "80%", // Mantén el mismo ancho que el botón anterior
    height: 40, // Ajusta la altura del botón
    backgroundColor: "#005CFE",
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 170,
  },
});

export default convenioStyles;
