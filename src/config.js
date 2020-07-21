// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    logging: true,
    
    stages: {
        dev: {
            endpoint: '012840307239'
        }
    },

    platform: {
        FacebookMessenger: {
            pageAccessToken: 'EAADZB3yd4rggBACvWBxQQCObPxIcscAbocXrFGu2GuHtsaNINmj6gAsl4uj1j5MDYUVfTJXboKE6yiefBXGT9X2TQUhylDZBZCSLKl4z5f2ccGraUfZCFcghttkCoFiAER8qIOZCCnGB8BKUTkNyfKcfV7asGRlZCLCnQ34cZAKq2fohAzrDkZC5',
            verifyToken: 'verifyToken1',
            locale: 'en-US'
        }
    },
 
    db: {
        //  FileDb: {
        //      pathToFile: '../db/db.json',
        //  },
         DynamoDb: {
            tableName: 'PlazaUserData',
        }
     },
 };
 