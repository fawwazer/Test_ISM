# API Documentation

Base URL: `http://localhost:3000`

---

## Role-Based Access

Sistem menggunakan 3 role:

- **user**: Nasabah yang bisa register sendiri
- **officer**: Credit officer yang bisa mengajukan application untuk user atau manual
- **admin**: Full access

---

## 1. Register

**Endpoint:** `POST /register`

**Note:** Register untuk role `user`. Untuk officer dan admin, gunakan akun yang sudah di-seed.

**Seeded Accounts:**

- **Admin**: `admin@system.com` / `Admin123!`
- **Officer 1**: `officer1@system.com` / `Officer123!`
- **Officer 2**: `officer2@system.com` / `Officer123!`

**Body:**

```json
{
  "nama": "John Doe",
  "tempatLahir": "Jakarta",
  "tanggalLahir": "1990-01-01",
  "jenisKelamin": "L",
  "kodePos": "12345",
  "alamat": "Jl. Contoh No. 123",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (201):**

```json
{
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "nama": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 2. Login

**Endpoint:** `POST /login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**

```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "nama": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 3. Get Scoring Structure

**Endpoint:** `GET /scoring-structure`

**Headers:** None (Public)

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "INFORMASI 1",
      "weight": 5.0,
      "order": 1,
      "criteria": [
        {
          "id": 1,
          "name": "Umur Pemohon",
          "weight": 30.0,
          "order": 1,
          "scoreOptions": [
            {
              "id": 1,
              "description": "1. 56-65 Tahun",
              "score": 25,
              "order": 1
            },
            {
              "id": 2,
              "description": "2. 21-30 Tahun",
              "score": 50,
              "order": 2
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. Get Users (Officer/Admin Only)

**Endpoint:** `GET /users`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Role Required:** `officer` atau `admin`

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "nama": "John Doe",
      "email": "john@example.com",
      "tempatLahir": "Jakarta",
      "tanggalLahir": "1990-01-01",
      "jenisKelamin": "L",
      "kodePos": "12345",
      "alamat": "Jl. Contoh No. 123"
    }
  ]
}
```

**Note:** Endpoint ini untuk officer melihat daftar user yang tersedia sebelum membuat application

---

## 5. Create Application (Officer/Admin Only)

**Endpoint:** `POST /applications`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Role Required:** `officer` atau `admin`

**Note:** Officer bisa membuat application dengan 2 cara:

1. **Pilih user yang ada** (pakai `userId`)
2. **Input manual** (pakai `userManualData`)

### Option A: Dengan User yang Ada

**Body:**

```json
{
  "userId": 1,
  "scores": [
    { "criteriaId": 1, "scoreOptionId": 3 },
    { "criteriaId": 2, "scoreOptionId": 6 },
    ...
    { "criteriaId": 22, "scoreOptionId": 86 }
  ]
}
```

### Option B: Input Manual (Tanpa User)

**Body:**

```json
{
  "userManualData": {
    "nama": "Jane Smith",
    "email": "jane@example.com",
    "phone": "08123456789",
    "address": "Jl. Manual No. 456"
  },
  "applicantName": "Jane Smith",
  "scores": [
    { "criteriaId": 1, "scoreOptionId": 3 },
    { "criteriaId": 2, "scoreOptionId": 6 },
    ...
    { "criteriaId": 22, "scoreOptionId": 86 }
  ]
}
```

**Note:**

- Harus isi **semua 22 criteria** (INFORMASI 1-6)
- Tidak bisa kirim `userId` dan `userManualData` bersamaan
- Lihat [example-full-application.json](./example-full-application.json) untuk contoh lengkap

**Response Success (201):**

```json
{
  "message": "Application created and assessed successfully",
  "data": {
    "applicationNumber": "APP-1735718400000-5",
    "applicationId": 5,
    "applicantName": "Jane Smith",
    "userId": null,
    "userManualData": {
      "nama": "Jane Smith",
      "email": "jane@example.com"
    },
    "status": "assessed",
    "totalScore": 85.75,
    "riskCategory": "LOW RISK"
  }
}
```

---

## 6. Get Applications

**Endpoint:** `GET /applications`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Role Required:** `officer` atau `admin`

**Query Parameters (Optional):**

- `status`: Filter by status (`pending`, `approved`, `rejected`, `draft`, `assessed`)

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "applicationNumber": "APP-1735718400000-1",
      "userId": 1,
      "userManualData": null,
      "applicantName": "John Doe",
      "status": "assessed",
      "totalScore": 85.75,
      "riskCategory": "LOW RISK",
      "createdAt": "2026-01-01T08:00:00.000Z",
      "user": {
        "id": 1,
        "nama": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": 2,
      "applicationNumber": "APP-1735718400000-2",
      "userId": null,
      "userManualData": {
        "nama": "Jane Smith",
        "email": "jane@example.com"
      },
      "applicantName": "Jane Smith",
      "status": "assessed",
      "totalScore": 72.5,
      "riskCategory": "MEDIUM RISK",
      "createdAt": "2026-01-01T09:00:00.000Z",
      "user": null
    }
  ]
}
```

**Example with filter:**

```
GET /applications?status=assessed
```

---

## 7. Get Application Detail

**Endpoint:** `GET /applications/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Role Required:** `officer` atau `admin`

**Response Success (200):**

```json
{
  "data": {
    "id": 1,
    "applicationNumber": "APP-1735718400000-1",
    "userId": 1,
    "userManualData": null,
    "applicantName": "John Doe",
    "status": "assessed",
    "totalScore": 85.75,
    "riskCategory": "LOW RISK",
    "scores": [
      {
        "id": 1,
        "score": 100,
        "criteriaWeight": 30.0,
        "weightedScore": 30.0,
        "criteria": {
          "id": 1,
          "name": "Umur Pemohon",
          "category": {
            "id": 1,
            "name": "INFORMASI 1"
          }
        },
        "scoreOption": {
          "id": 3,
          "description": "3. 31-45 Tahun",
          "score": 100
        }
      }
    ]
  }
}
```

---

## 8. Get Application Report

**Endpoint:** `GET /applications/:id/report`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Role Required:** `officer` atau `admin`

**Response Success (200):**

```json
{
  "data": {
    "applicationNumber": "APP-1735718400000-1",
    "applicantName": "John Doe",
    "totalScore": 85.75,
    "riskCategory": "LOW RISK",
    "createdAt": "2026-01-01T08:00:00.000Z",
    "report": [
      {
        "categoryId": 1,
        "categoryName": "INFORMASI 1",
        "categoryWeight": 5.0,
        "items": [
          {
            "criteriaName": "Umur Pemohon",
            "criteriaWeight": 30.0,
            "selectedOption": "3. 31-45 Tahun",
            "score": 100,
            "weightedScore": 30.0
          }
        ],
        "totalWeightedScore": 40.0,
        "finalScore": 2.0
      }
    ]
  }
}
```

**Risk Category:**

- **HIGH RISK**: totalScore < 55
- **MEDIUM RISK**: totalScore 55-69
- **LOW RISK**: totalScore >= 70

**Keterangan:**

- `report`: Array berisi detail per INFORMASI (Category)
- `items`: Array berisi semua criteria yang dijawab dalam kategori tersebut
- `score`: Nilai F (score dari option yang dipilih)
- `weightedScore`: Nilai F × D (score × criteria weight)
- `totalWeightedScore`: Sum dari semua F × D dalam kategori
- `finalScore`: (Sum F × D) × B / 100 (total weighted × category weight)
- `totalScore`: Sum dari semua finalScore

---

## 9. Update Application

**Endpoint:** `PUT /applications/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Role Required:** `officer` atau `admin`

**Body:**

```json
{
  "applicantName": "John Doe Updated",
  "scores": [
    { "criteriaId": 1, "scoreOptionId": 3 },
    ...
    { "criteriaId": 22, "scoreOptionId": 86 }
  ]
}
```

**Note:** Harus isi semua 22 criteria

**Response Success (200):**

```json
{
  "message": "Application updated successfully",
  "data": {
    "applicationNumber": "APP-1735718400000-1",
    "applicationId": 1,
    "applicantName": "John Doe Updated",
    "status": "assessed",
    "totalScore": 82.5,
    "riskCategory": "LOW RISK"
  }
}
```

---

## 10. Delete Application

**Endpoint:** `DELETE /applications/:id`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Role Required:** `officer` atau `admin`

**Response Success (200):**

```json
{
  "message": "Application deleted successfully",
  "data": {
    "applicationId": 5,
    "applicationNumber": "APP-1735718400000-1"
  }
}
```

---

## Error Responses

**400 Bad Request:**

```json
{
  "message": "All fields are required"
}
```

**401 Unauthorized:**

```json
{
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**

```json
{
  "message": "Access denied"
}
```

**404 Not Found:**

```json
{
  "message": "Application not found"
}
```

**500 Internal Server Error:**

```json
{
  "message": "Internal Server Error"
}
```

---

## Testing Flow

### Current System Flow

1. **Register USER** (`POST /register`) → dapat user dengan role `user`
2. **Login as OFFICER** (gunakan seeded account: `officer1@system.com` / `Officer123!`)
3. **Get list users** (`GET /users`) → lihat daftar user yang tersedia
4. **Create application** (`POST /applications`):
   - **Option A**: Pilih userId dari list user
   - **Option B**: Input manual userManualData
5. **Get applications** (`GET /applications`) → lihat semua application dengan risk category
6. **Get application report** (`GET /applications/:id/report`) → lihat detail perhitungan scoring
7. **Update application** (`PUT /applications/:id`) → edit scores dan recalculate
8. **Delete application** (`DELETE /applications/:id`) → hapus application

**Example Flow:**

```bash
# Step 1: Register user
POST /register
Body: { "nama": "John Doe", "email": "john@example.com", ... }
Response: { "id": 5, "role": "user" }

# Step 2: Login as officer
POST /login
Body: { "email": "officer1@system.com", "password": "Officer123!" }
Response: { "access_token": "..." }

# Step 3: Get users
GET /users
Headers: { "Authorization": "Bearer <token>" }
Response: { "data": [{ "id": 5, "nama": "John Doe", ... }] }

# Step 4A: Create application for existing user
POST /applications
Headers: { "Authorization": "Bearer <token>" }
Body: { "userId": 5, "scores": [ ... 22 criteria ... ] }

# Step 4B: Create application with manual data
POST /applications
Headers: { "Authorization": "Bearer <token>" }
Body: { "userManualData": { "nama": "...", ... }, "scores": [ ... ] }

# Step 5: View all applications
GET /applications
Response: { "data": [{ "totalScore": 85.75, "riskCategory": "LOW RISK", ... }] }
```
