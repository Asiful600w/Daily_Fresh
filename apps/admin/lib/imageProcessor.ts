/**
 * Client-side image processor for product images.
 * 
 * Processes uploaded images to be:
 * - Resized to fit within TARGET_SIZE × TARGET_SIZE
 * - Centered on a square canvas with a white background
 * - Compressed as WebP at 85% quality
 */

const TARGET_SIZE = 800;
const QUALITY = 0.85;

/**
 * Load a File into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        const url = URL.createObjectURL(file);
        img.src = url;
    });
}

/**
 * Process a single image file:
 * 1. Load into canvas
 * 2. Scale to fit within TARGET_SIZE while maintaining aspect ratio
 * 3. Center on a square white canvas
 * 4. Export as WebP
 */
export async function processImage(file: File): Promise<File> {
    const img = await loadImage(file);

    // Calculate scale to fit within TARGET_SIZE
    const scale = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height, 1);
    const scaledWidth = Math.round(img.width * scale);
    const scaledHeight = Math.round(img.height * scale);

    // Create square canvas
    const canvas = document.createElement('canvas');
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;

    const ctx = canvas.getContext('2d')!;

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

    // Draw image centered
    const offsetX = Math.round((TARGET_SIZE - scaledWidth) / 2);
    const offsetY = Math.round((TARGET_SIZE - scaledHeight) / 2);
    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

    // Clean up the object URL
    URL.revokeObjectURL(img.src);

    // Export as WebP
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
            'image/webp',
            QUALITY
        );
    });

    // Generate output filename
    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
}

/**
 * Process multiple image files in parallel.
 * Returns processed files and their preview URLs.
 */
export async function processImages(
    files: File[]
): Promise<{ processedFiles: File[]; previewUrls: string[] }> {
    const results = await Promise.all(
        files.map(async (file) => {
            const processed = await processImage(file);
            const previewUrl = URL.createObjectURL(processed);
            return { processed, previewUrl };
        })
    );

    return {
        processedFiles: results.map((r) => r.processed),
        previewUrls: results.map((r) => r.previewUrl),
    };
}
