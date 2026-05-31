import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    zIndex: 20,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.30)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#F3C67A",
    borderTopRightRadius: 22,
    borderTopLeftRadius: 22,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 10,
    height: "92%",
  },

  chatHeaderRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },

  messagesContent: {
    paddingBottom: 14,
  },

  messageRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginVertical: 6,
    paddingHorizontal: 6,
  },

  userRow: {
    alignItems: "flex-end",
  },

  botRow: {
    alignItems: "flex-start",
    width: "100%",
  },

 avatar: {
  width: 50,
  height: 50,
  borderRadius: 0,
  marginBottom: 4,
},

  messageBubble: {
    maxWidth: "92%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
  },

  userBubble: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 6,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },

  botBubble: {
    backgroundColor: "#F4F4F4",
    borderTopLeftRadius: 6,
    alignSelf: "flex-start",
    maxWidth: "92%",
  },

  messageText: {
    fontSize: 16,
    color: "#2d2d2d",
    textAlign: "justify",
    lineHeight: 26,
  },

  userText: {
    textAlign: "right",
  },

  consultingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 10,
  },

  consultingText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    flexShrink: 1,
  },

  footerBar: {
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#F3C67A",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D4D4D4",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#F8F8F8",
    marginRight: 4,
    color: "#333",
  },

  audioActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 0,
    marginRight: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },

  audioActionButtonRecording: {
    backgroundColor: "#FF5A5F",
  },

  audioActionButtonDisabled: {
    opacity: 0.6,
  },

  inlineRecordingPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF8F7",
    borderWidth: 1,
    borderColor: "#F0D3D3",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 4,
  },

  inlineRecordingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  inlineRecordingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#C62828",
    marginLeft: 8,
  },

  inlineRecordingTimer: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111",
  },

  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff3b30",
  },

  audioWrapper: {
    maxWidth: "82%",
    alignSelf: "flex-end",
  },

  audioMessageBubble: {
    width: 220,
    minHeight: 60,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  userAudioBubble: {
    backgroundColor: "#d9fdd3",
    alignSelf: "flex-end",
  },

  botAudioBubble: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
  },

  audioPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  audioCenterBlock: {
    flex: 1,
  },

  audioWaveRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 20,
  },

  audioWaveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "#6b7280",
    marginRight: 3,
  },

  audioDurationText: {
    marginTop: 6,
    fontSize: 11,
    color: "#555",
  },

  audioDurationTextUser: {
    color: "#2d5f2d",
  },

  audioTranscriptText: {
    marginTop: 8,
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    textAlign: "left",
    maxWidth: 220,
    paddingHorizontal: 4,
  },

  closeButton: {
    marginTop: 12,
    backgroundColor: "#1565F9",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
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