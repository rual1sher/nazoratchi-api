/** Minimal Multer file shape (avoids @types/multer dependency). */
export type MulterUploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  filename: string;
};
