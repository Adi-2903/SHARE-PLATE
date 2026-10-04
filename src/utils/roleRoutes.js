export const ROLE_ROUTES = {
  donor: '/donate',
  ngo: '/ngo',
  volunteer: '/volunteer',
  admin: '/admin',
}

export function getRoleRoute(role, fallback = '/') {
  return ROLE_ROUTES[role] || fallback
}
