import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { PushNewsModalData } from "../../services/pushNotificationNavigation";

type PushNewsModalProps = {
  news: PushNewsModalData | null;
  onClose: () => void;
};

const getSafeExternalUrl = (value?: string) => {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
};

export default function PushNewsModal({ news, onClose }: PushNewsModalProps) {
  const externalUrl = getSafeExternalUrl(news?.url);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [news?.image]);

  const cardWidth = Math.min(screenWidth * 0.92, 520);
  const imageHeight = Math.min(
    Math.max(cardWidth * 0.55, 120),
    screenHeight * 0.28,
  );

  const openMore = async () => {
    if (!externalUrl) return;
    try {
      if (await Linking.canOpenURL(externalUrl)) {
        await Linking.openURL(externalUrl);
      }
    } catch {
      // Un enlace inválido o no disponible no debe cerrar ni romper la APP.
    }
  };

  return (
    <Modal
      visible={Boolean(news)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>SIDCA · INFORMACIÓN</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar novedad"
              hitSlop={10}
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator
          >
            <Text style={styles.title}>{news?.title || "Novedad"}</Text>

            {news?.image && !imageFailed ? (
              <Image
                source={{ uri: news.image }}
                style={[styles.image, { height: imageHeight }]}
                resizeMode="contain"
                onError={() => setImageFailed(true)}
              />
            ) : news?.image ? (
              <Text style={styles.imageFallback}>No se pudo cargar la imagen.</Text>
            ) : null}

            {news?.description ? (
              <Text style={styles.description}>{news.description}</Text>
            ) : null}

            <View style={styles.actions}>
              {externalUrl ? (
                <Pressable style={styles.primaryButton} onPress={openMore}>
                  <Text style={styles.primaryButtonText}>VER MÁS</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.secondaryButton} onPress={onClose}>
                <Text style={styles.secondaryButtonText}>CERRAR</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 32,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  card: {
    width: "98%",
    maxWidth: 520,
    maxHeight: "88%",
    borderRadius: 18,
    backgroundColor: "#FEA200",
    overflow: "hidden",
  },
  header: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 48,
    paddingRight: 12,
    paddingTop: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "rgba(9, 29, 36, 0.14)",
  },
  closeButtonText: {
    color: "#091d24",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "700",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  eyebrow: {
    color: "#091d24",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: "#091d24",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },
  image: {
    width: "100%",
    marginBottom: 14,
  },
  imageFallback: {
    width: "100%",
    color: "#091d24",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 14,
  },
  description: {
    width: "100%",
    color: "#091d24",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "justify",
  },
  actions: {
    width: "100%",
    gap: 10,
    marginTop: 20,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#005CFE",
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#091d24",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: "#091d24",
    fontSize: 15,
    fontWeight: "700",
  },
});
