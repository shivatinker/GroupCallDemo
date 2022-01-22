package com.int20h.backend

import org.kurento.client.KurentoClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AppConfiguration {
    @Bean
    fun kurentoClient(): KurentoClient {
        return KurentoClient.create()
    }
}
