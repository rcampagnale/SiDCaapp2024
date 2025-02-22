import { View, Text, TouchableOpacity, Linking, ActivityIndicator, ScrollView } from "react-native";
import styles from '../../styles/advices/advices-styles'
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
interface HandleAdviceStatus{
    setActionType:(value:null | string)=>void
}
export default function SalaryRate({setActionType}:HandleAdviceStatus){
    const[salary,setSalary]=useState<any>([])
    const [loading, setLoading] = useState<boolean>(true); 
    const analytics = getFirestore(firebaseconn) 
    const data=collection(analytics,'asesoramiento')
    const openLinks=(urlMedia:string)=>{
        Linking.openURL(urlMedia)
    }
    useEffect(()=>{
        const getData=async()=>{
            try {
                const res=(await getDocs(data)).docs.filter(item=>item.data().categoria === "escala_salarial")
                setSalary(res)
            } catch (error) {
                console.log(error)
            }finally {
                setLoading(false); // Cambiar el estado de carga al final
            }
        }
        getData()
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
        <ScrollView  style={{width:'95%',height:'80%',margin:'auto'}}
            contentContainerStyle={{justifyContent:'space-between',alignItems:'center',display:'flex',rowGap:15}}
        >
            {loading ? ( 
                    <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                    salary.map((e: any, i: number) => (
                        <View style={styles.linksBox} key={i}>
                            <Text style={{ fontWeight: 'bold' }}>{e.data().titulo}</Text>
                            <TouchableOpacity style={styles.btnGetLink}
                                onPress={() => openLinks(e.data().link)}
                                activeOpacity={1}
                            >
                                <Text style={{ color: '#ffffff', fontSize: 20 }}>Descargar PDF</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
        </ScrollView>        
        </View>
    )
}