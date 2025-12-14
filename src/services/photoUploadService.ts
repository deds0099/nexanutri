import { uploadFile } from '@/lib/firebase-storage';

// Compress image before upload
export const compressImage = async (
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1920,
    quality: number = 0.8
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
    });
};

// Create thumbnail
export const createThumbnail = async (
    file: File,
    maxSize: number = 200
): Promise<Blob> => {
    return compressImage(file, maxSize, maxSize, 0.7);
};

// Upload meal photo and thumbnail
export const uploadMealPhoto = async (
    file: File,
    userId: string,
    mealPhotoId: string
): Promise<{ imageUrl: string; thumbnailUrl: string }> => {
    try {
        // Compress main image
        const compressedImage = await compressImage(file);

        // Create thumbnail
        const thumbnail = await createThumbnail(file);

        // Upload both
        const imagePath = `meal-photos/${userId}/${mealPhotoId}/image.jpg`;
        const thumbnailPath = `meal-photos/${userId}/${mealPhotoId}/thumbnail.jpg`;

        const [imageUrl, thumbnailUrl] = await Promise.all([
            uploadFile(compressedImage, imagePath),
            uploadFile(thumbnail, thumbnailPath),
        ]);

        return { imageUrl, thumbnailUrl };
    } catch (error) {
        console.error('Error uploading meal photo:', error);
        throw error;
    }
};
