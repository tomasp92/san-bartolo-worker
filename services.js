const xlsx = require('xlsx')
const { getHtmlHeaders, getRowDetails } = require('./utils/html_utils')
const { sendMail, sentEmailsReport } = require('./adapters/nodemailer')

const sendEmails = async ({ file, additionalMessage, fileName }) => {
  let emails = ''
  let sentCount = 0
  let nonSentCount = 0
  let errors = ''

  try {
    const workbook = xlsx.readFile(file)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet, { range: 5, header: 1 })

    const accountDataSheet = workbook.Sheets['Datos Cuenta']
    const accountData = accountDataSheet
      ? xlsx.utils.sheet_to_json(accountDataSheet, { range: 1, header: 0 })[0]
      : {}

    const headers = data[0]
    const totalesIndex = headers.indexOf('Total')

    if (totalesIndex === -1) {
      return { sentCount, emails, error: { number: 400, json: { error: 'No se encontro la columna "Total"' } } }
    }

    const headersHTML = getHtmlHeaders(totalesIndex, headers)

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      const email = row[0]

      if (!email || email === 'X') {
        continue
      }

      if (email === 'END') {
        return sentEmailsReport({ sentCount, emails, errors, nonSentCount })
      }

      const totalDebt = Math.round(data[i][totalesIndex])
      const rows = getRowDetails({ data, totalesIndex, currentIndex: i })
      const detail = `${headersHTML}${rows}</table>`

      const sent = await sendMail({
        email,
        additionalMessage,
        detail,
        file,
        totalDebt,
        fileName,
        accountData
      })

      if (sent) {
        sentCount++
        emails += `${email},`
      } else {
        nonSentCount++
        errors += `${email},`
      }
    }

    return sentEmailsReport({ sentCount, emails, errors, nonSentCount })
  } catch (error) {
    console.error(error)
    return { sentCount, emails, error: { number: 400, json: { message: `Error al enviar correos: ${error}` } } }
  }
}

module.exports = {
  sendEmails
}
