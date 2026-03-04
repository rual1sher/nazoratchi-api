import { compareSync, hashSync } from 'bcrypt';

export function checkPassword(password: string, current_password: string) {
  const compare = compareSync(password, current_password);
  return compare;
}

export function hashingPassword(password: string) {
  const hashed = hashSync(password, 10);
  return hashed;
}
