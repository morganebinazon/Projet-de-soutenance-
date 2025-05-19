
import { useState } from "react";
import { Link } from "react-router-dom";
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

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { country } = useCountry();
  const [step, setStep] = useState<number>(1);
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      toast.success("Inscription réussie ! Bienvenue sur PayeAfrique.");
      console.log(values, accountType);
      // Handle registration logic here
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
                        <div>
                          <FormLabel>Prénom</FormLabel>
                          <Input placeholder="Prénom" />
                        </div>
                        <div>
                          <FormLabel>Nom</FormLabel>
                          <Input placeholder="Nom" />
                        </div>
                      </div>
                      <div>
                        <FormLabel>Téléphone</FormLabel>
                        <Input placeholder="+229 00000000" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Nom de l'entreprise</FormLabel>
                        <Input placeholder="Nom de l'entreprise" />
                      </div>
                      <div>
                        <FormLabel>Numéro d'identification fiscale</FormLabel>
                        <Input placeholder="NIF" />
                      </div>
                      <div>
                        <FormLabel>Téléphone</FormLabel>
                        <Input placeholder="+229 00000000" />
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
                  >
                    Retour
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button type="submit">
                  {step === 3 ? "Terminer" : "Continuer"}
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
