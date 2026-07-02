import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              By accessing or using Grouperry (the "Platform"), you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. If you do not agree, please do not use the Platform. These terms apply to everyone who uses Grouperry, whether joining a group buy, organising one, or simply browsing.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">2. What Grouperry Is</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Grouperry is a group-buying marketplace that helps communities pool together to reach group or team pricing on software, SaaS, and other digital tools. Organisers create deals, members reserve seats, and where a deal is escrow-protected, Grouperry facilitates the collection and holding of funds until access is delivered.
            </p>
            <p>
              Grouperry is a coordination and payments facilitator. It is not the seller of the underlying software, licenses, or services, and it does not provide the products delivered by organisers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">3. Accounts &amp; Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>You must be at least 16 years old and able to form a binding contract to use Grouperry. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate account information and keep it up to date</li>
              <li>Keep your login credentials secure and not share your account</li>
              <li>Be responsible for all activity that occurs under your account</li>
              <li>Complete identity verification where required to organise deals</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">4. How Group Buys Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Reserving a seat in a group buy is free and does not, by itself, guarantee that a deal will complete. A deal unlocks only when it reaches the number of participants set by the organiser. Depending on the deal type:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Escrow-protected deals:</strong> Payment is collected when the group fills and held by Grouperry until the organiser confirms delivery, at which point funds are released to the organiser.</li>
              <li><strong className="text-foreground">Commit-only deals:</strong> You coordinate and settle payment directly with the organiser. Grouperry does not hold funds for these deals, and you rely on your own arrangement with the organiser.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">5. Payments, Refunds &amp; Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              For escrow-protected deals, your payment method is only charged once the group reaches the size that unlocks the deal. You will see your share and any applicable service or payment-processing fees before you confirm.
            </p>
            <p>
              If a group does not fill, or a deal is cancelled before access is delivered, your share is refunded to your original payment method. Once access has been delivered and confirmed, sales are generally final except where required by law or where a dispute is resolved in your favour. Refunds for commit-only deals are a matter between you and the organiser.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">6. Organiser Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>If you organise a deal, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Describe the deal accurately, including the plan, seat count, price, and what each member receives</li>
              <li>Deliver the promised access promptly once a group fills and payment clears</li>
              <li>Only list plans that you are permitted to share under the underlying provider's terms of service</li>
              <li>Respond to members and resolve issues in good faith</li>
              <li>Comply with all applicable laws, including tax obligations on funds you receive</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">7. Third-Party Terms &amp; Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Many software products are sold as team, family, or multi-seat plans that are intended to be shared. Grouperry is designed for these legitimate group and team plans. You are responsible for ensuring that any deal you organise or join complies with the terms of service of the underlying provider. Deals for products whose terms prohibit sharing are not permitted.
            </p>
            <p>You also agree not to use Grouperry to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post false, misleading, fraudulent, or infringing listings</li>
              <li>Resell pirated software, stolen credentials, or unauthorised licenses</li>
              <li>Harass other users or post offensive, unlawful, or harmful content</li>
              <li>Circumvent the Platform's payment, escrow, or verification systems</li>
              <li>Upload viruses or malicious code, or attempt to disrupt the Platform</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">8. Disputes Between Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Group buys are agreements between organisers and members. While Grouperry provides escrow protection on eligible deals and may assist in resolving disputes, we are not a party to the underlying agreement and cannot guarantee the conduct of any user. Where a dispute cannot be resolved, escrow-held funds will be handled in line with our dispute and refund processes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">9. Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              The Platform is provided "as is" and "as available". Grouperry makes no warranties, express or implied, and disclaims all implied warranties including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that listings are accurate or that the Platform will be uninterrupted or error-free.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">10. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              To the maximum extent permitted by law, Grouperry and its suppliers will not be liable for any indirect, incidental, or consequential damages, or for loss of data, profits, or business, arising out of your use of the Platform. Nothing in these terms limits liability that cannot be limited under applicable law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">11. Changes to These Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Grouperry may revise these terms from time to time. When we do, we will update the "last updated" date above. Your continued use of the Platform after changes take effect constitutes acceptance of the revised terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">12. Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              These terms are governed by and construed in accordance with the laws of the jurisdiction in which Grouperry operates, and you submit to the exclusive jurisdiction of the courts in that location. If you have any questions about these terms, please reach out via our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
