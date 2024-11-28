const { sendEmails } = require('../services')
require('dotenv').config()
const Redis = require('ioredis')
const redisClient = new Redis(process.env.REDIS)
const fs = require('fs-extra')
const path = require('path')
const temp = require('temp')

temp.track()

const processQueue = async () => {
  while (true) {
    try {
      const job = await redisClient.lpop('emailQueue')
      if (job) {
        const { fileKey, fileName, additionalMessage } = JSON.parse(job)

        // Recuperar el archivo desde Redis
        const fileBuffer = await redisClient.getBuffer(fileKey)

        // Crear un archivo temporal
        const tempFilePath = temp.path({ suffix: path.extname(fileName) })

        // Guardar el archivo en el sistema de archivos
        await fs.writeFile(tempFilePath, fileBuffer)

        // Llamar a sendEmails con la ruta del archivo temporal
        await sendEmails({ file: tempFilePath, additionalMessage, fileName })

        // Eliminar el archivo temporal después de su uso
        await fs.unlink(tempFilePath)
      }
    } catch (error) {
      console.error('Error al procesar la cola:', error)
    }
  }
}

processQueue()