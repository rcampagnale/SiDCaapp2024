import { StyleSheet } from "react-native";

export default StyleSheet.create({
  /* ===== Overlay & Card ===== */
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.79)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fea200",
    borderRadius: 16,
    padding: 18,
  },

  /* ===== Texts ===== */
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0b1e34",
    marginBottom: 8,
    textAlign: "center",     
  },
  msg: {
    fontSize: 15,
    color: "#000000ff",
    lineHeight: 22,
    marginBottom: 12,
    textAlign: "justify",
  },
  note: {
    fontSize: 13,
    color: "#050505",
    marginTop: 4,
    textAlign: "center",
  },

  /* ===== Contact box (opcional) ===== */
  contactBox: {
    backgroundColor: "#f2f6fb",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e3edf7",
    marginBottom: 12,
  },
  contact: {
    color: "#0b1e34",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "justify",         // ✅ justificado
  },

  /* ===== Actions & Buttons ===== */
  actions: {
    marginTop: 4,
    marginBottom: 8,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  btnWhats: {
    backgroundColor: "#25D366",
  },
  btnExit: {
    backgroundColor: "#005CFE",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
  btnText1: {
    color: "#000",
    fontWeight: "800",
  },

  /* ===== Icons ===== */
  btnWhatsIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});


