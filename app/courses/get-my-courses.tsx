import { Image, ScrollView, StatusBar, Text, View,ImageBackground, TouchableOpacity } from "react-native";
import styles from '../../styles/courses/courses-styles'
export default function GetCoursesOptions(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>    
            <View style={styles.container}>
                <View style={styles.scrollContainer}>
                    <ScrollView style={{width:'100%',height:'100%'}} horizontal={true} contentContainerStyle={{display:'flex',justifyContent:'space-around',alignItems:'center',columnGap:10}} showsHorizontalScrollIndicator={false}>
                        <Image style={{width:180,height:120}} source={require('../../assets/home/nosotros.png')} />
                        <Image style={{width:180,height:120}} source={require('../../assets/home/nosotros.png')} />
                        <Image style={{width:180,height:120}} source={require('../../assets/home/nosotros.png')} />
                        <Image style={{width:180,height:120}} source={require('../../assets/home/nosotros.png')} />
                    </ScrollView>
                </View>
                <View style={styles.textAboutCourse}>
                    <Text>
                        El programacion de capacitacion de SIDCA brinda durante todo el año ofertas de capacitacion y perfecionamiento docente gratuita a sus afiliados, mediante cursos, talleres, congresos y seminarios que propician
                        el acceso a material innovador y actualizado, contribuyendo en la profesionalizacion de nuestros docentes.                        
                    </Text>                    
                </View>
                <ImageBackground style={styles.cardCourses} source={require('../../assets/home/capacitaciones.png')} resizeMode="cover">
                    <Text style={{color:'#ffffff'}}>
                        Cards
                    </Text>
                    <TouchableOpacity style={styles.btnSeeInfo}>
                        <Text>Boton</Text>
                    </TouchableOpacity>
                </ImageBackground>
                <ImageBackground style={styles.cardCourses} source={require('../../assets/home/capacitaciones.png')} resizeMode="cover">
                    <Text style={{color:'#ffffff'}}>
                        Cards
                    </Text>
                    <TouchableOpacity style={styles.btnSeeInfo}>
                        <Text>Boton</Text>
                    </TouchableOpacity>
                </ImageBackground>
            </View>
        </View>
    )
}