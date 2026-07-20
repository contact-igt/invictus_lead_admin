 
import React from 'react';
import { Formik, Form } from 'formik';

type AppFormProps = {
  initialValues: any;
  onSubmit: (values: any) => void;
  validationSchema?: any;
  children: React.ReactNode;
};

export default function AppForm({
  initialValues,
  onSubmit,
  validationSchema,
  children,
}: AppFormProps) {
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {() => (
        <Form>{children}</Form>
      )}
    </Formik>
  );
}
