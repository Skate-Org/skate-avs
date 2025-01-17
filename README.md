## About

Skate AVS utilize Othentic stack [https://docs.othentic.xyz/main/avs-framework/abstract](https://docs.othentic.xyz/main/avs-framework/abstract)

This repo contains Skate AVS components:

1. `/dashboard` - AVS dashboard to track operator activity as well as general AVS details
2. `/extension-contracts` - Hooks to base `AttestationCenter` and `AvsGovernance` contract (in Othentic stack)
3. `/indexer` - Watch AVS operational status and post-process verified data.
4. `/othentic` - Contain CLI set up to initiate `attester` and `aggregator` nodes using Othentic CLI
5. `/performer` - the `performer` node whose reponsibility is retrieve and pre-process tasks from Skate MessageBox
6. `/scripts` - scripts to config the AVS.
7. `/webapi` - Validation services for `attester` to pre-verify attestation result before sending to `aggregator`
