USER_HOME := $(shell echo ~)

build-client:
	cd apps/server/app && pnpm i && pnpm run build

build-server: build-client
	cargo build -p resumemk_server --release

build-cli:
	cargo build -p resumemk_cli --release


install-server: build-server
	./target/release/resumemk_server 

install-cli: build-cli
	cp target/release/resumemk_cli $(USER_HOME)/.local/bin/resumemk
	resumemk --help

