# EmILY (Email Intelligence & List Yielder)

EmILY is a modular Spring Boot application designed for sophisticated contact management and email automation. Built as a modular monolith, it provides a robust foundation for CRM features, scheduled email delivery, and asynchronous message processing.

## 🚀 Key Features

- **Modular Monolith Architecture**: Clean separation of concerns between core domains (Auth, Contact, Email, Analytics).
- **Contact Management (CRM)**: Efficiently manage contacts, groups, and classifications.
- **Asynchronous Email Processing**: Leverages **RabbitMQ** for reliable, non-blocking email delivery.
- **Scheduled Tasks**: Integrated with **Quartz Scheduler** for managing complex timing and recurring email campaigns.
- **Secure Authentication**: Robust security layer featuring **JWT (JSON Web Tokens)** and **OAuth2 (Google login support)**.
- **Interactive API Documentation**: Full **Swagger/OpenAPI** integration for easy API exploration.
- **Containerized Infrastructure**: Ready-to-use Docker configuration for PostgreSQL and RabbitMQ.

## 🛠️ Tech Stack

- **Framework**: Spring Boot 3.x / 4.x
- **Language**: Java 25 (Latest JDK features)
- **Database**: PostgreSQL (Persistence), H2 (Testing)
- **Messaging**: RabbitMQ (AMQP)
- **Scheduling**: Quartz Scheduler
- **Security**: Spring Security, JWT, OAuth2
- **Documentation**: SpringDoc OpenAPI
- **Build Tool**: Maven
- **Infrastructure**: Docker & Docker Compose

## 📦 Project Structure

```text
src/main/java/com/em/Emily/
├── analytics/  # Insights and tracking listeners
├── auth/       # Authentication, JWT, and Security config
├── config/     # General application configuration
├── contact/    # CRM module: Contacts, Groups, and DTOs
└── email/      # Email module: Consumers, Services, and Quartz jobs
```

## 🚦 Getting Started

### Prerequisites

- **Java 25** or higher
- **Maven 3.9+**
- **Docker & Docker Compose**

### Setup Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/EmILY.git
   cd EmILY
   ```

2. Create a `.env` file in the root directory (refer to `application.properties` for required variables):
   ```env
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password
   RABBITMQ_USER=guest
   RABBITMQ_PASSWORD=guest
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   ```

### Running with Docker

Start the infrastructure (PostgreSQL, RabbitMQ):
```bash
docker-compose up -d
```

### Running the Application

Use the Maven wrapper to start the Spring Boot app:
```bash
./mvnw spring-boot:run
```

The application will be available at `http://localhost:5000`.

## 📖 API Documentation

Once the application is running, you can access the interactive Swagger UI at:
- **Swagger UI**: `http://localhost:5000/swagger-ui/index.html`
- **OpenAPI Docs**: `http://localhost:5000/v3/api-docs`

## 🧪 Testing

The project uses **Testcontainers** for integration testing with real database and messaging instances.

Run tests using Maven:
```bash
./mvnw test
```

---
Built with ❤️ by the EmILY Team.
