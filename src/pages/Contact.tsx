// src/pages/Contact.tsx
import Layout from "@/components/layout/Layout"; // Assurez-vous que le chemin vers votre Layout est correct

const Contact = () => {
  return (
    <Layout>
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Nous Contacter</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Vous avez des questions ? N'hésitez pas à nous envoyer un message.
        </p>
        {/* Vous pouvez ajouter un formulaire de contact ici plus tard */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <p className="text-xl font-semibold mb-4">Informations de contact :</p>
          <p className="text-gray-800 dark:text-gray-200">Email : <a href="mailto:contact@payeafrique.com" className="text-benin-green hover:underline">contact@payeafrique.com</a></p>
          <p className="text-gray-800 dark:text-gray-200">Téléphone : +229 97 XX XX XX</p>
          <p className="text-gray-800 dark:text-gray-200">Adresse : Rue de l'innovation, Cotonou, Bénin</p>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;