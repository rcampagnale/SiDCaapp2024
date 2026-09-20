import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PushNewsModalData } from "./pushNotificationNavigation";

export const SIDCA_ACTIVE_NEWS_MODAL_KEY = "sidca_active_news_modal";

const isValidNewsModal = (value: unknown): value is PushNewsModalData => {
  if (!value || typeof value !== "object") return false;
  const news = value as Record<string, unknown>;
  return [news.title, news.description, news.image, news.url, news.newsId].some(
    (field) => typeof field === "string" && field.trim().length > 0,
  );
};

export const saveActiveNewsModal = async (news: PushNewsModalData) => {
  try {
    await AsyncStorage.setItem(
      SIDCA_ACTIVE_NEWS_MODAL_KEY,
      JSON.stringify(news),
    );
  } catch {
    // La novedad sigue disponible en memoria aunque falle el almacenamiento.
  }
};

export const getActiveNewsModal = async (): Promise<PushNewsModalData | null> => {
  try {
    const raw = await AsyncStorage.getItem(SIDCA_ACTIVE_NEWS_MODAL_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidNewsModal(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const clearActiveNewsModal = async () => {
  try {
    await AsyncStorage.removeItem(SIDCA_ACTIVE_NEWS_MODAL_KEY);
  } catch {
    // Preparado para una futura desactivación remota.
  }
};
