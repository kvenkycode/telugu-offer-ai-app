import Tesseract from 'tesseract.js';

export const extractTeluguText = async (imageFile) => {
  const { data: { text } } = await Tesseract.recognize(imageFile, 'tel');
  return text;
};
