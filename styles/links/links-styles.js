import { StyleSheet, Dimensions } from "react-native";

// Obtiene el ancho de la pantalla para ajustar la imagen
const screenWidth = Dimensions.get("window").width;

export default linkStyles = StyleSheet.create({
  // Estilos generales del contenedor
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#091d24",
  },

  // Estilos para el contenedor principal de la vista
  mainContainer: {
    flex: 1,
    backgroundColor: "#091d24",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20, // Ajuste para evitar que la cámara cubra el contenido
  },

  // Estilos del título principal
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
    width:'90%',
    height:'auto'
  },

  // Estilos para los botones
  buttonWrapper: {
    width: "100%", // Ajusta al 100% del contenedor
    display:'flex',
    flexDirection: "column", // Los botones se dispondrán en columna
    justifyContent: "space-around", // Espacio entre los botones
    alignItems: "center", // Centra los botones horizontalmente,
    height:300,
    backgroundColor:"#fea200"
  },

  // Estilos comunes de los botones
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

  // Estilos del rectángulo naranja
  orangeRectangle: {
    width: "200%",
    minHeight: 310, // Altura mínima para el rectángulo
    backgroundColor: "#fea200",
    position: "absolute",
    top: 200,
    left: "-50%", // Centrado
    zIndex: 0,
  },

  // Estilos de la imagen
  image: {
    width: screenWidth, // Ajusta la imagen al ancho de la pantalla
    height: 140,
    resizeMode: "cover", // Ajuste automático de la imagen para cubrir el área sin distorsión
  },

  // Estilos del botón "Volver"
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

  // Estilos de las cajas de cursos
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
    fontSize: 18, // Tamaño de fuente más grande
    fontWeight: "bold", // Texto en negrita
    color: "#ffffff", // Color blanco para el texto
    textAlign: "center", // Centrado del texto
    paddingVertical: 10, // Espaciado vertical (arriba y abajo)
    paddingHorizontal: 15, // Espaciado horizontal (izquierda y derecha)
    backgroundColor: "#005CFE", // Fondo azul
    borderRadius: 5, // Bordes redondeados
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
    paddingBottom: 20, // Agregado padding para evitar que los botones se solapen
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: -8,
    textAlign: "center", // Centramos el texto
  },

  modalDescription: {
    fontSize: 16,
    textAlign: "justify", // Cambié para que se alineara mejor
    marginBottom: -8, // Ajustado para más espacio
    fontWeight: "bold",
  },
  modalDescription1: {
    fontSize: 16,
    textAlign: "justify", // Cambié para que se alineara mejor
    marginBottom: -8, // Ajustado para más espacio
    fontWeight: "bold",
  },

  closeButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15, // 🔹 Agregado para bajar el botón
  },

  closeButtonText: {
    color: "white",
    fontSize: 16,
  },

  // Estilo para el contenedor del Picker
  pickerContainer: {
    width: "60%", // Ocupa todo el ancho disponible
    height: 50, // Ajusta la altura según el diseño
    borderWidth: 1, // Borde del Picker
    borderColor: "#ccc", // Color del borde
    borderRadius: 5, // Bordes redondeados
    backgroundColor: "#fff", // Fondo blanco
    marginBottom: -1, // Espacio inferior
    paddingHorizontal: -1, // Espaciado horizontal interno
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1, // Aumenté el espaciado entre las filas
    width: "100%",
    justifyContent: "space-between", // Asegura que los elementos se distribuyan correctamente
  },

  titulodeopciones: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 1, // Espacio entre el texto y el sueldo
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
    alignSelf: "center", // Centra el sueldo en su contenedor
  },
  separator: {
    height: 2, // Alto de la línea
    backgroundColor: "black", // Color de la línea
    width: "100%", // Ocupa todo el ancho disponible
    marginVertical: 10, // Ajustado para un espaciado adecuado
  },
  buttonText1: {
    fontSize: 16,
    color: "#fff", // Cambiar el color del texto
    backgroundColor: "#007bff", // Fondo azul
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    marginRight: 52, // Espacio entre el texto y el sueldo
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
    alignSelf: "flex-start"
  },
  simularButton: {
    backgroundColor: "#007bff", // Azul fuerte
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
    color: "#0034ab", // Cambiar el c#0df2c9olor del texto
    fontWeight: "bold",
  },
  titulodeopciones1: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "justify",
    marginRight: 1, // Espacio entre el texto y el sueldo
    flex: 1,
  },
  simuladorTexto: {
    fontSize: 14,
    color: "black", // Para que sea más suave y diferenciable del contenido principal
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "justify",
  },
});
