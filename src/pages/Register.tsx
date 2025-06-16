/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCountry } from "@/hooks/use-country.tsx";
import { useApiMutation } from "@/hooks/use-api";
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

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  taxId?: string;
};

const Register = () => {
  const { country } = useCountry();
  const navigate = useNavigate();
  const { mutateAsync: registerUser } = useApiMutation<any, any>('/register');
  const [step, setStep] = useState<number>(1);
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    companyName: "",
    taxId: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = async (currentStep: number) => {
    try {
      if (currentStep === 1) {
        await step1Schema.parseAsync(formValues);
        return true;
      } else if (currentStep === 3) {
        if (accountType === "individual") {
          await step3IndividualSchema.parseAsync(formValues);
        } else {
          await step3CompanySchema.parseAsync(formValues);
        }
        return true;
      }
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        const path = err.path[0];
        newErrors[path] = err.message;
      });
      setErrors(newErrors);

      // Focus on first error field
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField) {
        setTimeout(() => {
          const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
          errorElement?.focus();
        }, 100);
      }

      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (step === 1) {
        const isValid = await validateStep(1);
        if (isValid) setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else if (step === 3) {
        const isValid = await validateStep(3);
        if (isValid) {
          const userData = {
            name: accountType === "individual"
              ? `${formValues.firstName} ${formValues.lastName}`
              : formValues.companyName,
            email: formValues.email,
            password: formValues.password,
            phone: formValues.phone,
            country: country === "benin" ? "Bénin" : "Togo",
            role: accountType === "company" ? "entreprise" : "client",
            ...(accountType === "individual" && {
              firstName: formValues.firstName,
              lastName: formValues.lastName,
            }),
            ...(accountType === "company" && {
              companyName: formValues.companyName,
              taxId: formValues.taxId,
            }),
          };

          // Appel API via le hook useApiMutation
          const response = await registerUser(userData);

          if (response.success) {
            toast.success("Inscription réussie !");
            // Stocker le token si présent dans la réponse
            if (response.data?.token) {
              localStorage.setItem('authToken', response.data.token);
            }
            navigate("/login");
          } else {
            toast.error(response.message || "Erreur lors de l'inscription");
          }
        }
      }
    } catch (error: any) {
      // La gestion d'erreur est déjà faite par useApiMutation via useApiStore
      // Vous pouvez ajouter un toast personnalisé si besoin
      toast.error(error.message || "Une erreur est survenue");
    }
  };

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
                aria-label={`Étape ${i}`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-live="polite">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre-email@example.com"
                    value={formValues.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    aria-describedby="email-error"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm font-medium text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    Mot de passe
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="********"
                    value={formValues.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby="password-error"
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p id="password-error" className="text-sm font-medium text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="********"
                    value={formValues.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby="confirmPassword-error"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p id="confirmPassword-error" className="text-sm font-medium text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4" role="radiogroup" aria-label="Type de compte">
                <h3 className="text-lg font-medium">Type de compte</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={accountType === "individual" ? "default" : "outline"}
                    aria-pressed={accountType === "individual"}
                    role="switch"
                    className={`h-32 flex flex-col items-center justify-center ${accountType === "individual" ? "bg-benin-green" : ""
                      }`}
                    onClick={() => setAccountType("individual")}
                    aria-label="Individuel"
                  >
                    <span className="text-4xl mb-2" aria-hidden="true">👤</span>
                    <span>Individuel</span>
                  </Button>
                  <Button
                    type="button"
                    variant={accountType === "company" ? "default" : "outline"}
                    aria-pressed={accountType === "company"}
                    role="switch"
                    className={`h-32 flex flex-col items-center justify-center ${accountType === "company" ? "bg-benin-green" : ""
                      }`}
                    onClick={() => setAccountType("company")}
                    aria-label="Entreprise"
                  >
                    <span className="text-4xl mb-2" aria-hidden="true">🏢</span>
                    <span>Entreprise</span>
                  </Button>
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
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium leading-none">
                          Prénom
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="Prénom"
                          value={formValues.firstName || ""}
                          onChange={handleInputChange}
                          disabled={isLoading}
                          aria-invalid={!!errors.firstName}
                          aria-describedby="firstName-error"
                        />
                        {errors.firstName && (
                          <p id="firstName-error" className="text-sm font-medium text-destructive">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium leading-none">
                          Nom
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Nom"
                          value={formValues.lastName || ""}
                          onChange={handleInputChange}
                          disabled={isLoading}
                          aria-invalid={!!errors.lastName}
                          aria-describedby="lastName-error"
                        />
                        {errors.lastName && (
                          <p id="lastName-error" className="text-sm font-medium text-destructive">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium leading-none">
                        Téléphone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+229 00000000"
                        value={formValues.phone || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.phone}
                        aria-describedby="phone-error"
                      />
                      {errors.phone && (
                        <p id="phone-error" className="text-sm font-medium text-destructive">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm font-medium leading-none">
                        Nom de l'entreprise
                      </label>
                      <Input
                        id="companyName"
                        name="companyName"
                        placeholder="Nom de l'entreprise"
                        value={formValues.companyName || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.companyName}
                        aria-describedby="companyName-error"
                      />
                      {errors.companyName && (
                        <p id="companyName-error" className="text-sm font-medium text-destructive">
                          {errors.companyName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="taxId" className="text-sm font-medium leading-none">
                        Numéro d'identification fiscale
                      </label>
                      <Input
                        id="taxId"
                        name="taxId"
                        placeholder="NIF"
                        value={formValues.taxId || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.taxId}
                        aria-describedby="taxId-error"
                      />
                      {errors.taxId && (
                        <p id="taxId-error" className="text-sm font-medium text-destructive">
                          {errors.taxId}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone-company" className="text-sm font-medium leading-none">
                        Téléphone
                      </label>
                      <Input
                        id="phone-company"
                        name="phone"
                        placeholder="+229 00000000"
                        value={formValues.phone || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.phone}
                        aria-describedby="phone-company-error"
                      />
                      {errors.phone && (
                        <p id="phone-company-error" className="text-sm font-medium text-destructive">
                          {errors.phone}
                        </p>
                      )}
                    </div>
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
                {isLoading ? "Chargement..." : step === 3 ? "Terminer" : "Continuer"}
              </Button>
            </div>
          </form>

          <div className="text-center text-sm mt-4">
            <p>
              Vous avez déjà un compte?{" "}
              <Link to="/login" className="text-benin-green hover:underline font-medium">
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