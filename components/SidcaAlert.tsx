import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

type AlertOptions = { cancelable?: boolean; onDismiss?: () => void };

type AlertState = {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  options: AlertOptions;
};

const initialState: AlertState = {
  visible: false,
  title: "",
  message: "",
  buttons: [],
  options: {},
};

const getTone = (title: string, message: string) => {
  const value = `${title} ${message}`.toLowerCase();
  if (value.includes("correctamente") || value.includes("éxito") || value.includes("validada")) {
    return { icon: "check-circle", color: "#16834B", soft: "#EAF7F0" } as const;
  }
  if (value.includes("error") || value.includes("inválido") || value.includes("no podés") || value.includes("bloqueado") || value.includes("otro afiliado")) {
    return { icon: "alert-circle", color: "#B33A3A", soft: "#FCEEEE" } as const;
  }
  if (value.includes("actualización")) {
    return { icon: "cellphone-arrow-down", color: "#075A83", soft: "#E8F4FA" } as const;
  }
  return { icon: "information", color: "#9A6500", soft: "#FFF5DD" } as const;
};

export const useSidcaAlert = () => {
  const [state, setState] = useState<AlertState>(initialState);

  const showAlert = useCallback((title: string, message = "", buttons: AlertButton[] = [{ text: "Entendido" }], options: AlertOptions = {}) => {
    setState({ visible: true, title, message, buttons: buttons.length ? buttons : [{ text: "Entendido" }], options });
  }, []);

  const dismiss = useCallback((callback?: () => void) => {
    setState((current) => ({ ...current, visible: false }));
    callback?.();
  }, []);

  const dismissCancelable = useCallback(() => {
    if (state.options.cancelable === false) return;
    const cancelButton = state.buttons.find((button) => button.style === "cancel");
    dismiss(cancelButton?.onPress || state.options.onDismiss);
  }, [dismiss, state.buttons, state.options]);

  const AlertPortal = useCallback(() => {
    const tone = getTone(state.title, state.message);
    return (
      <Modal visible={state.visible} transparent animationType="fade" statusBarTranslucent onRequestClose={dismissCancelable}>
        <Pressable style={styles.backdrop} onPress={dismissCancelable}>
          <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
            <View style={[styles.accent, { backgroundColor: tone.color }]} />
            <View style={[styles.iconWrap, { backgroundColor: tone.soft }]}>
              <MaterialCommunityIcons name={tone.icon} size={31} color={tone.color} />
            </View>
            <Text style={styles.brand}>SiDCa · Tu Sindicato</Text>
            <Text style={styles.title}>{state.title}</Text>
            {!!state.message && <Text style={styles.message}>{state.message}</Text>}
            <View style={styles.actions}>
              {state.buttons.map((button, index) => {
                const secondary = button.style === "cancel";
                const destructive = button.style === "destructive";
                return (
                  <TouchableOpacity
                    key={`${button.text || "acción"}-${index}`}
                    activeOpacity={0.78}
                    style={[styles.button, secondary && styles.buttonSecondary, destructive && styles.buttonDestructive]}
                    onPress={() => dismiss(button.onPress)}
                  >
                    <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{button.text || "Aceptar"}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }, [dismiss, dismissCancelable, state]);

  return { showAlert, AlertPortal };
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(3,18,24,0.72)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 410, overflow: "hidden", borderRadius: 24, backgroundColor: "#FEA200", paddingHorizontal: 24, paddingTop: 29, paddingBottom: 21, alignItems: "center", elevation: 14, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  accent: { position: "absolute", top: 0, left: 0, right: 0, height: 7 },
  iconWrap: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  brand: { color: "#553700", fontSize: 12, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 7 },
  title: { color: "#102B34", fontSize: 23, lineHeight: 29, fontWeight: "800", textAlign: "center" },
  message: { width: "100%", color: "#20343B", fontSize: 16, lineHeight: 23, textAlign: "center", marginTop: 13 },
  actions: { width: "100%", flexDirection: "row", flexWrap: "wrap-reverse", justifyContent: "center", gap: 10, marginTop: 22 },
  button: { minWidth: 128, minHeight: 48, flexGrow: 1, borderRadius: 14, paddingHorizontal: 17, paddingVertical: 13, backgroundColor: "#075A83", alignItems: "center", justifyContent: "center" },
  buttonSecondary: { backgroundColor: "rgba(255,255,255,0.52)", borderWidth: 1, borderColor: "rgba(9,29,36,0.2)" },
  buttonDestructive: { backgroundColor: "#A93232" },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textAlign: "center" },
  buttonTextSecondary: { color: "#31484F" },
});
