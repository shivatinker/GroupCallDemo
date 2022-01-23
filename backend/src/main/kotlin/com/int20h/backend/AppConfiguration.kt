package com.int20h.backend

import mu.KotlinLogging
import org.kurento.client.KurentoClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class AppConfiguration {
    private val log = KotlinLogging.logger {}

    @Bean
    fun kurentoClient(): KurentoClient {
        val env = System.getenv("MEETALL_COMPOSE")
        log.warn("Env: $env")
        return if (env != null) {
            KurentoClient.create("ws://kurento:8888/kurento")
        }
        else
            KurentoClient.create("ws://localhost:8888/kurento")
    }

    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
            }
        }
    }
}
