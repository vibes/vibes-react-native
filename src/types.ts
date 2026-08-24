export interface DeviceResponse {
  device_id?: string;
}

export interface DeviceInfoResponse extends DeviceResponse {
  push_token?: string;
}

export interface PersonResponse {
  person_key?: string;
  external_person_id?: string;
}

export interface AssociatePersonResponse {
  externalPersonId: string;
  status: string;
}

export interface InboxMessage {
  content?: string;
  created_at?: string;
  expires_at?: string;
  message_uid?: string;
  read?: boolean;
  subject?: string;
  detail?: string;
  collapse_key?: string;
  apprefdata?: any;
  images?: any;
  inbox_custom_data: any;
}
