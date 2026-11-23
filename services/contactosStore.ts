import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { firebaseconn } from "../constants/FirebaseConn";

export type Contacto = {
  id: string;
  referencia: string;
  numero: string;
  tipo: string;
  orden: number;
  activo: boolean;
};

export type ContactosState = {
  contactos: Contacto[];
  loading: boolean;
  error: boolean;
};

type Subscriber = (state: ContactosState) => void;

const CONTACTOS_CACHE_KEY = "sidca_contactos_cache_v1";
const db = getFirestore(firebaseconn);
const subscribers = new Set<Subscriber>();

let state: ContactosState = {
  contactos: [],
  loading: true,
  error: false,
};
let unsubscribeFirestore: (() => void) | null = null;
let started = false;
let hasValidCache = false;
let firestoreHasResponded = false;

const notify = () => {
  subscribers.forEach((subscriber) => subscriber(state));
};

const normalizarContactos = (snapshot: { docs: Array<{ id: string; data: () => Record<string, any> }> }) =>
  snapshot.docs
    .map((documento) => {
      const data = documento.data() || {};
      return {
        id: documento.id,
        referencia: String(data.referencia || "").trim(),
        numero: String(data.numero || "").replace(/\D/g, ""),
        tipo: String(data.tipo || "").trim().toLowerCase(),
        orden: Number(data.orden),
        activo: data.activo === true,
      };
    })
    .filter(
      (contacto) =>
        contacto.activo &&
        contacto.tipo === "whatsapp" &&
        contacto.referencia.length > 0 &&
        contacto.numero.length > 0,
    )
    .sort((a, b) => {
      const ordenA = Number.isFinite(a.orden) ? a.orden : Number.MAX_SAFE_INTEGER;
      const ordenB = Number.isFinite(b.orden) ? b.orden : Number.MAX_SAFE_INTEGER;
      if (ordenA !== ordenB) return ordenA - ordenB;
      return a.referencia.localeCompare(b.referencia, "es", {
        sensitivity: "base",
      });
    });

const cargarCache = async () => {
  try {
    const raw = await AsyncStorage.getItem(CONTACTOS_CACHE_KEY);
    if (!raw) return;

    const cache = JSON.parse(raw);
    if (!Array.isArray(cache)) return;
    if (firestoreHasResponded) return;

    hasValidCache = true;
    state = {
      contactos: cache,
      loading: false,
      error: false,
    };
    notify();
  } catch {
    // La caché es sólo una optimización; Firestore sigue siendo la fuente de verdad.
  }
};

const guardarCache = async (contactos: Contacto[]) => {
  try {
    await AsyncStorage.setItem(CONTACTOS_CACHE_KEY, JSON.stringify(contactos));
  } catch {
    // No bloquear la pantalla si el almacenamiento local no está disponible.
  }
};

const iniciarSuscripcion = () => {
  unsubscribeFirestore = onSnapshot(
    collection(db, "contactos"),
    (snapshot) => {
      firestoreHasResponded = true;
      const contactos = normalizarContactos(snapshot);
      hasValidCache = true;
      state = { contactos, loading: false, error: false };
      notify();
      void guardarCache(contactos);
    },
    () => {
      state = {
        contactos: state.contactos,
        loading: false,
        error: !hasValidCache,
      };
      notify();
    },
  );
};

export const iniciarContactosStore = () => {
  if (started) return;
  started = true;
  void cargarCache();
  iniciarSuscripcion();
};

export const suscribirseContactos = (subscriber: Subscriber) => {
  iniciarContactosStore();
  subscribers.add(subscriber);
  subscriber(state);
  return () => {
    subscribers.delete(subscriber);
  };
};

export const reintentarContactos = () => {
  if (unsubscribeFirestore) unsubscribeFirestore();
  unsubscribeFirestore = null;
  started = true;
  state = {
    contactos: state.contactos,
    loading: !hasValidCache,
    error: false,
  };
  notify();
  iniciarSuscripcion();
};
