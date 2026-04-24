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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
