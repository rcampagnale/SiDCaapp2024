import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import styles from "../../styles/courses/courses-styles";
import { useRouter } from "expo-router"; // Importa el hook para la navegación

interface HandleOptionsCourse {
  setActionType: (value: null | string) => void;
}

export default function HandleCourses({ setActionType }: HandleOptionsCourse) {
  const router = useRouter(); // Inicializa el router

  const openClassroom = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };

  return (
    <>
      <View style={styles.scrollContainer}>
        <ScrollView
          style={{ width: "100%", height: "100%" }}
          horizontal={true}
          contentContainerStyle={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            columnGap: 10,
          }}
          showsHorizontalScrollIndicator={false}
        >
          <Image
            style={{ width: 180, height: 120 }}
            source={require("../../assets/cursos/curso.jpg")}
          />
          <Image
            style={{ width: 180, height: 120 }}
            source={require("../../assets/cursos/curso1.jpg")}
          />
          <Image
            style={{ width: 180, height: 120 }}
            source={require("../../assets/cursos/curso2.jpg")}
          />
          <Image
            style={{ width: 180, height: 120 }}
            source={require("../../assets/cursos/curso3.jpg")}
          />
          <Image
            style={{ width: 180, height: 120 }}
            source={require("../../assets/cursos/curso4.jpg")}
          />
        </ScrollView>
      </View>
      <View style={styles.textAboutCourse}>
        <Text
          style={{ fontSize: 17, textAlign: "justify", paddingHorizontal: 10 }}
        >
          El programa de capacitación de SIDCA brinda durante todo el año
          ofertas de capacitación y perfeccionamiento docente gratuita a sus
          afiliados, mediante cursos, talleres, congresos y seminarios que
          propician el acceso a material innovador y actualizado, contribuyendo
          en la profesionalización de nuestros docentes.
        </Text>
      </View>
      <View
        style={{
          width: "90%",
          height: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            width: "90%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#005CFE",
          }}
          onPress={() => openClassroom("https://aula.sidcagremio.com")}
          activeOpacity={1}
        >
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: 600 }}>
            Abrir Aula Virtual
          </Text>
        </TouchableOpacity>
      </View>
      <ImageBackground
        style={styles.cardCourses}
        source={require("../../assets/home/capacitaciones.png")}
        resizeMode="cover"
      >
        <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 600 }}>
          Mis Cursos
        </Text>
        <TouchableOpacity
          style={styles.btnSeeInfo}
          activeOpacity={1}
          onPress={() => setActionType("see")}
        >
          <Text style={{ color: "#ffffff", fontSize: 20 }}>Ver</Text>
        </TouchableOpacity>
      </ImageBackground>
      <ImageBackground
        style={styles.cardCourses}
        source={require("../../assets/home/capacitaciones2.png")}
        resizeMode="cover"
      >
        <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 600 }}>
          Cursos Disponibles
        </Text>
        <TouchableOpacity
          style={styles.btnSeeInfo}
          onPress={() => setActionType("verify")}
        >
          <Text style={{ color: "#ffffff", fontSize: 20 }}>Ver</Text>
        </TouchableOpacity>
      </ImageBackground>
      <ImageBackground
        style={styles.cardCourses}
        source={require("../../assets/home/capacitaciones1.png")}
        resizeMode="cover"
      >
        <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 600 }}>
          Registro de Asistencia
        </Text>
        <TouchableOpacity
          style={styles.btnSeeInfo}
          onPress={() => router.push("/asistencia/asistencia")} // Usa router.push para la navegación
        >
          <Text style={{ color: "#ffffff", fontSize: 20 }}>Ver</Text>
        </TouchableOpacity>
      </ImageBackground>
    </>
  );
}
