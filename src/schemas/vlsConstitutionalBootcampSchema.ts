import * as Yup from 'yup';

export interface VlsConstitutionalBootcampFormValues {
  name: string;
  mobile: string;
  email: string;
  current_status: string;
  city: string;
  amount: string;
  registered_date: string;
  programm_date: string;
  payment_status: string;
  captured: '' | 'true' | 'false';
  page_name: string;
  ip_address: string;
  utm_source: string;
}

export const vlsConstitutionalBootcampInitialValues: VlsConstitutionalBootcampFormValues = {
  name: '',
  mobile: '',
  email: '',
  current_status: '',
  city: '',
  amount: '',
  registered_date: '',
  programm_date: '',
  payment_status: '',
  captured: '',
  page_name: '',
  ip_address: '',
  utm_source: '',
};

export const vlsConstitutionalBootcampSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(150, 'Name must be 150 characters or fewer')
    .required('Name is required'),
  mobile: Yup.string()
    .trim()
    .max(20, 'Mobile must be 20 characters or fewer')
    .matches(/^[0-9+\-()\s]+$/, 'Use only digits, spaces, +, -, and parentheses')
    .required('Mobile is required'),
  email: Yup.string().trim().email('Enter a valid email').max(255, 'Email must be 255 characters or fewer'),
  current_status: Yup.string().trim().max(80, 'Current status must be 80 characters or fewer'),
  city: Yup.string().trim().max(100, 'City must be 100 characters or fewer'),
  amount: Yup.number()
    .typeError('Amount must be a valid number')
    .min(0, 'Amount cannot be negative')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  registered_date: Yup.string().nullable(),
  programm_date: Yup.string().nullable(),
  payment_status: Yup.string().trim().max(50, 'Payment status must be 50 characters or fewer'),
  captured: Yup.mixed<'' | 'true' | 'false'>().oneOf(['', 'true', 'false']),
  page_name: Yup.string().trim().max(255, 'Page name must be 255 characters or fewer'),
  ip_address: Yup.string().trim().max(45, 'IP address must be 45 characters or fewer'),
  utm_source: Yup.string().trim().max(255, 'UTM source must be 255 characters or fewer'),
});
