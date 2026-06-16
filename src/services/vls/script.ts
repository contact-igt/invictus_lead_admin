export interface VlsLawPractice {
    id: number;
    name: string;
    mobile: string;
    email: string;
    amount: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    payment_status: string;
    captured: number;
    created_at: string;
    updated_at: string;
}

export interface VlsPropertyLaw {
    id: number;
    name: string;
    mobile: string;
    email: string;
    years_of_practice: string | null;
    amount: string | null;
    programm_date: string | null;
    registered_date: string;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    razorpay_signature: string | null;
    payment_status: 'paid' | 'attempted' | 'failed' | 'cancelled';
    page_name: string | null;
    ip_address: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
    created_at: string;
    updated_at: string;
}

export interface VlsFamilyLaw {
    id: number;
    name: string;
    mobile: string;
    email: string;
    years_of_practice: string | null;
    amount: string | null;
    programm_date: string | null;
    registered_date: string;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    razorpay_signature: string | null;
    payment_status: 'paid' | 'attempted' | 'failed' | 'cancelled';
    page_name: string | null;
    ip_address: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
    created_at: string;
    updated_at: string;
}

export interface VlsAibe {
    id: number;
    name: string;
    mobile: string;
    email: string;
    amount: string;
    registered_date: string;
    programm_start_date: string;
    programm_end_date: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    payment_status: string;
    captured: number;
    ip_address: string,
    utm_source: string,
    created_at: string;
    updated_at: string;
}
