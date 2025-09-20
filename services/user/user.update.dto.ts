export interface UserDto {
    name: string;
    nickname: string;
    password: string;
    avatar: {
        uri: string;
        mimeType: string;
        name: string
    } | null;
}