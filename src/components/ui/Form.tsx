'use client';

import React, { createContext, useContext, useId } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

type FormFieldContextValue = {
  id: string;
  name: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
};

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue);

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  };
};

// Hook para contexto de formulário simples
// const useFormContext = () => {
//   return {
//     getFieldState: () => ({}),
//     formState: {}
//   };
// };

type FormItemContextValue = {
  id: string;
};

const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

// Form Root Component
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function Form({ children, className = '', ...props }: FormProps) {
  return (
    <form 
      className={`space-y-6 ${className}`}
      role="form"
      noValidate
      {...props}
    >
      {children}
    </form>
  );
}

// Form Field Component
interface FormFieldProps {
  name: string;
  children: React.ReactNode;
}

export function FormField({ name, children }: FormFieldProps) {
  const id = useId();
  
  return (
    <FormFieldContext.Provider
      value={{
        id,
        name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
      }}
    >
      <FormItemContext.Provider value={{ id }}>
        {children}
      </FormItemContext.Provider>
    </FormFieldContext.Provider>
  );
}

// Form Item Component
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormItem({ className = '', children, ...props }: FormItemProps) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

// Form Label Component
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export function FormLabel({ 
  className = '', 
  children, 
  required = false,
  ...props 
}: FormLabelProps) {
  const { formItemId } = useFormField();
  
  return (
    <label
      htmlFor={formItemId}
      className={`
        text-sm font-medium text-text-primary
        ${className}
      `}
      {...props}
    >
      {children}
      {required && (
        <span className="text-destructive ml-1" aria-label="campo obrigatório">
          *
        </span>
      )}
    </label>
  );
}

// Form Control Component (wrapper for input elements)
interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  error?: boolean;
  success?: boolean;
}

