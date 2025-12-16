const nodemailer = require('nodemailer')
require('dotenv').config()

const { getMonthName, getMonthAndYear } = require('../utils/date_utils')
const {  getAccountDetails } = require('../utils/html_utils')

const gmail_user = process.env.GMAIL_USER

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmail_user,
    pass: process.env.GMAIL_PASS 
  }
})

const {month, year} = getMonthAndYear()
const monthName = getMonthName(month)

const transporterSendMail = ({ email, subject, html, attachments }) => {
  return transporter.sendMail({
    from: gmail_user,
    to: email,
    subject: subject,
    html: html,
    attachments: attachments
  })
  .then(() => {
    return 1
  })
  .catch(error => {
    console.error(`Error sending email to ${email}:`, error);
    return 0;
  })
}

const sendMail = ({ email, additionalMessage, detail, file, totalDebt, fileName, accountData }) => {
  const debtTitle = totalDebt > 0 ? `Debes $${totalDebt}` : `Tenés a favor $${totalDebt*-1}`
  return transporterSendMail({
    email,
    subject: `${debtTitle}. ${fileName.replace('.xlsx', '')}`,
    html: `<p>${additionalMessage}</p>
           <p>A continuación se detalla la deuda:</p>
           ${detail}<br>${getAccountDetails(accountData)}`,
    attachments: [
      {
        filename: fileName,
        path: file
      }
    ]
  })
}

const sentEmailsReport = async ({ sentCount, emails, errors, nonSentCount }) => {
  await transporterSendMail({
    email: gmail_user,
    subject: `La rendición de san bartolo fue envíada a ${sentCount} emails`,
    html: `<h1 style="color:#4CAF50;">La rendición de San Bartolo fue enviada, se enviaron ${sentCount} emails</h1>
<p>Fue recibida por los siguientes emails: <span style="color:#007BFF;">${emails}</span></p>
<br><br><br><br><br><br><br>
<p style="color:#F44336;">Hubieron : ${nonSentCount} errores en el envío</p>
<p>Errores al enviar para los siguientes emails: <span style="color:#007BFF;">${errors}</span></p>`,
  })
  return {sentCount, emails, error: false }
}

module.exports = {
  sendMail,
  sentEmailsReport
}