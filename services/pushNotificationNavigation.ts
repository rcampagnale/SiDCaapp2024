import { router } from "expo-router";
import * as Linking from "expo-linking";

type PushNotificationData = {
  type?: unknown;
  url?: unknown;
  courseId?: unknown;
};

type PushNotificationResponseLike = {
  notification?: {
    request?: {
      identifier?: string;
      content?: {
        data?: PushNotificationData;
      };
    };
  };
};

type InternalPushType =
  | "training"
  | "course_registration"
  | "approved_courses"
  | "tourism"
  | "agreements"
  | "office_management";

type PendingNotificationAction = {
  type: InternalPushType;
};

const processedNotificationIds = new Set<string>();
let pendingNotificationAction: PendingNotificationAction | null = null;

const normalizeType = (value: unknown): string =>
  String(value || "").trim().toLowerCase();

const getResponseData = (
  response: PushNotificationResponseLike,
): PushNotificationData => response?.notification?.request?.content?.data || {};

const getResponseKey = (
  response: PushNotificationResponseLike,
  data: PushNotificationData,
): string => {
  const identifier = String(
    response?.notification?.request?.identifier || "",
  ).trim();
  if (identifier) return identifier;

  const type = normalizeType(data.type);
  const url = typeof data.url === "string" ? data.url : "";
  return `${type}:${url}`;
};

const isInternalPushType = (type: string): type is InternalPushType =>
  type === "training" ||
  type === "course_registration" ||
  type === "approved_courses" ||
  type === "tourism" ||
  type === "agreements" ||
  type === "office_management";

const openInternalDestination = (type: InternalPushType) => {
  switch (type) {
    case "training":
      console.log("[PushNavigation] type: training");
      router.push("/courses/get-my-courses");
      break;
    case "course_registration":
      console.log("[PushNavigation] type: course_registration");
      router.push({
        pathname: "/courses/get-my-courses",
        params: { action: "verify" },
      });
      break;
    case "approved_courses":
      console.log("[PushNavigation] type: approved_courses");
      router.push("/courses/courses-picked");
      break;
    case "tourism":
      console.log("[PushNavigation] type: tourism");
      router.push("/tourist/tourist");
      break;
    case "agreements":
      console.log("[PushNavigation] type: agreements");
      router.push("/convenio/convenio");
      break;
    case "office_management":
      console.log("[PushNavigation] type: office_management");
      router.push("/oficina-gestion/oficina-gestion");
      break;
  }
};

const openExternalUrl = async (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
    if (await Linking.canOpenURL(url.toString())) {
      await Linking.openURL(url.toString());
    }
  } catch {
    // Una URL externa inválida no debe interrumpir la navegación normal.
  }
};

const dispatchNotificationData = async (
  data: PushNotificationData,
  hasAuthenticatedUser: boolean,
) => {
  const type = normalizeType(data.type);

  switch (type) {
    case "open_app":
    case "admin_push_test":
      return;
    case "external_url":
      await openExternalUrl(data.url);
      return;
    default:
      break;
  }

  if (!isInternalPushType(type)) return;

  if (!hasAuthenticatedUser) {
    pendingNotificationAction = { type };
    console.log("[PushNavigation] pending until login");
    return;
  }

  openInternalDestination(type);
};

/** Procesa una respuesta sólo cuando el usuario toca la notificación. */
export const handlePushNotificationResponse = async (
  response: PushNotificationResponseLike,
  hasAuthenticatedUser: boolean,
) => {
  const data = getResponseData(response);
  const responseKey = getResponseKey(response, data);
  if (processedNotificationIds.has(responseKey)) return;
  processedNotificationIds.add(responseKey);

  await dispatchNotificationData(data, hasAuthenticatedUser);
};

/** Reintenta una acción interna que quedó pendiente hasta completar el login. */
export const processPendingPushNotification = (hasAuthenticatedUser: boolean) => {
  if (!hasAuthenticatedUser || !pendingNotificationAction) return;

  const pending = pendingNotificationAction;
  pendingNotificationAction = null;
  openInternalDestination(pending.type);
};
