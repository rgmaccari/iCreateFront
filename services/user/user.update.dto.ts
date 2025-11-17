export interface UserDto {
    name: string;
    nickname: string;
    password: string;
    securityAnswers: string;
    avatar: {
        uri: string;
        mimeType: string;
        name: string
    } | null;
}