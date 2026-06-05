import { supabase } from './supabase';

// Helper to generate a random UUID-like string if id is not provided
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper to wrap ISO date strings with a Firestore-like Timestamp object containing .toDate()
function wrapDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => wrapDates(item));
  }
  const wrapped = { ...obj };
  for (const key of Object.keys(wrapped)) {
    const val = wrapped[key];
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/.test(val)) {
      const date = new Date(val);
      wrapped[key] = {
        toDate: () => date,
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
        toString: () => val,
        // Also keep the original string value if they access it directly
        valueOf: () => val
      };
    } else if (typeof val === 'object') {
      wrapped[key] = wrapDates(val);
    }
  }
  return wrapped;
}

// Convert Firestore fields to database updates
function prepareDataForSave(data: any) {
  if (!data || typeof data !== 'object') return data;
  const prepared = { ...data };
  for (const key of Object.keys(prepared)) {
    const val = prepared[key];
    // If it's a serverTimestamp placeholder
    if (val && typeof val === 'object' && val._methodName === 'serverTimestamp') {
      prepared[key] = new Date().toISOString();
    } else if (val && typeof val === 'object' && typeof val.toDate === 'function') {
      prepared[key] = val.toDate().toISOString();
    } else if (val && typeof val === 'object') {
      prepared[key] = prepareDataForSave(val);
    }
  }
  return prepared;
}

export interface DocumentReference {
  type: 'document';
  id: string;
  collection: string;
}

export interface CollectionReference {
  type: 'collection';
  id: string;
}

export interface Query {
  type: 'query';
  ref: any;
  constraints: any[];
}

// References
export function getFirestore(app?: any) {
  return { type: 'firestore' };
}

export function collection(db: any, name: string): CollectionReference {
  return { id: name, type: 'collection' };
}

export function doc(parentRefOrDb: any, pathOrCollection?: string, docId?: string): DocumentReference {
  if (docId) {
    return { id: docId, collection: pathOrCollection!, type: 'document' };
  }
  if (pathOrCollection) {
    // doc(db, collectionName, docId)
    if (parentRefOrDb && parentRefOrDb.type === 'collection') {
      return { id: pathOrCollection, collection: parentRefOrDb.id, type: 'document' };
    }
    return { id: pathOrCollection, collection: parentRefOrDb, type: 'document' };
  }
  // doc(collectionRef) - generate automatic ID
  const colId = parentRefOrDb.id || parentRefOrDb;
  return { id: generateId(), collection: colId, type: 'document' };
}

// Query constraints
export function where(field: string, op: string, value: any) {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function limit(value: number) {
  return { type: 'limit', value };
}

export function query(ref: any, ...constraints: any[]): Query {
  return {
    type: 'query',
    ref,
    constraints
  };
}

export interface DocumentData {
  [key: string]: any;
}

export interface QueryDocumentSnapshot<T = DocumentData> {
  id: string;
  ref: any;
  data(): T;
  get(field: string): any;
  exists(): boolean;
}

export interface QuerySnapshot<T = DocumentData> {
  docs: QueryDocumentSnapshot<T>[];
  empty: boolean;
  size: number;
  forEach(callback: (doc: QueryDocumentSnapshot<T>) => void): void;
}

// DB Operations
export async function getDocs(queryOrRef: any): Promise<QuerySnapshot> {
  const isQuery = queryOrRef.type === 'query';
  const collectionRef = isQuery ? queryOrRef.ref : queryOrRef;
  const tableName = collectionRef.id;

  let builder: any = supabase.from(tableName).select('*');

  if (isQuery && queryOrRef.constraints) {
    for (const constraint of queryOrRef.constraints) {
      if (constraint.type === 'where') {
        const { field, op, value } = constraint;
        if (op === '==') {
          builder = builder.eq(field, value);
        } else if (op === '!=') {
          builder = builder.neq(field, value);
        } else if (op === '>=') {
          builder = builder.gte(field, value);
        } else if (op === '<=') {
          builder = builder.lte(field, value);
        } else if (op === '>') {
          builder = builder.gt(field, value);
        } else if (op === '<') {
          builder = builder.lt(field, value);
        } else if (op === 'in') {
          builder = builder.in(field, value);
        } else if (op === 'array-contains') {
          builder = builder.contains(field, [value]);
        }
      } else if (constraint.type === 'orderBy') {
        builder = builder.order(constraint.field, { ascending: constraint.direction === 'asc' });
      } else if (constraint.type === 'limit') {
        builder = builder.limit(constraint.value);
      }
    }
  }

  const { data, error } = await builder;

  if (error) {
    console.error(`Error fetching docs from table: ${tableName}`, error);
    // Return empty results if table doesn't exist yet to prevent app crashing
    return {
      docs: [],
      empty: true,
      size: 0,
      forEach: (callback: any) => {}
    };
  }

  const docs: QueryDocumentSnapshot[] = (data || []).map((row: any) => {
    const wrappedRow = wrapDates(row);
    const docId = row.id || '';
    return {
      id: docId,
      ref: { id: docId, collection: tableName, type: 'document' },
      data: () => wrappedRow,
      get: (field: string) => wrappedRow[field],
      exists: () => true
    };
  });

  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback: any) => docs.forEach(callback)
  };
}

export async function getDoc(docRef: any): Promise<DocumentSnapshot> {
  const tableName = docRef.collection;
  const docId = docRef.id;

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', docId)
    .single();

  if (error || !data) {
    return {
      id: docId,
      exists: () => false,
      data: () => undefined,
      get: (field: string) => undefined
    };
  }

  const wrappedRow = wrapDates(data);
  return {
    id: docId,
    exists: () => true,
    data: () => wrappedRow,
    get: (field: string) => wrappedRow[field]
  };
}

