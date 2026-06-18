# EmILY (Email Information Log & Yard)

EmILY is a modern, modular monolithic CRM and Marketing Automation platform built with Spring Boot. It provides a robust architecture for managing contacts, securing communications, and automating email workflows with high reliability.

## 🚀 Key Features

- **Modular Monolith Architecture**: Clean separation of concerns with modules for Authentication, Contact Management, and Email Services.
- **Advanced Email System**:
    - Asynchronous email processing using **RabbitMQ**.
    - Scheduled email delivery powered by **Quartz Scheduler**.
    - Support for attachments and HTML templates.
- **Comprehensive Contact Management**: Store, group, and manage customer data with ease.
- **Robust Security**:
    - **JWT (JSON Web Token)** for stateless authentication.
    - **OAuth2 Integration** (Google) for seamless social login.
    - Secure cookie handling and HttpOnly refresh tokens.
- **API Documentation**: Interactive API testing and exploration via **Swagger UI / OpenAPI 3.0**.
- **Resilient Infrastructure**: Integrated with **PostgreSQL** and **Testcontainers** for reliable development and testing environments.

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Language** | Java 25 |
| **Framework** | Spring Boot 4.0.5 |
| **Database** | PostgreSQL |
| **Security** | Spring Security, JWT, OAuth2 (Google) |
| **Messaging** | RabbitMQ (AMQP) |
| **Scheduling** | Quartz Scheduler |
| **Documentation** | SpringDoc OpenAPI (Swagger) |
| **Build Tool** | Maven |
| **Testing** | JUnit 5, Testcontainers, GreenMail, Awaitility |

## 🏗️ Getting Started

### Prerequisites

- **Java 25** or higher
- **Maven 3.9+**
- **Docker** (for running PostgreSQL and RabbitMQ via Testcontainers or Compose)

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```bash
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
MAIL_USERNAME=your_gmail_user
MAIL_PASSWORD=your_gmail_app_password
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

### Installation & Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dheeraj080/EmILY.git
   cd EmILY
   ```

2. **Build the project**:
   ```bash
   mvn clean install
   ```

3. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```
   The application will start on `http://localhost:5000`.

### API Documentation

Once the app is running, you can access the Swagger UI at:
`http://localhost:5000/swagger-ui.html`

## 📁 Project Structure

```text
src/main/java/com/em/emily/
├── auth/       # Authentication & Security (JWT, OAuth2)
├── contact/    # Contact Management logic
├── email/      # Email Service, RabbitMQ Consumer, Quartz Jobs
└── config/     # Global configuration classes
```

## 🧪 Testing

The project uses **Testcontainers** to spin up real PostgreSQL and RabbitMQ instances during testing.

To run tests:
```bash
mvn test
```

## 🚢 Deployment Options

### Option 1: One-Click Deploy to Render
You can deploy the complete stack (Backend, Frontend, Database, and Redis cache) directly to Render in one click:

[![Deploy to Render](https://render.com/images/deploy-to-render.button.svg)](https://render.com/deploy?repo=https://github.com/dheeraj080/EmILY)

*Note: Make sure to change your **Health Check Path** in the Render service settings to `/actuator/health` instead of `/`.*

---

### Option 2: VM Deployment (using Docker Compose)
To run the complete application on a Virtual Machine (like AWS EC2, DigitalOcean, etc.), follow these steps:

1. Install Docker & Docker Compose on your VM:
   ```bash
   sudo apt update && sudo apt install docker.io docker-compose-v2 -y
   ```
2. Clone this repository and create a `.env` configuration file in the root folder:
   ```bash
   git clone https://github.com/dheeraj080/EmILY.git && cd EmILY
   nano .env
   ```
3. Configure your production variables in the `.env` file (e.g. SMTP, OAuth Secrets, and `NEXT_PUBLIC_BACKEND_URL=http://<YOUR_VM_PUBLIC_IP>:5000`).
4. Build and start the entire stack:
   ```bash
   docker compose up -d --build
   ```
The frontend will be accessible at `http://<YOUR_VM_PUBLIC_IP>:3000` and the backend at `http://<YOUR_VM_PUBLIC_IP>:5000`.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
