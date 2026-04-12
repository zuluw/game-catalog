import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJHm84bcx5KRpK-rxtt5QkC_nGxyW8Wd4",
  authDomain: "gamecatalog-af0a5.firebaseapp.com",
  projectId: "gamecatalog-af0a5",
  storageBucket: "gamecatalog-af0a5.firebasestorage.app",
  messagingSenderId: "293641750549",
  appId: "1:293641750549:web:6f9393a035ca9ddd16661c",
  measurementId: "G-9T464H2YQH",
};

const app = initializeApp(firebaseConfig);
export const remoteDB = getFirestore(app);
export const auth = getAuth(app);

export const registerInCloud = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (e) {
    console.error("Firebase registration error: ", e.code);
    throw e;
  }
};

export const loginInCloud = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (e) {
    console.error("Firebase login error: ", e.code);
    throw e;
  }
};

export const updateNicknameInCloud = async (newNickname) => {
  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: newNickname });
      return auth.currentUser;
    } catch (e) {
      console.error("Firebase updateProfile error: ", e);
      throw e;
    }
  }
};

export const logoutFromCloud = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Firebase logout error: ", e);
  }
};

export const subscribeToGamesCloud = (callback) => {
  const q = query(collection(remoteDB, "games"));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const games = [];
      querySnapshot.forEach((doc) => {
        games.push({ id: doc.id, ...doc.data() });
      });
      console.log("Global real-time update received!");
      callback(games);
    },
    (error) => {
      console.error("Real-time subscription error: ", error);
    },
  );

  return unsubscribe;
};

export const saveGameToCloud = async (gameData) => {
  try {
    const docRef = await addDoc(collection(remoteDB, "games"), gameData);
    console.log("The game has been saved to the cloud with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Firebase save error: ", e);
    throw e;
  }
};

export const updateGameInCloud = async (idOrTitle, updatedData) => {
  try {
    if (idOrTitle && idOrTitle.length > 15) {
      const docRef = doc(remoteDB, "games", idOrTitle);
      await updateDoc(docRef, updatedData);
      console.log("Successfully updated in Firebase by ID");
      return;
    }

    const q = query(
      collection(remoteDB, "games"),
      where("title", "==", idOrTitle),
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(remoteDB, "games", querySnapshot.docs[0].id);
      await updateDoc(docRef, updatedData);
    } else {
      await saveGameToCloud(updatedData);
    }
  } catch (e) {
    console.error("Update error: ", e);
  }
};

export const deleteGameFromCloud = async (idOrTitle, userId) => {
  try {
    if (idOrTitle && idOrTitle.length > 15) {
      const docRef = doc(remoteDB, "games", idOrTitle);
      await deleteDoc(docRef);
      return;
    }

    const q = query(
      collection(remoteDB, "games"),
      where("title", "==", idOrTitle),
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(remoteDB, "games", querySnapshot.docs[0].id);
      await deleteDoc(docRef);
    }
  } catch (e) {
    console.error("Deletion error: ", e);
  }
};

export const getGamesFromCloud = async () => {
  try {
    const q = query(collection(remoteDB, "games"));
    const querySnapshot = await getDocs(q);
    const games = [];
    querySnapshot.forEach((doc) => {
      games.push({ id: doc.id, ...doc.data() });
    });
    return games;
  } catch (e) {
    console.error("Error loading all games from cloud: ", e);
    return [];
  }
};
