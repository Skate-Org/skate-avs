import { Message, Type, Field } from "protobufjs/light";

@Type.d('AttestationSigProto')
export class AttestationSigProto extends Message<AttestationSigProto> {
  @Field.d(1, 'string', 'required')
  x: string;

  @Field.d(2, 'string', 'required')
  y: string;
}

export class PerformerProto extends Message<PerformerProto> {
  @Field.d(1, 'string', 'required')
  public address: string;

  @Field.d(2, 'string', 'required')
  public signature: string;
}

export class AttesterProto extends Message<AttesterProto > {
  @Field.d(1, 'string', 'required')
  public address: string;

  @Field.d(2, AttestationSigProto, 'required')
  public signature: AttestationSigProto;
}

@Type.d('AttestationProto')
export class AttestationProto extends Message<AttestationProto> {
  @Field.d(1, 'string', 'required')
  public proofOfTask: string;

  @Field.d(2, 'string', 'required')
  public data: string;

  @Field.d(3, PerformerProto, 'required')
  public performer: PerformerProto;

  @Field.d(4, AttesterProto, 'required')
  public attester: AttesterProto;

  @Field.d(5, 'bool', 'required')
  public isApproved: boolean;

  @Field.d(6, 'uint32', 'required')
  public definitionId: number;
}

@Type.d('TaskProto')
export class TaskProto extends Message<TaskProto> {
  @Field.d(1, 'string', 'required')
  public signature: string;

  @Field.d(2, 'string', 'required')
  public performer: string;

  @Field.d(3, 'string', 'required')
  public proofOfTask: string;

  @Field.d(4, 'string', 'required')
  public data: string;

  @Field.d(5, 'uint32', 'required')
  public definitionId: number;
}

@Type.d('TaskSubmittedProto')
export class TaskSubmittedProto extends Message<TaskSubmittedProto> {
  @Field.d(1, 'string', 'required')
  public taskId: string;

  @Field.d(2, 'string', 'required')
  public txHash: string;

  @Field.d(3, 'string', 'required')
  public performerAddress: string;
  
  @Field.d(4, 'uint32', 'repeated')
  public operatorIds: string;

  @Field.d(5, 'uint32', 'required')
  public definitionId: string;

  @Field.d(6, 'bool', 'required')
  public isApproved: boolean;

}

@Type.d('CustomMessageProto')
export class CustomMessageProto extends Message<CustomMessageProto> {
  @Field.d(1, 'string', 'required')
  public data: string;
}

