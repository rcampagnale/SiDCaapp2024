import {  StatusBar, View } from "react-native";
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
            content=<CourseAviablesForMe setActionType={handleSetActionType}/>
            break;    
        case 'verify':
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