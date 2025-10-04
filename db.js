// IndexedDB数据库管理模块
class StudyDB {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('StudyDB', 3); // 更新版本号

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建或更新学习时间存储
                if (!db.objectStoreNames.contains('studyTime')) {
                    const studyTimeStore = db.createObjectStore('studyTime', { keyPath: 'id' });
                    studyTimeStore.createIndex('date', 'date', { unique: false });
                    studyTimeStore.createIndex('subject', 'subject', { unique: false });
                } else if (event.oldVersion < 3) {
                    // 更新现有的对象存储以支持时段信息
                    try {
                        const studyTimeStore = event.currentTarget.transaction.objectStore('studyTime');
                        if (!studyTimeStore.indexNames.contains('date')) {
                            studyTimeStore.createIndex('date', 'date', { unique: false });
                        }
                        if (!studyTimeStore.indexNames.contains('subject')) {
                            studyTimeStore.createIndex('subject', 'subject', { unique: false });
                        }
                    } catch (e) {
                        console.log('升级studyTime存储时出错:', e);
                    }
                }

                // 创建学习时段存储
                if (!db.objectStoreNames.contains('studySessions')) {
                    const sessionStore = db.createObjectStore('studySessions', { keyPath: 'id' });
                    sessionStore.createIndex('date', 'date', { unique: false });
                    sessionStore.createIndex('subject', 'subject', { unique: false });
                    sessionStore.createIndex('startTime', 'startTime', { unique: false });
                }

                // 创建待办事项存储
                if (!db.objectStoreNames.contains('todos')) {
                    const todoStore = db.createObjectStore('todos', { keyPath: 'id' });
                    todoStore.createIndex('completed', 'completed', { unique: false });
                    todoStore.createIndex('subject', 'subject', { unique: false });
                }

                // 创建提醒存储
                if (!db.objectStoreNames.contains('reminders')) {
                    const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
                }

                // 创建复盘记录存储
                if (!db.objectStoreNames.contains('reviews')) {
                    const reviewStore = db.createObjectStore('reviews', { keyPath: 'id' });
                    reviewStore.createIndex('date', 'date', { unique: false });
                    reviewStore.createIndex('type', 'type', { unique: false });
                }

                // 创建科目进度存储
                if (!db.objectStoreNames.contains('subjectProgress')) {
                    const progressStore = db.createObjectStore('subjectProgress', { keyPath: 'subject' });
                }

                // 创建知识点存储
                if (!db.objectStoreNames.contains('knowledgePoints')) {
                    const knowledgeStore = db.createObjectStore('knowledgePoints', { keyPath: 'id' });
                    knowledgeStore.createIndex('subject', 'subject', { unique: false });
                    knowledgeStore.createIndex('status', 'status', { unique: false });
                }

                // 创建错题存储
                if (!db.objectStoreNames.contains('mistakes')) {
                    const mistakesStore = db.createObjectStore('mistakes', { keyPath: 'id' });
                    mistakesStore.createIndex('subject', 'subject', { unique: false });
                }

                // 创建学习计划存储
                if (!db.objectStoreNames.contains('planTasks')) {
                    const planStore = db.createObjectStore('planTasks', { keyPath: 'id' });
                    planStore.createIndex('stage', 'stage', { unique: false });
                    planStore.createIndex('subject', 'subject', { unique: false });
                    planStore.createIndex('completed', 'completed', { unique: false });
                }
            };
        });
    }
    
    // 添加数据
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // 获取所有数据
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // 根据索引获取数据
    async getByIndex(storeName, indexName, indexValue) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(indexValue);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // 更新数据
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // 删除数据
    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // 清空存储
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // 获取数据数量
    async count(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
}

// 创建数据库实例
const studyDB = new StudyDB();