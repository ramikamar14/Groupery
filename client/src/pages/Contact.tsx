import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Mail, MessageSquare, Send, Loader2 } from "lucide-react";

export default function Contact() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message || formData.message.trim().length < 10) {
      toast({
        title: t("contact.toastErrorTitle"),
        description: t("contact.toastValidation"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      toast({
        title: t("contact.toastSentTitle"),
        description: t("contact.toastSentDesc"),
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({
        title: t("contact.toastErrorTitle"),
        description: t("contact.toastFailDesc"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">{t("contact.title")}</h1>
          <p className="text-muted-foreground">{t("contact.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {t("contact.formTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
                <div>
                  <label className="text-sm font-medium">{t("contact.name")}</label>
                  <Input
                    placeholder={t("contact.placeholderName")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">{t("contact.email")}</label>
                  <Input
                    type="email"
                    placeholder={t("contact.placeholderEmail")}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">{t("contact.subject")}</label>
                  <Input
                    placeholder={t("contact.placeholderSubject")}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    data-testid="input-subject"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">{t("contact.message")}</label>
                  <Textarea
                    placeholder={t("contact.placeholderMessage")}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[150px]"
                    data-testid="textarea-message"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full" data-testid="button-submit-contact">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("contact.sending")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t("contact.send")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {t("contact.infoTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">{t("contact.generalTitle")}</h4>
                  <p className="text-sm text-muted-foreground">{t("contact.generalDesc")}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{t("contact.supportTitle")}</h4>
                  <p className="text-sm text-muted-foreground">{t("contact.supportDesc")}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{t("contact.reportTitle")}</h4>
                  <p className="text-sm text-muted-foreground">{t("contact.reportDesc")}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{t("contact.businessTitle")}</h4>
                  <p className="text-sm text-muted-foreground">{t("contact.businessDesc")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("contact.responseTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>{t("contact.responseP1")}</p>
                <p>{t("contact.responseP2")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
