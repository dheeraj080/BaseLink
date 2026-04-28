package com.em.emily.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;
import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    private volatile ProxyManager<byte[]> proxyManager;
    private final Map<String, Bucket> localFallbackCache = new ConcurrentHashMap<>();
    private boolean useRedis = true;

    public Bucket resolveBucket(String key) {
        BucketConfiguration configuration = BucketConfiguration.builder()
                .addLimit(Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1))))
                .build();

        if (useRedis) {
            try {
                if (proxyManager == null) {
                    synchronized (this) {
                        if (proxyManager == null) {
                            RedisClient redisClient = RedisClient.create("redis://" + redisHost + ":" + redisPort);
                            // Verify connection eagerly to trigger exception if Redis is down
                            redisClient.connect().close();
                            this.proxyManager = LettuceBasedProxyManager.builderFor(redisClient)
                                    .withExpirationStrategy(ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofSeconds(10)))
                                    .build();
                        }
                    }
                }
                return proxyManager.builder().build(key.getBytes(), configuration);
            } catch (Exception e) {
                useRedis = false;
                System.err.println("Redis connection failed for RateLimitingService. Falling back to in-memory. Error: " + e.getMessage());
            }
        }

        return localFallbackCache.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1))))
                .build());
    }
}

