// Image Handler - Convert files to Base64 and validate
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }
    
    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      reject(new Error('Image must be under 1MB'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result); // Returns "data:image/jpeg;base64,..."
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Create image preview
export const createImagePreview = (base64String, altText = 'Preview') => {
  const img = document.createElement('img');
  img.src = base64String;
  img.alt = altText;
  img.style.maxWidth = '100%';
  img.style.maxHeight = '300px';
  img.style.objectFit = 'cover';
  return img;
};

// Validate image before upload
export const validateImage = (file) => {
  const errors = [];
  
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image (JPG, PNG, GIF)');
  }
  
  if (file.size > 1024 * 1024) {
    errors.push('Image must be under 1MB');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};