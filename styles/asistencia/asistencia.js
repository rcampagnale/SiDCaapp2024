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
    paddingBottom: 1,
    paddingTop: 10,
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
    marginBottom: 250,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start", // Modal en la parte superior
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro translúcido
  },
  modalContainer: {
    width: "98%",
    height: "86%", // Aumentamos la altura del modal
    padding: 20,
    backgroundColor: "#fea200",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "flex-start", // Alineación hacia la parte superior
    alignSelf: "center",
    paddingBottom: 20, // Aumentamos el padding en la parte inferior
  },
  modalContent: {
    backgroundColor: "#fea200",
    width: "100%",
    height: "auto",
    maxHeight: "auto", // Limitar la altura máxima
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
    marginTop: 15,
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
    marginBottom: -35,
  },
  imageOutsideText: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  mainInformationContainer: {
    marginBottom: 15,
    alignItems: "flex-start", // Alineación a la izquierda
    width: "100%", // Asegúrate de que ocupe todo el ancho disponible
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "left", // Alineación a la izquierda
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, // Adds extra space at the bottom to prevent cutoff
  },
  separator: {
    height: 2, // Alto de la línea
    backgroundColor: "black", // Color de la línea
    width: "100%", // Ocupa todo el ancho disponible
    marginVertical: 10, // Ajustado para un espaciado adecuado
  },
  modalDescription: {
    fontSize: 16,
    textAlign: "justify", // Cambié para que se alineara mejor
    marginBottom: -8, // Ajustado para más espacio
    fontWeight: "bold",
  },
});

export default styles;
