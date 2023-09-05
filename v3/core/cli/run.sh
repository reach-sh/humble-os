#!/bin/sh

export COMMAND=$1
export ANNOUNCER=1
export REACH_CONNECTOR_MODE=ALGO

exec node --experimental-modules --unhandled-rejections=strict index.mjs
