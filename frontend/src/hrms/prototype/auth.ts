export const DEMO_EMAIL = 'admin@hrms.demo';
export const DEMO_PASSWORD = 'HRMS@2026';
export function validateCredentials(email: string, password: string) {
 if(!email.trim() || !password)throw new Error('Enter your email and password.');
 if(email.trim().toLowerCase()!==DEMO_EMAIL || password!==DEMO_PASSWORD)throw new Error('Email or password is incorrect. Use the demo credentials below.');
}
