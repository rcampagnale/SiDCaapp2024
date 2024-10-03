import { ScrollView, StatusBar, Text, View, Image } from "react-native";

export default function AboutUs(){
    const statusBarHeight = StatusBar.currentHeight;
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
          <View style={{ display:'flex',justifyContent:'space-between',alignItems:'center',backgroundColor:'#091d24',width:'100%',height:'100%'}}>
            <Text style={{fontSize:24,color:'#ffffff',fontWeight:500, height:45,display:'flex',justifyContent:'center',alignItems:'center',marginTop:10}}>
                Quienes somos
            </Text>
            <ScrollView style={{width:'100%',height:200}} horizontal={true} contentContainerStyle={{columnGap:20,alignItems:'center'}} >
                <Image source={require('../../assets/home/nosotros.png')}
                    style={{width:200,height:100}}
                />
                <Image source={require('../../assets/home/nosotros.png')}
                    style={{width:200,height:100}}
                />
                <Image source={require('../../assets/home/nosotros.png')}
                    style={{width:200,height:100}}
                />
            </ScrollView>
            <View style={{width:'100%',height:'auto',backgroundColor:'#fea200',paddingBottom:10,paddingTop:10}}>
                <Text style={{fontSize:16,textAlign:'justify',width:'95%'}}>
                    SIDCA, el sindicato de docentes de Catamarca, inscripcion gremial 2902, adherido a la Confederacion Argentina de Educadores, CEA, Personeria gremial 1716. Trabaja en la firme defensa de los derechos docente, rearfirmando el reclamo permanente por mejores condiciones en el desempeño profesional, promoviendo la capacitacion y el perfecionamiento, exigiendo el respeto a normativas justas
                    para los trabajadores y trabajadoras de la educacion. Creemos que la educacion es motor indiscutible de desarrollo de los pueblos y por eso defendemos las mejores condiciones
                    laborales para quienes la imparten, en consonancia con las intituciones gremiales consolidadas a nivel pais y la internacional de la educacion, que cuidan y protegen a educadores del pais y el mundo
                </Text>
            </View>
            <ScrollView style={{width:'100%',height:200}} horizontal={true} contentContainerStyle={{columnGap:20,alignItems:'center'}}>
            <Image source={require('../../assets/home/nosotros.png')}
                    style={{width:200,height:100}}
                />
                <Image source={require('../../assets/home/nosotros.png')}
                    style={{width:200,height:100}}
                />
                <Image source={require('../../assets/home/nosotros.png')}
                    style={{width:200,height:100}}
                />
            </ScrollView>
          </View>
        </View>
    )
}