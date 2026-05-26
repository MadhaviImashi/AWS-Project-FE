import axios from 'axios';
import client from './client';

export const getUploadUrl = (data: { eventId: string; fileName: string; contentType: string }) =>
  client.post<{ uploadUrl: string; s3Key: string }>('/api/v1/files/upload-url', data).then((r) => r.data);

export const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  // Direct PUT to S3 pre-signed URL — no auth header, no axios interceptor
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  });
};
