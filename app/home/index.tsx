import {
  StatusBar,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import styles from "../../styles/home-styles/home-styles";
import subMenuStyles from "../../styles/sub_menu/sub_menu"; // Importamos los estilos del submenú
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import CloseApp from "./log-out";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Fontisto from "react-native-vector-icons/Fontisto";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react"; // Necesario para el estado de apertura/cierre

export default function HomePage() {
  const [menuVisible, setMenuVisible] = useState(false); // Estado para controlar el submenú
  const statusBarHeight: number | undefined = StatusBar.currentHeight;

  const toggleMenu = () => {
    setMenuVisible(!menuVisible); // Cambia el estado del submenú
  };

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.topBar}>
        {/* Botón de submenú */}
        <TouchableOpacity
          style={subMenuStyles.menuButton}
          activeOpacity={0.7}
          onPress={toggleMenu} // Al hacer clic, cambia el estado del menú
        >
          <MaterialCommunityIcons name="menu" size={32} color="black" />
        </TouchableOpacity>

        {/* Logos */}
        <View>
          <Image
            source={require("../../assets/logos/cea_1.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>
        <View>
          <Image
            source={require("../../assets/logos/logo-01.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>
        <View>
          <Image
            source={require("../../assets/logos/cgt.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>
        <View>
          <Image
            source={require("../../assets/logos/ie.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Submenú deslizable */}
      {menuVisible && (
        <View style={subMenuStyles.drawer}>
          {/* Título de opciones */}
          <Text style={subMenuStyles.menuTitle}>Datos Personales</Text>

          {/* Agregamos el campo Apellido y Nombre */}
          <Text style={subMenuStyles.dataLabel}>Apellido y Nombre:</Text>
          <Text style={subMenuStyles.dataLabel}>DNI:</Text>
          <Text style={subMenuStyles.dataLabel}>Email:</Text>
          <Text style={subMenuStyles.dataLabel}>Domicilio:</Text>
          <Text style={subMenuStyles.dataLabel}>Teléfono:</Text>
          <Text style={subMenuStyles.dataLabel}>Departamento:</Text>
          <Text style={subMenuStyles.dataLabel}>Establecimiento/s:</Text>

          {/* Botón salir integrado en el submenú */}
          <CloseApp />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          justifyContent: "space-between",
          rowGap: 20,
          backgroundColor: "#091d24",
        }}
      >
        <ImageBackground
          style={styles.viewAbout}
          source={require("../../assets/home/nosotros.png")}
          resizeMode="cover"
        >
          <Text style={{ fontSize: 28, fontWeight: 600, color: "#ffffff" }}>
            Nosotros
          </Text>
          <View style={styles.btnsContainer}>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/aboutus/about-sidca")}
            >
              <View style={styles.logoContainer}>
                <Ionicons name="heart" size={25} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Quienes somos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/credential")}
            >
              <View style={styles.logoContainer}>
                <Entypo name="v-card" size={26} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Credencial de Afiliado</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/contact/contact-information")}
            >
              <View style={styles.logoContainer}>
                <FontAwesome5 name="phone-alt" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Contacto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/quota/quota-users")}
            >
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons
                  name="card-multiple"
                  size={24}
                  color="black"
                />
              </View>
              <Text style={{ fontSize: 18 }}>Cuotas Adherentes</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <ImageBackground
          style={styles.viewInformation}
          source={require("../../assets/home/capacitaciones.png")}
          resizeMode="cover"
        >
          <Text style={{ fontSize: 28, fontWeight: 600, color: "#ffffff" }}>
            Información
          </Text>
          <View style={styles.btnsContainer}>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/courses/get-my-courses")}
            >
              <View style={styles.logoContainer}>
                <FontAwesome5 name="user-graduate" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Capacitaciones</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                router.navigate("/sala_de_reuniones/sala_de_reuniones")
              }
            >
              <View style={styles.logoContainer}>
                <AntDesign name="customerservice" size={27} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Sala de Reuniones</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/links/short-links")}
            >
              <View style={styles.logoContainer}>
                <Feather name="external-link" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Enlaces de utilidad</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <ImageBackground
          style={styles.viewSupport}
          source={require("../../assets/home/asesoramiento.jpg")}
          resizeMode="cover"
        >
          <Text style={{ fontSize: 28, fontWeight: 600, color: "#ffffff" }}>
            Asesoramiento
          </Text>
          <View style={styles.btnsContainer}>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/advice-general/advicer")}
            >
              <View style={styles.logoContainer}>
                <Fontisto name="person" color="#000" size={24} />
              </View>
              <Text style={{ fontSize: 18 }}>Gremial</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/legal-advice/legal")}
            >
              <View style={styles.logoContainer}>
                <FontAwesome name="legal" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Legal</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <ImageBackground
          style={styles.viewBenefits}
          source={require("../../assets/casa/casa.jpg")}
          resizeMode="cover"
        >
          <Text style={{ fontSize: 28, fontWeight: 600, color: "#ffffff" }}>
            Beneficios
          </Text>
          <View style={styles.btnsContainer}>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/tourist/tourist")}
            >
              <View style={styles.logoContainer}>
                <FontAwesome name="bus" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Turismo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/house/house")}
            >
              <View style={styles.logoContainer}>
                <FontAwesome5 name="house-user" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Casa del docente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/campus/campus")}
            >
              <View style={styles.logoContainer}>
                <MaterialIcons name="maps-home-work" color="#000" size={24} />
              </View>
              <Text style={{ fontSize: 18 }}>Predio Recreativo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() => router.navigate("/convenio/convenio")}
            >
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons
                  name="network-outline"
                  color="#000"
                  size={28}
                />
              </View>
              <Text style={{ fontSize: 18 }}>Red de Convenios</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ScrollView>
    </View>
  );
}
