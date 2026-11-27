# Connecting OfficeFlow to the existing Django backend

The preview is a complete frontend demo using fictional, in-memory data. No Django source, database, user accounts, credentials or uploaded documents were imported or replaced. Changes survive page navigation but reset on refresh.

## Detected source capabilities

The archive uses Django, Django REST Framework model viewsets, Django auth users, QR attendance (`qrcode`) and PDF payslips (`reportlab`). Models are Department, Role, Employee, Attendance, Leave and Payroll. The archive also includes template-based attendance, leave review, payroll, heuristic attrition, keyword resume screening and deterministic chatbot endpoints. No record or user export was supplied; this is deliberately not a data migration.

## API adapter

`src/services/django-api.ts` exposes list, detail, create, update and delete methods for `employees`, `departments`, `roles`, `attendance`, `payroll` and `leaves`. Pass the deployed API root ending in `/api` and an explicit authentication-header callback. UI does not invoke it in demo mode.

Before enabling live mode:

1. Supply your deployed Django URL, configure HTTPS and CORS for the frontend origin, and confirm your authentication mechanism. For session auth configure CSRF correctly, secure cookies and permissions; for tokens pass a runtime header callback. Never commit secrets.
2. Employee API fields are `first_name`, `last_name`, `dept`, `role`, `salary`, `bonus`, `phone`, `hire_date`, `leave_balance`, and `user`. Its current serializer makes `dept` and `role` read-only string-related fields. Add explicit writeable relationship IDs before connecting employee creation or editing. Demo email and employment status are UI-only fields absent from the supplied model.
3. Map attendance statuses Present/Absent to P/A, and leave statuses to Pending/Approved/Rejected. Frontend display uses actual department and role names; backend writes require valid IDs.
4. Do not approve leave through an unrestricted generic PATCH: the source template approval endpoint handles balances while the model viewset does not. Provide authenticated transactional leave review endpoints that update balances once and enforce role permissions and record ownership.
5. Preserve the source `/generate-qr/`, `/mark-attendance-qr/`, `/payslip/<id>/`, `/chatbot/`, `/resume/`, `/generate-payroll/` and leave endpoints, or implement matching authenticated JSON contracts. The demo QR modal simulates a check-in and does not scan a camera. TXT uploads and pasted resume text are supported; PDF/DOCX extraction needs a backend contract.
6. Correct the source payroll query to scope attendance by employee and payroll month. It currently counts every present attendance record and assumes 30 days. The demo shows the divisor transparently and estimates only its seeded records, not actual monthly payroll.
7. Verify authentication, per-user authorization, pagination, errors, CRUD, employee creation, leave approval and balance consistency, actual attendance, payroll generation and real PDF downloads before switching modes. The source's fallback to the first employee for unauthenticated requests must not be used for live data.

No backend URL, live authentication or real records are available in this request; live integration remains unverified. Existing Django capabilities are retained and untouched, not replaced with a new backend.
