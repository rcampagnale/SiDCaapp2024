import { ImageBackground, Text, TouchableOpacity,View,ScrollView,Image } from "react-native";
import styles from '../../styles/courses/courses-styles'
interface HandleOptionsCourse{
    setActionType:(value:null | string)=>void
}
export default function HandleCourses ({setActionType}:HandleOptionsCourse){
    return(
        <>
        <View style={styles.scrollContainer}>
                    <ScrollView style={{width:'100%',height:'100%'}} horizontal={true} contentContainerStyle={{display:'flex',justifyContent:'space-around',alignItems:'center',columnGap:10}} showsHorizontalScrollIndicator={false}>
                        <Image style={{width:180,height:120}} source={require('../../assets/home/nosotros.png')} />
                        <Image style={{width:180,height:120}} source={require('../../assets/home/nosotros.png')} />
                        <Image style={{width:180,height:120}} source={require('../../assets/home/nosotros.png')} />
                        <Image style={{width:180,height:120}} source={require('../../assets/home/nosotros.png')} />
                    </ScrollView>
                </View>
                <View style={styles.textAboutCourse}>
                    <Text style={{fontSize:18,width:'90%'}}>
                        El programacion de capacitacion de SIDCA brinda durante todo el año ofertas de capacitacion y perfecionamiento docente gratuita a sus afiliados, mediante cursos, talleres, congresos y seminarios que propician
                        el acceso a material innovador y actualizado, contribuyendo en la profesionalizacion de nuestros docentes.                        
                    </Text>                    
                </View>
        <ImageBackground style={styles.cardCourses} source={require('../../assets/home/capacitaciones.png')} resizeMode="cover">
                    <Text style={{color:'#ffffff',fontSize:20,fontWeight:600}}>
                        Mis Cursos
                    </Text>
                    <TouchableOpacity style={styles.btnSeeInfo} activeOpacity={1}
                        onPress={()=>setActionType('see')}
                    >
                        <Text style={{color:'#ffffff',fontSize:20}}>Ver</Text>
                    </TouchableOpacity>
                </ImageBackground>
                <ImageBackground style={styles.cardCourses} source={require('../../assets/home/capacitaciones.png')} resizeMode="cover">
                    <Text style={{color:'#ffffff',fontSize:20,fontWeight:600}}>
                        Cursos Disponibles
                    </Text>
                    <TouchableOpacity style={styles.btnSeeInfo}
                        onPress={()=>setActionType('verify')}
                    >
                        <Text style={{color:'#ffffff',fontSize:20}}>Ver</Text>
                    </TouchableOpacity>
                </ImageBackground>
        </>
    )
}