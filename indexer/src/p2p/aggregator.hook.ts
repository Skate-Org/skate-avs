// @ts-ignore
import { Libp2pOptions, RPC } from 'libp2p';
// @ts-ignore
import { AddrInfo } from '@chainsafe/libp2p-gossipsub';
// @ts-ignore
import type { AddrInfo, GossipSub, RPC } from '@chainsafe/libp2p-gossipsub';
import { TaskProto, TaskSubmittedProto } from './dto';

import { updateAvsTask } from '../common/db/avs.task';
import { MODE } from '../common/env';


const BOOTSTRAP_ID: string = "12D3KooWLvCJRgZBraadPPtEMcBSFVeK3uQWxq5LS2wgmSAS1G6q";
const BOOTSTRAP_ADDR: string = `/ip4/127.0.0.1/tcp/9876/p2p/${BOOTSTRAP_ID}`;
export enum P2PTopic {
  ATTESTATION = 'othentic.p2p.attest',
  TASK = 'othentic.p2p.task',
  TASK_SUBMITTED = 'othentic.p2p.task_submitted',
  CUSTOM_MESSAGE = 'othentic.p2p.custom_message'
}

async function startNode(): Promise<void> {
  const { createLibp2p } = await import('libp2p');
  const { tcp } = await import('@libp2p/tcp');
  const { yamux } = await import('@chainsafe/libp2p-yamux');
  const { gossipsub } = await import('@chainsafe/libp2p-gossipsub');
  const { pubsubPeerDiscovery } = await import('@libp2p/pubsub-peer-discovery');
  const { identify } = await import('@libp2p/identify');
  const { multiaddr } = await import('@multiformats/multiaddr');
  const { peerIdFromString } = await import("@libp2p/peer-id");
  const { noise } = await import('@libp2p/noise');

  const peers = [BOOTSTRAP_ADDR];
  const peerAddrs = await Promise.all(peers.map(async (addr: string) => {
    const multi = multiaddr(addr);
    const multiAddrString = multi.getPeerId();
    if (!multiAddrString) {
      return;
    }

    const peer: AddrInfo = {
      id: peerIdFromString(multiAddrString),
      addrs: [multi]
    };

    return peer;
  }))
  const directPeers = peerAddrs.filter((a: AddrInfo | undefined) => !!a)

  const opts: Libp2pOptions = {
    start: false,
    addresses: {
      listen: [`/ip4/0.0.0.0/tcp/0`]
    },
    transports: [tcp()],
    streamMuxers: [yamux()],
    peerDiscovery: [pubsubPeerDiscovery({
      interval: 100
    })],
    services: {
      pubsub: gossipsub({
        allowPublishToZeroPeers: true,
        emitSelf: true,
        directPeers,
      }),
      identify: identify()
    },
    // @ts-ignore
    connectionEncryption: [noise()]
    // TODO: persistent data store
  };


  const node = await createLibp2p(opts);

  // Start the libp2p node
  await node.start();
  console.log(`Node started with id: ${node.peerId.toString()}`);
  console.log(`Listening on: ${node.getMultiaddrs().map((addr: any) => addr.toString()).join(', ')}`);
  node.addEventListener('peer:connect', async (evt: CustomEvent) => {
    const peer = evt.detail;
    console.log(`Connected to peer: ${peer.toString()}`);
  });

  // @ts-ignore
  const pubsub: GossipSub = node.services.pubsub;

  for (const peer of await node.peerStore.all()) {
    try {
      const peerAddress = peer.addresses.at(0);
      console.log("Boostrap peer", peerAddress)
      if (!peerAddress) {
        console.warn(`Peer ${peer.id} has no valid address`);
        continue;
      }
      await node.dial(peerAddress.multiaddr);
      pubsub.direct.add(peer.id.toString());
    } catch (error) {
      console.warn(`Failed to connect to peer ${peer.id}: ${error}`);
    }
  }


  const TOPIC = P2PTopic.TASK
  console.log(`Subscribed to topic: ${TOPIC}`);
  pubsub.subscribe(TOPIC);
  pubsub.addEventListener('message', async (message: CustomEvent<RPC.Message>) => {
    const { topic, data } = message.detail;
    switch (topic) {
      case P2PTopic.TASK_SUBMITTED:
        const submissionDetails = TaskSubmittedProto.decode(data);
        const { operatorIds, taskId, isApproved, txHash, definitionId, performerAddress } = submissionDetails;
        console.log(submissionDetails)
        await updateAvsTask(MODE, { taskId: Number(taskId) }, {
          attesterIds: operatorIds.split(','),
          isApproved,
          taskDefinitionId: Number(definitionId),
          performer: performerAddress,
          txHash
        })
        if (isApproved) {
          // TODO: From avsTaskId, find relevant off-chain tasks and match them with.
        }
        break;
      case P2PTopic.TASK:
        const taskDetails = TaskProto.decode(data);
        console.log(taskDetails)
        break;
      case P2PTopic.ATTESTATION:
    }
  });
}

startNode().catch(err => {
  console.error("Error starting the libp2p node:", err);
});

