import axios, { AxiosRequestConfig } from 'axios';

export interface BasicResponseType {
  returnCode: string;
  message: string | undefined;
}

export interface FileInfoTypeWithObjectId {
  _id: string;
  fieldname: string;
  filename: string;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface UploadedFileType extends BasicResponseType {
  fileInfo: FileInfoTypeWithObjectId;
}

export interface UploadMultipleFilesType extends BasicResponseType {
  fileInfoList: FileInfoTypeWithObjectId[];
}

type MediaId = {
  id: string;
};

const DEFAULT_IMAGE_MGMT_ENDPOINT = 'http://localhost:4000/image-mgmt/';
const websiteUrl =
  process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT?.replace('image-mgmt/', '') ||
  DEFAULT_IMAGE_MGMT_ENDPOINT.replace('image-mgmt/', '');
const baseUrl = process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT || DEFAULT_IMAGE_MGMT_ENDPOINT;

const upload = async (
  file: File,
  onUploadProgress: (event: ProgressEvent) => void,
  auth?: string,
  groupId?: string,
): Promise<UploadedFileType> => {
  const formData = new FormData();
  formData.append('media', file);

  const http = axios.create({
    baseURL: websiteUrl,
    headers: {
      'Content-type': 'application/json',
      authorization: auth || '',
      'group-id': groupId || '',
    },
  });

  const { data } = await http.post<UploadedFileType>(`${baseUrl}uploadedMedia`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      authorization: auth || '',
      'group-id': groupId || '',
    },
    onUploadProgress,
  });

  return data;
};

const multiple = async (
  files: Array<File>,
  onUploadProgress: (event: ProgressEvent) => void,
  auth?: string,
  groupId?: string,
): Promise<UploadMultipleFilesType> => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i += 1) {
    formData.append('media', files[i]);
  }

  const http = axios.create({
    baseURL: websiteUrl,
    headers: {
      'Content-type': 'application/json',
      authorization: auth || '',
      'group-id': groupId || '',
    },
  });

  const { data } = await http.post<UploadMultipleFilesType>(`${baseUrl}multiple2`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      authorization: auth || '',
      'group-id': groupId || '',
    },
    onUploadProgress,
  });
  return data;
};

const getUploadMediabyId = async (
  auth: string,
  groupId: string,
  mediaId: string,
): Promise<Blob> => {
  const requestConfig: AxiosRequestConfig = {
    method: 'get',
    baseURL: process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT || '',
    headers: {
      authorization: auth || '',
      'group-id': groupId || '',
    },
    responseType: 'blob',
  };

  const http = axios.create(requestConfig);

  const { data } = await http.get<Blob>(mediaId);
  return data;
};

const deleteImages = (mediaIds: MediaId[], auth?: string, groupId?: string): Promise<void> => {
  const formatData = JSON.stringify(mediaIds);

  const http = axios.create({
    baseURL: websiteUrl,
    headers: {
      'Content-type': 'application/json',
      authorization: auth || '',
      'group-id': groupId || '',
    },
  });

  return http.post(`${baseUrl}deleteFilesbyIds`, formatData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      authorization: auth || '',
      'group-id': groupId || '',
    },
  });
};

const MediaUploadService = {
  upload,
  multiple,
  deleteImages,
  getUploadMediabyId,
};

export default MediaUploadService;
