.DEFAULT_GOAL := test

REACH := $(or $(REACH), ./reach)

reach:
	curl https://docs.reach.sh/reach -o reach ; chmod +x reach

.PHONY: clean
clean:
	rm -rf build/*.mjs

%.txt: %.rsh
	REACH_DEBUG=Y $(REACH) compile --intermediate-files --verify-fail-once $< | tee $@

%.dot.png: %.dot
	dot -Tpng -O $<

.PHONY: build
build: index.txt staker.txt farmAnnouncer.txt limitOrder.txt nettle.txt

APPS := index.net_tok index.tok_tok index.triumvirate staker.main
DOTS := $(patsubst %, build/%.appApproval.dot, $(APPS))

define GEN_RULE
$(dot) : index.txt
endef

$(foreach dot,$(DOTS), \
  $(eval $(GEN_RULE)) \
)

PNGS := $(patsubst %.dot, %.dot.png, $(DOTS))

.PHONY: build-all
build-all: build $(PNGS)

.PHONY: check-index check-staker
check-%: %.txt
	grep "budget of" $< | (! grep -v "of 700")

.PHONY: check
check: check-index check-staker

.PHONY: test
test:
	./test.sh

.PHONY: staker-test
staker-test: staker.txt
	cp build/staker.main.mjs staker/build/index.main.mjs
	REACH_NO_WARN=1 REACH_CONNECTOR_MODE=ALGO reach run staker

.PHONY: farm-announcer-test
farm-announcer-test: staker.txt farmAnnouncer.txt
	REACH_CONNECTOR_MODE=ALGO reach run farmAnnouncer

