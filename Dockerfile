# ---- build stage ----
FROM eclipse-temurin:25-jre-alpine AS builder
WORKDIR /app

COPY target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract --destination target/extracted

# ---- runtime stage ----
FROM eclipse-temurin:25-jre-alpine AS runtime
WORKDIR /app

# Ensure we have a system group/users
RUN addgroup -S spring && adduser -S spring -G spring

# Copying layers
COPY --from=builder --chown=spring:spring /app/target/extracted/dependencies/ ./
COPY --from=builder --chown=spring:spring /app/target/extracted/spring-boot-loader/ ./
COPY --from=builder --chown=spring:spring /app/target/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=spring:spring /app/target/extracted/application/ ./

USER spring:spring

EXPOSE 5000

ENTRYPOINT ["java", \
  "-XX:TieredStopAtLevel=1", \
  "-XX:+UseContainerSupport", \
  "org.springframework.boot.loader.launch.JarLauncher"]