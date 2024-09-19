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

const sendMail = ({ email, additionalMessage, detail, file, totalDebt }) => {
  const debtTitle = totalDebt > 0 ? `Debes $${totalDebt}` : `Tenés a favor $${totalDebt*-1}`
  return transporterSendMail({
    email,
    subject: `${debtTitle}. Rendición San Bartolo ${monthName} ${year}`,
    html: `<p>${additionalMessage}</p>
           <p>A continuación se detalla la deuda:</p>
           ${detail}<br>${getAccountDetails()}`,
    attachments: [
      {
        filename: `Rendición San Bartolo ${monthName} ${year}.xlsx`,
        path: file
      }
    ]
  })
}

const sentEmailsReport = async ({ sentCount, emails, errors }) => {
  await transporterSendMail({
    email: 'tomaspalau35@hotmail.com', //sanbartolo.pagos@gmail.com
    subject: `La rendición de san bartolo fue envíada a  ${sentCount} emails`,
    html: `<h1>La rendición de san bartolo fue envíada</h1>
           <p>Fue recibida por los siguientes emails: ${emails}</p>
           <br><br><br><br><br><br><br>
           <p>Errores al enviar para los siguientes emails: ${errors}</p>`,
  })
  return {sentCount, emails, error: false }
}

module.exports = {
  sendMail,
  sentEmailsReport
}