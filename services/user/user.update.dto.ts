export interface UserDto {
  name: string;
  nickname: string;
  password: string;
  securityAnswer?: string;
  securityQuestion?: string;
  avatar: {
    uri: string;
    mimeType: string;
    name: string;
  } | null;
}
