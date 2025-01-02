import {
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import styles from "../../styles/contact/contact-styles";
export default function ContactInformation() {
  const statusBarHeight = StatusBar.currentHeight;
  const openWspNumber = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };
  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.titleContact}>
          <Text style={styles.textTitle}>Medios de contacto</Text>
        </View>
        <View style={styles.mediasContactContainer}>
          <Text style={{ fontSize: 22, fontWeight: 500 }}>
            Números de WhatsApp
          </Text>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834051983")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>
              Asesoramiento General
            </Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834397239")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>
              Departamento Jurídico
            </Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834230813")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>
              SiDCa Gestión Expediente
            </Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834283151")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>SiDCa Turismo</Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834250139")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>
              Casa del Docente
            </Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834220295")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>SiDCa Radio</Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493835406450")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>
              Hotelería Interprovincial SiDCa
            </Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834012228")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>
              Secretaría de Capacitación
            </Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493832437803")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>
              Soporte Técnico
            </Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834539754")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>
              Afiliado Adherente
            </Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834325816")}
          >
            <Text style={{ fontSize: 18, marginLeft: 10 }}>
              Entrega de Certificados
            </Text>
            <Image
              style={{ width: 30, height: 30, marginRight: 10 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.footerContainer}>
          <Text style={{ width: "90%" }}>
            Sede central Ayacucho 227 - 1° Piso, San Fernando del Valle de
            Catamarca, Catamarca CP 4700
          </Text>
        </View>
      </View>
    </View>
  );
}
