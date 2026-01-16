const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class Validator {
    static isUUID(value: string): boolean {
        return UUID_REGEX.test(value);
    }

    static isEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isPhoneNumber(phone: string): boolean {
        const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
        return phoneRegex.test(phone);
    }

    static isStrongPassword(password: string): boolean {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password)
        );
    }

    static isURL(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static isNumeric(value: string): boolean {
        return /^[0-9]+$/.test(value);
    }

    static isAlphanumeric(value: string): boolean {
        return /^[a-zA-Z0-9]+$/.test(value);
    }

    static isLength(value: string, min: number, max?: number): boolean {
        if (max) return value.length >= min && value.length <= max;
        return value.length >= min;
    }

    static isEmpty(value: any): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }
}

