USER_HOME := $(shell echo ~)

install:
	cargo build --release 
	cp target/release/resumemk $(USER_HOME)/.local/bin/resumemk
	resumemk --help

