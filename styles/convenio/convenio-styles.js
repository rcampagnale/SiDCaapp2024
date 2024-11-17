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
    paddingBottom: 20,
    paddingTop: 10,
  },
  text: {
    textAlign: "justify", // Justifica el texto
    // Puedes agregar otros estilos aquí, como color, tamaño, etc.
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
    width: "75%",
    height: 40,
    backgroundColor: "#fea200",
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
    backgroundColor: "#fea200", // Color de fondo que pediste
    borderRadius: 10,
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalItem: {
    marginVertical: 10,
  },
  modalItemText: {
    fontSize: 18,
    color: "#333",
  },
  closeModalBtn: {
    marginTop: 20,
    backgroundColor: "#fea200", // Botón de cerrar con el mismo color
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default convenioStyles;
