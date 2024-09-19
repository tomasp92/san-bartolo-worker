function getMonthAndYear() {
  const date = new Date()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  return {
    month: month,
    year: year
  }
}
  
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]
  
function getMonthName(monthNumber) {
  return MONTH_NAMES[monthNumber - 1]
}

module.exports = {
  getMonthName,
  getMonthAndYear
}