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
} from "react-native";
import styles from "../styles/signin-styles/sign-in-styles";
import { useEffect, useState, useContext } from "react";
import { router } from "expo-router";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
import { SidcaContext } from "./_layout";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function SignInApp() {
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dniNumber, setDniNumber] = useState<string>("");
  const statusBarHeight: number | undefined = StatusBar.currentHeight;
  const { setUserData } = useContext(SidcaContext);

  const openSocialMedia = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  const db = getFirestore(firebaseconn);
  const usuariosCollection = collection(db, "usuarios");

  const findUser = async () => {
    if (dniNumber === "") return alert("Ingrese un Numero Valido!!");
    setLoading(true);
    try {
      const queryFirebase = query(
        usuariosCollection,
        where("dni", "==", dniNumber)
      );
      const querySnapshot = await getDocs(queryFirebase);
      if (querySnapshot.empty) {
        alert("DNI no encontrado");
      } else {
        const userData = querySnapshot.docs[0].data();
        setUserData(userData);
        router.navigate("/home");
        setDniNumber("");
      }
    } catch (error) {
      alert(`error: ${error}`);
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
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
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
              onPress={() => router.navigate("/form-register/create-new-user")}
              disabled={loading}
            >
              <Text style={{ fontSize: 20, fontWeight: "500" }}>AFILIARSE</Text>
            </TouchableOpacity>
          </ImageBackground>
          <View style={{ width: "80%", height: 40, marginTop: 20 }}>
            <TouchableOpacity
              style={styles.btnWhatsApp}
              activeOpacity={1}
              onPress={() => openWspNumber("https://wa.me/5493832437803")}
            >
              <Text style={{ fontSize: 18 }}>Soporte Técnico</Text>
              <Image
                style={{ width: 30, height: 30 }}
                source={require("../assets/logos/whatsapp.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
        {isKeyboardVisible === false ? (
          <>
            <ImageBackground
              source={require("../assets/signinFotos/radio_1.jpg")}
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
                  style={{ fontSize: 18, fontWeight: "bold", marginRight: 10 }}
                >
                  {" "}
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
    </View>
  );
}