export function FormControl({ 
  className = '', 
  children, 
  error = false,
  success = false,
  ...props 
}: FormControlProps) {
  return (
    <div 
      className={`
        relative
        ${error ? 'form-control-error' : ''}
        ${success ? 'form-control-success' : ''}
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
}

// Form Description Component
interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function FormDescription({ 
  className = '', 
  children, 
  ...props 
}: FormDescriptionProps) {
  const { formDescriptionId } = useFormField();
  
  return (
    <p
      id={formDescriptionId}
      className={`text-sm text-text-muted ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

// Form Message Component (for errors, success, info)
interface FormMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  type?: 'error' | 'success' | 'info';
}

export function FormMessage({ 
  className = '', 
  children, 
  type = 'error',
  ...props 
}: FormMessageProps) {
  const { formMessageId } = useFormField();
  
  if (!children) return null;

  const icons = {
    error: <AlertCircle className="w-4 h-4" aria-hidden="true" />,
    success: <CheckCircle className="w-4 h-4" aria-hidden="true" />,
    info: <Info className="w-4 h-4" aria-hidden="true" />
  };

  const styles = {
    error: 'text-destructive',
    success: 'text-success',
    info: 'text-info'
  };

  const ariaLabels = {
    error: 'Erro',
    success: 'Sucesso',
    info: 'Informação'
  };

  return (
    <div
      id={formMessageId}
      className={`
        flex items-center space-x-2 text-sm font-medium
        ${styles[type]}
        ${className}
      `}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-label={ariaLabels[type]}
      {...props}
    >
      {icons[type]}
      <span>{children}</span>
    </div>
  );
}

// Enhanced Input Component with Form integration
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export function FormInput({ 
  className = '', 
  error = false,
  success = false,
  ...props 
}: FormInputProps) {
  const { formItemId, formDescriptionId, formMessageId } = useFormField();
  
  return (
    <input
      id={formItemId}
      aria-describedby={`${formDescriptionId} ${formMessageId}`}
      aria-invalid={error ? 'true' : 'false'}
      aria-required={props.required ? 'true' : 'false'}
      className={`
        w-full px-3 py-2 border rounded-lg
        bg-background
        text-text-primary
        placeholder:text-text-muted
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          error
            ? 'border-destructive focus:ring-destructive focus:border-destructive'
            : success
            ? 'border-success focus:ring-success focus:border-success'
            : 'border-border focus:ring-focus-ring focus:border-primary'
        }
        ${className}
      `}
      {...props}
    />
  );
}

// Enhanced Textarea Component
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

export function FormTextarea({ 
  className = '', 
  error = false,
  success = false,
  ...props 
}: FormTextareaProps) {
  const { formItemId, formDescriptionId, formMessageId } = useFormField();
  
  return (
    <textarea
      id={formItemId}
      aria-describedby={`${formDescriptionId} ${formMessageId}`}
      aria-invalid={error ? 'true' : 'false'}
      aria-required={props.required ? 'true' : 'false'}
      className={`
        w-full px-3 py-2 border rounded-lg
        bg-background
        text-text-primary
        placeholder:text-text-muted
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed
        resize-vertical min-h-[80px]
        ${
          error
            ? 'border-destructive focus:ring-destructive focus:border-destructive'
            : success
            ? 'border-success focus:ring-success focus:border-success'
            : 'border-border focus:ring-focus-ring focus:border-primary'
        }
        ${className}
      `}
      {...props}
    />
  );
}

// Enhanced Select Component
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  success?: boolean;
  children: React.ReactNode;
}

export function FormSelect({ 
  className = '', 
  error = false,
  success = false,
  children,
  ...props 
}: FormSelectProps) {
  const { formItemId, formDescriptionId, formMessageId } = useFormField();
  
  return (
    <select
      id={formItemId}
      aria-describedby={`${formDescriptionId} ${formMessageId}`}
      aria-invalid={error ? 'true' : 'false'}
      aria-required={props.required ? 'true' : 'false'}
      className={`
        w-full px-3 py-2 border rounded-lg
        bg-background
        text-text-primary
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          error
            ? 'border-destructive focus:ring-destructive focus:border-destructive'
            : success
            ? 'border-success focus:ring-success focus:border-success'
            : 'border-border focus:ring-focus-ring focus:border-primary'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}

// Form Actions Component (for buttons)
interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function FormActions({ 
  className = '', 
  children, 
  align = 'right',
  ...props 
}: FormActionsProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div
      className={`
        flex items-center space-x-3 pt-4
        ${alignmentClasses[align]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Hook para validação simples
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validar campo se já foi tocado
    if (touched[name] && validationRules[name]) {
      const error = validationRules[name]!(value);
      setErrors(prev => ({ ...prev, [name]: error || undefined }));
    }
  };

  const setTouchedField = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar campo quando for tocado
    if (validationRules[name]) {
      const error = validationRules[name]!(values[name]);
      setErrors(prev => ({ ...prev, [name]: error || undefined }));
    }
  };

  const validateAll = () => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const fieldKey = key as keyof T;
      const validator = validationRules[fieldKey];
      if (validator) {
        const error = validator(values[fieldKey]);
        if (error) {
          newErrors[fieldKey] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Partial<Record<keyof T, boolean>>)
    );

    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}

// Funções de validação comuns
export const validators = {
  required: (message = 'Este campo é obrigatório') => (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return null;
  },
  
  email: (message = 'Email inválido') => (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return null;
  },
  
  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `Mínimo de ${min} caracteres`;
    }
    return null;
  },
  
  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `Máximo de ${max} caracteres`;
    }
    return null;
  },
  
  pattern: (regex: RegExp, message = 'Formato inválido') => (value: string) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  },
  
  number: (message = 'Deve ser um número') => (value: any) => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return null;
  },
  
  min: (min: number, message?: string) => (value: number) => {
    if (value && value < min) {
      return message || `Valor mínimo: ${min}`;
    }
    return null;
  },
  
  max: (max: number, message?: string) => (value: number) => {
    if (value && value > max) {
      return message || `Valor máximo: ${max}`;
    }
    return null;
  }
};

// Função para combinar validadores
export function combineValidators(...validators: Array<(value: any) => string | null>) {
  return (value: any) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}