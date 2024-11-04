import { View, Text, TouchableOpacity, Image } from "react-native";
import styles from "../../styles/advices/advices-styles";
interface HandleAdviceStatus {
  setActionType: (value: null | string) => void;
}
export default function MainLegalAdvice({ setActionType }: HandleAdviceStatus) {
  return (
    <View style={styles.container}>
      <View style={styles.titleView}>
        <Text style={{ fontSize: 20, color: "#ffffff" }}>
          Asesoramiento Legal
        </Text>
      </View>
      <Image
        style={{ width: "100%", height: 150 }}
        source={require("../../assets/home/juzgado.png")}
        resizeMode="cover"
      />
      <View style={styles.viewInformation}>
        <Text style={{ width: "95%" }}>
          SIDCA, Sindicato de Docentes de Catamarca, te ofrece su equipo
          asesoramiento jurídico, en defensa de derechos. Reclamos y
          presentaciones administrativas, orientación y asesoramiento en
          normativa especializada. ¡Súmate vos también a este beneficio!
        </Text>
      </View>
      <View style={styles.btnsContainer}>
        <Text style={{ fontSize: 18 }}>Normativas</Text>
        <TouchableOpacity
          style={styles.btnGetData}
          activeOpacity={1}
          onPress={() => setActionType("laws")}
        >
          <Text style={{ color: "#ffffff", fontSize: 18 }}>Leyes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnGetData}
          activeOpacity={1}
          onPress={() => setActionType("decrets")}
        >
          <Text style={{ color: "#ffffff", fontSize: 18 }}>Decretos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnGetData}
          activeOpacity={1}
          onPress={() => setActionType("resolutions")}
        >
          <Text style={{ color: "#ffffff", fontSize: 18 }}>Resoluciones</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnGetData}
          activeOpacity={1}
          onPress={() => setActionType("other")}
        >
          <Text style={{ color: "#ffffff", fontSize: 18 }}>
            Otras disposiciones
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.btnWhatsApp}>
        <Text style={{ fontSize: 18 }}>Contacto</Text>
        <Image
          style={{ width: 30, height: 30 }}
          source={require("../../assets/logos/whatsapp.png")}
        />
      </TouchableOpacity>
    </View>
  );
}
