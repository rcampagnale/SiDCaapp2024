import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from '../../styles/advices/advices-styles'
import { useState } from "react";
import OtherData from "./others";
import MainLegalAdvice from "./main-advice";
import Laws from "./laws";
import Resolutions from "./resolutions";
import Decrets from "./decrets";

export default function LegalAdvices(){
    const statusBarHeight: number | undefined = StatusBar.currentHeight;
    const [advice,setAdvice]=useState<string | null>(null)
    const handleAdviceStatus=(value:string | null)=>{
        setAdvice(value)
    }
    let content;
    switch (advice) {
        case 'other':
            content=<OtherData setActionType={handleAdviceStatus}/>
            break;
        case 'laws':
            content=<Laws setActionType={handleAdviceStatus}/>
            break;
        case 'resolutions':
            content=<Resolutions setActionType={handleAdviceStatus}/>
            break;
        case 'decrets':
                content=<Decrets setActionType={handleAdviceStatus}/>
                break;
        default:
            content=<MainLegalAdvice setActionType={handleAdviceStatus}/>
            break;
    }
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
           {content}
        </View>
    )
}