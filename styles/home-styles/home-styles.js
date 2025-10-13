import { StyleSheet } from "react-native";

const homeStyles = StyleSheet.create({
  container: {
    // Mejor práctica: usar flex en lugar de height: "100%"
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#091d24",
  },
  topBar: {
    width: "100%",
    height: 40, // si tus íconos son grandes, subí a 56–64
    backgroundColor: "#fea200",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAbout: {
    width: "100%",
    height: 300,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  viewInformation: {
    width: "100%",
    height: 230,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  viewSupport: {
    width: "100%",
    height: 230,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  viewBenefits: {
    width: "100%",
    height: 300,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  btnsContainer: {
    width: "80%",
    height: "75%",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
  },
  btnActions: {
    width: "100%",
    height: 45,
    backgroundColor: "#fea200",
    borderRadius: 5,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  btnTextAction: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  logoContainer: {
    width: "30%",
    height: "100%",
    marginRight: 10,
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
  },
});

export default homeStyles;
