const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

export function uid(prefix: string, length = 8) {
    let out = '';
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
    return `${prefix}_${out}`;
}
