import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from '../../styles/advices/advices-styles'
import { useState } from "react";
import InformationParts from "./info-part";
import MainComponent from "./main-data";
export default function GeneralAdvice(){
    const statusBarHeight: number | undefined = StatusBar.currentHeight;
    const [advice,setAdvice]=useState<string | null>(null)
    const handleAdviceStatus=(value:string | null)=>{
        setAdvice(value)
    }
    let adviceStatus;
    switch (advice) {
        case 'information':
            adviceStatus = <InformationParts setActionType={handleAdviceStatus}/>
            break;
        default:
            adviceStatus=<MainComponent setActionType={handleAdviceStatus}/>
            break;
    }
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.container}>
               {adviceStatus}
            </View>
        </View>
    )
}