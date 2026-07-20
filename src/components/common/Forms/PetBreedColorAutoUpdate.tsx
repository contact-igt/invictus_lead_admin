 
import { useFormikContext } from 'formik';
import { useEffect } from 'react';

type FormValues = {
  pet_type: any;
  pet_breed: any;
  color: any;
};

function ResetBreedColorOnTypeChange() {
  const { values, initialValues, setFieldValue } = useFormikContext<FormValues>();

  useEffect(() => {
    if (values.pet_type !== initialValues.pet_type) {
      setFieldValue('pet_breed', '');
      setFieldValue('color', '');
    }
  }, [values.pet_type, initialValues.pet_type, setFieldValue]);

  return null;
}

export default ResetBreedColorOnTypeChange;
