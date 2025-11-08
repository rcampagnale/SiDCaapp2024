import React, { useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Linking,
  Image,
} from "react-native";
import styles from "../styles/modalAlerta/modalAlerta";

type Props = {
  visible: boolean;
  onSalir: () => void;
  telefono?: string; // fallback opcional (no se muestra)
  whatsapp?: string; // número del adherente o default
  titulo?: string;
  motivo?: string | null; // 👈 viene de colección 'adherentes'
  mensaje?: string;
};

const DEFAULT_WSP = "+54 9 3834 53-9754";

const onlyDigits = (s?: string) => (s ?? "").replace(/\D/g, "");

// Normaliza a wa.me para Argentina (549...).
const normalizeWaAR = (input?: string): string | null => {
  let n = onlyDigits(input);
  if (!n) return null;
  if (n.startsWith("0")) n = n.slice(1);
  if (n.startsWith("54") && !n.startsWith("549")) n = "549" + n.slice(2);
  if (!n.startsWith("54")) n = "549" + n;
  return n;
};

const ModalAlerta: React.FC<Props> = ({
  visible,
  onSalir,
  telefono = "+54 9 3834 53-9754",
  whatsapp = "+54 9 3834 53-9754",
  titulo = "Afiliado en carácter Adherente — Acceso temporalmente restringido",
  motivo = null,
  mensaje,
}) => {
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [visible]);

  // Usa número manual si no viene por props
  const waNumber = useMemo(
    () => normalizeWaAR(whatsapp ?? DEFAULT_WSP),
    [whatsapp]
  );

  const body =
    mensaje ??
    `Estimado/a docente, su afiliación figura como Afiliado en carácter de Adherente y actualmente se encuentra SUSPENDIDA.
${
  motivo
    ? `\nMotivo: ${motivo}\n`
    : `\nMotivo: Sin información.\n`
}
Por favor, escríbanos por WhatsApp al Área Afiliado Adherente (solo mensajes; no llamadas).
Horario de atención: Lunes a Viernes 8:00–12:00 y 16:00–18:00 Hs, Días no laborables: Feriados, Asuetos, Sábado y Domingo no se atiende. La atención es por orden de ingreso de la consulta`;

  function openWspNumber(url: string): void {
    if (!url) return;
    const msg = encodeURIComponent(
      "Estimados/as, solicito ayuda para normalizar mi situación de Afiliado Adherente y restablecer el acceso a SiDCa. Muchas gracias."
    );
    // Append text param if not present
    const hasText = /([?&])text=/.test(url);
    const target = hasText
      ? url
      : url.includes("?")
      ? `${url}&text=${msg}`
      : `${url}?text=${msg}`;

    Linking.canOpenURL(target)
      .then((supported) => {
        if (supported) return Linking.openURL(target);
        // fallback to normalized waNumber if direct URL cannot be opened
        const fallback = waNumber
          ? `https://wa.me/${waNumber}?text=${msg}`
          : target;
        return Linking.openURL(fallback);
      })
      .catch(() => {
        // last-resort attempt
        const fallback = waNumber
          ? `https://wa.me/${waNumber}?text=${msg}`
          : target;
        Linking.openURL(fallback).catch(() => {});
      });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.msg}>{body}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnWhats]}
              onPress={() => openWspNumber("https://wa.me/5493834539754")}
            >
              <Image
                style={styles.btnWhatsIcon} // 👈 usa el estilo nuevo
                source={require("../assets/logos/whatsapp.png")}
              />
              <Text style={styles.btnText1}>Afiliado Adherente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnExit]}
              onPress={onSalir}
            >
              <Text style={styles.btnText}>Salir</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            * Hasta regularizar sus aranceles, los servicios del Sindicato
            permanecerán suspendidos.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default ModalAlerta;