export async function setDoc(docRef: any, data: any, options?: { merge?: boolean }) {
  const tableName = docRef.collection;
  const docId = docRef.id;
  const preparedData = prepareDataForSave(data);

  // Merge check: if merge is true, we should get existing first or do upsert
  const saveObj = { id: docId, ...preparedData };

  const { error } = await supabase
    .from(tableName)
    .upsert(saveObj, { onConflict: 'id' });

  if (error) {
    console.error(`Error setDoc on table ${tableName}:`, error);
    throw error;
  }
}

export async function addDoc(collectionRef: any, data: any) {
  const tableName = collectionRef.id;
  const docId = generateId();
  const preparedData = prepareDataForSave(data);

  const saveObj = { id: docId, ...preparedData };

  const { error } = await supabase
    .from(tableName)
    .insert([saveObj]);

  if (error) {
    console.error(`Error addDoc on table ${tableName}:`, error);
    throw error;
  }

  return { id: docId };
}

export async function updateDoc(docRef: any, data: any) {
  const tableName = docRef.collection;
  const docId = docRef.id;
  const preparedData = prepareDataForSave(data);

  const { error } = await supabase
    .from(tableName)
    .update(preparedData)
    .eq('id', docId);

  if (error) {
    console.error(`Error updateDoc on table ${tableName}:`, error);
    throw error;
  }
}

export async function deleteDoc(docRef: any) {
  const tableName = docRef.collection;
  const docId = docRef.id;

  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', docId);

  if (error) {
    console.error(`Error deleteDoc on table ${tableName}:`, error);
    throw error;
  }
}

export interface DocumentSnapshot<T = DocumentData> {
  id: string;
  ref?: any;
  exists(): boolean;
  data(): any;
  get(field: string): any;
}

export function onSnapshot(
  docRef: DocumentReference,
  callback: (snapshot: DocumentSnapshot<any>) => void,
  errorCallback?: (error: any) => void
): () => void;

export function onSnapshot(
  queryOrRef: CollectionReference | Query | any,
  callback: (snapshot: QuerySnapshot<any>) => void,
  errorCallback?: (error: any) => void
): () => void;

export function onSnapshot(
  queryOrRef: any,
  callback: (snapshot: any) => void,
  errorCallback?: (error: any) => void
) {
  const isDoc = queryOrRef && queryOrRef.type === 'document';
  
  if (isDoc) {
    const tableName = queryOrRef.collection;
    const docId = queryOrRef.id;
    
    const fetchAndCallback = () => {
      getDoc(queryOrRef)
        .then(callback)
        .catch(err => {
          if (errorCallback) errorCallback(err);
          else console.error(`Error in onSnapshot doc fetch for ${tableName}/${docId}:`, err);
        });
    };

    fetchAndCallback();

    const channel = supabase
      .channel(`public-realtime:${tableName}:${docId}:${Math.random().toString(36).substring(2, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName, filter: `id=eq.${docId}` }, () => {
        fetchAndCallback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const isQuery = queryOrRef.type === 'query';
  const collectionRef = isQuery ? queryOrRef.ref : queryOrRef;
  const tableName = collectionRef.id;

  // Trigger initial fetch
  getDocs(queryOrRef)
    .then(callback)
    .catch(err => {
      if (errorCallback) errorCallback(err);
      else console.error(`Error in onSnapshot initial fetch for ${tableName}:`, err);
    });

  // Subscribe to changes on the table
  const channel = supabase
    .channel(`public-realtime:${tableName}:${Math.random().toString(36).substring(2, 8)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
      // Re-fetch and call callback
      getDocs(queryOrRef)
        .then(callback)
        .catch(err => {
          if (errorCallback) errorCallback(err);
        });
    })
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

// Server Timestamp placeholder object
export function serverTimestamp() {
  return { _methodName: 'serverTimestamp' };
}

// Simple batch write utility
export function writeBatch(db?: any) {
  const operations: Array<() => Promise<void>> = [];
  return {
    set: (docRef: any, data: any, options?: any) => {
      operations.push(() => setDoc(docRef, data, options));
    },
    update: (docRef: any, data: any) => {
      operations.push(() => updateDoc(docRef, data));
    },
    delete: (docRef: any) => {
      operations.push(() => deleteDoc(docRef));
    },
    commit: async () => {
      for (const op of operations) {
        await op();
      }
    }
  };
}

// Transactions compat helper
export async function runTransaction(db: any, updateFunction: (transaction: any) => Promise<any>) {
  const transaction = {
    get: async (docRef: any) => {
      return getDoc(docRef);
    },
    set: (docRef: any, data: any, options?: any) => {
      return setDoc(docRef, data, options);
    },
    update: (docRef: any, data: any) => {
      return updateDoc(docRef, data);
    },
    delete: (docRef: any) => {
      return deleteDoc(docRef);
    }
  };
  return updateFunction(transaction);
}

// FieldValue array handlers
export function arrayUnion(...elements: any[]) {
  // Simplistic local array union behavior: database will just update arrays
  return elements; 
}

export function arrayRemove(...elements: any[]) {
  // Simplistic local array remove behavior
  return elements;
}

// FieldValue type and object exports
export class FieldValue {
  static arrayUnion = arrayUnion;
  static arrayRemove = arrayRemove;
  static serverTimestamp = serverTimestamp;
}

