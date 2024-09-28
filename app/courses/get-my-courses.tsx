import { Image, ScrollView, StatusBar, Text, View,ImageBackground, TouchableOpacity } from "react-native";
import styles from '../../styles/courses/courses-styles'
import { useState } from "react";
import CourseAviablesForMe from "./courses-aviables";
import HandleCourses from "./options-courses";
import CoursesTakenByMe from "./courses-picked";
export default function GetCoursesOptions(){
    const [action,setAction]=useState<null | string>(null)
    const statusBarHeight = StatusBar.currentHeight;
    const handleSetActionType=(value:null | string)=>{
        setAction(value)
      }
    let content;
    switch (action) {
        case 'see':
            content=<CourseAviablesForMe/>
            break;    
        case 'verify':
            content=<CoursesTakenByMe/>
        break;
        default:
            content=<HandleCourses setActionType={handleSetActionType}/>
            break;
    }
    
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
                    <Text style={{fontSize:18,width:'90%'}}>
                        El programacion de capacitacion de SIDCA brinda durante todo el año ofertas de capacitacion y perfecionamiento docente gratuita a sus afiliados, mediante cursos, talleres, congresos y seminarios que propician
                        el acceso a material innovador y actualizado, contribuyendo en la profesionalizacion de nuestros docentes.                        
                    </Text>                    
                </View>
                {content}
            </View>
        </View>
    )
}