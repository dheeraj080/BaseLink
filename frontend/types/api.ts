export interface RoleDTO {
  id?: string;
  name?: string;
}

export interface UserDTO {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  image?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  provider?: 'LOCAL' | 'GOOGLE' | 'GITHUB' | 'FACEBOOK';
  roles?: RoleDTO[];
}

export interface EmailTemplate {
  id?: string;
  name?: string;
  subject?: string;
  content?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contact {
  id?: string;
  name?: string;
  email: string;
  phoneNo?: string;
  description?: string;
  userId?: string;
  selected?: boolean;
  groups?: ContactGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactGroup {
  id?: string;
  name?: string;
  description?: string;
  userId?: string;
  contacts?: Contact[];
  createdAt?: string;
}

export interface EmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  body: string;
}

export interface BulkSelectionRequest {
  contactIds?: string[];
  selected?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface TokenResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  user?: UserDTO;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface EventRequest {
  emailId?: number;
  eventType?: 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'UNSUBSCRIBED' | 'BOUNCED' | 'SPAM_COMPLAINT';
  recipient?: string;
}

export interface EmailLog {
  id?: number;
  recipient: string;
  subject: string;
  status?: 'PENDING' | 'SENT' | 'FAILED' | 'RETRYING';
  createdAt?: string;
  sentAt?: string;
  errorMessage?: string;
}

export interface AnalyticsStatsDto {
  totalSent?: number;
  totalDelivered?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalUnsubscribed?: number;
  totalBounced?: number;
  totalSpamComplaints?: number;
  openRate?: number;
  clickThroughRate?: number;
  clickToOpenRate?: number;
  unsubscribeRate?: number;
  bounceRate?: number;
  deliveryRate?: number;
  spamComplaintRate?: number;
}
