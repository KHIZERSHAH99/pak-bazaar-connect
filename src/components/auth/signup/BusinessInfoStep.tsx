
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './signupSchema';
import BasicBusinessFields from './business/BasicBusinessFields';
import TaxRegistrationFields from './business/TaxRegistrationFields';
import AddressFields from './business/AddressFields';
import IndustryExperienceFields from './business/IndustryExperienceFields';
import ContactFields from './business/ContactFields';
import TermsNotice from './business/TermsNotice';

interface BusinessInfoStepProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({ form, isLoading }) => {
  return (
    <div className="space-y-4 animate-fadeIn bg-background dark:bg-background">
      <BasicBusinessFields form={form} isLoading={isLoading} />
      <TaxRegistrationFields form={form} isLoading={isLoading} />
      <AddressFields form={form} isLoading={isLoading} />
      <IndustryExperienceFields form={form} isLoading={isLoading} />
      <ContactFields form={form} isLoading={isLoading} />
      <TermsNotice />
    </div>
  );
};

export default BusinessInfoStep;
