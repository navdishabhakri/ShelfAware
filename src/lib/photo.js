/**
 * Reads an image file and returns a 160×160 centre-cropped JPEG data URL,
 * small enough to keep in localStorage.
 */
export function resizePhoto(file, size = 160) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const k = Math.max(size / img.width, size / img.height);
        canvas.width = size;
        canvas.height = size;
        canvas
          .getContext('2d')
          .drawImage(img, (size - img.width * k) / 2, (size - img.height * k) / 2, img.width * k, img.height * k);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
