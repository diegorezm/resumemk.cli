USER_HOME := $(shell echo ~)

build:
	cargo build -p resumemk_cli --release

install: build
	cp target/release/resumemk_cli $(USER_HOME)/.local/bin/resumemk
	resumemk --help
