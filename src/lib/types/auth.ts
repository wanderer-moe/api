export interface LoginBody {
    username: string;
    password: string;
}

export interface RegisterBody {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
}
