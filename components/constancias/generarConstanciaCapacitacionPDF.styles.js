export const estilosConstanciaPDF = `
  @page {
    size: A4 portrait;
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    width: 210mm;
    height: 297mm;
    background: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
  }

  .page {
    position: relative;
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    background: #ffffff;
  }

  .template {
    position: absolute;
    top: 0;
    left: 0;
    width: 210mm;
    height: 297mm;
    object-fit: fill;
    z-index: 1;
  }

  .dato {
    position: absolute;
    z-index: 2;
    color: #000000;
    font-size: 16pt;
    font-weight: 700;
    line-height: 14pt;
    white-space: nowrap;
    margin: 0;
    padding: 0;
    background: transparent;
  }

 .docente {
  left: 56.2%;
  top: 28.6%;
  width: 45.7%;
  font-size: 16pt;
  font-weight: 700;
  line-height: 14pt;
}

  .dni {
    left: 10.7%;
    top: 36.2%;
    width: 24%;
  }

  /*
    CURSO CORREGIDO:
    - Punto de partida fijo a la izquierda.
    - Sin left negativo.
    - Sin centrado.
    - Escribe de izquierda a derecha.
  */
  .curso {
    left: 5.2%;
    top: 40.7%;
    width: 89%;
    white-space: normal;
    font-size: 16pt;
    font-weight: 700;
    line-height: 14pt;
    text-transform: uppercase;
    text-align: left;
    background: transparent;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .resolucion {
    left: 55.8%;
    top: 45.2%;
    width: 38%;
    font-size: 16pt;
    font-weight: 700;
    line-height: 14pt;
    text-align: left;
  }

  .dias {
    left: 11.7%;
    top: 50.8%;
    width: 57%;
    font-size: 16pt;
    font-weight: 700;
    line-height: 14pt;
  }

  .emision {
    left: 5.2%;
    top: 59.2%;
    width: 72%;
    font-size: 16pt;
    font-weight: 700;
    line-height: 14pt;
    white-space: normal;
    background: transparent;
    text-align: left;
    overflow-wrap: break-word;
    word-break: normal;
  }
`;