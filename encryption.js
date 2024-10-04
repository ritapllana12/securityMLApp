import bcrypt from 'bcryptjs';

export async function encryptPassword(password) {
    const saltRounds = 10;
    if (!password) {
        password = "password";
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}