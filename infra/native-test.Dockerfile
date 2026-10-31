# Real Linux qualification: the exact shipped native executable runs in a fresh
# test-only data directory, using the same REST/restart suite as Windows.
FROM portfolio-genesis:2527a864-portfolio-impact-v1 AS native
FROM portfolio-api:local
USER root
COPY --from=native /usr/local/bin/genesis-db-server /usr/local/bin/genesis-db-server
RUN mkdir -p /app/server/genesis/.runtime && chown node:node /app/server/genesis/.runtime
USER node
ENV GENESIS_NATIVE_TEST=1 \
    GENESIS_NATIVE_BINARY=/usr/local/bin/genesis-db-server \
    GENESIS_NATIVE_SOURCE_COMMIT=2527a8644f4be5d6c1e8722b24e71717e5ca9e4f \
    OLLAMA_BASE_URL=http://host.docker.internal:11434 \
    GENESIS_NATIVE_REPORT=/evidence/native-linux.json
CMD ["node", "--test", "tests/genesis-native.test.mjs"]
