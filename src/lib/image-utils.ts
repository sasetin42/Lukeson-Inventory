
'use client';

export const processImage = (file: File, maxSizeMB: number = 2): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject(new Error('Failed to get canvas context'));
                }
                
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/webp', 0.85);
                
                // Check size
                const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
                const sizeInBytes = (base64Length * 0.75);
                
                if (sizeInBytes > maxSizeMB * 1024 * 1024) {
                    return reject(new Error(`Image size is too large after compression. Max size is ${maxSizeMB}MB.`));
                }

                resolve(dataUrl);
            };
        };
        reader.onerror = error => reject(error);
    });
};
