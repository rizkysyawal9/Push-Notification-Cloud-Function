const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin')
admin.initializeApp()

exports.sendNotification = functions.firestore
  .document('messages/{groupId1}/{groupId2}/{message}')
  .onCreate((snap, context) => {
    console.log('----------------start function--------------------')

    const doc = snap.data()
    console.log(doc)

    const idFrom = doc.idFrom
    const idTo = doc.idTo
    const contentMessage = doc.content

    console.log('------ destructured data -----------')
    console.log(idFrom)
    console.log(idTo)
    console.log(contentMessage)
    console.log('------ end destructured data -----------')

    // Get push token user to (receive)
    admin
      .firestore()
      .collection('users')
      .doc(idTo)
      .get()
      .then(querySnapshot => {
        const userTo = querySnapshot.data()
        if(userTo.pushToken && userTo.isChattingWith.find(chat => chat.id === idFrom) !== undefined){
          admin
            .firestore()
            .collection('users')
            .doc(idFrom)
            .get()
            .then(querySnapshot2 => {
              const userFrom = querySnapshot2.data()
              const payload = {
                  notification: {
                    title: `You have a message from ${userFrom.name}`,
                    body: contentMessage,
                    sound: 'default'
                  }
              }
              admin
                .messaging()
                .sendToDevice(userTo.pushToken, payload)
                .then(response => {
                    console.log('Successfully sent message:', response)
                    console.log(response.results[0].error);
                })
                .catch(error => {
                    console.log('Error sending message:', error)
                })
            })
        }
        // ORIGINAL CODE 
        // querySnapshot.forEach(userTo => {
        //     if (userTo.data().pushToken && userTo.data().isChattingWith.find(chat => chat.id === idFrom) !== undefined) {
        //     // Get info user from (sent)
        //     admin
        //       .firestore()
        //       .collection('users')
        //       .where('uid', '==', idFrom)
        //       .get()
        //       .then(querySnapshot2 => {
        //         console.log('------------- query snapshot 2 ----------')
        //         console.log(querySnapshot2)
                
        //         querySnapshot2.forEach(userFrom => {
        //           console.log(`Found user from: ${userFrom.data().name}`)
        //           const payload = {
        //             notification: {
        //               title: `You have a message from "${userFrom.data().name}"`,
        //               body: contentMessage,
        //               sound: 'default'
        //               // badge: '1',
        //             }
        //           }
        //           console.log('-------------- the payload -----------')
        //           console.log(payload)
        //           // Let push to the target device
        //           console.log('---------- push notification for server ----------')
        //           console.log(userTo.data().pushToken)
        //           admin
        //             .messaging()
        //             .sendToDevice(userTo.data().pushToken, payload)
        //             .then(response => {
        //               console.log('Successfully sent message:', response)
        //               console.log(response.results[0].error);
        //             })
        //             .catch(error => {
        //               console.log('Error sending message:', error)
        //             })
        //         })
        //       }).catch(err=> {
        //         console.log('---------- ERROR LOG QUERYSNAPSHOT2 -------------')
        //         console.log(err)
        //       })
        //   } else {
        //     console.log('Can not find pushToken target user')
        //   }
        // })
      }).catch(err=> {
        console.log('-------------- ERROR LOG QUERYSNAPSHOT ----------------')
        console.log(err)
      })
      console.log('------------------end of function ------------------')
    return null
  })