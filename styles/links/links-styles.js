import { StyleSheet, Dimensions } from "react-native";

// Obtiene el ancho de la pantalla para ajustar la imagen
const screenWidth = Dimensions.get("window").width;

// 👉 Declarás el objeto de estilos normalmente
const styles = StyleSheet.create({
  // Estilos generales del contenedor
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#091d24",
  },

  mainContainer: {
    flex: 1,
    backgroundColor: "#091d24",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 30,
    textAlign: "center",
    top: 1,
  },

  title1: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    width: "90%",
    height: "auto",
  },

  buttonWrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    height: 300,
    backgroundColor: "#fea200",
  },

  button: {
    width: "95%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#005CFE",
    alignItems: "center",
    elevation: 5,
  },

  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },

  orangeRectangle: {
    width: "200%",
    minHeight: 310,
    backgroundColor: "#fea200",
    position: "absolute",
    top: 200,
    left: "-50%",
    zIndex: 0,
  },

  image: {
    width: screenWidth,
    height: 140,
    resizeMode: "cover",
  },

  backButton: {
    width: "100%",
    backgroundColor: "#fea200",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 20,
  },

  backButtonText: {
    fontSize: 18,
    marginLeft: 5,
  },

  coursesDoneBox: {
    width: "100%",
    height: 300,
    backgroundColor: "#fea200",
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },

  btnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#005CFE",
    borderRadius: 5,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    paddingBottom: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: -8,
    textAlign: "center",
  },

  modalDescription: {
    fontSize: 16,
    textAlign: "justify",
    marginBottom: -8,
    fontWeight: "bold",
  },

  modalDescription1: {
    fontSize: 16,
    textAlign: "justify",
    marginBottom: -8,
    fontWeight: "bold",
  },

  closeButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },

  closeButtonText: {
    color: "white",
    fontSize: 16,
  },

  pickerContainer: {
    width: "60%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: -1,
    paddingHorizontal: -1,
  },

  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 1,
    width: "100%",
    justifyContent: "space-between",
  },

  titulodeopciones: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 1,
    flex: 1,
  },

  sueldo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "#f5f5f5",
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    width: "60%",
    alignSelf: "center",
  },

  separator: {
    height: 2,
    backgroundColor: "black",
    width: "100%",
    marginVertical: 10,
  },

  buttonText1: {
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#007bff",
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    marginRight: 52,
  },

  input: {
    width: "60%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: "center",
    alignSelf: "flex-start",
  },

  simularButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },

  simularButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  picker: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
  },

  buttonText2: {
    fontSize: 15,
    color: "#0034ab",
    fontWeight: "bold",
  },

  titulodeopciones1: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "justify",
    marginRight: 1,
    flex: 1,
  },

  simuladorTexto: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "justify",
  },

  helpMessage: {
    color: "black",
    fontSize: 14,
    fontFamily: "Roboto",
    marginLeft: 8,
    lineHeight: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "justify",
  },
});

// 👇 Exportás el objeto de estilos ya declarado
export default styles;
