import { StatusBar, Text, View } from "react-native";
import styles from '../../styles/courses/courses-styles'
export default function GetCoursesOptions(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>    
            <View style={styles.container}>
                <Text>
                    mis cursos
                </Text>
            </View>
        </View>
    )
}