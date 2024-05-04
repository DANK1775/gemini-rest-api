const { MongoClient } = require('mongodb');
require('dotenv').config()

async function openDB() {
  const uri = process.env.DBLINK;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Conexión establecida a la base de datos');
    return client; 
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

async function closeDB(client) {
  try {
    await client.close();
    console.log('Conexión cerrada correctamente');
  } catch (error) {
    console.error('Error al cerrar la conexión:', error);
    throw error;
  }
}

module.exports = { openDB, closeDB };
