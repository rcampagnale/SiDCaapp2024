import {StyleSheet} from 'react-native'

export default touristStyles=StyleSheet.create({
    container:{
        width:'100%',
        height:'100%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor:'#091d24',
    },
    viewTitle:{
        width:'100%',
        height:'8%',        
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    },
    viewInformation:{
        width:'100%',
        height:'auto',
        backgroundColor:'#fea200',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        paddingBottom:10,
        paddingTop:10
    }, 
    carruselContainer:{
        width:'100%',
        height:150,
    },
    carrusel:{
        width:'100%',
        height:'100%',        
    },
    viewGetInformation:{
        width:'100%',
        height:'15%',        
        backgroundColor:'#fea200',
        display:'flex',
        justifyContent:'space-around',
        alignItems:'center',
        flexDirection:'column',
    },
    btnWhatsApp:{
        width:'80%',
        height:40,
        backgroundColor:'#25d366',
        borderRadius:7,
        display:'flex',
        justifyContent:'space-around',
        alignItems:'center',
        flexDirection:'row',
    },
    btnNews:{
        width:'75%',
        height:40,
        backgroundColor:'#fea200',
        borderRadius:5,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        marginBottom:100
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro translúcido
      },
      modalContainer: {
        width: "95%",
        height:'90%',
        padding: 20,
        backgroundColor: "#fea200", // Color de fondo que pediste
        borderRadius: 10,
        alignItems: "center",
      },
      modalText: {
        fontSize: 18,
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
      },
      btnGetLink: {
        width: "auto",
        height: 40,
        borderRadius: 5,
        backgroundColor: "#005CFE",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft:10,
        paddingRight:10
      },
})