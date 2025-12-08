/**
 * Avatar utility functions
 * Handles avatar URL processing and default avatar generation
 */

/**
 * Get avatar source for Image component
 * @param avatarUrl - URL of the avatar image
 * @returns Image source object or null
 */
export const getAvatarSource = (
  avatarUrl: string | null | undefined
): { uri: string } | null => {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return { uri: avatarUrl };
  }
  return null;
};

/**
 * Get initials from full name (last word)
 * @param fullName - User's full name
 * @returns First letter of the last word in uppercase
 */
export const getInitials = (fullName: string): string => {
  if (!fullName || fullName.trim() === '') return '?';

  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return '?';

  // Get last word and return its first letter
  const lastName = parts[parts.length - 1];
  return lastName[0].toUpperCase();
};

/**
 * Get last name from full name
 * @param fullName - User's full name
 * @returns Last word of the full name
 */
export const getLastName = (fullName: string): string => {
  if (!fullName || fullName.trim() === '') return '';

  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return '';

  return parts[parts.length - 1];
};
