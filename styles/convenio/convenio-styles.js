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
    paddingBottom: 10,
    paddingTop: 10,   
  },

  text: {
    textAlign: "justify", // Justifica el texto
    fontSize: 16,
    color: "#000",
    width: "97%",
  },
  carruselContainer: {
    width: "100%",
    height: 150,
  },
  carrusel: {
    width: "100%",
    height: "100%",
  },

  btnNews: {
    width: "75%",
    height: 40,
    backgroundColor: "#005CFE",
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "5%", // Este sigue teniendo el mismo margen abajo
  },
  
  btnNews1: {
    width: "75%",
    height: 40,
    backgroundColor: "#005CFE",
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
    padding: 10,
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
    color: "black",
    marginBottom: 2,
    textAlign: "center",
  },

  modalItem: {
    paddingVertical: 10,
    width: "auto",
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
    height: 300, // Tamaño ajustado de la imagen
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
    height: 2,
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

  
});

export default convenioStyles;
