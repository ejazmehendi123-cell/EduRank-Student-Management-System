package com.studentmanagement;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class StudentManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudentManagementApplication.class, args);
    }

    @Bean
    public CommandLineRunner readyLogger() {
        return args -> {
            System.out.println("\n" +
                "================================================================================\n" +
                "  🎓 STUDENT MANAGEMENT SYSTEM BACKEND READY!\n" +
                "================================================================================\n" +
                "  👉 REST API Endpoint:   http://localhost:8081/api/v1\n" +
                "  👉 Web Application:     http://localhost:8082\n" +
                "  👉 Database (Postgres): localhost:5434\n" +
                "================================================================================\n");
        };
    }
}


