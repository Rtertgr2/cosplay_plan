/**
 * Image Processing Module for Cosplay Planner
 */

const ImageProcessor = {
    MAX_WIDTH: 800,
    MAX_HEIGHT: 800,
    QUALITY: 0.7,

    /**
     * Handle file input and process the image
     */
    async process(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject('กรุณาเลือกไฟล์รูปภาพ');
                return;
            }

            if (file.size > 20 * 1024 * 1024) {
                reject('ไฟล์ใหญ่เกิน 20MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > this.MAX_WIDTH || height > this.MAX_HEIGHT) {
                        if (width > height) {
                            height = Math.round(height * (this.MAX_WIDTH / width));
                            width = this.MAX_WIDTH;
                        } else {
                            width = Math.round(width * (this.MAX_HEIGHT / height));
                            height = this.MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw with white background
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG
                    const base64Data = canvas.toDataURL('image/jpeg', this.QUALITY);

                    // Statistics
                    const originalSizeKB = Math.round(file.size / 1024);
                    const processedSizeKB = Math.round(base64Data.length * 0.75 / 1024);
                    const reductionPercent = Math.round((1 - processedSizeKB / originalSizeKB) * 100);

                    resolve({
                        base64: base64Data,
                        width,
                        height,
                        originalSizeKB,
                        processedSizeKB,
                        reductionPercent,
                        base64Length: base64Data.length
                    });
                };
                img.onerror = () => reject('ไม่สามารถโหลดรูปภาพได้');
                img.src = e.target.result;
            };
            reader.onerror = () => reject('ไม่สามารถอ่านไฟล์ได้');
            reader.readAsDataURL(file);
        });
    }
};

window.ImageProcessor = ImageProcessor;
