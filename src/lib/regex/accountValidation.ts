// must have @ and . inside to be considered an email
export function checkEmail(email: string) {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
}

// minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
export function checkPassword(password: string) {
    const passwordRegex =
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return passwordRegex.test(password);
}

// 5 to 16 characters which contain only characters, numeric digits, underscore and first character must be a letter
export function checkUsername(username: string) {
    const usernameRegex = /^[a-zA-Z0-9]{5,16}$/;
    return usernameRegex.test(username);
}
