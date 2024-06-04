/**
 * Produces a display name based on the email of a user
 * @param email A valid email adress
 */
export function nameFromEmail(email: string | undefined | null): string {
    if (!email) {
        return '';
    }
    return email.split('@')[0].split('.').join(' ');
}
