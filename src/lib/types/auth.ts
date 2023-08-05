export interface LoginBody {
    username: string;
    password: string;
}
export interface RegisterBody extends LoginBody {
    email: string;
    passwordConfirm: string;
}
