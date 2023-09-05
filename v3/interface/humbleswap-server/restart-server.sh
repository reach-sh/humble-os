#!/bin/bash

# Clear pm2 logs and restart instance
~/.linuxbrew/bin/pm2 flush && ~/.linuxbrew/bin/node ~/.linuxbrew/bin/pm2 restart all --update-env