# Seeded Accounts for Testing

## Admin Account

- **Email:** admin@system.com
- **Password:** Admin123!
- **Role:** admin
- **Name:** Admin System

## Credit Officer Accounts

### Officer 1

- **Email:** officer1@system.com
- **Password:** Officer123!
- **Role:** officer
- **Name:** Credit Officer 1

### Officer 2

- **Email:** officer2@system.com
- **Password:** Officer123!
- **Role:** officer
- **Name:** Credit Officer 2

---

## Usage

These accounts are automatically created when running:

```bash
npx sequelize db:seed:all
```

Use these credentials to login and test role-based features:

- Admin can access all features
- Officers can complete assessment (INFORMASI 4-6)
- Regular users can only submit draft applications (INFORMASI 1-3)
