import { StatusBar, Text, View, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import styles from '../../styles/home-styles/home-styles'
import { router } from "expo-router";
export default function HomePage(){
    const statusBarHeight:number | undefined = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.topBar}>
                <Text>Salir</Text>
            </View>
        <ScrollView  contentContainerStyle={{justifyContent:'space-between',rowGap:20,backgroundColor:'#091d24'}}>
            <ImageBackground style={styles.viewAbout} source={require('../../assets/home/nosotros.png')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Nosotros</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/aboutus/about-sidca")}
                    >
                        <Text>Quienes somos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/credential")}                
                    >
                        <Text>Credencial de Afiliado</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/contact/contact-information")}                
                        >
                        <Text>Contacto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/quota/quota-users")}                
                    >
                        <Text>Cuotas Adherentes</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <ImageBackground style={styles.viewInformation} source={require('../../assets/home/capacitaciones.png')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Informacion</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/courses/get-my-courses")}                
                    >
                        <Text>Capacitaciones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Text>Enlaces de utilidad</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <ImageBackground style={styles.viewSupport} source={require('../../assets/home/asesoramiento.jpg')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Asesoramiento</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/advice-general/advicer")}                                    
                    >
                        <Text>General</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/legal-advice/legal")}                                                
                    >
                        <Text>Legal</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <ImageBackground style={styles.viewBenefits} source={require('../../assets/home/casadocente.png')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Beneficios</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/tourist/tourist")}                                                                
                    >
                        <Text>Turismo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/house/house")}                                                                                        
                    >
                        <Text>Casa del docente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/campus/campus")}                                                
                    >
                        <Text>Predio recreativo</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </ScrollView>
        </View>
    )
}