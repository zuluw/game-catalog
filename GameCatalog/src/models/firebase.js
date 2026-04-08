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
} from "firebase/firestore";

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
      where("owner_id", "==", updatedData.owner_id),
      where("title", "==", idOrTitle),
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(remoteDB, "games", querySnapshot.docs[0].id);
      await updateDoc(docRef, updatedData);
      console.log("Successfully updated in Firebase by title search.");
    } else {
      console.log("Record not found, creating a new one...");
      await saveGameToCloud(updatedData);
    }
  } catch (e) {
    console.error("Synchronization error (update) with Firebase: ", e);
  }
};

export const deleteGameFromCloud = async (idOrTitle, userId) => {
  try {
    if (idOrTitle && idOrTitle.length > 15) {
      const docRef = doc(remoteDB, "games", idOrTitle);
      await deleteDoc(docRef);
      console.log("The game has been removed from Firebase by ID.");
      return;
    }

    const q = query(
      collection(remoteDB, "games"),
      where("owner_id", "==", userId),
      where("title", "==", idOrTitle),
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(remoteDB, "games", querySnapshot.docs[0].id);
      await deleteDoc(docRef);
      console.log("Game removed from Firebase by title search.");
    }
  } catch (e) {
    console.error("Firebase deletion error: ", e);
  }
};

export const getGamesFromCloud = async (userId) => {
  try {
    const q = query(
      collection(remoteDB, "games"),
      where("owner_id", "==", userId),
    );
    const querySnapshot = await getDocs(q);
    const games = [];
    querySnapshot.forEach((doc) => {
      games.push({ id: doc.id, ...doc.data() });
    });
    return games;
  } catch (e) {
    console.error("Error loading from Firebase: ", e);
    return [];
  }
};
