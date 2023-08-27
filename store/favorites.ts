import { ref } from "vue";
import { defineStore } from "pinia";
import { Auth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Favorites } from "@/types/types";

export const useFavoritesStore = defineStore("favorites", () => {
  const favorites = ref<Favorites[]>([]);

  async function getFavorites() {
    const nuxtApp = useNuxtApp();
    const auth = nuxtApp.$auth as Auth;
    const firestore = nuxtApp.$firestore as Firestore;

    try {
      if (auth.currentUser) {
        const colRef = collection(
          firestore,
          "users",
          auth.currentUser.uid,
          "favorites"
        );

        const snapshot = await getDocs(colRef);

        const docs: Favorites[] = Array.from(snapshot.docs).map((doc) => {
          return {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            tags: doc.data().tags,
            photo: doc.data().photo,
            location: doc.data().location,
            timestamp: doc.data().timestamp,
          };
        });

        favorites.value = docs;
      }
    } catch (e) {
      console.error("Error retrieving document: ", e);
    }
  }

  async function addFavorite(newFavorite: Favorites) {
    const nuxtApp = useNuxtApp();
    const auth = nuxtApp.$auth as Auth;
    const firestore = nuxtApp.$firestore as Firestore;

    try {
      if (auth.currentUser) {
        const colRef = collection(
          firestore,
          "users",
          auth.currentUser.uid,
          "favorites"
        );

        const newFavoriteWithTimestamp = {
          ...newFavorite,
          timestamp: serverTimestamp(),
        };

        const docRef = await addDoc(colRef, newFavoriteWithTimestamp);
        getFavorites();

        return docRef;
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async function editFavorite(docId: string, updatedFavorite: Favorites) {
    const nuxtApp = useNuxtApp();
    const auth = nuxtApp.$auth as Auth;
    const firestore = nuxtApp.$firestore as Firestore;

    try {
      if (auth.currentUser) {
        const favoriteRef = doc(
          firestore,
          "users",
          auth.currentUser.uid,
          "favorites",
          docId
        );

        const updatedFavoriteWithTimestamp = {
          ...updatedFavorite,
          timestamp: serverTimestamp(),
        };

        const docRef = await updateDoc(
          favoriteRef,
          updatedFavoriteWithTimestamp
        );
        getFavorites();

        return docRef;
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // function editFavorite(id: number, newFavorite: Favorites) {
  //   const index = favorites.value.findIndex((fav) => fav.id === id);
  //   if (index !== -1) {
  //     favorites.value[index] = newFavorite;
  //   }
  // }

  // function deleteFavorite(id: number) {
  //   const index = favorites.value.findIndex((fav) => fav.id === id);
  //   if (index !== -1) {
  //     favorites.value.splice(index, 1);
  //   }
  // }

  // return { favorites, addFavorite, editFavorite, deleteFavorite };
  return { favorites, getFavorites, addFavorite, editFavorite };
});
