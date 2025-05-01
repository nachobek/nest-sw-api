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
  MOVIE_NOT_FOUND = 'Movie not found',
  MOVIE_CREATION_ERROR = 'Error creating movie',
  MOVIE_UPDATE_ERROR = 'Error updating movie',
  MOVIE_DELETION_ERROR = 'Error deleting movie',
  SYNC_ALREADY_RUNNING = 'Sync already running',
  MOVIE_SYNC_ERROR = 'Error syncing movies',
  MOVIE_SYNC_SUCCESS = 'Movies synced successfully',
  SCHEDULED_MOVIE_SYNC_STARTED = 'Automated movies sync started',
  SCHEDULED_MOVIE_SYNC_SUCCESS = 'Automated movies sync completed successfully',
  USER_NOT_FOUND = 'User not found',
}

export default ResponseMessages;
