import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native";
import styles from '../../styles/advices/advices-styles'
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from "react";
import { firebaseconn } from "@/constants/FirebaseConn";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
  } from "firebase/firestore";
interface HandleAdviceStatus{
    setActionType:(value:null | string)=>void
}
export default function InformationParts({setActionType}:HandleAdviceStatus){
    const[partInfo,setPartInfo]=useState<any>([])
    const [loading,setLoading]=useState<boolean>(false)
    const db = getFirestore(firebaseconn);
    const asesoramientoCollection = collection(db, "asesoramiento");
   
    
    useEffect(()=>{
        const seeData=async()=>{
            try {
                setLoading(true)
                const queryFirebase = query(asesoramientoCollection, where("categoria", "==", "paritarias"));
                const querySnapshot = (await getDocs(queryFirebase)).docs;
                setPartInfo(querySnapshot)      
            } catch (error) {
                alert('Ocurrio un error')
                console.log(error)
            }finally{
                setLoading(false)
            }          
        }
        seeData()
    },[])
    return(
        <View  style={{height:'100%',width:'100%',backgroundColor:'#091d24'}}>    
        <View style={styles.btnBackToOptions}>
            <TouchableOpacity style={styles.btnBack}
                onPress={()=>setActionType(null)}
            >
            <AntDesign name="back" size={24} color="black" />
                <Text style={{fontSize:18,marginLeft:5}}>Volver</Text>
            </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{display:'flex',justifyContent:'center',alignItems:'center',paddingTop:10,rowGap:20}}>
                {
                    loading === true ? 
                    <ActivityIndicator size="large" color="#ffffff" />
                    :
                    (
                        partInfo.map((e: any, i: number) => (
                          <View style={styles.coursesDoneBox} key={i}>
                               <Text style={{ fontWeight: "bold", width: "90%" }}>
                {e.data().titulo}
              </Text>
              <Image
                src={e.data().imagen}
                style={{ width: '80%', height: '70%' }}
                resizeMode="contain"
              />    
                               <Text style={{ fontWeight: "bold", width: "90%" }}>
                {e.data().descripcion}
              </Text>                                                    
                          </View>
                        ))
                      )
                }
                
                
              
                
            </ScrollView>
        </View>
    )
}