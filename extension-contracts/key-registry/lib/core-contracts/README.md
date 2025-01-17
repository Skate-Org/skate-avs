# Othentic

Othentic is a self-deploy infrastructure to spin up AVSs.

Check the Othentic Docs for more details - https://othentic.gitbook.io/main

# Network Management

Please check out the `src/NetworkManagement` folder to see contracts that allow new networks to perform together with EigenLayer.
![image (12)](https://othentic.gitbook.io/~gitbook/image?url=https%3A%2F%2F740349061-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FOU9BNZyLM0Zg4ujkq3Zn%252Fuploads%252FZVjdrZiFWxuhgLyXYv7c%252FAbstract---high-level%2520%282%29.png%3Falt%3Dmedia%26token%3D7386b3f5-abe6-4432-ad20-0c3b235dee04&width=768&dpr=4&quality=100&sign=e90c2bc7&sv=1)

## AVS Structure on Othentic Protocol

Othentic Stack allows AVS developers to focus on their unique business logic (while ignoring the common technical issues), abstracting away low-level infrastructure details, where AVS developers focus only on implementing the two bussines actors (of AVSs) "Performer" and "Attester" (together they are the validator). While the Performer and Attester bussines-logics are contained by off-chain applications, in this repository we are focusing on the on-chain components, hence will not get into the technical details about the framework but consider its two subject components as the actions takers in the stack (activating the protocol's smart contracts).


In this section we explain how running AVS network on Othentic Stack should looks like by structure. We describe the different components, the dependencies, and how they interact with each other.

### How does AVS Network Works?

Each validator owns a private key related to the restaked value (and delegated stakes value) tokens, giving them the corresponding voting power and also putting them at risk of slashing and penalties for bad behavior. In Othentic Stack, developers focus on the logic of "Tasks" that are executed by the network's validators. Performers are the actors who actually "do" the tasks, and the attesters vote for good or bad work.

The network's governance is implemented by ```AvsGovernance```, which is the endpoint for network members' management and deposits, etc. The network has the ability to control stake tokens, depending on the performance of tasks, and vote against bad acting. That kind of votes are managed by ```AttestationCenter```. This contract should know everything about the tasks and their operators, including their stakes etc.

From costs and availability goals, we separate ```AvsGovernance``` and ```AttestationCenter``` by running in different networks, Layer 1 and Layer 2 (respectively), and hence their interactions are "hard" (not on-chain native). Hence we use LayerZero for exchanging messages between each other. We implemented that ```L1MassageHandler``` and ```L2MassageHandler``` where ```L1MassageHandler``` interacts directly with ```AvsGovernance``` and ```L2MassageHandler``` interacts directly with ```AttestationCenter```. We send passing message from Layer 2 to Layer 1 by: ```L2MassageHandler.sendMessage(payload)``` -> ```L1MassageHandler.receive(payload)``` and the other way.


## Prerequisites

In this sub-section we install our command line tool ```othentic-cli``` that uses for networks deployments and more, and set-up the environment variables that are required before deploying new AVS network.

The steps we following is this section:
1. ```othentic-cli``` installation
1. environment variables setup
1. pre-deployed token (address)
1. AVS network on-chain deployment

### Install othentic-cli

Install using npm:
```
npm i -g @othentic/othentic-cli
```

After installtion done verify installation by the command
```
othentic-cli
```

The outcome should be
```
Usage: main [options] [command]

Options:
  -h, --help        display help for command

Commands:
  node <type>
  network <action>
  help [command]    display help for command
```


## Layer 1 Components

The Layer 1 part, consists of the following contract deployments:
1. ```AvsGovernance``` is governence contract of the AVS. 


## Layer2 Components

The Layer 2 part, consists of the following contract deployments:
1. ```AttestationCenter``` is a contract on Layer 2 that is manage tasks of the AVS validators. It informed by the validators about historical tasks executions and votes
1. ```OBLS``` is the contract that implements multisig operations
1. ```BN256G2``` is a cryptographic logical contract that used by ```OBLS```.

## Inter-Layer Communications
1. ```l1MessageHandler``` is an endpoint for communication with Layer 2 components. When activate it act like a router and also a broadcast for Layer 2.
1. ```l2MessageHandler``` this contract is the completment contract to ```l1MessageHandler``` that were discussed on previous section, that is an endpoint for communication with Layer 1 components
