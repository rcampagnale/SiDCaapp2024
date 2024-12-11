import { StyleSheet } from "react-native";

const subMenuStyles = StyleSheet.create({
  menuButton: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent", // Sin fondo
    padding: 0,
  },
  drawer: {
    position: "absolute",
    top: 74,
    left: 0,
    width: 350, // Ancho del submenú
    height: "80%", // Altura completa
    backgroundColor: "#fea200",
    zIndex: 1,
    paddingTop: 50, // Alineación con la parte superior
    paddingBottom: 20, // Espacio en la parte inferior
    borderRadius: 5, // Bordes redondeados para mejorar la apariencia
  },
  menuTitle: {
    color: "black",
    fontSize: 22,
    fontWeight: "bold",
    padding: 1,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
});

export default subMenuStyles;
