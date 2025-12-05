import { StyleSheet } from "react-native";

const credentialStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },

  viewInfoContainer: {
    height: "100%",
    width: "30%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  mainInformationContainer: {
    transform: "rotateZ(90deg)",
    height: 140,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
  },

  cardNameContainer: {
    width: "20%",
    height: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  logosHeaderContainer: {
    width: "20%",
    height: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: 20,
    paddingTop: 20,
  },

  /* ===========================
     Botón ¿Dónde voto?
     =========================== */
  voteButton: {
    position: "absolute",
    bottom: 70,
    right: 60,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#f9c76b",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  voteButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },

  /* ===========================
     Modal ¿Dónde voto?
     =========================== */
  voteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  voteModalContent: {
  width: "85%",
  backgroundColor: "#fea200",
  borderRadius: 16,
  padding: 20,
  borderWidth: 2,        // 👈 grosor del borde
  borderColor: "#000000" // 👈 color negro
},

  voteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  voteModalText: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333333",
  },
  voteModalHighlight: {
    fontWeight: "700",
  },

  /* Botón WhatsApp dentro del modal */
  voteModalWhatsappButton: {
    marginTop: 16,
    alignSelf: "stretch",
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#25D366",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  voteModalWhatsappButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  voteModalCloseButton: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "#005CFE",
  },
  voteModalCloseButtonText: {
    color: "#ffffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default credentialStyles;
