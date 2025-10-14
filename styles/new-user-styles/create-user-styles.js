// create-user-styles.js
import { StyleSheet } from "react-native";

const newUserStyles = StyleSheet.create({
  container: {
    // mejor que height: "100%":
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#091d24",
  },
  viewInformation: {
    width: "100%",
    height: 200,
    backgroundColor: "#fea200",
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  viewFormContainer: {
    width: "100%",
    height: 900,
    paddingBottom: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputContainer: {
    width: "80%",
    height: "9%",
    marginTop: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputForm: {
    width: "100%",
    height: 40,
    backgroundColor: "#fea200",
    borderRadius: 5,
    paddingLeft: 5,
  },
  btnSendInfo: {
    width: "80%",
    height: 40,
    backgroundColor: "#fea200",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    height: "50%",
    backgroundColor: "#fea200",
    borderRadius: 10,
  },
  modalItem: {
    fontWeight: "bold",
  },
  closeButton: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#000000",
    borderWidth: 1,
    backgroundColor: "#005CFE",
  },
});

export default newUserStyles;
