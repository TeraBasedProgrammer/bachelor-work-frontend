export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    // Convert to KB if less than 1MB
    return `${Math.round(bytes / 1024)} kb`;
  } else {
    // Convert to MB with one decimal place
    return `${(bytes / (1024 * 1024)).toFixed(1)} mb`;
  }
}

export const getFileBuffer = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return buffer;
};
