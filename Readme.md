# TopIT – Intelligent IT Job Portal

**TopIT** là nền tảng tuyển dụng chuyên biệt cho ngành **Công nghệ Thông tin**, được thiết kế với kiến trúc hiện đại, hiệu năng cao và định hướng mở rộng tích hợp AI trong tương lai.

> **Timeline:** Jan 2026 – May 2026  
>  **Author:** Nguyễn Thành Nhân

---

## 📖 Overview

TopIT được xây dựng nhằm giải quyết bài toán kết nối giữa **Doanh nghiệp IT** và **Ứng viên Công nghệ**.

Khác với các cổng việc làm truyền thống, hệ thống tập trung vào:

- Chuẩn hóa **Skillsets (bộ kỹ năng)**
- Tối ưu quá trình **matching ứng viên – công việc**
- Sẵn sàng tích hợp **AI Job Recommendation** trong giai đoạn tiếp theo

---

## System Architecture

Hệ thống áp dụng mô hình **Client–Server** kết hợp với tư duy **Layered Architecture** để đảm bảo:

- Dễ bảo trì (Maintainability)
- Dễ mở rộng (Scalability)
- Phân tách rõ trách nhiệm từng tầng

graph TD
Client[Client Side Angular SPA] -->|HTTP REST API| Gateway[ASP.NET Core Web API]

    subgraph Backend_DotNet_Core
        Gateway --> Controller[Controllers]
        Controller --> Service[Business Logic Layer]
        Service --> Repo[Repository Pattern]
    end

    Repo -->|Entity Framework Core| DB[(SQL Server)]

    subgraph Future_AI_Integration
        Service <-->|REST API| PyService[Python AI Service]
    end

### 🔍 Technical Breakdown

| Layer                    | Responsibility                         | Technology                         |
| ------------------------ | -------------------------------------- | ---------------------------------- |
| **Frontend (SPA)**       | Giao diện người dùng, gọi API          | Angular 16+, TypeScript            |
| **API Layer**            | Xử lý request, authentication, routing | ASP.NET Core Web API               |
| **Business Layer**       | Xử lý nghiệp vụ hệ thống               | Service Layer (.NET)               |
| **Data Access Layer**    | Truy cập dữ liệu qua abstraction       | Repository Pattern + EF Core       |
| **Database**             | Lưu trữ dữ liệu hệ thống               | SQL Server                         |
| **AI Service (Planned)** | Gợi ý việc làm thông minh              | Python (Scikit-learn / TensorFlow) |

---

## Key Features

### Candidate (Ứng viên)

- [x] Đăng ký / Đăng nhập
- [x] Quản lý hồ sơ cá nhân (Profile)
- [ ] Tìm kiếm việc làm theo kỹ năng, từ khóa, mức lương
- [ ] Ứng tuyển và theo dõi trạng thái hồ sơ
- [ ] Tạo CV trực tuyến (CV Builder)

### Recruiter (Nhà tuyển dụng)

- [ ] Đăng tin tuyển dụng
- [ ] Quản lý danh sách tin đăng
- [ ] Xem ứng viên đã ứng tuyển
- [ ] Lọc ứng viên theo kỹ năng

### Admin

- [ ] Quản lý người dùng
- [ ] Quản lý nội dung hệ thống
- [ ] Dashboard thống kê & báo cáo

---

## Future AI Integration (Roadmap)

Trong giai đoạn tiếp theo, hệ thống sẽ tích hợp một **Python AI Service** độc lập để:

- Phân tích CV ứng viên
- Chuẩn hóa dữ liệu kỹ năng
- Gợi ý công việc phù hợp dựa trên mô hình Machine Learning

Điều này giúp TopIT tiến tới mô hình **Intelligent Recruitment Platform**.

---

## 🛠️ Tech Stack

| Category            | Technology            | Notes                                 |
| ------------------- | --------------------- | ------------------------------------- |
| **Backend**         | ASP.NET Core 8        | Web API, DI, Clean Architecture-ready |
| **Frontend**        | Angular 16+           | SPA, RxJS, Angular Material           |
| **Database**        | SQL Server            | Code First với EF Core                |
| **Authentication**  | JWT                   | Secure API Access                     |
| **ORM**             | Entity Framework Core | Repository Pattern                    |
| **Version Control** | Git & GitHub          | Source code management                |
| **AI (Future)**     | Python                | ML-based Job Matching                 |

---

## ⚙️ Installation & Setup

### 🔧 Prerequisites

- .NET SDK 9.0+
- Node.js & npm
- SQL Server

---

### 📥 Clone Repository

```bash
git clone https://github.com/Nhan-Ng3110/TopIT.git
cd TopIT
```

---

### Backend Setup

```bash
cd Backend
dotnet restore
dotnet ef database update   # Initialize database
dotnet run
```

API mặc định chạy tại:  
`https://localhost:5001` hoặc `http://localhost:5000`

---

### 🌐 Frontend Setup

```bash
cd Frontend
npm install
ng serve --open
```

Frontend mặc định chạy tại:  
`http://localhost:4200`

---

## Contact

Nếu bạn quan tâm đến dự án hoặc muốn đóng góp:

- 📧 Email: tnhan31102005@gmail.com
- 💼 LinkedIn: www.linkedin.com/in/thành-nhân-nguyễn-376b79381

---

**Developed with dedication by "Nguyễn Thành Nhân"**
