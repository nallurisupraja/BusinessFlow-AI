import { useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessFormDefaults, businessFormSchema, type BusinessFormValues } from "./schema";
import { BUSINESS_TYPE_OPTIONS } from "./types";

interface BusinessFormProps {
  initialValues?: BusinessFormValues;
  submitLabel: string;
  onSubmit: (values: BusinessFormValues) => Promise<void>;
}

interface TextFieldProps {
  name: keyof BusinessFormValues;
  label: string;
  register: UseFormRegister<BusinessFormValues>;
  error?: string;
  required?: boolean;
  multiline?: boolean;
}

// One labelled text input (or textarea) with its error message.
function TextField({ name, label, register, error, required = false, multiline = false }: TextFieldProps) {
  const id = `business-${name}`;
  const className = "w-full rounded-md border border-gray-300 px-3 py-2";

  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-xs text-gray-500">{required ? "*" : "(optional)"}</span>
      </div>
      {multiline ? (
        <textarea id={id} rows={3} className={className} {...register(name)} />
      ) : (
        <input id={id} type="text" className={className} {...register(name)} />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function BusinessForm({ initialValues, submitLabel, onSubmit }: BusinessFormProps) {
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: initialValues ?? businessFormDefaults,
  });

  async function submit(values: BusinessFormValues) {
    setSaved(false);
    setSubmitError(null);
    try {
      await onSubmit(values);
      setSaved(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField name="name" label="Business name" required register={register} error={errors.name?.message} />

        <div>
          <div className="mb-1 flex items-center gap-1">
            <label htmlFor="business-business_type" className="text-sm font-medium text-gray-700">
              Business type
            </label>
            <span className="text-xs text-gray-500">*</span>
          </div>
          <select
            id="business-business_type"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2"
            {...register("business_type")}
          >
            {BUSINESS_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <TextField name="owner_name" label="Owner name" required register={register} error={errors.owner_name?.message} />
        <TextField name="email" label="Email" required register={register} error={errors.email?.message} />
        <TextField name="phone" label="Phone" required register={register} error={errors.phone?.message} />
        <TextField name="country" label="Country" required register={register} error={errors.country?.message} />
        <TextField name="state" label="State" required register={register} error={errors.state?.message} />
        <TextField name="city" label="City" required register={register} error={errors.city?.message} />
        <TextField name="address" label="Address" multiline register={register} error={errors.address?.message} />
        <TextField name="pin_code" label="PIN code" register={register} error={errors.pin_code?.message} />
        <TextField name="gstin" label="GSTIN" register={register} error={errors.gstin?.message} />
        <TextField name="website" label="Website" register={register} error={errors.website?.message} />
        <TextField
          name="description"
          label="Description"
          multiline
          register={register}
          error={errors.description?.message}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {saved && <p className="text-green-600">Saved successfully.</p>}
        {submitError && (
          <p role="alert" className="text-red-600">
            {submitError}
          </p>
        )}
      </div>
    </form>
  );
}
