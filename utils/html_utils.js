function getAccountDetails() {
  const accountDetails =  `
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
    <tr style="background-color: #f2f2f2;">
        <th style="text-align: left;">Número de Cuenta</th>
        <td style="background-color: #e6f7ff;">799983351</td>
    </tr>
    <tr>
        <th style="text-align: left;">CBU</th>
        <td style="background-color: #e6ffe6;">0070335020000007999815</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
        <th style="text-align: left;">Alias CBU</th>
        <td style="background-color: #fff7e6;">familiaborda</td>
    </tr>
    <tr>
        <th style="text-align: left;">CUIL/CUIT</th>
        <td style="background-color: #fff2e6;">30717385930</td>
    </tr>
    </table> `
  return accountDetails
}

const getHtmlHeaders = (totalesIndex, headers) => {
    let headersHTML = `<table border="1" cellpadding="5" cellspacing="0"><tr>`
    // Añadimos los títulos (exceptuando la primera columna)
    for (let h = 1; h <= totalesIndex; h++) {
      headersHTML += `<th style="color: darkblue; background-color: lightblue;">${headers[h] ? headers[h] : ''}</th>`
    }
    headersHTML += `</tr>`
    return headersHTML
}

const getRowDetails = ({ data, totalesIndex, currentIndex}) => {
  let rows = ""
  
  for (let j = currentIndex; j >= 0; j--) {
    const currentRow = data[j]
    let currentRowHTML = "<tr>"
    for (let k = 1; k <= totalesIndex; k++) {
      let value = currentRow[k]
      let colorStyle = '';

      if (!isNaN(value) && value !== '') {
        value = Math.round(value)
        if (value > 0) {
          colorStyle = 'color: darkred; background-color: lightcoral;'
        } else if (value < 0) {
          colorStyle = 'color: darkgreen; background-color: lightgreen;'
        }
      }

      currentRowHTML += `<td style="${colorStyle}">${value ? value : ''}</td>`
    }
    rows = `${currentRowHTML}</tr>` + rows
    if (data[j-1][0]) {
      break // Nos detenemos cuando encontramos un correo anterior
    }
  }
  return rows
}
  
module.exports = {
  getAccountDetails,
  getHtmlHeaders,
  getRowDetails
}