const { sendEmails } = require('../services')
require('dotenv').config()
const Redis = require('ioredis')
const redisClient = new Redis(process.env.REDIS)
const fs = require('fs')

const processQueue = async () => {
  while (true) {
    try {
      const job = await redisClient.lpop('emailQueue');
      if (job) {
        const { file, fileName, additionalMessage } = JSON.parse(job);

        // Convertir el string base64 a un archivo temporal
        const tempFilePath = `/tmp/${fileName}`;
        fs.writeFileSync(tempFilePath, Buffer.from(file, 'base64'));

        console.log('🚀 ~ file:', tempFilePath);
        
        // Llamar a sendEmails con la ruta del archivo temporal
        await sendEmails({ file: tempFilePath, additionalMessage });

        // Eliminar el archivo temporal después de su uso
        fs.unlinkSync(tempFilePath);
      }
    } catch (error) {
      console.error('Error al procesar la cola:', error);
    }
  }
};

processQueue();