/*
 * В этом файле написана программа, которая загружает содержимое файла data.json 
 * в базу данных firestore https://console.firebase.google.com/u/0/?pli=1 
 * В файле data.json есть массивы, а в базе данных должны быть объекты, где ключом является id. 
 * Поэтому здесь эти массивы заменяются на объекты с ключом id.
 * 
 * Надо установить вспомогательный модуль 'firestore-export-import', импорт которого делается в этом файле. 
 * Для этого в консоли пишем команду: 
 * $    npm i -D firestore-export-import
 * Далее в консоли firebase надо сгенерировать ключ. 
 * Для этого на боковой панели (слева) нажимаем на "шестеренку" и выбираем "Users and permissions". 
 * Там выбираем вкладку "Service accounts". 
 * Нажимаем на кнопку "Generate new private key" и в открывшемся окне – "Generate key". 
 * При этом загрузится JSON-файл. Переименовываем его в firebasePrivateKey.json и перемещаем в корень проекта
 * Внимание: надо добавить этот файл в .gitignore.
 * 
 * Теперь надо запустить вспомогательный файл firestoreImportData.js. Для этого в терминале вводим команду:
 * $    node ./firestoreImportData.js
*/

// Импорты
const { initializeFirebaseApp, restore } = require('firestore-export-import');
const firebasePrivateKey = require('./firebasePrivateKey.json');
const firebaseConfig = require('./firebaseConfig');
const fs = require('fs');
const tempFileName = `${__dirname}/data-temp.json`;

// Загрузка данных в Cloud Firestore
(async () => {
  const fileContents = fs.readFileSync(`${__dirname}/src/data.json`, 'utf8');
  const data = JSON.parse(fileContents);
  const transformed = transformDataForFirestore(data);
  fs.writeFileSync(tempFileName, JSON.stringify(transformed));
  await jsonToFirestore();
  fs.unlinkSync(tempFileName);
})();

// -------------------------------------
// Вспомогательные функции
// Формируем JSON для Firestore
async function jsonToFirestore () {
  try {
    console.log('Initialzing Firebase');
    await initializeFirebaseApp(firebasePrivateKey, firebaseConfig.databaseURL);
    console.log('Firebase Initialized');

    await restore(tempFileName);
    console.log('Upload Success');
  } catch (error) {
    console.log(error);
  }
}

// Сохраняем id, заданные нами в файле data.json,
// чтобы записать в базу даннные под этими ключами (нашими id)
function transformDataForFirestore (data) {
  const collections = data;
  delete collections.stats;
  const collectionsById = {};
  Object.keys(collections).forEach((collectionKey) => {
    collectionsById[collectionKey] = {};
    const collection = collections[collectionKey];
    collection.forEach((record) => {
      collectionsById[collectionKey][record.id] = record;
      delete collectionsById[collectionKey][record.id].id;
    })
  })
  return collectionsById;
}