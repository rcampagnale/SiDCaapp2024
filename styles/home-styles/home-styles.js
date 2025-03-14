import { StyleSheet } from "react-native";

export default homeStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#091d24",
  },
  topBar: {
    width: "100%",
    height: 40,
    backgroundColor: "#fea200",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAbout: {
    width: "100%",
    height: 300,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  viewInformation: {
    width: "100%",
    height: 230,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  viewSupport: {
    width: "100%",
    height: 230,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  viewBenefits: {
    width: "100%",
    height: 270,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  btnsContainer: {
    width: "80%",
    height: "90%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
  },
  btnActions: {
    width: "100%",
    height: 45,
    backgroundColor: "#fea200",
    borderRadius: 5,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  btnTextAction: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  logoContainer: {
    width: "30%",
    height: "100%",
    marginRight: 10,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
  },
});
