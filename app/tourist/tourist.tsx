import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Button,
  Modal,
  ActivityIndicator,
} from "react-native";
import styles from "../../styles/tourist/tourist-styles";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
export default function HandleTourist() {
  const statusBarHeight = StatusBar.currentHeight;
  const [modalVisible, setModalVisible] = useState<boolean>(false); 
  const [loading,setLoading]=useState<boolean>(false)
  const [dataImg,setDataImg]=useState<string>("")
  const analytics = getFirestore(firebaseconn) 
    const data=collection(analytics,'novedades')
  const openWspNumber = (urlMedia: string) => {
    Linking.openURL(urlMedia);
  };
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };
  useEffect(()=>{
    const getData=async()=>{
        try {
          setLoading(true)
            const res=(await getDocs(data)).docs
            setDataImg(res[0].data().imagen)
        } catch (error) {
            alert(`Error:${error}`)
        }finally {
            setLoading(false); 
        }
    }
    getData()
    },[])
  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={{ fontSize: 24, color: "#ffffff" }}>Turismo</Text>
        </View>
        <View style={styles.viewInformation}>
          <Text>
            SIDCA desarrolla su programa de turismo social para sus afiliados,
            con la firma de convenios con otras entidades gremiales a nivel país
            que permiten disfrutar del tiempo libre y vacacional mediante sus
            planes de paseo a corredores turísticos de la Argentina y Catamarca,
            gozando de los mejores paisajes y servicios. ¡Súmate a los
            beneficios!
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
              source={require("../../assets/turismo/turismo.jpg")}
              resizeMode="cover"
            />

            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo1.jpg")}
              resizeMode="cover"
            />

            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo2.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo3.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo4.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo5.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/turismo/turismo6.jpg")}
              resizeMode="cover"
            />
          </ScrollView>
        </View>
        <View style={styles.viewGetInformation}>
          <Text style={{ fontSize: 24, fontWeight: 600 }}>Hace tu reserva</Text>
          <TouchableOpacity
            style={styles.btnWhatsApp}
            activeOpacity={1}
            onPress={() => openWspNumber("https://wa.me/5493834283151")}
          >
            <Text style={{ fontSize: 18 }}>Contacto</Text>
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../assets/logos/whatsapp.png")}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.btnNews}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <Text>Novedades</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal} // Cuando se cierra el modal
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
            {loading ? ( 
                    <ActivityIndicator size="large" color="#ffffff" />
                ) : (                                            
                  <Image src={dataImg} style={{width:'100%',height:'90%'}} resizeMode="contain"/>
                )}
                <TouchableOpacity style={styles.btnGetLink}
                  onPress={toggleModal}
                >
                  <Text style={{fontSize:18,fontWeight:'bold',color:'#ffffff'}}>Cerrar</Text>
                </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
