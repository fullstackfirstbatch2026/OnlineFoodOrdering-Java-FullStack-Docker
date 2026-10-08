# Stage 1: Build the application using Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to speed up future builds
RUN mvn dependency:go-offline

COPY src ./src
# Build the JAR file, skipping tests for faster build
RUN mvn clean package -DskipTests

# Stage 2: Run the application using a lightweight JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy the built JAR from the previous stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]