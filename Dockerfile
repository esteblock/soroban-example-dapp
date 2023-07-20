# Based on Preview 7
# https://soroban.stellar.org/docs/reference/releases

FROM ubuntu:20.04

RUN apt update && apt install -y curl

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs > rust_install.sh
RUN sh rust_install.sh -y
RUN echo $PATH
ENV PATH="$PATH:/root/.cargo/bin"
RUN rustup target add wasm32-unknown-unknown

RUN apt install -y build-essential
# WORKDIR /
RUN mkdir /workspace
WORKDIR /workspace
ENV IS_USING_DOCKER=true

RUN apt install -y jq
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash \
    && . ~/.bashrc \
    && nvm install 18 && nvm use 18

ENV NODE_VERSION=18
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN apt update && apt install -y git


## THIS NEXT LINE SHOULD BE THE ONLY ONE TO CHANGE BETWEEN SOROBAN PREVIEWS
RUN cargo install --locked --version 0.9.1 soroban-cli



### What problem does your feature solve?
I want to deploy the contracts.

### What is the problem?
The initialize.sh script forces me to install the pined version with `cargo install_soroban`
However, this breaks with 
```
error: failed to compile `soroban-cli v0.9.1`, intermediate artifacts can be found at `/tmp/cargo-installNUQcAq`

Caused by:
  package `stellar-xdr v0.0.17` cannot be built because it requires rustc 1.70 or newer, while the currently active rustc version is 1.68.2
  Try re-running cargo install with `--locked`

```

### What alternatives are there?

1.- Require (and add it on README requirements) the user to have rustc >= 1.70

2.- Let the user to run everything from a Docker "soroban-preview" container. However, after https://github.com/stellar/soroban-example-dapp/commit/c2924f0463a0358d5eb41e928cd3adee8e97f0d5 the soroban-preview Docker containers does not install an specific soroban-cli version.... wich does not makes too much sense...

The soroban-preview Docker container should have rustc>=1.70 and soroban-cli 0.9.1


## Pull Requests:
I will be opening 2 PR 
(1) in order to document the 1.70 rustc version requirement
(2) in order to add


