import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/layout/Layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCountry } from "@/hooks/use-country.tsx";
import { useAuthStore } from "@/stores/authSore";

// Validation schemas
const step1Schema = z
  .object({
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Email invalide")
      .transform((email) => email.trim().toLowerCase()),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const step3IndividualSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").transform((val) => val.trim()),
  lastName: z.string().min(1, "Le nom est requis").transform((val) => val.trim()),
  phone: z.string().min(8, "Le numéro de téléphone est requis").transform((val) => val.trim()),
});

const step3CompanySchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis").transform((val) => val.trim()),
  taxId: z
    .string()
    .min(1, "Le numéro d'identification fiscale est requis")
    .transform((val) => val.trim()),
  phone: z.string().min(8, "Le numéro de téléphone est requis").transform((val) => val.trim()),
});

type RegisterFormValues = z.infer<typeof step1Schema> &
  Partial<z.infer<typeof step3IndividualSchema>> &
  Partial<z.infer<typeof step3CompanySchema>>;

const Register = () => {
  const { country } = useCountry();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [isLoading, setIsLoading] = useState(false);

  // Reference for first error input for focus management
  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(
      step === 1
        ? step1Schema
        : step === 3
          ? accountType === "individual"
            ? step3IndividualSchema
            : step3CompanySchema
          : z.object({})
    ),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      companyName: "",
      taxId: "",
    },
    mode: "onBlur",
  });

  // On validation errors, focus first error field for better UX
  useEffect(() => {
    const firstErrorFieldName = Object.keys(form.formState.errors)[0] as keyof RegisterFormValues | undefined;
    if (firstErrorFieldName) {
      // Use setTimeout to wait for DOM render
      setTimeout(() => {
        const errorElement = document.querySelector(
          `[name="${firstErrorFieldName}"]`
        ) as HTMLElement | null;
        errorElement?.focus();
      }, 100);
    }
  }, [form.formState.errors]);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (formValues) => {
    setIsLoading(true);
    console.log("Form values before cleaning:", formValues);
    // Cleaning inputs with fallback empty string
    const cleanedValues = {
      email: formValues.email?.trim().toLowerCase() || "",
      password: formValues.password || "",
      confirmPassword: formValues.confirmPassword || "",
      firstName: formValues.firstName?.trim() || "",
      lastName: formValues.lastName?.trim() || "",
      phone: formValues.phone?.trim() || "",
      companyName: formValues.companyName?.trim() || "",
      taxId: formValues.taxId?.trim() || "",
    };

    try {
      if (step === 1) {
        // Validate step 1 inputs
        await step1Schema.parseAsync(cleanedValues);
        setStep(2);
      } else if (step === 2) {
        // Just progress step 2 to 3 with account type selected
        setStep(3);
      } else if (step === 3) {
        // Validate step 3 inputs depending on account type
        if (accountType === "individual") {
          await step3IndividualSchema.parseAsync(cleanedValues);
        } else {
          await step3CompanySchema.parseAsync(cleanedValues);
        }

        // Prepare data for registration
        const userData = {
          name:
            accountType === "individual"
              ? `${cleanedValues.firstName} ${cleanedValues.lastName}`
              : cleanedValues.companyName,
          email: cleanedValues.email,
          password: cleanedValues.password,
          company: accountType === "company" ? cleanedValues.companyName : undefined,
          phone: cleanedValues.phone,
          country: country === "benin" ? "Bénin" : "Togo",
          role: accountType === "company" ? "entreprise" : "client",
        };

        // Register user via auth store
        await useAuthStore.getState().register(userData);

        toast.success("Inscription réussie !");
        navigate("/login");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Set field errors explicitly to show messages next to inputs
        error.errors.forEach(({ path, message }) => {
          if (path.length > 0) {
            form.setError(path[0] as keyof RegisterFormValues, { message });
          } else {
            toast.error(message);
          }
        });
      } else {
        console.error("Erreur lors de l'inscription:", error);
        toast.error(error.message ?? "Erreur lors de l'inscription");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Accessibility: role and aria-pressed for toggle buttons on account type
  const AccountTypeButton = ({
    type,
    label,
    icon,
  }: {
    type: "individual" | "company";
    label: string;
    icon: string;
  }) => (
    <Button
      type="button"
      variant={accountType === type ? "default" : "outline"}
      aria-pressed={accountType === type}
      role="switch"
      className={`h-32 flex flex-col items-center justify-center ${accountType === type ? "bg-benin-green" : ""
        }`}
      onClick={() => setAccountType(type)}
      aria-label={`${label} account type`}
    >
      <span aria-hidden="true" className="text-4xl mb-2">
        {icon}
      </span>
      <span>{label}</span>
    </Button>
  );

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-heading">Créer un compte</h1>
            <p className="text-muted-foreground mt-2">
              Rejoignez PayeAfrique pour gérer efficacement vos salaires au{" "}
              {country === "benin" ? "Bénin" : "Togo"}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${step >= i ? "bg-benin-green" : "bg-gray-300"
                  }`}
                aria-current={step === i ? "step" : undefined}
                aria-label={`Step ${i}`}
              />
            ))}
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
              aria-live="polite"
            >
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder="votre-email@example.com"
                            {...field}
                            disabled={isLoading}
                            aria-invalid={!!form.formState.errors.email}
                            aria-describedby="email-error"
                          />
                        </FormControl>
                        <FormMessage id="email-error" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password">Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            {...field}
                            disabled={isLoading}
                            aria-invalid={!!form.formState.errors.password}
                            aria-describedby="password-error"
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage id="password-error" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="confirmPassword">
                          Confirmer le mot de passe
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="********"
                            {...field}
                            disabled={isLoading}
                            aria-invalid={!!form.formState.errors.confirmPassword}
                            aria-describedby="confirmPassword-error"
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage id="confirmPassword-error" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {step === 2 && (
                <div className="space-y-4" role="radiogroup" aria-label="Type de compte">
                  <h3 className="text-lg font-medium">Type de compte</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <AccountTypeButton type="individual" label="Individuel" icon="👤" />
                    <AccountTypeButton type="company" label="Entreprise" icon="🏢" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">
                    {accountType === "individual"
                      ? "Informations personnelles"
                      : "Informations de l'entreprise"}
                  </h3>

                  {accountType === "individual" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="firstName">Prénom</FormLabel>
                              <FormControl>
                                <Input
                                  id="firstName"
                                  placeholder="Prénom"
                                  {...field}
                                  disabled={isLoading}
                                  aria-invalid={!!form.formState.errors.firstName}
                                  aria-describedby="firstName-error"
                                />
                              </FormControl>
                              <FormMessage id="firstName-error" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="lastName">Nom</FormLabel>
                              <FormControl>
                                <Input
                                  id="lastName"
                                  placeholder="Nom"
                                  {...field}
                                  disabled={isLoading}
                                  aria-invalid={!!form.formState.errors.lastName}
                                  aria-describedby="lastName-error"
                                />
                              </FormControl>
                              <FormMessage id="lastName-error" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="phone">Téléphone</FormLabel>
                            <FormControl>
                              <Input
                                id="phone"
                                placeholder="+229 00000000"
                                {...field}
                                disabled={isLoading}
                                aria-invalid={!!form.formState.errors.phone}
                                aria-describedby="phone-error"
                              />
                            </FormControl>
                            <FormMessage id="phone-error" />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="companyName">
                              Nom de l&apos;entreprise
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="companyName"
                                placeholder="Nom de l'entreprise"
                                {...field}
                                disabled={isLoading}
                                aria-invalid={!!form.formState.errors.companyName}
                                aria-describedby="companyName-error"
                              />
                            </FormControl>
                            <FormMessage id="companyName-error" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="taxId">
                              Numéro d&apos;identification fiscale
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="taxId"
                                placeholder="NIF"
                                {...field}
                                disabled={isLoading}
                                aria-invalid={!!form.formState.errors.taxId}
                                aria-describedby="taxId-error"
                              />
                            </FormControl>
                            <FormMessage id="taxId-error" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="phone-company">Téléphone</FormLabel>
                            <FormControl>
                              <Input
                                id="phone-company"
                                placeholder="+229 00000000"
                                {...field}
                                disabled={isLoading}
                                aria-invalid={!!form.formState.errors.phone}
                                aria-describedby="phone-company-error"
                              />
                            </FormControl>
                            <FormMessage id="phone-company-error" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={isLoading}
                    aria-label="Retour à l'étape précédente"
                  >
                    Retour
                  </Button>
                ) : (
                  <div />
                )}
                <Button type="submit" disabled={isLoading} aria-live="polite">
                  {isLoading ? (
                    <div className="flex items-center" aria-busy="true" aria-label="Chargement en cours">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Chargement...
                    </div>
                  ) : step === 3 ? (
                    "Terminer"
                  ) : (
                    "Continuer"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="text-center text-sm mt-4">
            <p>
              Vous avez déjà un compte?{" "}
              <Link
                to="/login"
                className="text-benin-green hover:underline font-medium"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;

