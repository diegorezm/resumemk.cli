USER_HOME := $(shell echo ~)

build-client:
	cd app && bun run build

build-server:
	cargo build --release

install: build-client build-server
	cp target/release/resumemk $(USER_HOME)/.local/bin/resumemk
	resumemk --help

