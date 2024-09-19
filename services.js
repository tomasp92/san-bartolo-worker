const xlsx = require('xlsx')
const fs = require('fs');
const { getHtmlHeaders, getRowDetails } = require('./utils/html_utils')
const { sendMail } = require('./adapters/nodemailer')

const sendEmails = async ({ file, additionalMessage }) => {
    let emails = ''
    let sentCount = 0
    let nonSentCount = 0
    let errors = ''
    try {
        const workbook = xlsx.readFile(file)
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const data = xlsx.utils.sheet_to_json(sheet, { range: 5, header: 1 }) 
        
    
        const headers = data[0]
        const totalesIndex = headers.indexOf("Total")
        
        if (totalesIndex === -1) {
          return {sentCount, emails, error: {number: 400, json: { error: 'No se encontró la columna "Total"'}}}
        }
        let headersHTML = getHtmlHeaders(totalesIndex, headers)
        
        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          const email =  row[0]
          if (!email || email === "X") {
            continue
          } else if (email === "END") {
            return sentEmailsReport({sentCount, emails, errors })
          }
          const totalDebt = Math.round(data[i][totalesIndex])
          const rows = getRowDetails({ data, totalesIndex, currentIndex: i })
          const detail = `${headersHTML}${rows}</table>`

          const sent = await sendMail({ email, additionalMessage, detail, file: file, totalDebt })
          if (sent){
            sentCount++
            emails += `${email},`
          } else {
            nonSentCount ++
            errors += `${email},`
          }
        }
        
        return sentEmailsReport({sentCount, emails, errors })
      } catch (error) {
        console.error(error)
        return {sentCount, emails, error: {number: 400, json: { message: `Error al enviar correos: ${error}`}}}
      } finally {
        // Eliminamos el archivo subido después de su uso
        fs.unlink(file, (err) => {
          if (err) {
            console.error('Error al eliminar el archivo:', err)
          }
        })
      }
}

module.exports = {
  sendEmails
}