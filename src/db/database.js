import SQLite from 'react-native-sqlite-storage';
import firestore from '@react-native-firebase/firestore';

const db = SQLite.openDatabase(
  {
    name: 'UserDatabase.db',
    location: 'default',
  },
  () => { },
  error => {
    console.log('Error opening database:', error);
  }
);

export const createTable = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Users (ID INTEGER PRIMARY KEY AUTOINCREMENT, Email TEXT UNIQUE, Contact TEXT, uid TEXT, Name TEXT, SignupDate TEXT);',
        [],
        () => {
          resolve();
        },
        error => {
          reject(new Error('Error creating table: ' + error.message));
        }
      );
    });
  });
};

export const insertUser = async (email, contact, uid, successCallback, errorCallback) => {
  const signupDate = new Date().toISOString(); // Capture current date as signup date
  try {
    await db.transaction(async (tx) => {
      // Check for existing user
      await tx.executeSql(
        'SELECT 1 FROM Users WHERE Email = ?;',
        [email],
        async (tx, results) => {
          if (results.rows.length === 0) {
            // No existing user, proceed with insertion
            await tx.executeSql(
              'INSERT INTO Users (Email, Contact, uid, SignupDate) VALUES (?, ?, ?, ?);',
              [email, contact, uid, signupDate],
              () => {
                console.log('User inserted successfully!');
                successCallback();
              },
              (error) => {
                // Handle insertion error
                const errorMessage = `Error inserting user: ${error.message}`;
                console.log(errorMessage);
                errorCallback(new Error(errorMessage));
              }
            );
          } else {
            // Existing user found, handle error
            const errorMessage = 'User with this email already exists.';
            console.log(errorMessage);
            errorCallback(new Error(errorMessage));
          }
        },
        (error) => {
          // Handle error checking for existing user
          const errorMessage = `Error checking for existing user: ${error.message}`;
          console.log(errorMessage);
          errorCallback(new Error(errorMessage));
        }
      );
    });
  } catch (error) {
    console.log('Unexpected error:', error);
    errorCallback(new Error('An unexpected error occurred'));
  }
};


export const insertMultiUsers = async (users, successCallback, errorCallback) => {
  for (const user of users) {
    const { email, contact, uid } = user; // Destructure user object

    try {
      await insertUser(email, contact, uid, successCallback, errorCallback);
    } catch (error) {
      errorCallback(new Error('Error inserting user: ' + error.message));
      break; // Stop iterating after encountering an error
    }
  }

  // Only call successCallback if all insertions are successful (optional)
  successCallback('All users inserted successfully');
};


export const getUsersMonthlySignupCounts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM Users;', [], (tx, results) => {
        const rows = results.rows;
        let signupData = {};
        for (let i = 0; i < rows.length; i++) {
          const user = rows.item(i);
          const signupDate = new Date(user.SignupDate);
          const month = signupDate.getMonth(); // Get month (0-11)

          if (!signupData[month]) {
            signupData[month] = 0;
          }
          signupData[month]++;
        }

        // Convert object to array for easier charting
        const sortedSignupData = Object.keys(signupData).sort().map(month => ({
          month: parseInt(month) + 1, // Adjust month index (0-based to 1-based)
          count: signupData[month]
        }));

        resolve(sortedSignupData);
      }, (error) => {
        reject(new Error('Error fetching users: ' + error.message));
      });
    });
  });
};

export const getUsers = callback => {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM Users;', [], (tx, results) => {
      const rows = results.rows;
      let users = [];
      for (let i = 0; i < rows.length; i++) {
        users.push(rows.item(i));
      }
      callback(users);
    });
  });
};

export const updateUserContact = (email, newContact, onSuccess, onError) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Users SET Contact = ? WHERE Email = ?',
      [newContact, email],
      (tx, results) => {
        if (results.rowsAffected > 0) {
          onSuccess();
        } else {
          onError(new Error('Update failed'));
        }
      },
      error => {
        onError(new Error('Error updating contact: ' + error.message));
      }
    );
  });
};

export const fetchData = (collectionName) => {
  return new Promise((resolve, reject) => {
    try {
      var fetchedUsers = [];
      const unsubscribe = firestore() // Get a reference to Firestore
        .collection('users') // Specify the "users" collection
        .onSnapshot((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const { uid, name, email, contact } = doc.data(); // Extract user data
            fetchedUsers.push({ uid, name, email, contact }); // Add user data with ID
          });
          resolve(fetchedUsers); // Resolve the Promise with fetched users
        });
    } catch (error) {
      reject(error); // Reject the Promise on error
    }
  });
};

export const updateUserInSql = async (userId, name, contact) => {
  try {
    await db.transaction(async tx => {
      await tx.executeSql(
        `UPDATE users SET name = ?, contact = ? WHERE uid = ?`,
        [name, contact, userId]
      );
    });
  } catch (error) {
    console.log('Error updating user:', error);
    throw error; // Re-throw the error for handling in handleSubmit
  }
};