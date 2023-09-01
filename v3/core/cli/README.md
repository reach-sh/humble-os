XXX Krystof --- This program should be rearranged to get its arguments/etc from
environment variables. It will be way simpler.

# COMMANDS
+ announcer [ KEY="...my mnemonic" [ ANNOUNCER=XXX... ] ]
+ listener ANNOUNCER=XXX... [ KEY="...my mnemonic" ]
+ manager ANNOUNCER=XXX... [ KEY="...my mnemonic" ]
+ pool-admin ANNOUNCER=XXX... [ KEY="...my mnemonic" ]
+ token-funder ANNOUNCER=XXX... [ KEY="...my mnemonic" ]

## CREATE ANNOUNCER CONTRACT

$ ./run.sh announcer [ KEY="...my mnemonic" [ ANNOUNCER=XXX... ]]

Create a Pool Announcer contract. If provided, `KEY` will be used to
create the contract. The value passed to `KEY` *must* be wrapped in
quotes `""` or only the first word will be treated as the mnemonic.

If the ANNOUNCER key is passed, it will be treated as an existing
contract, and you'll choose what Participant should attach to it
(Announcer-Manager or Listener). You can also choose to run the
TOKEN_FUNDER Participant instead.

## CREATE ANNOUNCER LISTENER

$ ./run.sh listener ANNOUNCER=XXX... [ KEY="...my mnemonic"]

Create and attach a Pool LISTENER to an existing "ANNOUNCER" contract. The
LISTENER will announce the creation of any pools to the front-end.

## CREATE TOKEN FUNDER

$ ./run.sh token-funder ANNOUNCER=XXX... [ KEY="...my mnemonic"]

Create a TOKEN_FUNDER. The TOKEN_FUNDER will create a pair of tokens and fund
a specified address (or its own if none is specified).

## CREATE ANNOUNCER MANAGER

$ ./run.sh manager ANNOUNCER=XXX... [ KEY="...my mnemonic"]

Create a MANAGER, who will announce the creation of new pools to the supplied
ANNOUNCER contract.

## CREATE POOL ADMIN

$ ./run.sh pool-admin ANNOUNCER=XXX... [ KEY="...my mnemonic"]

Create a POOL ADMIN, who will create a pool (token pair)

