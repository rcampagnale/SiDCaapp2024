import {  StatusBar, View } from "react-native";
import styles from '../../styles/courses/courses-styles'
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import CourseAviablesForMe from "./courses-aviables";
import HandleCourses from "./options-courses";
import CoursesTakenByMe from "./courses-picked";
import { prefetchCursosConCertificado } from "../../components/certificados/certificadoApi";
export default function GetCoursesOptions(){
    const { action: actionParam } = useLocalSearchParams<{
        action?: string | string[];
    }>();
    const initialActionRef = useRef(
        Array.isArray(actionParam) ? actionParam[0] : actionParam,
    );
    const initialAction =
        initialActionRef.current === "verify" || initialActionRef.current === "see"
            ? initialActionRef.current
            : null;
    const [action,setAction]=useState<null | string>(initialAction)
    const statusBarHeight = StatusBar.currentHeight;

    useEffect(() => {
        prefetchCursosConCertificado();
    }, []);

    const handleSetActionType=(value:null | string)=>{
        setAction(value)
      }
    let content;
    switch (action) {
        case 'verify':
            content=<CourseAviablesForMe setActionType={handleSetActionType}/>
            break;    
        case 'see':
            content=<CoursesTakenByMe setActionType={handleSetActionType}/>
        break;
        default:
            content=<HandleCourses setActionType={handleSetActionType}/>
            break;
    }
    
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>    
            <View style={styles.container}>                
                {content}
            </View>
        </View>
    )
}
