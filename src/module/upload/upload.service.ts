import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ALLOWED_MIME_TYPES,
  ensureUploadDir,
  UPLOAD_DIR,
  UPLOAD_URL_PREFIX,
} from 'src/helpers/config/upload.config';
import { MulterUploadedFile } from './upload.types';
import { env } from 'src/helpers/config/env.config';

export type UploadedFileResult = {
  url: string;
  size: number;
  filename: string;
  originalName: string;
  mimetype: string;
};

@Injectable()
export class UploadService implements OnModuleInit {
  onModuleInit() {
    ensureUploadDir();
  }

  buildFileUrl(filename: string): string {
    return `${UPLOAD_URL_PREFIX}/${filename}`;
  }

  toUploadResult(file: MulterUploadedFile | undefined): UploadedFileResult {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const url = this.buildFileUrl(file.filename);
    const baseUrl = env.baseUrl;

    return {
      url: `${baseUrl}${url}`,
      size: file.size,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
    };
  }

  static multerFileFilter(
    _req: unknown,
    file: MulterUploadedFile,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error(`File type not allowed: ${file.mimetype}`), false);
      return;
    }
    cb(null, true);
  }
}

export { UPLOAD_DIR };
