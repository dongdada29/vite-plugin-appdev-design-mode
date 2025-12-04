import axios from 'axios';

const APP_ID = import.meta.env.VITE_APP_ID;

const apiClient = axios.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': APP_ID
  }
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API 请求错误:', error);
    if (error.response?.data?.status === 999) {
      throw new Error(error.response.data.msg);
    }
    return Promise.reject(error);
  }
);

export interface ImageGenerationParams {
  prompt: string;
  width?: number;
  height?: number;
  image_num?: number;
}

export interface ImageGenerationResponse {
  status: number;
  msg: string;
  data: {
    task_id: number;
  };
}

export interface ImageQueryResponse {
  status: number;
  msg: string;
  data: {
    task_status: string;
    task_progress: number;
    sub_task_result_list?: Array<{
      sub_task_status: string;
      final_image_list?: Array<{
        img_url: string;
        width: number;
        height: number;
      }>;
    }>;
  };
}

export const generateImage = async (params: ImageGenerationParams): Promise<ImageGenerationResponse> => {
  return apiClient.post(
    'https://api-integrations.appmiaoda.com/app-7a7nlc9zki69/api-2bk93oeO9Nyz/v1/bce/wenxinworkshop/ai_custom_image_creation/v2/text2image',
    {
      prompt: params.prompt,
      width: params.width || 768,
      height: params.height || 1360,
      image_num: params.image_num || 1
    }
  );
};

export const queryImageResult = async (taskId: number): Promise<ImageQueryResponse> => {
  return apiClient.post(
    'https://api-integrations.appmiaoda.com/app-7a7nlc9zki69/api-2jBYdN3A9Nyz/v1/bce/wenxinworkshop/ai_custom_image_creation/v2/query_task',
    {
      task_id: taskId
    }
  );
};

export const pollImageResult = async (
  taskId: number,
  maxAttempts = 30,
  interval = 2000
): Promise<string> => {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await queryImageResult(taskId);
    
    if (result.data.task_status === 'SUCCESS') {
      const imageUrl = result.data.sub_task_result_list?.[0]?.final_image_list?.[0]?.img_url;
      if (imageUrl) {
        return imageUrl;
      }
    }
    
    if (result.data.task_status === 'FAILED') {
      throw new Error('图片生成失败');
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('图片生成超时');
};
