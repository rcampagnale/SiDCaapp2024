import { StatusBar, Text, View, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import styles from '../../styles/home-styles/home-styles'
import { router } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
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
                        <View style={styles.logoContainer}>                        
                        <Ionicons name="heart" size={24} color="black" />
                        </View>
                        <Text>Quienes somos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/credential")}                
                    >
                        <View style={styles.logoContainer}>                        
                        <MaterialCommunityIcons name="card-text" size={24} color="black" />
                        </View>
                        <Text>Credencial de Afiliado</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/contact/contact-information")}                
                        >
                        <View style={styles.logoContainer}>                                                
                        <FontAwesome5 name="phone-alt" size={24} color="black" />
                        </View>
                        <Text>Contacto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/quota/quota-users")}                
                    >
                        <View style={styles.logoContainer}>                        
                        <MaterialCommunityIcons name="card-multiple" size={24} color="black" />
                        </View>
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
                        <View style={styles.logoContainer}>                        
                        <FontAwesome5 name="user-graduate" size={24} color="black" />
                        </View>
                        <Text>Capacitaciones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <View style={styles.logoContainer}>                        
                        <Feather name="external-link" size={24} color="black" />
                        </View>
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
                        <View style={styles.logoContainer}>                        
                        <Entypo name="shield" size={24} color="black" />
                        </View>
                        <Text>General</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/legal-advice/legal")}                                                
                    >
                        <View style={styles.logoContainer}>                        
                        <FontAwesome name="legal" size={24} color="black" />
                        </View>
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
                        <View style={styles.logoContainer}>                        
                        <FontAwesome name="bus" size={24} color="black" />
                        </View>
                        <Text>Turismo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/house/house")}                                                                                        
                    >
                        <View style={styles.logoContainer}>
                        <FontAwesome5 name="house-user" size={24} color="black" />
                        </View>
                        <Text>Casa del docente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}
                        onPress={()=>router.navigate("/campus/campus")}                                                
                    >
                        <View style={styles.logoContainer}>
                            <FontAwesome name="birthday-cake" size={24} color="black" />
                        </View>
                        <Text>Predio recreativo</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </ScrollView>
        </View>
    )
}