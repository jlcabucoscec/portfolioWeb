function readFileAsDataUrl(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(fileOrBlob);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image preview."));
    image.src = source;
  });
}

function fitWithinBounds(width, height, maxWidth, maxHeight) {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export async function compressImageFile(
  file,
  options = { maxWidth: 1600, maxHeight: 1600, quality: 0.82, type: "image/jpeg" },
) {
  if (!file) {
    throw new Error("No image file selected.");
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const size = fitWithinBounds(image.naturalWidth, image.naturalHeight, options.maxWidth, options.maxHeight);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image compression is not supported in this browser.");
  }

  context.drawImage(image, 0, 0, size.width, size.height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, options.type, options.quality);
  });

  const outputBlob = blob || file;
  const dataUrl = await readFileAsDataUrl(outputBlob);
  const nextName = file.name.replace(/\.[^.]+$/, "") || "upload";

  return {
    fileName: `${nextName}.jpg`,
    dataUrl,
    contentType: outputBlob.type || options.type,
    width: size.width,
    height: size.height,
    sizeBytes: outputBlob.size || file.size || 0,
  };
}
