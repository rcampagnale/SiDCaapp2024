import { View, StatusBar,ScrollView, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from '../../styles/links/links-styles'
import { useState, useEffect } from "react";
import { firebaseconn } from "@/constants/FirebaseConn";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
  } from "firebase/firestore";
export default function ReferenceLinks(){
    const statusBarHeight: number | undefined = StatusBar.currentHeight;
    const[linkTo,setLinksTo]=useState<any>([])
    const [loading,setLoading]=useState<boolean>(false)
    const db = getFirestore(firebaseconn);
    const enlacesCollection = collection(db, "enlaces");
   
    
    useEffect(()=>{
        const seeData=async()=>{
            try {
                setLoading(true)
                const queryFirebase = query(enlacesCollection, where("prioridad", "!=", 0));
                const querySnapshot = (await getDocs(queryFirebase)).docs;
                setLinksTo(querySnapshot)      
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
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{display:'flex',justifyContent:'center',alignItems:'center',paddingTop:10,rowGap:20}}>
                {
                    loading === true ? 
                    <ActivityIndicator size="large" color="#ffffff" />
                    :
                    (
                        linkTo.map((e: any, i: number) => (
                          <View style={styles.coursesDoneBox} key={i}>
                            <Text style={{ fontWeight: "bold", width: "90%",textAlign:'center' }}>
                              {e.data().titulo}
                            </Text>            
                            <Text style={{ fontSize:18, width: "90%" }}>
                              {e.data().descripcion}
                            </Text>                 
                            <TouchableOpacity style={styles.btnGetLink}>
                                <Text style={{fontSize:18,color:'#ffffff',fontWeight:'bold'}}>Ver Informacion</Text>
                            </TouchableOpacity>                               
                          </View>
                        ))
                      )
                }
                
                
              
                
            </ScrollView>
        </View>
        </View>
    )
}