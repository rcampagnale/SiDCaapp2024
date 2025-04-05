import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { firebaseconn } from "@/constants/FirebaseConn";
import { SidcaContext } from "../_layout";
import styles from "@/styles/chatmodal/chatmodal";

export default function ChatbotModal() {
  const { userData } = useContext(SidcaContext);

  const fullName =
    userData?.apellido && userData?.nombre
      ? `${userData.apellido}, ${userData.nombre}`
      : userData?.nombre || "Usuario";

  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");

  const welcomeMessage = {
    id: "bienvenida",
    texto: `¡Hola ${fullName}! Soy el asistente virtual de SiDCa. Podés consultarme sobre capacitaciones, credenciales, horarios, o cualquier duda que tengas 📚💬`,
    tipo: "bot",
  };

  const toggleModal = () => {
    if (visible) {
      // Al cerrar, reiniciar el estado del chat
      setMessages([welcomeMessage]);
      setInputText("");
    } else {
      // Al abrir, iniciar con mensaje de bienvenida
      setMessages([welcomeMessage]);
    }

    setVisible(!visible);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      texto: inputText,
      tipo: "usuario",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={toggleModal}>
        <Image
          source={require("@/assets/logos/Chatboot3.png")}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.header}>
              {`¡Hola ${fullName}! Bienvenido al Asistente Virtual SiDCa 👋`}
            </Text>

            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const animatedValue = new Animated.Value(0);
                Animated.timing(animatedValue, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();

                const animatedStyle = {
                  opacity: animatedValue,
                  transform: [{ scale: animatedValue }],
                };

                return (
                  <Animated.View
                    style={[
                      animatedStyle,
                      styles.messageRow,
                      item.tipo === "usuario" ? styles.userRow : styles.botRow,
                    ]}
                  >
                    {item.tipo === "bot" && (
                      <Image
                        source={require("@/assets/logos/Chatboot4.png")}
                        style={styles.avatar}
                      />
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        item.tipo === "usuario"
                          ? styles.userBubble
                          : styles.botBubble,
                      ]}
                    >
                      <Text style={styles.messageText}>{item.texto}</Text>
                    </View>
                    {item.tipo === "usuario" && (
                      <Image
                        source={require("@/assets/logos/chatdocente.png")}
                        style={styles.avatar}
                      />
                    )}
                  </Animated.View>
                );
              }}
            />

            {/* Campo de entrada y botón de enviar */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Escribí tu consulta..."
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.sendButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

