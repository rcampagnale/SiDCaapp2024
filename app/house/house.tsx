import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import styles from "../../styles/tourist/tourist-styles";
export default function HandleTeacherHouse() {
  const statusBarHeight = StatusBar.currentHeight;
  const openWspNumber = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };
  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={{ fontSize: 24, color: "#ffffff" }}>
            Casa del Docente
          </Text>
        </View>
        <View style={styles.viewInformation}>
          <Text>
            En Lavalle 815 en la ciudad capital en Catamarca, la casa del
            docente es el anexo de servicios que ofrece SIDCA. Hospedaje, bar y
            cocina compartida, Salón de conferencias y sala de computación. Más
            servicios para la docencia. ¡Súmate a nuestros beneficios ¡
          </Text>
        </View>
        <View style={styles.carruselContainer}>
          <ScrollView
            style={styles.carrusel}
            contentContainerStyle={{
              justifyContent: "space-between",
              alignItems: "center",
              columnGap: 15,
            }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/casa/casa.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/casa/casa1.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/casa/casa2.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/casa/casa3.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/casa/casa4.jpg")}
              resizeMode="cover"
            />
          </ScrollView>
        </View>
        <View style={styles.viewGetInformation}>
          <Text style={{ fontSize: 24, fontWeight: 600 }}>Hace tu reserva</Text>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834250139")}
          >
            <Text style={{ fontSize: 18 }}>Contacto</Text>
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.btnNews} activeOpacity={1}>
          <Text>Novedades</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
