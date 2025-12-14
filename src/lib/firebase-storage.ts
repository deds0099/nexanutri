import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from './firebase';

// Initialize Firebase Storage
export const storage = getStorage(app);

// Helper function to create storage reference
export const createStorageRef = (path: string) => {
    return ref(storage, path);
};

// Upload file to storage
export const uploadFile = async (
    file: File | Blob,
    path: string
): Promise<string> => {
    const storageRef = createStorageRef(path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};

// Delete file from storage
export const deleteFile = async (path: string): Promise<void> => {
    const storageRef = createStorageRef(path);
    await deleteObject(storageRef);
};

// Get download URL for a file
export const getFileURL = async (path: string): Promise<string> => {
    const storageRef = createStorageRef(path);
    return await getDownloadURL(storageRef);
};
