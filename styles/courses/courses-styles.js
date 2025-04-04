import { StyleSheet } from "react-native";

export default coursesStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#091d24",
  },
  scrollContainer: {
    width: "100%",
    height: 160,
  },
  textAboutCourse: {
    width: "100%",
    height: 250,
    backgroundColor: "#fea200",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  cardCourses: {
    width: "100%",
    height: 120,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  btnSeeInfo: {
    width: "80%",
    height: 40,
    borderRadius: 5,
    backgroundColor: "#005CFE",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  btnBackToOptions: {
    width: "100%",
    height: 40,
    backgroundColor: "#fea200",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  btnBack: {
    width: "auto",
    height: "100%",
    marginLeft: 15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  // 🔄 Actualizado para que se ajuste al contenido dinámicamente
  linksBox: {
    width: "100%",
    backgroundColor: "#fea200",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },

  btnGetLink: {
    width: "80%",
    height: 40,
    borderRadius: 5,
    backgroundColor: "#005CFE",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  coursesDoneBox: {
    width: "100%",
    height: 500,
    backgroundColor: "#fea200",
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  viewCertificateButton: {
    backgroundColor: "#005CFE",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    
  },
  separator: {
    height: 2,
    width: "100%",
    backgroundColor: "black",
    marginVertical: 5,
  },
});
