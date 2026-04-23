package com.em.emily.email.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter; // Note the name change
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE = "email.exchange";
    public static final String QUEUE = "email.queue";
    public static final String ROUTING_KEY = "email.route";
    public static final String TRANSACTIONAL_QUEUE = "email.transactional.queue";
    public static final String TRANSACTIONAL_ROUTING_KEY = "email.transactional.route";

    @Bean
    public MessageConverter jsonMessageConverter() {
        // Use JacksonJsonMessageConverter for Jackson 3
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue queue() {
        return new Queue(QUEUE);
    }

    @Bean
    public Queue transactionalQueue() {
        return new Queue(TRANSACTIONAL_QUEUE);
    }

    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public Binding transactionalBinding(Queue transactionalQueue, DirectExchange exchange) {
        return BindingBuilder.bind(transactionalQueue).to(exchange).with(TRANSACTIONAL_ROUTING_KEY);
    }
}