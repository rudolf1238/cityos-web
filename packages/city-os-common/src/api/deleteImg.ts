import axios from 'axios';

export interface DeleteImgPayload {
  imageId: string;
  onDeleteProgress?: (event: ProgressEvent) => void;
  authorization?: string;
  groupId?: string;
  controller?: AbortController;
}

export interface DeleteImgResponse {
  returnCode: string;
  message: string | undefined;
}

const deleteImg = async (props: DeleteImgPayload): Promise<DeleteImgResponse> => {
  const { controller, imageId, onDeleteProgress, authorization, groupId } = props;

  const requestConfig = {
    baseURL: process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT || '',
    headers: {
      authorization: authorization || '',
      'group-id': groupId || '',
    },
    onDeleteProgress,
    signal: controller?.signal,
  };

  const http = axios.create(requestConfig);

  const { data } = await http.delete<DeleteImgResponse>(imageId);
  return data;
};

export default deleteImg;
