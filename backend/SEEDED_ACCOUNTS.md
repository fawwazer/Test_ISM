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

Use these credentials to login and test the credit scoring system:

- **Admin** and **Officers** can access all features
- Create credit applications with all 22 criteria (INFORMASI 1-6)
- View, update, and delete applications
- Generate scoring reports with risk category (HIGH/MEDIUM/LOW)
