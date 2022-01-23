FROM maven:3.8.2-openjdk-17-slim AS build
WORKDIR /app/
COPY ./src ./src
COPY ./pom.xml ./
RUN mvn --batch-mode --update-snapshots -f ./pom.xml package

FROM openjdk:17-slim
WORKDIR /usr/local/lib/
COPY --from=build /app/target/backend.jar ./app.jar
COPY ./wait-for-it.sh /usr/local/lib/wait-for-it.sh
RUN chmod +x /usr/local/lib/wait-for-it.sh
EXPOSE 8080
#ENTRYPOINT ["java", "--enable-preview", "-jar", "/usr/local/lib/app.jar"]
