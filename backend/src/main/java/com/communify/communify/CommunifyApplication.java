package com.communify.communify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CommunifyApplication {

	public static void main(String[] args) {
		SpringApplication.run(CommunifyApplication.class, args);
	}

}