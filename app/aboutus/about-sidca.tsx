import { ScrollView, StatusBar, Text, View, Image } from "react-native";

export default function AboutUs(){
    const statusBarHeight = StatusBar.currentHeight;
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
          <View style={{ display:'flex',justifyContent:'space-between',alignItems:'center',backgroundColor:'#091d24',width:'100%',height:'100%'}}>
            <Text style={{fontSize:20,color:'#ffffff',fontWeight:500, height:45,display:'flex',justifyContent:'center',alignItems:'center'}}>
                Quienes somos
            </Text>
            <ScrollView style={{width:'100%',borderColor:'#ff0000',borderWidth:1,height:200}} horizontal={true} contentContainerStyle={{columnGap:20,alignItems:'center'}} >
                <Image source={{uri: 'https://reactnative.dev/img/tiny_logo.png',}}
                    style={{width:200,height:100}}
                />
                <Image source={{uri: 'https://reactnative.dev/img/tiny_logo.png',}}
                    style={{width:200,height:100}}
                />
                <Image source={{uri: 'https://reactnative.dev/img/tiny_logo.png',}}
                    style={{width:200,height:100}}
                />
            </ScrollView>
            <View style={{width:'100%',height:'40%',backgroundColor:'#fea200'}}>
                <Text>
                    ejemploosss
                </Text>
            </View>
            <ScrollView style={{width:'100%',borderColor:'#ff0000',borderWidth:1,height:200}} horizontal={true} contentContainerStyle={{columnGap:20,alignItems:'center'}}>
            <Image source={{uri: 'https://reactnative.dev/img/tiny_logo.png',}}
                    style={{width:200,height:100}}
                />
                <Image source={{uri: 'https://reactnative.dev/img/tiny_logo.png',}}
                    style={{width:200,height:100}}
                />
                <Image source={{uri: 'https://reactnative.dev/img/tiny_logo.png',}}
                    style={{width:200,height:100}}
                />
            </ScrollView>
          </View>
        </View>
    )
}