import { useLocation } from 'react-router-dom';
import PhoenixFitnessSection from 'components/sections/phoenixFitness/PhoenixFitnessSection';

const PhoenixFitnessPage = () => {
  const { pathname } = useLocation();
  const section = pathname.replace(/\/+$/, '').split('/').pop();
  const leadSource = section === 'franchise-leads' ? 'franchise'
    : section === 'website-leads' ? 'website' : 'landing_page';
  return <PhoenixFitnessSection key={leadSource} leadSource={leadSource} />;
};

export default PhoenixFitnessPage;
