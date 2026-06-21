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

    public enum BucketType {
        GENERAL(60, Duration.ofMinutes(1)),
        AUTH_TOTP(5, Duration.ofMinutes(5));

        private final int capacity;
        private final Duration duration;

        BucketType(int capacity, Duration duration) {
            this.capacity = capacity;
            this.duration = duration;
        }

        public int getCapacity() { return capacity; }
        public Duration getDuration() { return duration; }
    }

    public Bucket resolveBucket(String key) {
        return resolveBucket(key, BucketType.GENERAL);
    }

    public Bucket resolveBucket(String key, BucketType type) {
        BucketConfiguration configuration = buildConfiguration(type);
        String storageKey = type.name() + ":" + key;

        if (useRedis) {
            try {
                if (proxyManager == null) {
                    synchronized (this) {
                        if (proxyManager == null) {
                            RedisClient redisClient = RedisClient.create("redis://" + redisHost + ":" + redisPort);
                            redisClient.connect().close();
                            this.proxyManager = LettuceBasedProxyManager.builderFor(redisClient)
                                    .withExpirationStrategy(ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofSeconds(10)))
                                    .build();
                        }
                    }
                }
                return proxyManager.builder().build(storageKey.getBytes(), configuration);
            } catch (Exception e) {
                useRedis = false;
                System.err.println("Redis connection failed for RateLimitingService. Falling back to in-memory. Error: " + e.getMessage());
            }
        }

        return localFallbackCache.computeIfAbsent(storageKey,
                k -> Bucket.builder()
                        .addLimit(Bandwidth.classic(type.getCapacity(), Refill.greedy(type.getCapacity(), type.getDuration())))
                        .build());
    }

    /**
     * Builds a {@link BucketConfiguration} for the given {@link BucketType}.
     * Centralises the rate-limit parameters so they cannot drift between the
     * Redis-backed and in-memory fallback paths.
     */
    private BucketConfiguration buildConfiguration(BucketType type) {
        return BucketConfiguration.builder()
                .addLimit(Bandwidth.classic(type.getCapacity(), Refill.greedy(type.getCapacity(), type.getDuration())))
                .build();
    }
}

