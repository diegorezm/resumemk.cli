USER_HOME := $(shell echo ~)

build-client:
	cd apps/server/app && npm ci && npm run build

build-server: build-client
	cargo build -p resumemk_server --release

build-cli:
	cargo build -p resumemk_cli --release


install-server: build-server
	cp target/release/resumemk_server $(USER_HOME)/.local/bin/resumemk_server
	resumemk_server

install-cli: build-cli
	cp target/release/resumemk_cli $(USER_HOME)/.local/bin/resumemk
	resumemk --help

