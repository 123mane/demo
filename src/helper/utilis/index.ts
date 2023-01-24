import { compare, hash } from 'bcrypt';

export async function passwordEncryption(password: string) {
  return await hash(password, 10);
}

export async function comparePassword(password: string, hashPassword: string) {
  return await compare(password, hashPassword);
}
