import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { WebView } from "react-native-webview";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
import styles from "../../styles/oficina-gestion/oficina-gestion";

const LOGO_SINDICATO_URL = "https://sidcagremio.com/logo192.png";

type FormularioGestion = {
  id: string;
  titulo?: string;
  descripcion?: string;
  descripcionHtml?: string;
  cantidadCampos?: number;
  campos?: any[];
  activo?: boolean;
  publicado?: boolean;
  createdAt?: any;
};

type DescripcionItem = {
  letra: string;
  contenido: string;
};

type DescripcionFormateada = {
  intro: string;
  items: DescripcionItem[];
  cierre: string;
  parrafos: string[];
};

const limpiarEspacios = (texto = "") => {
  return String(texto || "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
};

const decodificarEntidadesBasicas = (texto = "") => {
  return String(texto || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
};

const htmlATextoPlanoMovil = (html = "") => {
  return decodificarEntidadesBasicas(
    String(html || "")
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
};

const obtenerMarcadoresAlfabeticos = (texto = "") => {
  const regex = /\b([a-z])\)\s*/gi;
  const matches: { letra: string; index: number; length: number }[] = [];

  let match: RegExpExecArray | null;

  while ((match = regex.exec(texto)) !== null) {
    matches.push({
      letra: String(match[1] || "").toLowerCase(),
      index: match.index,
      length: match[0].length,
    });
  }

  return matches;
};

const formatearTextoPlano = (texto = ""): DescripcionFormateada => {
  const limpio = limpiarEspacios(texto);

  if (!limpio) {
    return {
      intro: "",
      items: [],
      cierre: "",
      parrafos: [],
    };
  }

  const matches = obtenerMarcadoresAlfabeticos(limpio);

  if (matches.length < 2) {
    const parrafos = limpio
      .split(/\n{2,}/)
      .map((item) => limpiarEspacios(item))
      .filter(Boolean);

    return {
      intro: "",
      items: [],
      cierre: "",
      parrafos: parrafos.length ? parrafos : [limpio],
    };
  }

  const primeraMarca = matches[0];
  const intro = limpiarEspacios(limpio.slice(0, primeraMarca.index));

  const items: DescripcionItem[] = [];
  let cierre = "";

  matches.forEach((match, index) => {
    const inicioContenido = match.index + match.length;
    const finContenido =
      index + 1 < matches.length ? matches[index + 1].index : limpio.length;

    let contenido = limpiarEspacios(
      limpio.slice(inicioContenido, finContenido)
    );

    if (index === matches.length - 1) {
      const cierreMatch = contenido.match(
        /(Agradecemos su colaboración\.?|Muchas gracias\.?|Importante:.*)$/i
      );

      if (
        cierreMatch &&
        typeof cierreMatch.index === "number" &&
        cierreMatch.index > 0
      ) {
        cierre = limpiarEspacios(contenido.slice(cierreMatch.index));
        contenido = limpiarEspacios(contenido.slice(0, cierreMatch.index));
      }
    }

    if (contenido) {
      items.push({
        letra: match.letra,
        contenido,
      });
    }
  });

  return {
    intro,
    items,
    cierre,
    parrafos: [],
  };
};

const formatearHtml = (html = ""): DescripcionFormateada => {
  const htmlLimpio = String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");

  const listaMatch = htmlLimpio.match(/<(ol|ul)[^>]*>([\s\S]*?)<\/\1>/i);

  if (listaMatch?.index !== undefined) {
    const introHtml = htmlLimpio.slice(0, listaMatch.index);
    const listaHtml = listaMatch[2] || "";
    const cierreHtml = htmlLimpio.slice(
      listaMatch.index + listaMatch[0].length
    );

    const items: DescripcionItem[] = [];
    const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;

    let itemMatch: RegExpExecArray | null;
    let index = 0;

    while ((itemMatch = itemRegex.exec(listaHtml)) !== null) {
      const contenido = htmlATextoPlanoMovil(itemMatch[1] || "");

      if (contenido) {
        items.push({
          letra: String.fromCharCode(97 + index),
          contenido,
        });

        index += 1;
      }
    }

    if (items.length > 0) {
      return {
        intro: htmlATextoPlanoMovil(introHtml),
        items,
        cierre: htmlATextoPlanoMovil(cierreHtml),
        parrafos: [],
      };
    }
  }

  return formatearTextoPlano(htmlATextoPlanoMovil(htmlLimpio));
};

const obtenerDescripcionFormateada = (
  formulario: FormularioGestion
): DescripcionFormateada => {
  const descripcionHtml = formulario?.descripcionHtml || "";

  if (htmlATextoPlanoMovil(descripcionHtml)) {
    return formatearHtml(descripcionHtml);
  }

  return formatearTextoPlano(formulario?.descripcion || "");
};

const obtenerPathDesdeUrl = (url = "") => {
  const limpio = String(url || "").trim();

  if (!limpio) return "";

  const sinHash = limpio.split("#")[0];
  const sinQuery = sinHash.split("?")[0];

  const match = sinQuery.match(/^https?:\/\/([^/]+)(\/.*)?$/i);

  if (match) {
    const host = match[1] || "";
    const path = match[2] || "/";

    const esDominioSidca =
      host === "sidcagremio.com" || host === "www.sidcagremio.com";

    if (!esDominioSidca) return "";

    return path.replace(/\/+$/, "") || "/";
  }

  if (sinQuery.startsWith("/")) {
    return sinQuery.replace(/\/+$/, "") || "/";
  }

  return "";
};

export default function OficinaGestion() {
  const statusBarHeight = StatusBar.currentHeight || 0;
  const db = getFirestore(firebaseconn);

  const [formularios, setFormularios] = useState<FormularioGestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [logoError, setLogoError] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [webLoading, setWebLoading] = useState(false);
  const [webError, setWebError] = useState("");
  const [webViewReloadKey, setWebViewReloadKey] = useState(0);

  const [selectedUrl, setSelectedUrl] = useState("");

  const injectedNavigationListener = `
    (function() {
      function notifyLocationChange() {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'URL_CHANGE',
            url: window.location.href
          }));
        } catch (error) {}
      }

      var originalPushState = history.pushState;
      history.pushState = function() {
        originalPushState.apply(history, arguments);
        notifyLocationChange();
      };

      var originalReplaceState = history.replaceState;
      history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        notifyLocationChange();
      };

      window.addEventListener('popstate', notifyLocationChange);
      window.addEventListener('hashchange', notifyLocationChange);

      document.addEventListener('click', function(event) {
        var target = event.target;

        while (target && target.tagName !== 'A' && target.parentElement) {
          target = target.parentElement;
        }

        if (target && target.href) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LINK_CLICK',
            url: target.href
          }));
        }
      }, true);

      notifyLocationChange();
    })();

    true;
  `;

  useEffect(() => {
    const cargarFormularios = async () => {
      try {
        setLoading(true);

        const q = query(collection(db, "oficina_gestion_formularios"));
        const snap = await getDocs(q);

        const data = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as FormularioGestion[];

        setFormularios(data);
      } catch (error) {
        console.error("Error al cargar formularios:", error);
        setFormularios([]);

        Alert.alert(
          "Error",
          "No se pudieron cargar los formularios disponibles."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarFormularios();
  }, []);

  const solicitarPermisosAndroid = async () => {
  if (Platform.OS !== "android") return true;

  try {
    const androidVersion =
      typeof Platform.Version === "number"
        ? Platform.Version
        : Number(Platform.Version);

    const permisosSolicitados = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      ...(androidVersion >= 33
        ? [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          ]
        : [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE]),
    ].filter(Boolean) as Parameters<
      typeof PermissionsAndroid.requestMultiple
    >[0];

    const resultados = await PermissionsAndroid.requestMultiple(
      permisosSolicitados
    );

    const camaraOk =
      resultados[PermissionsAndroid.PERMISSIONS.CAMERA] ===
      PermissionsAndroid.RESULTS.GRANTED;

    return camaraOk;
  } catch (error) {
    console.error("Error solicitando permisos:", error);
    return true;
  }
};

  const formulariosDisponibles = useMemo(() => {
    return formularios
      .filter((formulario) => formulario?.activo && formulario?.publicado)
      .sort((a, b) => {
        const fechaA = a?.createdAt?.toDate?.()?.getTime?.() || 0;
        const fechaB = b?.createdAt?.toDate?.()?.getTime?.() || 0;

        return fechaB - fechaA;
      });
  }, [formularios]);

  const cerrarModal = () => {
    setModalVisible(false);
    setSelectedUrl("");
    setWebError("");
    setWebLoading(false);
  };

  const debeCerrarModalPorUrl = (url = "") => {
    const path = obtenerPathDesdeUrl(url);

    if (!path) return false;

    return path === "/oficina-gestion" || path === "/home" || path === "/";
  };

  const volverALaAppSiCorresponde = (url = "") => {
    if (debeCerrarModalPorUrl(url)) {
      cerrarModal();
      return true;
    }

    return false;
  };

  const abrirFormulario = async (formulario: FormularioGestion) => {
    await solicitarPermisosAndroid();

    const formularioId = encodeURIComponent(formulario.id);
    const url = `https://sidcagremio.com/oficina-gestion/formulario/${formularioId}`;

    setSelectedUrl(url);
    setWebError("");
    setWebLoading(true);
    setWebViewReloadKey((prev) => prev + 1);
    setModalVisible(true);
  };

  const recargarFormulario = () => {
    if (!selectedUrl) return;

    setWebError("");
    setWebLoading(true);
    setWebViewReloadKey((prev) => prev + 1);
  };

  const renderLogo = () => {
    if (logoError) {
      return (
        <View style={styles.logoFallback}>
          <FontAwesome name="file-text-o" size={26} color="#15803d" />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: LOGO_SINDICATO_URL }}
        style={styles.logoSindicato}
        resizeMode="cover"
        onError={() => setLogoError(true)}
      />
    );
  };

  const renderDescripcionFormulario = (formulario: FormularioGestion) => {
    const descripcion = obtenerDescripcionFormateada(formulario);

    if (
      !descripcion.intro &&
      descripcion.items.length === 0 &&
      !descripcion.cierre &&
      descripcion.parrafos.length === 0
    ) {
      return (
        <View style={styles.descriptionContainerCard}>
          <Text style={styles.cardDescriptionText}>
            Sin descripción disponible.
          </Text>
        </View>
      );
    }

    if (descripcion.items.length > 0) {
      return (
        <View style={styles.descriptionContainerCard}>
          {!!descripcion.intro && (
            <Text style={styles.cardDescriptionText}>{descripcion.intro}</Text>
          )}

          <View style={styles.descriptionList}>
            {descripcion.items.map((item) => (
              <View
                key={`${formulario.id}-${item.letra}`}
                style={styles.descriptionListRow}
              >
                <Text style={styles.descriptionListMarker}>
                  {item.letra})
                </Text>

                <Text style={styles.descriptionListText}>
                  {item.contenido}
                </Text>
              </View>
            ))}
          </View>

          {!!descripcion.cierre && (
            <Text style={styles.cardDescriptionText}>{descripcion.cierre}</Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.descriptionContainerCard}>
        {descripcion.parrafos.map((parrafo, index) => (
          <Text
            key={`${formulario.id}-parrafo-${index}`}
            style={styles.cardDescriptionText}
          >
            {parrafo}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: statusBarHeight }]}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={styles.title}>Formularios disponibles</Text>
        </View>

        <View style={styles.viewInformation}>
          <Text style={styles.text}>
            Desde este espacio podrás completar formularios institucionales,
            presentar documentación y realizar trámites habilitados por el
            Sindicato de Docentes de Catamarca.
          </Text>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#ffffff" />

              <Text style={styles.loadingText}>
                Cargando formularios disponibles...
              </Text>
            </View>
          ) : formulariosDisponibles.length === 0 ? (
            <View style={styles.emptyBox}>
              <FontAwesome name="inbox" size={32} color="#ffffff" />

              <Text style={styles.emptyTitle}>
                No hay formularios disponibles
              </Text>

              <Text style={styles.emptyText}>
                Actualmente no existen formularios publicados para completar.
                Cuando se habilite uno nuevo, aparecerá en este espacio.
              </Text>
            </View>
          ) : (
            formulariosDisponibles.map((formulario) => {
              const cantidadCampos =
                formulario?.cantidadCampos || formulario?.campos?.length || 0;

              return (
                <View key={formulario.id} style={styles.formCard}>
                  <View style={styles.formHeader}>
                    <View style={styles.logoBox}>{renderLogo()}</View>

                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Disponible</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>
                    {formulario?.titulo || "Formulario sin título"}
                  </Text>

                  {renderDescripcionFormulario(formulario)}

                  <View style={styles.metaBox}>
                    <FontAwesome name="list-ul" size={14} color="#111827" />

                    <Text style={styles.metaText}>
                      {cantidadCampos}{" "}
                      {cantidadCampos === 1 ? "campo" : "campos"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.btnNews, styles.btnEnabled]}
                    activeOpacity={0.8}
                    onPress={() => abrirFormulario(formulario)}
                  >
                    <FontAwesome
                      name="send-o"
                      size={16}
                      color="#ffffff"
                      style={styles.btnIcon}
                    />

                    <Text style={styles.btnText}>Completar formulario</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>

        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={cerrarModal}
        >
          <View style={styles.modalContainer}>
            {webLoading && !webError && (
              <View style={styles.webLoader}>
                <ActivityIndicator size="large" color="#005CFE" />

                <Text style={styles.webLoaderText}>
                  Cargando formulario...
                </Text>
              </View>
            )}

            {!!webError && (
              <View style={styles.webErrorBox}>
                <FontAwesome
                  name="exclamation-triangle"
                  size={34}
                  color="#f59e0b"
                />

                <Text style={styles.webErrorTitle}>
                  No se pudo cargar el formulario
                </Text>

                <Text style={styles.webErrorText}>{webError}</Text>

                <TouchableOpacity
                  style={styles.webErrorButton}
                  activeOpacity={0.8}
                  onPress={recargarFormulario}
                >
                  <Text style={styles.webErrorButtonText}>
                    Intentar nuevamente
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!!selectedUrl && !webError && (
              <WebView
                key={`${selectedUrl}-${webViewReloadKey}`}
                source={{ uri: selectedUrl }}
                style={styles.webView}
                originWhitelist={["*"]}
                javaScriptEnabled
                domStorageEnabled
                cacheEnabled={false}
                incognito={false}
                sharedCookiesEnabled
                thirdPartyCookiesEnabled
                mixedContentMode="always"
                allowsBackForwardNavigationGestures
                startInLoadingState
                setSupportMultipleWindows={false}
                applicationNameForUserAgent="SIDCAApp"
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback
                allowFileAccess
                allowFileAccessFromFileURLs
                allowUniversalAccessFromFileURLs
                mediaCapturePermissionGrantType="grant"
                injectedJavaScriptBeforeContentLoaded={
                  injectedNavigationListener
                }
                injectedJavaScript={injectedNavigationListener}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);

                    if (
                      (data?.type === "URL_CHANGE" ||
                        data?.type === "LINK_CLICK") &&
                      data?.url
                    ) {
                      volverALaAppSiCorresponde(data.url);
                    }
                  } catch (error) {
                    console.log(
                      "Mensaje WebView no procesado:",
                      event.nativeEvent.data
                    );
                  }
                }}
                onShouldStartLoadWithRequest={(request) => {
                  if (volverALaAppSiCorresponde(request.url)) {
                    return false;
                  }

                  return true;
                }}
                onNavigationStateChange={(navState) => {
                  volverALaAppSiCorresponde(navState.url);
                }}
                onLoadStart={({ nativeEvent }) => {
                  if (volverALaAppSiCorresponde(nativeEvent.url)) {
                    return;
                  }

                  setWebLoading(true);
                  setWebError("");
                }}
                onLoadProgress={({ nativeEvent }) => {
                  if (nativeEvent.progress >= 1) {
                    setWebLoading(false);
                  }
                }}
                onLoadEnd={({ nativeEvent }) => {
                  volverALaAppSiCorresponde(nativeEvent.url);
                  setWebLoading(false);
                }}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;

                  console.error("Error WebView:", nativeEvent);

                  setWebLoading(false);
                  setWebError(
                    nativeEvent?.description ||
                      "El formulario no respondió correctamente."
                  );
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;

                  console.error("HTTP Error WebView:", nativeEvent);

                  setWebLoading(false);
                  setWebError(
                    `Error HTTP ${nativeEvent.statusCode}. Verifique la conexión.`
                  );
                }}
              />
            )}
          </View>
        </Modal>
      </View>
    </View>
  );
}