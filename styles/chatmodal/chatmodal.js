import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFCC80",
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    padding: 15,
    height: 830,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#005CFE",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
  },
  messageRow: {
    flexDirection: "column", // vertical
    alignItems: "flex-start",
    marginVertical: 6,
    paddingHorizontal: 10,
  },
  userRow: {
    alignItems: "flex-end",
  },
  botRow: {
    alignItems: "flex-start",
    width: "100%",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: "100%", 
    padding: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 0,
    alignSelf: "flex-end",
    maxWidth: "85%",
  },
  botBubble: {
    backgroundColor: "#F0F0F0",
    borderTopLeftRadius: 0,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    textAlign: "justify",
    lineHeight: 22,
    
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#005CFE",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  selectorContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    marginTop: 15,
    marginBottom: 10,
  },
  selectorButton: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectorButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  iconSendButton: {
    backgroundColor: "#005CFE",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  userText: {
    textAlign: "right",
  },
  
  modalPreguntasOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  modalPreguntasContainer: {
    backgroundColor: "#F0F0F0",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    maxHeight: "80%",
  },
  
  modalPreguntasTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    
  },
  
  modalPreguntaItem: {
    paddingVertical: 8,
    borderBottomColor: "#ccc",
    borderBottomWidth: 2,
  },
  
  modalPreguntaTexto: {
    fontSize: 16,
    color: "#007AFF",
    textAlign: "justify",
  },
  
  modalCloseButton: {
    marginTop: 15,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  
  modalCloseText: {
    color: "#fff",
    fontWeight: "bold",
  },
  
});

export default styles;
