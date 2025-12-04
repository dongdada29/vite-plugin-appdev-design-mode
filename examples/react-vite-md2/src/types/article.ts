export interface ArticleContent {
  title: string;
  content: string;
  images?: string[];
}

export interface VideoScript {
  title: string;
  scenes: SceneScript[];
}

export interface SceneScript {
  sceneNumber: number;
  description: string;
  dialogue: string;
  duration: string;
  notes: string;
}

export type ContentType = 'article' | 'image-caption' | 'video-script';
