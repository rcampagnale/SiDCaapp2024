import { TouchableOpacity, Text, View, ActivityIndicator, ScrollView, Image } from "react-native";
import styles from '../../styles/courses/courses-styles'
import AntDesign from '@expo/vector-icons/AntDesign';
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
import { useContext, useEffect, useState } from "react";
import { SidcaContext } from "../_layout";
interface HandleOptionsCourse{
    setActionType:(value:null | string)=>void
}
export default function CoursesTakenByMe({setActionType}:HandleOptionsCourse){
    const[courseAproved,setCourseAproved]=useState<any>([])
    const [loading, setLoading] = useState<boolean>(true); 
    const [checkData,setCheckData]=useState<number>(0)
    const{userData}=useContext(SidcaContext)
    const analytics = getFirestore(firebaseconn) 
    const data=collection(analytics,'usuarios')
    
    useEffect(()=>{
        const seeInfo=async()=>{
            try {
                const res=(await getDocs(data)).docs        
                if(res.findIndex(item => item.data().dni === userData?.dni) !== -1 && userData){
                    let position=res.findIndex(item => item.data().dni === userData?.dni)
                    const subColRef = collection(analytics, 'usuarios', res[position].id, 'cursos')
                    const subQuerySnapshot = (await getDocs(subColRef)).docs; //Array con todos los cursos
                    let filterCourses=subQuerySnapshot.filter(item=>item.data().estado === "terminado")
                    setCourseAproved(filterCourses)
                }else{
                    setCheckData(1)
                } 
            } catch (error) {
                alert(`Error:${error}`)                
            }finally{
                setLoading(false); // Cambiar el estado de carga al final
            }
        }
        seeInfo()
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
        <Text style={{fontSize:20,color:'#ffffff',width:'90%',marginHorizontal:'auto',height:'auto'}}>{checkData === 1 ? 'No haz finalizado ningun curso' : null}</Text>
        <ScrollView  style={{width:'95%',height:'80%',margin:'auto',paddingTop:20}}
            contentContainerStyle={{justifyContent:'space-between',alignItems:'center',display:'flex',rowGap:15,paddingBottom:40}}
        >
            {loading ? ( 
                    <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                    courseAproved.map((e: any, i: number) => (
                        <View style={styles.coursesDoneBox} key={i}>
                            <Text style={{ fontWeight: 'bold',width:'90%' }}>{e.data().titulo}</Text>  
                            <Image src={e.data().imagen} style={{width:200,height:250}} resizeMode="cover"/>                          
                            <Text style={{fontSize:18,fontWeight:'bold'}}>{e.data().aprobo === true ? 'Curso Aprobado' : 'Curso NO Aprobado'}</Text>
                        </View>
                    ))
                )}
        </ScrollView>        
        </View>
    )
}