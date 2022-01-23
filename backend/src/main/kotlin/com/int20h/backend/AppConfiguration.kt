package com.int20h.backend

import org.kurento.client.KurentoClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class AppConfiguration {
    @Bean
    fun kurentoClient(): KurentoClient {
//        return KurentoClient.create("ws://kurento:8888/kurento")
        return KurentoClient.create("ws://localhost:8888/kurento")
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
