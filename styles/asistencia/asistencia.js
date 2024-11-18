import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
    height: "15%",
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
    paddingTop: 20,
  },
  text: {
    textAlign: "justify",
    fontSize: 16,
    color: "#000",
    width: "97%",
  },
  btnNews: {
    width: "75%",
    height: 40,
    backgroundColor: "#005CFE", // Fondo azul
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
    width: "98%",
    height: "90%",
    padding: 20,
    backgroundColor: "#fea200",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
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
  modalItem: {
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    width: "100%",
  },
  modalItemImage: {
    width: "200%", // Ajuste para que la imagen ocupe el 100% del ancho
    height: 400, // Aumento del tamaño de la imagen
    marginBottom: 10,
    alignSelf: "center", // Centrado de la imagen
  },
  btnCommon: {
    width: "auto",
    height: 40,
    borderRadius: 5,
    backgroundColor: "#005CFE",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    alignSelf: "center",
  },
  commonBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  textAbout: {
    width: "95%",
    height: "auto",
    textAlign: "justify",
  },
  btnsBox: {
    width: "100%",
    marginTop: 10,
    alignItems: "center",
    paddingBottom: 20,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  imageOutsideText: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});

export default styles;
