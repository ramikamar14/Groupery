import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Grouperry ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard data when you use our group-buying coordination platform.
            </p>
            <p>
              By using Grouperry, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Account information:</strong> Name, email address, profile photo, and phone number, collected when you sign up via Replit Auth or a linked identity provider.</li>
              <li><strong className="text-foreground">Profile data:</strong> Country, language, user type (individual or vendor), and optional verification documents (ID photo and selfie) you voluntarily submit.</li>
              <li><strong className="text-foreground">Usage data:</strong> Groups you join, listings you create, messages you send, and searches you perform within the platform.</li>
              <li><strong className="text-foreground">Payment data:</strong> When you join or organise an escrow-protected deal, payment and payout details are processed by our third-party payment provider. Grouperry does not store your full card number; we retain only the transaction records needed to manage your group buys, refunds, and payouts.</li>
              <li><strong className="text-foreground">Device and log data:</strong> IP address, browser type, pages visited, and timestamps of activity, collected automatically for security and performance purposes.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">3. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and improve the Grouperry platform</li>
              <li>Authenticate your identity and maintain your account</li>
              <li>Connect you with group buying opportunities that match your interests</li>
              <li>Process payments, hold funds in escrow, issue refunds, and pay out organisers</li>
              <li>Send notifications about groups you've joined or created</li>
              <li>Generate AI-powered recommendations to help you discover relevant deals</li>
              <li>Enforce our Terms & Conditions and protect against fraud or abuse</li>
              <li>Comply with applicable legal obligations</li>
            </ul>
            <p>
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">4. Identity Verification Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Verification is optional. If you choose to submit identity documents (ID photo, passport, or selfie), these are stored securely in encrypted object storage and are only accessible to authorised Grouperry administrators for the purpose of manually reviewing and approving your verification status.
            </p>
            <p>
              Verification documents are not shared with other users, advertisers, or third parties. You may request deletion of your verification documents at any time by contacting us.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">5. Data Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>We may share your information only in the following limited circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Other platform members:</strong> Your display name, profile photo, user type, verification status, and reliability score are visible to other users in the context of group listings you join or create. Your email address and phone number are never publicly displayed.</li>
              <li><strong className="text-foreground">AI processing:</strong> Anonymised usage data (your participation history, saved listings, and group activity) is processed by an AI model (Anthropic Claude) to generate personalised recommendations. No identifiable personal information is shared with the AI provider beyond what is necessary for this function.</li>
              <li><strong className="text-foreground">Payment providers:</strong> To collect payments, hold funds in escrow, issue refunds, and pay out organisers, we share the necessary transaction details with our third-party payment processor, which handles your card data under its own security and privacy standards.</li>
              <li><strong className="text-foreground">Legal requirements:</strong> We may disclose your information if required by law or in response to valid legal process.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">6. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              We retain your personal information for as long as your account remains active or as needed to provide you with our services. If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">7. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Grouperry uses session cookies to maintain your authentication state. We do not use advertising cookies or third-party tracking pixels. Your browser's local storage may be used to save your draft listings and recent searches — this data stays on your device.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">8. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-foreground">Rectification:</strong> Update or correct inaccurate data via your profile settings</li>
              <li><strong className="text-foreground">Erasure:</strong> Request deletion of your account and associated data</li>
              <li><strong className="text-foreground">Portability:</strong> Request an export of your data in a machine-readable format</li>
              <li><strong className="text-foreground">Objection:</strong> Object to certain processing of your personal data</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at the address provided on our Contact page.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">9. Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              We implement industry-standard technical and organisational measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction. These include encrypted data storage, HTTPS-only transmission, and access controls. However, no method of transmission over the internet is 100% secure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">10. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Grouperry is not directed at children under the age of 16. We do not knowingly collect personal information from anyone under 16. If you believe we have inadvertently collected such information, please contact us and we will delete it promptly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">11. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the "last updated" date at the top of this page. Continued use of Grouperry after changes constitutes your acceptance of the updated policy. We encourage you to review this policy periodically.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">12. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              If you have any questions about this Privacy Policy or how we handle your data, please contact us via the <a href="/contact" className="text-primary hover:underline">Contact page</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
