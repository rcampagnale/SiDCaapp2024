import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    //backgroundColor: "#1a4157",
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
    backgroundColor: "#ffd59a",
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    padding: 20,
    height: "auto",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  messageBubble: {
    backgroundColor: "#1a4157",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
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
  flexDirection: 'row',
  alignItems: 'flex-end',
  marginVertical: 5,
  marginHorizontal: 10,
},

userRow: {
  justifyContent: 'flex-end',
},

botRow: {
  justifyContent: 'flex-start',
},

avatar: {
  width: 42,
  height: 42,
  borderRadius: 16,
  marginHorizontal: 5,
},

messageBubble: {
  maxWidth: '70%',
  padding: 10,
  borderRadius: 15,
},

userBubble: {
  backgroundColor: '#DCF8C6',
  borderTopRightRadius: 0,
  alignSelf: 'flex-end',
},

botBubble: {
  backgroundColor: '#F0F0F0',
  borderTopLeftRadius: 0,
  alignSelf: 'flex-start',
},

messageText: {
  fontSize: 16,
  color: '#333',
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
  borderRadius: 20,
  paddingHorizontal: 15,
  paddingVertical: 8,
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


});

export default styles;
