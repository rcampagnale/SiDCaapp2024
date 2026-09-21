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

  const cardWidth = Math.min(screenWidth * 0.94, 520);
  const imageHeight = Math.min(
    Math.max(cardWidth * 0.84, 200),
    screenHeight * 0.46,
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
            <View style={styles.accentBar} />
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
            <Text
              style={[styles.title, { fontSize: screenWidth < 380 ? 22 : 25 }]}
            >
              {news?.title || "Novedad"}
            </Text>

            {news?.image ? (
              <View style={[styles.imageFrame, { height: imageHeight }]}>
                {imageFailed ? (
                  <Text style={styles.imageFallback}>Imagen no disponible</Text>
                ) : (
                  <Image
                    source={{ uri: news.image }}
                    style={styles.image}
                    resizeMode="contain"
                    onError={() => setImageFailed(true)}
                  />
                )}
              </View>
            ) : null}

            {news?.description ? (
              <View style={styles.descriptionBlock}>
                <Text style={styles.description}>{news.description}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              {externalUrl ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ver más información"
                  style={styles.primaryButton}
                  onPress={openMore}
                >
                  <Text style={styles.primaryButtonText}>Ver más ↗</Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar novedad"
                style={styles.secondaryButton}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>Cerrar</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  card: {
    width: "98%",
    maxWidth: 520,
    maxHeight: "88%",
    borderRadius: 18,
    backgroundColor: "#FEA200",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  header: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 48,
    paddingRight: 12,
    paddingTop: 10,
  },
  accentBar: {
    position: "absolute",
    left: 22,
    top: 18,
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#FEA200",
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
    backgroundColor: "#F1F3F4",
  },
  closeButtonText: {
    color: "#526169",
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "700",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
  },
  eyebrow: {
    color: "#526169",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    width: "100%",
    color: "#17242A",
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 18,
  },
  imageFrame: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    width: "100%",
    color: "#738087",
    fontSize: 13,
    textAlign: "center",
  },
  descriptionBlock: {
    width: "100%",
    padding: 14,
    borderLeftColor: "#000000",
    borderLeftWidth: 3,
    borderRadius: 8,
    backgroundColor: "#FFF4D6",
  },
  description: {
    width: "100%",
    color: "#27363C",
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "400",
    textAlign: "left",
  },
  actions: {
    width: "100%",
    gap: 10,
    marginTop: 24,
    paddingTop: 14,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#005CFE",
    borderColor: "#005CFE",
    borderWidth: 1,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#66757C",
    fontSize: 15,
    fontWeight: "500",
  },
});
