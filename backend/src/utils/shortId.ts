import { customAlphabet } from 'nanoid';

// Base62: a-z, A-Z, 0-9
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// 7 characters = 62^7 = 3.5 trillion unique codes
const generateShortId = customAlphabet(alphabet, 7);

export { generateShortId };