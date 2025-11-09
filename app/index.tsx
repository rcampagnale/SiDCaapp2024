import {
  Text,
  TouchableOpacity,
  View,
  Linking,
  ImageBackground,
  TextInput,
  Keyboard,
  Image,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  BackHandler,
  Platform,
  Alert,
} from "react-native";
import styles from "../styles/signin-styles/sign-in-styles";
import { useEffect, useState, useContext, useCallback } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  getDocFromServer, // 👈 agregado: fuerza lectura desde servidor
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";

let Application: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Application = require("expo-application");
} catch {
  Application = { applicationId: undefined, nativeBuildVersion: undefined };
}
import { SidcaContext } from "./_layout";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

// 🔧 Helper: normalizar "si/no", true/false, "1"/"0"
const toBool = (v: any): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return ["si", "sí", "true", "1", "yes"].includes(s);
  }
  return false;
};

// 🔎 Helper: busca por DNI en string y number
const getByDni = async (colRef: any, dni: string) => {
  let qs = await getDocs(query(colRef, where("dni", "==", dni)));
  if (!qs.empty) return qs.docs[0].data();
  const dniNum = Number(dni);
  if (!Number.isNaN(dniNum)) {
    qs = await getDocs(query(colRef, where("dni", "==", dniNum)));
    if (!qs.empty) return qs.docs[0].data();
  }
  return null;
};

/** =========================
 *  🔧 HELPERS ROBUSTOS
 *  ========================= */
