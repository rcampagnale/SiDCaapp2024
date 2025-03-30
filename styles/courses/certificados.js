import { StyleSheet, Dimensions } from 'react-native';

// Obtenemos las dimensiones de la pantalla para hacerla responsiva
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa todo el espacio disponible
    justifyContent: 'center', // Centra los elementos verticalmente
    alignItems: 'center', // Centra los elementos horizontalmente
    width: '100%', // Ocupa el 100% del ancho de la pantalla
    height: '100%', // Ajustado a 100% de la altura de la pantalla
    display: 'flex', // Usamos flexbox para el layout
    flexDirection: 'column', // Los elementos se distribuyen en una columna
  },

  // Fondo de color antes de la imagen
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#091d24', // Color de fondo personalizable
    zIndex: -1, // Coloca este fondo debajo de la imagen y otros elementos
  },

  // Imagen de fondo
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  // Contenedor con información rotada
  rotatedTextContainer: {
    position: 'absolute',
    bottom: 50,
    left: '-8%',
    top: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rotatedText: {
    fontSize: 10,
    fontWeight: '700',
    transform: 'rotateZ(90deg)', // Rotación
    width: 520,
    color: 'black',
    textAlign: 'center', // Centrado del texto
    flexWrap: 'wrap', // Ajusta el texto largo
  },

  // Estilo para la imagen rotada
  rotatedImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // Asegura que la imagen se ajuste correctamente dentro del contenedor
  },

  // Estilo general de los campos de texto
  fieldText: {
    fontSize: 10,
    fontWeight: '600',
    transform: 'rotateZ(90deg)', // Rotación
    width: 300,
    color: 'black',
  },

  // Estilo del contenedor de la imagen con firma
  imageContainer: {
    position: 'absolute',
    bottom: 50,
    left: '4%',
    top: 550,
    transform: [{ rotateZ: '90deg' }], // Rotación de la imagen
    width: 120, // Ajusta el ancho de la imagen
    height: 120, // Ajusta la altura de la imagen
  },

  // Estilo para el texto que indica que la firma no está disponible
  imageFallbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
    
  },

  // Estilos para el botón de volver
  btnBackToOptions: {
    width: '100%',
    height: 75,
    backgroundColor: '#fea200',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnBack: {
    width: 'auto',
    height: '100%',
    marginLeft: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

});

export default styles;
