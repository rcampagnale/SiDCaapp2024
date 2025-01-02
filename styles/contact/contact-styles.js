import { StyleSheet } from "react-native";

export default contactStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#091d24",
  },
  titleContact: {
    width: "80%",
    height: 60,
    fontSize: 22,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  textTitle: {
    color: "#ffffff",
    fontSize: 24,
  },
  mediasContactContainer: {
    width: "100%",
    height: "75%",
    backgroundColor: "#fea200",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
  },
  footerContainer: {
    width: "100%",
    height: "15%",
    backgroundColor: "#fea200",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  btnWhatsApp: {
    width: "80%",
    height: 40,
    backgroundColor: "#25d366",
    borderRadius: 7,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
});
