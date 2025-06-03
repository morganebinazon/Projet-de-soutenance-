import emailjs from '@emailjs/browser';

class EmailService {
  private static instance: EmailService;
  private readonly serviceId: string = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  private readonly templateId: string = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  private readonly publicKey: string = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

  private constructor() {
    // Initialisation du service
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendSimulationPDF(
    userEmail: string,
    pdfBase64: string,
    simulationDetails: {
      country: string;
      grossSalary: number;
      netSalary: number;
      date: string;
    }
  ): Promise<void> {
    try {
      const templateParams = {
        to_email: userEmail,
        pdf_attachment: pdfBase64,
        country: simulationDetails.country === 'benin' ? 'Bénin' : 'Togo',
        gross_salary: new Intl.NumberFormat('fr-FR').format(simulationDetails.grossSalary),
        net_salary: new Intl.NumberFormat('fr-FR').format(simulationDetails.netSalary),
        simulation_date: simulationDetails.date,
      };

      await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Échec de l\'envoi de l\'email');
    }
  }
}

export default EmailService.getInstance(); 