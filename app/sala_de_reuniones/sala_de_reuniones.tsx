import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import styles from "../../styles/sala_de_reuniones/sala_de_reuniones";
import { useState, useEffect } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";

export default function HandleCampusTeachers() {
  const statusBarHeight = StatusBar.currentHeight;

  // Estado para controlar la carga de datos
  const [loading, setLoading] = useState<boolean>(true);
  const [dataTravel, setDataTravel] = useState<any>(null); // Cambié el tipo de estado para un solo objeto
  const [checkRoomLink,setCheckRoomLink]=useState<boolean>(false)
  const analytics = getFirestore(firebaseconn);
  const docRef = doc(analytics, "cuotas", "sala"); // Accede al documento "sala" dentro de la colección "cuotas"

  // Cargar datos desde Firebase
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const docSnap = await getDoc(docRef); // Obtén el documento "sala"

        if (docSnap.exists()) {
          setDataTravel(docSnap.data()); // Si existe, guarda los datos del documento
          //el booleano del boton sea true
          setCheckRoomLink(true)
        } else {
          //el booleano del boton sea falso
          setCheckRoomLink(false)
          alert("El documento 'sala' no existe en la colección 'cuotas'.");
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        alert(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // Verificar si el botón debe estar habilitado
  const isButtonEnabled = dataTravel && dataTravel.link;

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={{ fontSize: 24, color: "#ffffff" }}>
            Sala de Reuniones
          </Text>
        </View>
        <View style={styles.viewInformation}>
          <Text style={styles.text}>
            La Sala de Reuniones para los afiliados tiene como finalidad ofrecer
            un espacio de encuentro gremial donde los miembros del sindicato
            plantean temas de interés y fortalecen la unidad. Además, sirve como lugar para resolver inquietudes,
            compartir información relevante y organizar actividades que
            beneficien a los afiliados. Este espacio contribuye al
            fortalecimiento del movimiento sindical y a la construcción de un
            colectivo más sólido.
          </Text>
        </View>
        <View style={{width:'100%',height:'45%',display:'flex',flexDirection:'column',justifyContent:'space-between',alignItems:'center'}}>
          <View style={{width:'100%',height:180}}>
          <ScrollView            
            contentContainerStyle={{
              display:'flex',
              flexDirection:'row',
              justifyContent: "space-between",
              alignItems: "center",
              columnGap: 15,
              width:'100%',
              height:180,
            
            }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala1.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala2.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala3.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala4.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala5.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala6.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/sala/sala7.jpg")}
              resizeMode="cover"
            />
          </ScrollView>
          </View>   
        
          <View style={[styles.viewInformation,{height:60}]}>
            <Text style={styles.descripcionText}>Descripción:</Text>
          </View>
        

        
          <TouchableOpacity
            style={[styles.btnNews, {
                backgroundColor: checkRoomLink ? "#005CFE" : "#A9A9A9",marginBottom:10
              },
            ]}
            onPress={() => Linking.openURL(dataTravel.link)}
            disabled={checkRoomLink}
            activeOpacity={1}
          >
            <Text style={styles.btnText}>Unirse</Text>
          </TouchableOpacity>
        
       

      </View>
      </View>
    </View>
  );
}
