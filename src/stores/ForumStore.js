import { defineStore } from 'pinia';
import { findItemById } from '@/helpers';
import { db } from "@/main.js";
import { collection,doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, writeBatch, serverTimestamp, increment, onSnapshot } from "firebase/firestore";
//import auth from './modules/auth'; // ??? Заменяем на:
import { useAuthStore } from './AuthStore';
import chunk from 'lodash/chunk';


export const useForumStore = defineStore('ForumStore', {
  state: () => {
    return {
      categories: [],
      forums: [],
      threads: [],
      posts: [],
      users: [],
      unsubscribes: [],
      isAsyncDataLoaded: true,
    }
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
  /*mutations: {
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
  },*/
  actions: {
    //------------------------------------------------------------
    // Чтение из БД Cloud Firestore
    //------------------------------------------------------------
    // Создаем два универсальных метода для чтения из базы данных: 
    fetchItem({ id, resource, handleUnsubscribe = null, once = false, callBack = null }) {
      return new Promise(resolve => {
        const docRef = doc(db, resource, id);
        const unsubscribe = onSnapshot(docRef, doc => {
          if (once) unsubscribe();
  
          if (doc.exists()) {
            const item = { ...doc.data(), id: doc.id };
            let previousItem = findItemById(this[resource], id);
            previousItem = previousItem ? { ...previousItem } : null;
            pushItemToStore(this[resource], item);
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
          this.unsubscribes.push(unsubscribe);
        }
      })
    },
    fetchItems({ ids, resource, callBack = null }) {
      ids = ids || [];
      return Promise.all(ids.map(id => this.fetchItem({ id, resource, callBack })));
    },
    async unsubscribeAllSnapshots () {
      this.unsubscribes.forEach(unsubscribe => unsubscribe());
      this.unsubscribes = [];
    },
    // Создаем на их основе методы чтения из базы данных
    // Для одного item
    fetchCategory({id}) {
      return this.fetchItem({ resource: 'categories', id });
    },
    fetchForum({id}) {
      return this.fetchItem({ resource: 'forums', id });
    },
    fetchThread({id}) {
      return this.fetchItem({ resource: 'threads', id });
    },
    fetchPost({id}) {
      return this.fetchItem({ resource: 'posts', id });
    },
    fetchUser({id}) {
      return this.fetchItem({ resource: 'users', id });
    },
    // Для нескольких items
    async fetchAllCategories() {
      let categories = [];
      const querySnapshot = await getDocs(collection(db, 'categories'));
      querySnapshot.forEach((doc) => {
        const item = { ...doc.data(), id: doc.id };
        categories.push(item);
        pushItemToStore(this.categories, item);
      });
      return Promise.resolve(categories);
    },
    fetchForums({ids}) {
      return this.fetchItems({ resource: 'forums', ids });
    },
    fetchThreads({ids}) {
      return this.fetchItems({ resource: 'threads', ids });
    },
    fetchThreadsByPage ({ ids = [], page, threadsPerPage = 10 }) {
      if (ids.length === 0) return [];
      this.threads = [];
      const chunks = chunk(ids, threadsPerPage);
      const limitedIds = chunks[page - 1];
      return this.fetchThreads({ ids: limitedIds });
    },
    // Изначальный вариант:
    /*fetchThreadsByPage: ({ ids = [], page, threadsPerPage = 10 }) => {
      //console.log('fetchThreadsByPage')
      if (ids.length === 0) return [];
      //console.log('fetchThreadsByPage -> this.threads', this.threads)
      this.threads = [];
      const chunks = chunk(ids, threadsPerPage);
      const limitedIds = chunks[page - 1];
      return this.fetchThreads({ ids: limitedIds });
    },*/
    fetchPosts({ids}) {
      return this.fetchItems({ resource: 'posts', ids });
    },
    fetchUsers({ids}) {
      return this.fetchItems({ resource: 'users', ids });
    },
    
    //------------------------------------------------------------
    // Запись в БД Cloud Firestore
    //------------------------------------------------------------
    async createThread({ text, title, forumId }) {
      // Подготавливаем данные для отправки
      const auth = useAuthStore();
      const userId = auth.authId;
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
      pushItemToStore(this.threads, { ...newThread.data(), id: newThread.id });
      
      //commit('appendThreadToUser', { parentId: userId, childId: threadRef.id });
      appendChildToParent({child: 'threadsStarted', parent: 'users'})(this.users, { parentId: userId, childId: threadRef.id });  // !!!!!!!!!!!!!!!!
      //commit('appendThreadToForum', { parentId: forumId, childId: threadRef.id });
      appendChildToParent({child: 'threadIds', parent: 'forums'})(this.forums, { parentId: forumId, childId: threadRef.id }); // !!!!!!!!!!!!!!!!!!!!
      
      // Создаем первый пост в теме
      await this.createPost({ text, threadId: threadRef.id, firstInThread: true });
      // Возвращаем новую thread
      return findItemById(this.threads, threadRef.id);
    },
    async updateThread({ title, text, id }) {
      // Подготавливаем данные
      const thread = findItemById(this.threads, id);
      const post = findItemById(this.posts, thread.postIds[0]);
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
      pushItemToStore(this.threads, newThread);
      pushItemToStore(this.posts, newPost);
      // Возвращаем обновленную thread
      return makeResourceFromDoc(newThread);
    },
    async createPost(post) {
      // Подготавливаем данные
      const auth = useAuthStore();
      post.userId = auth.authId;
      post.publishedAt = serverTimestamp();
      post.firstInThread = post.firstInThread || false;
      const batch = writeBatch(db);
      const postRef = doc(collection(db, 'posts'));
      const threadRef = doc(db, 'threads', post.threadId);
      const userRef = doc(db, 'users', auth.authId);
      // Добавляем пост в базу данных Cloud Firebase: 
      // - сам пост добавляем в коллекцию постов posts
      // - id поста добавляем в соответствующий thread
      // - id пользователя, написавшего пост, тоже добавлям в этот же thread
      batch.set(postRef, post);
      const threadUpdates = {
        postIds: arrayUnion(postRef.id)
      };
      if (!post.firstInThread) {
        threadUpdates.contributorIds = arrayUnion(auth.authId);
      }
      batch.update(threadRef, threadUpdates);
      batch.update(userRef, {
        postsCount: increment(1)
      });
      await batch.commit();
      // Делаем то же самое в store, чтобы сразу отобразить на странице
      const newPost = await getDoc(postRef);
      pushItemToStore(this.posts, { ...newPost.data(), id: newPost.id });
      appendChildToParent({child: 'postIds', parent: 'threads'})(this.threads, { childId: newPost.id, parentId: post.threadId });
      if (!post.firstInThread) {
        appendChildToParent({child: 'contributorIds', parent: 'threads'})(this.threads, { childId: auth.authId, parentId: post.threadId });
      }
    },
    async updatePost({ text, id }) {
      const auth = useAuthStore();
      const post = {
        text,
        edited: {
          at: serverTimestamp(),
          by: auth.authId,
          moderated: false
        }
      };
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, post);
      const updatedPost = await getDoc(postRef);
      pushItemToStore(this.posts, updatedPost);
    },
    async createUser({ id, email, name, username }) {
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
      pushItemToStore(this.users, newUser);
      return makeResourceFromDoc(newUser);
    },
    async updateUser(user) {
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
      pushItemToStore(this.users, user);
    },
      
    //------------------------------------------------------------
    // Другие методы
    //------------------------------------------------------------
    // Установка и сброс переменной для индикатора загрузки
    startLoadingIndicator() {
      this.isAsyncDataLoaded = false;
    },
    stopLoadingIndicator() {
      this.isAsyncDataLoaded = true;
    },
  },
});

// Вспомогательные функции
function appendChildToParent({child, parent}) {
  return (parentResource, { childId, parentId }) => {
    const resource = parentResource.find(r => r.id === parentId);
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
