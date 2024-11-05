import { ActivityIndicator, StatusBar, Text, TouchableOpacity, View, Image } from "react-native";
import styles from "../../styles/quota/quota-styles";
import { firebaseconn } from "@/constants/FirebaseConn";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import * as Clipboard from 'expo-clipboard';

export default function FileForQuotaPayment() {
  const statusBarHeight = StatusBar.currentHeight;
  const [quotaData,setQuotaData]=useState<any>([])
  const [loading,setLoading]=useState<boolean>(false)
  const analytics = getFirestore(firebaseconn) 
  const data=collection(analytics,'cuotas')
  useEffect(()=>{
    const getData=async()=>{
        try {
          setLoading(true)
            const res=(await getDocs(data)).docs
            setQuotaData(res[0].data())
        } catch (error) {
            alert(`Error:${error}`)
        }finally {
            setLoading(false); 
        }
    }
    getData()
    },[])
    const copyToClipboard = async () => {
      await Clipboard.setStringAsync(quotaData.alias);
    };
  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>       
        {loading ? ( 
                    <ActivityIndicator size="large" color="#ffffff" />
                ) : (   
                  <View style={styles.quotaBox}>
                  <Image src={quotaData.imagen} style={{width:'95%',height:'80%',borderWidth:1,borderColor:'#ff0000'}} resizeMode="contain"/>
                  <Text style={{width:'95%',height:'auto'}}>{quotaData.descripcion}</Text>
                    <TouchableOpacity style={styles.btnGetAlias}
                      onPress={copyToClipboard}
                      >
                      <Text style={{fontSize:18,color:'#ffffff',fontWeight:'bold'}}>
                        Copiar Alias
                      </Text>
                    </TouchableOpacity>
                  </View>                                         
                )}
      </View>
    </View>
  );
}
