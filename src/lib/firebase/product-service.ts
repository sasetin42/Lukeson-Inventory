
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import type { Product } from '@/lib/types';

const PRODUCTS_COLLECTION = 'products';

// Function to upload an image and get the URL
const uploadImage = async (productId: string, image: string): Promise<string> => {
  if (!image || !image.startsWith('data:image')) {
    return image; // Not a new base64 image, return original URL or null
  }
  const imageRef = ref(storage, `${PRODUCTS_COLLECTION}/${productId}/${Date.now()}`);
  const snapshot = await uploadString(imageRef, image, 'data_url');
  return getDownloadURL(snapshot.ref);
};

// Function to delete an image from storage
const deleteImage = async (imageUrl: string | undefined | null) => {
    if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
      // Not a Firebase Storage URL, so we can't delete it.
      return;
    }
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      // If the object does not exist, Firebase throws 'storage/object-not-found'.
      // We can safely ignore this error.
      if (error.code === 'storage/object-not-found') {
        console.warn("Tried to delete an image that doesn't exist:", imageUrl);
      } else {
        console.error("Error deleting image from storage: ", error);
        throw error; // Re-throw other errors
      }
    }
};

// Get all products with real-time updates
export const getProducts = (
    callback: (products: Product[]) => void,
    onError?: (error: Error) => void
  ) => {
    const productsCollection = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsCollection, orderBy('createdAt', 'desc'));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Product, 'id'>,
        createdAt: doc.data().createdAt as Timestamp,
      }));
      callback(products);
    }, (error) => {
      console.error("Error getting real-time products: ", error);
      if (onError) {
        onError(error);
      }
    });
  
    return unsubscribe;
};

// Add a new product
export const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
  const { image, ...restOfData } = productData;
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...restOfData,
    createdAt: serverTimestamp(),
    imageUrl: null, // Initially set to null
  });

  let imageUrl = null;
  if (image) {
    imageUrl = await uploadImage(docRef.id, image);
    await updateDoc(docRef, { imageUrl });
  }

  return { id: docRef.id, imageUrl };
};

// Update an existing product
export const updateProduct = async (productId: string, productData: Partial<Product>) => {
    const { image, ...restOfData } = productData;
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  
    let newImageUrl = productData.imageUrl;
  
    // Check if a new image is being uploaded
    if (image && image.startsWith('data:image')) {
      // A new image is provided (base64 string)
      // First, delete the old image if it exists
      if (productData.imageUrl) {
        await deleteImage(productData.imageUrl);
      }
      // Upload the new image and get its URL
      newImageUrl = await uploadImage(productId, image);
    }
  
    await updateDoc(productRef, {
      ...restOfData,
      imageUrl: newImageUrl, // Update with the new URL or keep the old one
    });
};

// Delete a product
export const deleteProduct = async (productId: string, imageUrl: string | undefined | null) => {
  // First, delete the image from Storage
  await deleteImage(imageUrl);
  
  // Then, delete the document from Firestore
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(productRef);
};
