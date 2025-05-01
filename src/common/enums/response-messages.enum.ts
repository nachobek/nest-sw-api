enum ResponseMessages {
  EMAIL_ALREADY_TAKEN = 'Email is currently in use by another user',
  ENTITY_ALREADY_EXISTS = 'Entity already exists',
  ENTITY_NOT_FOUND = 'Entity not found',
  ENTITY_UPDATED = 'Entity updated successfully',
  ENTITY_REMOVED = 'Entity removed successfully',
  INVALID_CREDENTIALS = 'Wrong credentials',
  INVALID_REFERRAL_CODE = 'Invalid referral code',
  ERROR_CREATING_USER = 'Error creating user',
  ERROR_UPDATING_USER = 'Error updating user',
  ERROR_REMOVING_USER = 'Error removing user',
}

export default ResponseMessages;