const toInt = (v: any) => {
  const m = String(v ?? "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

const readRemoteConfig = async (db: any) => {
  try {
    // 1) Primero /app (coincide con tu screenshot)
    let s = await getDocFromServer(doc(db, "app"));
    if (s.exists()) return s.data();
    // 2) Fallback a /config/app
    s = await getDocFromServer(doc(db, "config", "app"));
    if (s.exists()) return s.data();
  } catch (_) {
    let s = await getDoc(doc(db, "app"));
    if (s.exists()) return s.data();
    s = await getDoc(doc(db, "config", "app"));
    if (s.exists()) return s.data();
  }
  return {};
};

export default function SignInApp() {
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dniNumber, setDniNumber] = useState<string>("");
  const statusBarHeight: number | undefined = StatusBar.currentHeight;
  const { setUserData } = useContext(SidcaContext);

  // Al estar en esta pantalla (index), el botón atrás cierra la app.
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          BackHandler.exitApp();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => sub.remove();
    }, [])
  );

  const openSocialMedia = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  const db = getFirestore(firebaseconn);
  const usuariosCollection = collection(db, "usuarios");

  // ---- Actualización: abrir Play Store y chequear versión remota (Firestore config/app) ----
  const goToStore = async () => {
    const pkg = Application.applicationId ?? "com.jakiro12.one";
    const marketUrl = `market://details?id=${pkg}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${pkg}`;
    try {
      const can = await Linking.canOpenURL(marketUrl);
      await Linking.openURL(can ? marketUrl : webUrl);
    } catch {
      Linking.openURL(webUrl);
    }
  };

  /** =========================
   *  🔄 checkUpdate (mejorado)
   *  ========================= */
  const checkUpdate = async () => {
    try {
      // Considerar "release" si package coincide o si hay versionCode válido (>0).
      const isRelease =
        Platform.OS === "android" &&
        (Application?.applicationId === "com.jakiro12.one" ||
          toInt(Application?.nativeBuildVersion) > 0);
      if (!isRelease) return;

      const data: any = await readRemoteConfig(db);
      const latest = toInt(data?.latestAndroidVersionCode); // Firestore
      const current = toInt(Application?.nativeBuildVersion); // versionCode real

      // DEBUG (opcional): ver en el dispositivo qué está leyendo
      console.log(
        "UPDATE CHECK → current:",
        current,
        "latest:",
        latest,
        "force:",
        !!data?.forceUpdate
      );

      if (latest > 0 && current > 0 && latest > current) {
        Alert.alert(
          "Actualización disponible",
          data?.message || "Tenés una actualización disponible.",
          [
            ...(data?.forceUpdate
              ? []
              : [{ text: "Más tarde", style: "cancel" as const }]),
            { text: "Actualizar ahora", onPress: goToStore },
          ],
          { cancelable: !data?.forceUpdate }
        );
      }
    } catch (e) {
      console.log("checkUpdate error", e);
    }
  };

  useEffect(() => {
    checkUpdate();
  }, []);

  // -------------------------------------------------------------------------------------------

  const findUser = async () => {
    const dni = (dniNumber || "").trim();
    if (!dni) {
      Alert.alert("Atención", "Ingresá un DNI válido.");
      return;
    }

    setLoading(true);
    try {
      // 1) Usuario base (datos generales y posible fallback de flags)
      const userDoc = await getByDni(usuariosCollection, dni);
      if (!userDoc) {
        Alert.alert("DNI no encontrado", "Verificá el número ingresado.");
        return;
      }

      // 2) Flags canónicos: nuevoAfiliado (si existe)
      const nuevoAfiliadoCol = collection(db, "nuevoAfiliado");
      const af = await getByDni(nuevoAfiliadoCol, dni); // puede ser null

      // 3) Resolver adherente/activo priorizando nuevoAfiliado y luego usuarios
      const adherenteRaw =
        (af?.adherente !== undefined ? af?.adherente : undefined) ??
        userDoc?.adherente ??
        false;

      const activoRaw =
        (af?.activo !== undefined ? af?.activo : undefined) ??
        (af?.estado !== undefined ? af?.estado : undefined) ??
        (userDoc?.activo !== undefined ? userDoc?.activo : undefined) ??
        (userDoc?.estado !== undefined ? userDoc?.estado : undefined) ??
        false;

      const esAdherente = toBool(adherenteRaw);
      // Si es adherente pero no tenemos flag de activo, por seguridad asumimos INACTIVO (false).
      const esActivo = esAdherente ? toBool(activoRaw ?? false) : true;

      // 4) Extras: motivo (y opcional wsp) desde "adherentes"
      const adherentesCol = collection(db, "adherentes");
      const adh = await getByDni(adherentesCol, dni); // puede ser null
      const motivo = adh?.motivo ?? null;
      const wspFromAdh =
        adh?.whatsapp ?? adh?.wsp ?? adh?.celular ?? adh?.telefono ?? null;

      // 5) Guardar en contexto (Home/ModalAlerta usan estos campos)
      setUserData({
        ...userDoc,
        dni,
        _afiliado: {
          adherente: esAdherente,
          activo: esActivo,
          motivo, // ← del doc en "adherentes"
          whatsapp: wspFromAdh ?? null,
          _source: af
            ? "nuevoAfiliado+usuarios+adherentes"
            : "usuarios+adherentes",
          ...(af ?? {}), // conserva otros campos de nuevoAfiliado si existen
        },
      });

      // 6) Ir al Home (si es adherente inactivo, el Modal bloquea el menú)
      router.navigate("/home");
      setDniNumber("");
    } catch (error: any) {
      Alert.alert("Error", String(error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleDniChange = (text: string) => {
    setDniNumber(text);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const openWspNumber = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />
      <ScrollView
        style={{ height: "100%", backgroundColor: "#091d24" }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.container}>
          <View
            style={[
              styles.viewGetData,
              { height: isKeyboardVisible ? "100%" : "60%" },
            ]}
          >
            <ImageBackground
              source={require("../assets/logos/logo-01.png")}
              resizeMode="contain"
              style={styles.logoSignin}
            />
            <View style={styles.formContainer}>
              <Text style={{ fontSize: 20, color: "#ffffff" }}>
                Ingresar con tu DNI de Afiliado
              </Text>
              <TextInput
                style={styles.inputForm}
                placeholder="D.N.I."
                value={dniNumber}
                onChangeText={handleDniChange}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.btnGetIn}
                activeOpacity={1}
                onPress={findUser}
              >
                {loading ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <Text style={{ fontSize: 20, fontWeight: "500" }}>
                    INGRESAR
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <ImageBackground
              style={styles.viewAfiliate}
              source={require("../assets/signinFotos/afiliate.png")}
              resizeMode="cover"
            >
              <TouchableOpacity
                style={styles.btnAfiliate}
                activeOpacity={1}
                onPress={() =>
                  router.navigate("/form-register/create-new-user")
                }
                disabled={loading}
              >
                <Text style={{ fontSize: 20, fontWeight: "500" }}>
                  AFILIARSE
                </Text>
              </TouchableOpacity>
            </ImageBackground>

            {isKeyboardVisible === false ? (
              <View style={{ width: "80%", height: 40, marginTop: 20 }}>
                <TouchableOpacity
                  style={styles.btnWhatsApp}
                  activeOpacity={1}
                  onPress={() => openWspNumber("https://wa.me/5493834539754")}
                >
                  <Text style={{ fontSize: 18 }}>Soporte Técnico</Text>
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require("../assets/logos/whatsapp.png")}
                  />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {isKeyboardVisible === false ? (
            <>
              <ImageBackground
                source={require("../assets/signinFotos/radio_1.png")}
                resizeMode="cover"
                style={styles.viewRadio}
              >
                <Text
                  style={{ fontSize: 20, color: "#ffffff", fontWeight: "600" }}
                >
                  Escuchar Radio SiDCa
                </Text>
                <TouchableOpacity
                  style={styles.radioBtn}
                  onPress={() =>
                    openSocialMedia(
                      "https://streaming.gostreaming.com.ar:10982/stream"
                    )
                  }
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      marginRight: 10,
                    }}
                  >
                    PLAY FM 106.5
                  </Text>
                  <FontAwesome6 name="radio" size={24} color="black" />
                </TouchableOpacity>
              </ImageBackground>

              <View style={{ alignItems: "center", marginVertical: 10 }}>
                <Text
                  style={{ fontSize: 20, color: "#ffffff", fontWeight: "500" }}
                >
                  ¡Síguenos en nuestras Redes Sociales!
                </Text>
              </View>

              <ImageBackground
                source={require("../assets/signinFotos/redes.png")}
                resizeMode="cover"
                style={styles.viewShowMedias}
              >
                <TouchableOpacity
                  style={styles.mediasBtns}
                  onPress={() =>
                    openSocialMedia(
                      "https://youtube.com/@sidcacatamarca2424?si=dQTZ6oWZQLSizYLN"
                    )
                  }
                >
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    source={require("../assets/logos/youtube.png")}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediasBtns}
                  onPress={() =>
                    openSocialMedia(
                      "https://www.facebook.com/profile.php?id=100058046356234"
                    )
                  }
                >
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    source={require("../assets/logos/facebook1.png")}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediasBtns}
                  onPress={() =>
                    openSocialMedia("https://www.sidcagremio.com.ar")
                  }
                >
                  <Image
                    style={{ width: "122%", height: "122%" }}
                    source={require("../assets/logos/cromo1.png")}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediasBtns}
                  onPress={() =>
                    openSocialMedia(
                      "https://www.instagram.com/sidcagremio?igsh=N2Q4aGkzN3lhbzRl"
                    )
                  }
                >
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    source={require("../assets/logos/instagram.png")}
                  />
                </TouchableOpacity>
              </ImageBackground>
            </>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
