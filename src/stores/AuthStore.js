import { defineStore } from 'pinia';
import { auth, storage } from "@/main.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { useForumStore } from './ForumStore';

export const useAuthStore = defineStore('AuthStore', {
  state: () => {
    return {
      authId: null,
      authUserUnsubscribe: null,
      authObserverUnsubscribe: null
    }
  },
  getters: {
    authUser: (state) => {
      const forum = useForumStore();
      return forum.user(state.authId);
    }
  },
  actions: {
    async registerUserWithEmailAndPassword({ name, username, email, password }) {
      const { createUser } = useForumStore();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUser({ id: result.user.uid, name, username, email });                   // Здесь await лишний!
    },
    signInWithEmailAndPassword({ email, password }) {
      return signInWithEmailAndPassword(auth, email, password);
    },
    async signOut() {
      await auth.signOut();
      this.authId = null;
    },
    async fetchAuthUser() {
      const { fetchItem } = useForumStore();
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      await fetchItem({
          resource: 'users',
          id: userId,
          handleUnsubscribe: (unsubscribe) => {
            this.authUserUnsubscribe = unsubscribe;
          }
        });
      this.authId = userId;
    },
    initAuthentication() {
      if (this.authObserverUnsubscribe) this.authObserverUnsubscribe();
      return new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
          this.unsubscribeAuthUserSnapshot();
          if (user) {
            await this.fetchAuthUser();
            resolve(user);
          } else {
            resolve(null);
          }
        })
        this.authObserverUnsubscribe = unsubscribe;
      })
    },
    async uploadAvatar({ file, filename }) {
      if (!file) return null;
      const authId = this.authId;
      filename = filename || file.name;
      try {
        const storageRef = ref(
          storage,
          `uploads/${authId}/images/${Date.now()}-${filename}`
        )
        return uploadBytes(storageRef, file).then(() => {
          return getDownloadURL(storageRef);
        })
      } catch (error) {
        alert(error.message);
      }
    },
    // Методы для смены e-mail
    async updateEmail({ email }) {
      return updateEmail(auth.currentUser, email);
    },
    async updatePassword({ password }) {
      return updatePassword(auth.currentUser, password);
    },
    async reauthenticate({ email, password }) {
      try {
        const credential = EmailAuthProvider.credential(email, password);
        const user = auth.currentUser;
        await reauthenticateWithCredential(user, credential);
      } catch (error) {
        console.log({ error });
      }
    },
    // Отписываемся от слушателей
    async unsubscribeAuthUserSnapshot() {
      if (this.authUserUnsubscribe) {
        this.authUserUnsubscribe();
        this.authUserUnsubscribe = null;
      }
    }
  }
});
