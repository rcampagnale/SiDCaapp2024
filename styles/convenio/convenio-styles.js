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
    paddingHorizontal: 10, // Asegura que los elementos no estén pegados al borde
  },
  viewTitle: {
    width: "100%",
    height: "10%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,  // Añadido espacio vertical
  },
  viewInformation: {
    width: "107%",
    backgroundColor: "#fea200",
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textAlign: "justify",
    fontSize: 16,
    color: "#000",
    width: "95%",
    marginBottom: 15,  // Espacio debajo del texto
  },
  carruselContainer: {
    width: "100%",
    height: 180,
    marginBottom: 15, // Añadir espacio abajo
  },
  carrusel: {
    width: "100%",
    height: "100%",
  },
  viewGetInformation: {
    width: "100%",
    backgroundColor: "#fea200",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
    paddingVertical: 20,
  },

  btnNews: {
    width: "80%",
    height: 45, // Aumento la altura para mejorar la interacción
    backgroundColor: "#005CFE",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,  // Espacio entre los botones
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
    justifyContent: "space-between",
    alignSelf: "center",
    paddingBottom: 22, // Reducido para un mejor ajuste
  },

  modalContent: {
    width: "100%",
    backgroundColor: "#fea200",
    maxHeight: "auto", // Limitar la altura máxima
    borderRadius: 1,
    padding: 1,
    
  },

  modalTitle: {
    fontSize: 20, // Título más grande
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
    textAlign: "center",
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

  btnCommon: {
    width: "80%",
    height: 45, // Botones más altos para una mejor interacción
    borderRadius: 5,
    backgroundColor: "#005CFE", 
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10, // Espacio entre el contenido y el botón
    alignSelf: "center", 
  },

  commonBtnText: {
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16,
    textAlign: "center", 
  },

  modalItemImage: {
    width: "100%", // Ajusta para que ocupe el 100% del contenedor
    height: 300,  // Tamaño ajustado de la imagen
    marginBottom: 15,
    alignSelf: "center",
  },

  textAbout: {
    width: "100%",
    height: "auto",
    textAlign: "justify",
    fontSize: 16,
    marginBottom: 10, // Espacio debajo del texto
  },

  btnsBox: {
    width: "100%",
    marginTop: "auto",
    alignItems: "center",
    paddingBottom: 2,
    
  },

  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "black",
    marginVertical: 5,
  },

  btnText1: {
    color: "#ffffff", 
    fontSize: 16,
    fontWeight: "bold",
  },

  btnText2: {
    color: "#ffffff", 
    fontSize: 16,
    fontWeight: "bold",
  },

  Textmodal: {
    fontSize: 22,
    color: "#000000",
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 20,
  },

  btnHotelConv: {
    width: "80%", 
    height: 45, // Ajuste en altura
    backgroundColor: "#005CFE",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "auto",  // Espacio entre botones
  },
});

export default convenioStyles;
