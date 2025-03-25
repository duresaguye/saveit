import { createAccessControl } from "better-auth/plugins/access"

export const resourcePermissions = {
  resource: ['create', 'read', 'update', 'delete']
} as const

export const ac = createAccessControl({
  ...resourcePermissions,
  organization: ['read', 'update', 'delete']
})

// Member can create/read, update/delete own resources
interface User {
    id: string;
}

interface Resource {
    ownerId: string;
}

export const member = ac.newRole({
    resource: ['create', 'read', 'update', 'delete'],
    organization: ['read']
})

// Admin can manage all resources
export const admin = ac.newRole({
  resource: ['create', 'read', 'update', 'delete'],
  organization: ['read', 'update']
})