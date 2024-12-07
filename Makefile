USER_HOME := $(shell echo ~)

install:
	cargo run build --release
	cp target/release/resumemk $(USER_HOME)/bin/resumemk
	resumemk --help

