import { auth, storage } from "@/main.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  state: {
    authId: null,
    authUserUnsubscribe: null,
    authObserverUnsubscribe: null
  },
  getters: {
    authUser: (state, getters) => {
      return getters.user(state.authId);
    }
  },
  actions: {
    async registerUserWithEmailAndPassword({ dispatch }, { name, username, email, password }) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await dispatch('createUser', { id: result.user.uid, name, username, email }, { root: true });
    },
    signInWithEmailAndPassword(context, { email, password }) {
      return signInWithEmailAndPassword(auth, email, password);
    },
    async signOut({ commit }) {
      await auth.signOut();
      commit('setAuthId', null);
    },
    async fetchAuthUser({ dispatch, commit }) {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      await dispatch(
        'fetchItem',
        {
          resource: 'users',
          id: userId,
          handleUnsubscribe: (unsubscribe) => {
            commit('setAuthUserUnsubscribe', unsubscribe);
          }
        },
        { root: true }
      )
      commit('setAuthId', userId)
    },
    initAuthentication({ dispatch, commit, state }) {
      if (state.authObserverUnsubscribe) state.authObserverUnsubscribe();
      return new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
          dispatch('unsubscribeAuthUserSnapshot');
          if (user) {
            await dispatch('fetchAuthUser');
            resolve(user);
          } else {
            resolve(null);
          }
        })
        commit('setAuthObserverUnsubscribe', unsubscribe);
      })
    },
    async uploadAvatar({ state }, { file, filename }) {
      if (!file) return null;
      const authId = state.authId;
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
    async updateEmail(context, { email }) {
      return updateEmail(auth.currentUser, email);
    },
    async updatePassword(context, { password }) {
      return updatePassword(auth.currentUser, password);
    },
    async reauthenticate(context, { email, password }) {
      try {
        const credential = EmailAuthProvider.credential(email, password);
        const user = auth.currentUser;
        await reauthenticateWithCredential(user, credential);
      } catch (error) {
        console.log({ error });
      }
    },
    // Отписываемся от слушателей
    async unsubscribeAuthUserSnapshot({ state, commit }) {
      if (state.authUserUnsubscribe) {
        state.authUserUnsubscribe();
        commit('setAuthUserUnsubscribe', null);
      }
    }
  },
  mutations: {
    setAuthId(state, id) {
      state.authId = id;
    },
    setAuthUserUnsubscribe(state, unsubscribe) {
      state.authUserUnsubscribe = unsubscribe;
    },
    setAuthObserverUnsubscribe(state, unsubscribe) {
      state.authObserverUnsubscribe = unsubscribe;
    }
  }
}