export interface BunqCreateUserResponse {
	Response: BunqCreateUser[];
}

export interface BunqCreateUser {
	ApiKey: {
		api_key: string;
		login_code: string;
		user: {
			UserPerson: UserPerson;
		};
	};
}

export interface UserPerson {
	id: number;
	created: string;
	updated: string;
	status: string;
	sub_status: string;
	public_uuid: string;
	display_name: string;
	public_nick_name: string;
	language: string;
	region: string;
	session_timeout: number;
	daily_limit_without_confirmation_login: {
		currency: string;
		value: string;
	};
	relations: any[];
	alias: UserAlias[];
	avatar: UserAvatar;
	tax_resident: null;
	notification_filters: NotificationFilter[];
	address_main: Address;
	address_postal: Address;
	address_shipping: null;
	first_name: string;
	middle_name: string;
	last_name: string;
	legal_name: string;
	date_of_birth: string;
	place_of_birth: string;
	country_of_birth: string;
	nationality: string;
	all_nationality: string[];
	gender: string;
	version_terms_of_service: string;
	deny_reason: null;
	document_issuing_authority: null;
	document_expiry_date: null;
	document_status: string;
	is_primary_document: boolean;
	customer: Customer;
	customer_limit: CustomerLimit;
	billing_contract: BillingContract[];
	pack_membership: null;
	premium_trial: null;
}

export interface UserAlias {
	type: string;
	value: string;
	name: string;
}

export interface UserAvatar {
	uuid: string;
	image: AvatarImage[];
	anchor_uuid: string;
	style: string;
}

export interface AvatarImage {
	attachment_public_uuid: string;
	height: number;
	width: number;
	content_type: string;
	urls: AvatarImageUrl[];
}

export interface AvatarImageUrl {
	type: string;
	url: string;
}

export interface NotificationFilter {
	notification_delivery_method: string;
	category: string;
}

export interface Address {
	street: string;
	house_number: string;
	postal_code: string;
	city: string;
	country: string;
	province: null;
	extra: null;
	mailbox_name: string | null;
	is_user_address_updated: boolean;
	id: number;
	created: string;
	updated: string;
}

export interface Customer {
	id: number;
	created: string;
	updated: string;
	billing_account_id: number;
	invoice_notification_preference: string;
}

export interface CustomerLimit {
	limit_monetary_account: number;
	limit_monetary_account_remaining: number;
	limit_card_debit_maestro: number;
	limit_card_debit_mastercard: number;
	limit_card_wildcard: number;
	limit_card_debit_wildcard: number;
	limit_card_debit_maestro_virtual_subscription: number;
	limit_card_debit_maestro_virtual_total: number;
	limit_card_debit_mastercard_virtual_subscription: number;
	limit_card_debit_mastercard_virtual_total: number;
	limit_card_replacement: number;
	limit_amount_monthly: null;
	spent_amount_monthly: null;
	limit_card_credit_mastercard: number;
}

export interface BillingContract {
	BillingContractSubscription: {
		id: number;
		created: string;
		updated: string;
		contract_date_start: string;
		contract_date_end: null;
		contract_version: number;
		subscription_type: string;
		subscription_type_downgrade: null;
		status: string;
		sub_status: string;
	};
}

export interface ClientKey {
	private_key_client: string;
	public_key_client: string;
	public_key_client_fmt: string;
}

// Add new interfaces for bunq installation response
export interface BunqInstallationResponse {
	Response: BunqInstallationResponseItem[];
}

export interface BunqInstallationResponseItem {
	Id?: {
		id: number;
	};
	Token?: {
		id: number;
		created: string;
		updated: string;
		token: string;
	};
	ServerPublicKey?: {
		server_public_key: string;
	};
}

export type GenerateSignature = (body: string, privateKey: string) => string;

// Add new interfaces for bunq session response
export interface BunqSessionResponse {
	Response: BunqSessionResponseItem[];
}

export interface BunqSessionResponseItem {
	Id?: {
		id: number;
	};
	Token?: {
		id: number;
		created: string;
		updated: string;
		token: string;
	};
	UserPerson?: UserPerson;
}

export interface BunqAccountResponse {
	Response: BunqAccountResponseItem[];
}

export interface BunqAccountResponseItem {
	Id: {
		id: number;
	};
}

// Webhook Body Interfaces
export interface WebhookBody {
	NotificationUrl: {
		target_url: string;
		category: string;
		event_type: string;
		object: {
			Payment: WebhookPayment;
		};
	};
}

export interface WebhookPayment {
	id: number;
	created: string;
	updated: string;
	monetary_account_id: number;
	amount: {
		currency: string;
		value: string;
	};
	payment_fee: null | any;
	description: string;
	type: string;
	merchant_reference: null | string;
	maturity_date: string;
	alias: WebhookAlias;
	country: string;
	counterparty_alias: WebhookAlias;
	attachment: any[];
	geolocation: null | any;
	batch_id: null | number;
	scheduled_id: null | number;
	address_billing: null | any;
	address_shipping: null | any;
	sub_type: string;
	status: string;
	payment_arrival_expected: {
		status: string;
		time: null | string;
	};
	request_reference_split_the_bill: any[];
	balance_after_mutation: {
		currency: string;
		value: string;
	};
	all_auto_save_entry: any[];
	payment_auto_allocate_instance: null | any;
	payment_suspended_outgoing: null | any;
	bizum_payment: null | any;
}

export interface WebhookAlias {
	iban: string;
	is_light: boolean;
	display_name: string;
	avatar: {
		uuid: string;
		image: WebhookAvatarImage[];
		anchor_uuid: null | string;
		style: string;
	};
	label_user: {
		uuid: string;
		display_name: string;
		country: string;
		avatar: {
			uuid: string;
			image: WebhookAvatarImage[];
			anchor_uuid: null | string;
			style: string;
		};
		public_nick_name: string;
		type: string;
	};
	public_nick_name: string;
	type: string;
}

export interface WebhookAvatarImage {
	attachment_public_uuid: string;
	height: number;
	width: number;
	content_type: string;
	urls: WebhookAvatarImageUrl[];
}

export interface WebhookAvatarImageUrl {
	type: string;
	url: string;
}
