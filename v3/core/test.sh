#!/bin/bash -e
export REACH_DOCKER=0
export REACH_DEBUG=Y
REACH=../../reach
if ! [ -f "$REACH" ] ; then
  REACH=./reach
  make reach
fi
if [ "$REACH_CONNECTOR_MODE" = "" ] ; then
  REACH_CONNECTOR_MODE=ALGO
fi
export REACH REACH_CONNECTOR_MODE

if [ "${JUST_RUN}" = "" ] ; then
  echo Building...
  if (which dot) ; then
    make build-all
  else
    make build
  fi
  # make build/index.main.mjs

  echo Checking...
  make check
fi

if [ "${JUST_COMPILE}" = "Y" ] ; then
  exit 0
fi

export REACH_DEBUG=N
set -o pipefail +e
echo Running...
${REACH} run index --- "$@" | tee log
EXIT=$?
sed -i 's/\r//g' log
sed -n 's/^var //p' log > log.sh
source log.sh
echo "${RESULTS_B64}" | base64 -d - > test_results.xml
cat > message.sh <<END
STATUS="${STATUS}"
SUMMARY="${SUMMARY}"
END
grep -v '^var ' log
echo "${STATUS} ${SUMMARY}"
exit "${EXIT}"
