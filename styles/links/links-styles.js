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
    marginBottom: 30,
    textAlign: "center",
    top: 50,
  },

  // Estilos para los botones
  buttonWrapper: {
    width: "100%", // Ajusta al 100% del contenedor
    flexDirection: "column", // Los botones se dispondrán en columna
    justifyContent: "space-evenly", // Espacio entre los botones
    alignItems: "center", // Centra los botones horizontalmente
    gap: 28, // Espaciado entre los botones
    zIndex: 1, // Controla la superposición, si es necesario
    marginTop: -150, // Ajusta este valor para mover los botones hacia abajo
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
    minHeight: 350, // Altura mínima para el rectángulo
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
    top: -200, // Alineamos el rectángulo en la parte superior
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
});
