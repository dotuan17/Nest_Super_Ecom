const RoleName = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  SELLER: 'SELLER',
} as const;

const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;

export { RoleName, HTTPMethod };