# Nazoratchi API

Backend для системы учёта персонала: сотрудники, посещаемость, зарплаты, штрафы, задачи, расписания.

**Стек:** NestJS 11 · TypeScript · PostgreSQL · Prisma 7 · JWT · Swagger

---

## Быстрый старт

### Требования

- Node.js 20+
- PostgreSQL 15+
- npm

### 1. Установка

```bash
npm install
cp .env.example .env
```

Заполни `.env`:

| Переменная       | Описание                          |
|------------------|-----------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string      |
| `PORT`           | Порт API (по умолчанию `7777`)    |
| `ACCESS_SECRET`  | JWT access token secret           |
| `REFRESH_SECRET` | JWT refresh token secret          |
| `ACCESS_EXPIRE`  | Срок access token                 |
| `REFRESH_EXPIRE` | Срок refresh token                |
| `NODE_ENV`       | `development` / `production`      |
| `BASE_URL`       | Базовый URL (для upload и т.д.)   |

### 2. База данных

```bash
npx prisma migrate dev
npx prisma db seed   # создаёт admin: 998901234567 / admin123
npx prisma generate
```

### 3. Запуск

```bash
npm run dev          # dev с hot-reload
npm run build        # сборка
npm run prod         # production (node dist/main)
```

### Docker

```bash
docker compose up --build
```

- API: `http://localhost:7777`
- PostgreSQL: `localhost:5433` (внутри compose — `db:5432`)

---

## API

| Параметр   | Значение                          |
|------------|-----------------------------------|
| Base URL   | `/api/v1`                         |
| Swagger    | `/api/docs` (только не production)|
| Auth       | `Authorization: Bearer <token>`   |
| Tenant     | `x-company-id: <id>` (default: 1) |

### Формат ответа

```json
{
  "data": {},
  "status": 200,
  "pagination": null,
  "date": "2026-06-07T..."
}
```

### Аутентификация

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/auth/login-phone` | Телефон → OTP |
| POST | `/auth/login-username` | Username + password → токены сразу |
| POST | `/auth/verify` | Подтверждение OTP |
| POST | `/auth/refresh` | Refresh token из cookie |
| POST | `/auth/logout` | Выход |
| GET  | `/auth/me` | Текущий пользователь |

Refresh token — в httpOnly cookie `refreshToken`.

### Роли

- **user.role:** `admin` | `worker`
- **worker.role:** `worker` | `maneger`

`admin` обходит проверки worker-ролей. Остальные — через `WorkerRolesGuard` + заголовок `x-company-id`.

---

## Модули

| Модуль | Route prefix | Назначение |
|--------|--------------|------------|
| Auth | `auth` | Логин, OTP, токены |
| User | `user` | Пользователи |
| Company | `company` | Компании (admin) |
| Filial | `filial` | Филиалы |
| Department | `department` | Отделы |
| Position | `position` | Должности |
| Employee | `employee` | Сотрудники |
| Schedule | `schedule`, `work-schedule` | Расписания |
| Day | `day` | Рабочие/выходные дни |
| Holiday | `holiday` | Праздники |
| Attendance | `manual-attendance` | Ручная посещаемость |
| Face ID | `face-id-attendance` | Check-in/out через Face ID |
| Salary | `salary` | Зарплаты |
| Payment | `payment` | Выплаты |
| Penalty | `penalty` | Штрафы |
| Task | `task` | Задачи |
| Terminal | `terminal` | Терминалы |
| Upload | `upload` | Загрузка файлов |

---

## Структура проекта

```
src/
├── main.ts                 # Bootstrap, CORS, Swagger, pipes
├── module/                 # NestJS-модули (controller/service/dto)
└── helpers/
    ├── config/             # env, upload
    ├── guard/              # AuthGuard, AdminGuard, WorkerRolesGuard
    ├── decorators/         # @CompanyId, @WorkerId, @Owner, @WorkerRoles
    ├── prisma/             # PrismaService
    ├── jwt/                # JWT
    ├── error/              # HttpExceptionFilter, сообщения
    └── pagination/         # Пагинация

prisma/
├── schema/                 # Модели (multi-file schema)
├── migrations/
└── seed.ts
```

---

## Multi-tenancy

Данные изолированы по `company_id`. Заголовок `x-company-id` определяет компанию; если не передан — используется `1`.

---

## Cron

`AttendancePenaltyCron` — каждый день в `00:00` финализирует штрафы за вчерашнюю посещаемость.

---

## Полезные команды

```bash
npx prisma studio              # GUI для БД
npx prisma migrate dev --name  # новая миграция
npx prisma db push             # синхронизация без миграции (dev)
```

---

## Конвенции для разработчиков

1. Новый модуль: `src/module/<name>/` — module, controller, service, dto.
2. Защищённые роуты: `@UseGuards(AuthGuard)` + при необходимости `WorkerRolesGuard` / `AdminGuard`.
3. Company scope: декоратор `@CompanyId()`.
4. DTO с `class-validator`; глобальный `ValidationPipe` включён.
5. Ответы через `new ApiResponse(data, status?, pagination?)`.
6. Prisma client: `prisma/generated/prisma`.
