import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { useCountry } from "@/hooks/use-country";
import { useAuth } from "@/hooks/use-auth";

// Schéma de validation pour l'étape 1
const step1Schema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    ),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

// Schéma de validation pour l'étape 3 - Individuel
const step3IndividualSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
});

// Schéma de validation pour l'étape 3 - Entreprise
const step3CompanySchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  taxId: z.string().min(2, "Le numéro d'identification fiscale est requis"),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
});

// Type pour le formulaire complet
type RegisterFormValues = z.infer<typeof step1Schema> & 
  Partial<z.infer<typeof step3IndividualSchema>> &
  Partial<z.infer<typeof step3CompanySchema>>;

const Register = () => {
  const { country } = useCountry();
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(step === 1 ? step1Schema : 
      step === 3 ? (accountType === "individual" ? step3IndividualSchema : step3CompanySchema) : 
      z.object({})),
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
    mode: "onChange"
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      if (step === 1) {
        // Valider uniquement les champs de l'étape 1
        await step1Schema.parseAsync({
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else {
        // Valider les champs de l'étape 3 selon le type de compte
        if (accountType === "individual") {
          await step3IndividualSchema.parseAsync({
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
          });
        } else {
          await step3CompanySchema.parseAsync({
            companyName: values.companyName,
            taxId: values.taxId,
            phone: values.phone,
          });
        }

        // Envoyer les données d'inscription
        await register({
          email: values.email,
          password: values.password,
          accountType,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          companyName: values.companyName,
          taxId: values.taxId,
        });
        
        toast.success("Inscription réussie ! Bienvenue sur PayeAfrique.");
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Gérer les erreurs de validation Zod
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-heading">Créer un compte</h1>
            <p className="text-muted-foreground mt-2">
              Rejoignez PayeAfrique pour gérer efficacement vos salaires au {country === 'benin' ? 'Bénin' : 'Togo'}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  step >= i ? "bg-benin-green" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="votre-email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Type de compte</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={accountType === "individual" ? "default" : "outline"}
                      className={`h-32 flex flex-col items-center justify-center ${
                        accountType === "individual" ? "bg-benin-green" : ""
                      }`}
                      onClick={() => setAccountType("individual")}
                    >
                      <span className="text-xl mb-2">👤</span>
                      <span>Individuel</span>
                    </Button>
                    <Button
                      type="button"
                      variant={accountType === "company" ? "default" : "outline"}
                      className={`h-32 flex flex-col items-center justify-center ${
                        accountType === "company" ? "bg-benin-green" : ""
                      }`}
                      onClick={() => setAccountType("company")}
                    >
                      <span className="text-xl mb-2">🏢</span>
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
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prénom</FormLabel>
                              <FormControl>
                                <Input placeholder="Prénom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input placeholder="+229 00000000" {...field} />
                            </FormControl>
                            <FormMessage />
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
                            <FormLabel>Nom de l'entreprise</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom de l'entreprise" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro d'identification fiscale</FormLabel>
                            <FormControl>
                              <Input placeholder="NIF" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input placeholder="+229 00000000" {...field} />
                            </FormControl>
                            <FormMessage />
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
                  >
                    Retour
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
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

          <div className="text-center text-sm">
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
