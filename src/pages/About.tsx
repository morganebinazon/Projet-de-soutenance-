// src/pages/About.tsx
import Layout from "@/components/layout/Layout"; // Assurez-vous du bon chemin

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-4xl font-bold">À propos de nous</h1>
        <p className="mt-4">Plus d'informations sur notre entreprise et nos valeurs.</p>
      </div>
    </Layout>
  );
};

export default About;