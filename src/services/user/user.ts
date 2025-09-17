export interface User {
  code: number;
  name: string;
  nickname: string;
  createdAt: string;
  alteratedAt: string;
  avatarData?: {
    type: string;
    data: number[];
  };
  avatarMimeType?: string;
}


