// Global constants for the application

/**
 * Special UUID used for guest orders where no authenticated user is present.
 * This UUID is referenced in RLS policies and database constraints.
 * DO NOT MODIFY without updating database policies.
 */
export const GUEST_USER_UUID = '00000000-0000-0000-0000-000000000000';

/**
 * File upload constants
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;
export const MAX_PRODUCT_IMAGE_SIZE_KB = 5120; // 5MB for product images
export const MAX_PROFILE_IMAGE_SIZE_KB = 1024; // 1MB for profile/logo images
export const MAX_IMAGES_PER_PRODUCT = 5;

/**
 * Order status constants
 */
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

/**
 * User role constants
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  WHOLESALER: 'wholesaler',
  SELLER: 'seller',
  PENDING: 'pending'
} as const;
