import * as Yup from 'yup';
import { PHOENIX_FITNESS_BRANCHES } from 'components/sections/phoenixFitness/phoenixFitnessUtils';

export interface PhoenixFitnessFormValues {
  name: string;
  mobile_number: string;
  branch: string;
  ip_address: string;
  utm_source: string;
}

export const phoenixFitnessInitialValues: PhoenixFitnessFormValues = {
  name: '',
  mobile_number: '',
  branch: '',
  ip_address: '',
  utm_source: '',
};

export const phoenixFitnessSchema = Yup.object({
  name: Yup.string().trim().max(150, 'Name must be 150 characters or fewer').required('Name is required'),
  mobile_number: Yup.string().trim().max(20, 'Mobile number must be 20 characters or fewer').matches(/^[0-9+\-()\s]+$/, 'Use only digits, spaces, +, -, and parentheses').required('Mobile number is required'),
  branch: Yup.string().trim().nullable().oneOf([...PHOENIX_FITNESS_BRANCHES, '', null], 'Please select a valid branch'),
  ip_address: Yup.string().trim().max(45, 'IP address must be 45 characters or fewer'),
  utm_source: Yup.string().trim().max(255, 'UTM source must be 255 characters or fewer'),
});