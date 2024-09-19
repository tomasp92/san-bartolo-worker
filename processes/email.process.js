const { sendEmails } = require('../services')
require('dotenv').config()
const Redis = require('ioredis');
const redisClient = new Redis(process.env.REDIS_URL);

const processQueue = async () => {
  while (true) {
    try {
      const job = await redisClient.lpop('emailQueue');
      if (job) {
        const { file, additionalMessage } = JSON.parse(job);
        await sendEmails({ file, additionalMessage });
      }
    } catch (error) {
      console.error('Error al procesar la cola:', error);
    }
  }
};

processQueue()