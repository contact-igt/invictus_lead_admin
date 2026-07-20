import * as Yup from 'yup';
import { SHANTI_EYE_TECH_SERVICES } from 'components/sections/shantiEyeTech/shantiEyeTechUtils';

export interface ShantiEyeTechFormValues {
  name: string;
  mobile_number: string;
  service: string;
  message: string;
  ip_address: string;
  utm_source: string;
}

export const shantiEyeTechInitialValues: ShantiEyeTechFormValues = {
  name: '',
  mobile_number: '',
  service: '',
  message: '',
  ip_address: '',
  utm_source: '',
};

export const shantiEyeTechSchema = Yup.object({
  name: Yup.string().trim().max(150, 'Name must be 150 characters or fewer').required('Name is required'),
  mobile_number: Yup.string()
    .trim()
    .max(20, 'Mobile number must be 20 characters or fewer')
    .matches(/^[0-9+\-()\s]+$/, 'Use only digits, spaces, +, -, and parentheses')
    .required('Mobile number is required'),
  service: Yup.string()
    .trim()
    .nullable()
    .oneOf([...SHANTI_EYE_TECH_SERVICES, '', null], 'Please select a valid service'),
  message: Yup.string().trim().max(5000, 'Message must be 5000 characters or fewer'),
  ip_address: Yup.string().trim().max(45, 'IP address must be 45 characters or fewer'),
  utm_source: Yup.string().trim().max(255, 'UTM source must be 255 characters or fewer'),
});
