import { StyleSheet } from "react-native";

export default touristStyles = StyleSheet.create({
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
    height: "8%",
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
  carruselContainer: {
    width: "100%",
    height: 150,
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
  btnWhatsApp: {
    width: "80%",
    height: 40,
    backgroundColor: "#25d366",
    borderRadius: 7,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  btnNews: {
    width: "75%",
    height: 40,
    backgroundColor: "#005CFE",
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100,
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
    backgroundColor: "#fea200", // Color de fondo del modal
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  modalContent: {
    width: "100%",
    height: "100%",
  },
  modalItem: {
    marginBottom: 15,
    width: "100%",
  },
  btnsBox: {
    width: "90%",
    height: "auto",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
  },
  btnGetLink: {
    width: "100%",
    height: 40,
    borderRadius: 5,
    backgroundColor: "#005CFE",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  textAbout: {
    width: "95%",
    height: "auto",
    textAlign: "justify",
    fontSize: 16,
    color: "#000",
    marginVertical: 10,
  },
  text: {
    textAlign: "justify", // Justifica el texto
    fontSize: 16,
    color: "#000",
    width: "97%",
  },
  btnText1: {
    color: "#ffffff", // Color blanco
    fontSize: 16,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10, // Espacio entre el título y el contenido
  },
  separator: {
    height: 2, // Alto de la línea
    backgroundColor: "black", // Color de la línea
    width: "100%", // Ocupa todo el ancho disponible
    marginVertical: 10, // Ajustado para un espaciado adecuado
  },
});
