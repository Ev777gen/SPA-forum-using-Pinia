import { createStore } from 'vuex';
import { findItemById } from '@/helpers';
import { db } from "@/main.js";
import { collection,doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, writeBatch, serverTimestamp, increment, onSnapshot } from "firebase/firestore";
import auth from './modules/auth';
import chunk from 'lodash/chunk';

export default createStore({
  state: {
    categories: [],
    forums: [],
    threads: [],
    posts: [],
    users: [],
    unsubscribes: [],
    isLoaded: true,
  },
  getters: {
    user: (state) => {
      return (id) => {
        const user = findItemById(state.users, id);
        if (!user) return null;
        return {
          ...user,
          get posts () {
            return state.posts.filter(post => post.userId === user.id);
          },
          get postsCount () {
            return user.postsCount || 0;
          },
          get threads () {
            return state.threads.filter(post => post.userId === user.id);
          },
          get threadsCount () {
            return user.threadsStarted?.length || 0;
          }
        }
      }
    },
    thread: (state) => {
      return (id) => {
        const thread = findItemById(state.threads, id);
        if (!thread) return {};
        return {
          ...thread,
          get author () {
            return findItemById(state.users, thread.userId);
          },
          get repliesCount () {
            return thread.postIds.length - 1;
          },
          get contributorsCount () {
            if (!thread.contributorIds) return 0;
            return thread.contributorIds.length;
          }
        }
      }
    },
  },
  mutations: {
    setItem(state, { resource, item }) {
      pushItemToStore(state[resource], item);
    },
    // Мутации для дублирования перекрестных связей между 
    // документами в БД Firestore сюда, в store
    appendPostToThread: makeAppendChildToParentMutation({child: 'postIds', parent: 'threads'}),
    appendContributorToThread: makeAppendChildToParentMutation({child: 'contributorIds', parent: 'threads'}),
    appendThreadToForum: makeAppendChildToParentMutation({child: 'threadIds', parent: 'forums'}),
    appendThreadToUser: makeAppendChildToParentMutation({child: 'threadsStarted', parent: 'users'}),
    // Мутации для работы с обновлением в реальном времени из БД
    appendUnsubscribe (state, { unsubscribe }) {
      state.unsubscribes.push(unsubscribe);
    },
    clearAllUnsubscribes (state) {
      state.unsubscribes = [];
    },
    setIsLoadedStatus(state, status) {
      state.isLoaded = status;
    },
    clearThreadsForPagination(state) {
      state.threads = [];
    }
  },
  actions: {
    //------------------------------------------------------------
    // Чтение из БД Cloud Firestore
    //------------------------------------------------------------
    // Создаем два универсальных метода для чтения из базы данных: 
    fetchItem({ state, commit }, { id, resource, handleUnsubscribe = null, once = false, callBack = null }) {
      return new Promise(resolve => {
        const docRef = doc(db, resource, id);
        const unsubscribe = onSnapshot(docRef, doc => {
          if (once) unsubscribe();
  
          if (doc.exists()) {
            const item = { ...doc.data(), id: doc.id };
            let previousItem = findItemById(state[resource], id);
            previousItem = previousItem ? { ...previousItem } : null;
            commit('setItem', { resource, item });
            if (typeof callBack === 'function') {
              const isLocal = doc.metadata.hasPendingWrites;
              callBack({ item: { ...item }, previousItem, isLocal });
            }
            resolve(item);
          } else {
            resolve(null);
          }
        })
        if (handleUnsubscribe) {
          handleUnsubscribe(unsubscribe);
        } else {
          commit('appendUnsubscribe', { unsubscribe });
        }
      })
    },
    fetchItems({ dispatch }, { ids, resource, callBack = null }) {
      ids = ids || [];
      return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource, callBack })));
    },
    async unsubscribeAllSnapshots ({ state, commit }) {
      state.unsubscribes.forEach(unsubscribe => unsubscribe());
      commit('clearAllUnsubscribes');
    },
    // Создаем на их основе методы чтения из базы данных
    // Для одного item
    fetchCategory({ dispatch }, {id}) {
      return dispatch('fetchItem', { resource: 'categories', id });
    },
    fetchForum({ dispatch }, {id}) {
      return dispatch('fetchItem', { resource: 'forums', id });
    },
    fetchThread({ dispatch }, {id}) {
      return dispatch('fetchItem', { resource: 'threads', id });
    },
    fetchPost({ dispatch }, {id}) {
      return dispatch('fetchItem', { resource: 'posts', id });
    },
    fetchUser({ dispatch }, {id}) {
      return dispatch('fetchItem', { resource: 'users', id });
    },
    // Для нескольких items
    async fetchAllCategories({ commit }) {
      let categories = [];
      const querySnapshot = await getDocs(collection(db, 'categories'));
      querySnapshot.forEach((doc) => {
        const item = { ...doc.data(), id: doc.id };
        categories.push(item);
        commit('setItem', { resource: 'categories', item });
      });
      return Promise.resolve(categories);
    },
    fetchForums({ dispatch }, {ids}) {
      return dispatch('fetchItems', { resource: 'forums', ids });
    },
    fetchThreads({ dispatch }, {ids}) {
      return dispatch('fetchItems', { resource: 'threads', ids });
    },
    fetchThreadsByPage: ({ dispatch, commit }, { ids = [], page, threadsPerPage = 10 }) => {
      if (ids.length === 0) return [];
      commit('clearThreadsForPagination');
      const chunks = chunk(ids, threadsPerPage);
      const limitedIds = chunks[page - 1];
      return dispatch('fetchThreads', { ids: limitedIds });
    },
    fetchPosts({ dispatch }, {ids}) {
      return dispatch('fetchItems', { resource: 'posts', ids });
    },
    fetchUsers({ dispatch }, {ids}) {
      return dispatch('fetchItems', { resource: 'users', ids });
    },
    
    //------------------------------------------------------------
    // Запись в БД Cloud Firestore
    //------------------------------------------------------------
    async createThread({ commit, state, dispatch, rootState }, { text, title, forumId }) {
      // Подготавливаем данные для отправки
      const userId = rootState.auth.authId;
      const publishedAt = serverTimestamp();
      const threadRef = doc(collection(db, 'threads'));
      const thread = { forumId, title, publishedAt, userId, id: threadRef.id };
      const userRef = doc(db, 'users', userId);
      const forumRef = doc(db, 'forums', forumId);
      const batch = writeBatch(db);
      // Добавляем thread в базу данных Cloud Firestore: 
      // - сам thread добавляем в коллекцию threads
      // - его id добавляем в соответствующий форум
      // - его id добавляем пользователю, который его создал
      batch.set(threadRef, thread);
      batch.update(userRef, {
        threadsStarted: arrayUnion(threadRef.id)
      });
      batch.update(forumRef, {
        threadIds: arrayUnion(threadRef.id)
      });
      await batch.commit();
      // Делаем то же самое в store, чтобы сразу отобразить на странице
      const newThread = await getDoc(threadRef);
      commit('setItem', { resource: 'threads', item: { ...newThread.data(), id: newThread.id } }, { root: true });
      commit('appendThreadToUser', { parentId: userId, childId: threadRef.id }, { root: true });
      commit('appendThreadToForum', { parentId: forumId, childId: threadRef.id }, { root: true });
      // Создаем первый пост в теме
      await dispatch('createPost', { text, threadId: threadRef.id, firstInThread: true }, { root: true });
      // Возвращаем новую thread
      return findItemById(state.threads, threadRef.id);
    },
    async updateThread({ commit, state }, { title, text, id }) {
      // Подготавливаем данные
      const thread = findItemById(state.threads, id);
      const post = findItemById(state.posts, thread.postIds[0]);
      let newThread = { ...thread, title };
      let newPost = { ...post, text };
      const threadRef = doc(db, 'threads', id);
      const postRef = doc(db, 'posts', post.id);
      const batch = writeBatch(db);
      // Изменяем thread в базе данных Cloud Firestore:
      batch.update(threadRef, newThread);
      batch.update(postRef, newPost);
      await batch.commit();
      // Делаем то же самое в store, чтобы сразу отобразить на странице
      newThread = await getDoc(threadRef);
      newPost = await getDoc(postRef);
      commit('setItem', { resource: 'threads', item: newThread }, { root: true });
      commit('setItem', { resource: 'posts', item: newPost }, { root: true });
      // Возвращаем обновленную thread
      return makeResourceFromDoc(newThread);
    },
    async createPost({ commit, rootState }, post) {
      // Подготавливаем данные
      post.userId = rootState.auth.authId;
      post.publishedAt = serverTimestamp();
      post.firstInThread = post.firstInThread || false;
      const batch = writeBatch(db);
      const postRef = doc(collection(db, 'posts'));
      const threadRef = doc(db, 'threads', post.threadId);
      const userRef = doc(db, 'users', rootState.auth.authId);
      // Добавляем пост в базу данных Cloud Firebase: 
      // - сам пост добавляем в коллекцию постов posts
      // - id поста добавляем в соответствующий thread
      // - id пользователя, написавшего пост, тоже добавлям в этот же thread
      batch.set(postRef, post);
      const threadUpdates = {
        postIds: arrayUnion(postRef.id)
      };
      if (!post.firstInThread) {
        threadUpdates.contributorIds = arrayUnion(rootState.auth.authId);
      }
      batch.update(threadRef, threadUpdates);
      batch.update(userRef, {
        postsCount: increment(1)
      });
      await batch.commit();
      // Делаем то же самое в store, чтобы сразу отобразить на странице
      const newPost = await getDoc(postRef);
      commit('setItem', { resource: 'posts', item: { ...newPost.data(), id: newPost.id } }, { root: true });
      commit('appendPostToThread', { childId: newPost.id, parentId: post.threadId }, { root: true });
      if (!post.firstInThread) {
        commit('appendContributorToThread', { childId: rootState.auth.authId, parentId: post.threadId }, { root: true });
      }
    },
    async updatePost({ commit, rootState }, { text, id }) {
      const post = {
        text,
        edited: {
          at: serverTimestamp(),
          by: rootState.auth.authId,
          moderated: false
        }
      };
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, post);
      const updatedPost = await getDoc(postRef);
      commit('setItem', { resource: 'posts', item: updatedPost }, { root: true });
    },
    async createUser({ commit }, { id, email, name, username }) {
      const registeredAt = serverTimestamp();
      const usernameLower = username.toLowerCase();
      email = email.toLowerCase();
      const user = {
        email,
        name,
        username,
        usernameLower,
        registeredAt
      };
      const userRef = doc(db, 'users', id);
      await setDoc(userRef, user);
      const newUser = await getDoc(userRef);
      commit('setItem', { resource: 'users', item: newUser });
      return makeResourceFromDoc(newUser);
    },
    async updateUser({ commit }, user) {
      const userUpdates = {
        avatar: user.avatar || null,
        username: user.username || null,
        name: user.name || null,
        bio: user.bio || null,
        website: user.website || null,
        email: user.email || null
      }
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, userUpdates);
      commit('setItem', { resource: 'users', item: user }, { root: true });
    },
      
    //------------------------------------------------------------
    // Другие методы
    //------------------------------------------------------------
    // Установка и сброс переменной для индикатора загрузки
    startLoadingIndicator({commit}) {
      commit('setIsLoadedStatus', false);
    },
    stopLoadingIndicator({commit}) {
      commit('setIsLoadedStatus', true);
    },
  },
  modules: {
    auth,
  }
});

// Вспомогательные функции
function makeAppendChildToParentMutation({child, parent}) {
  return (state, { childId, parentId }) => {
    const resource = state[parent].find(r => r.id === parentId);
    if (!resource) {
      console.warn(`Не удалось добавить ${child} ${childId} к ${parent} ${parentId} т.к. родитель не существует.`);
      return;
    }
    resource[child] = resource[child] || [];
    if (!resource[child].includes(childId)) { // Чтобы добавить пользователя в список только один раз
      resource[child].push(childId);
    }
  }
}
function pushItemToStore(resources, item) {
  const index = resources.findIndex(r => r.id === item.id);
  if (item.id && index !== -1) {
    resources[index] = item;
  } else {
    resources.push(item);
  }
}
function makeResourceFromDoc(doc) {
  if (typeof doc?.data !== 'function') return doc;
  return { ...doc.data(), id: doc.id };
}