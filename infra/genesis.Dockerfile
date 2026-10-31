# Reproducible source pin; no unverified prebuilt Genesis image is assumed.
FROM rust:1.96-bookworm@sha256:d99f7b31f49909348dc59b51f3c95d1efded1701ffb222f095aaab7de3c4abd8 AS build
ARG GENESIS_COMMIT=2527a8644f4be5d6c1e8722b24e71717e5ca9e4f
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN git init && git remote add origin https://github.com/Freshair129/GenesisBlock.git && git fetch --depth 1 origin "${GENESIS_COMMIT}" && git checkout --detach FETCH_HEAD && test "$(git rev-parse HEAD)" = "${GENESIS_COMMIT}"
RUN cargo build --locked --release --no-default-features --features bins --bin genesis-db-server
COPY infra/genesis/patches/ /patches/
RUN git apply --check /patches/0001-transaction-impact.patch && git apply /patches/0001-transaction-impact.patch
RUN GENESIS_SOURCE_COMMIT=${GENESIS_COMMIT} cargo test --locked --release --no-default-features --test portfolio_transaction_impact_tests
RUN GENESIS_SOURCE_COMMIT=${GENESIS_COMMIT} cargo build --locked --release --no-default-features --features bins --bin genesis-db-server

FROM debian:bookworm-slim@sha256:a3bba7dc7dbcc1f37c2856c51fc9a7fac96608f50cb87b1b4e4d8b8c85ae988e
RUN groupadd --gid 10001 genesis && useradd --uid 10001 --gid genesis --no-create-home genesis && mkdir /data && chown genesis:genesis /data
COPY --from=build /src/target/release/genesis-db-server /usr/local/bin/genesis-db-server
USER genesis
ENV GENESIS_HOST=0.0.0.0 GENESIS_PORT=3000 GENESIS_DATA_DIR=/data
VOLUME ["/data"]
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/genesis-db-server"]
