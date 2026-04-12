import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Terms() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By accessing and using Grouperry, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">2. Use License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) from Grouperry for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the platform</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Uploading viruses or malicious code</li>
              <li>Harassing other users or posting offensive content</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">3. Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The materials on Grouperry are provided "as is". Grouperry makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">4. Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              In no event shall Grouperry or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Grouperry.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">5. Accuracy of Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The materials appearing on Grouperry could include technical, typographical, or photographic errors. Grouperry does not warrant that any of the materials on its Internet web site are accurate, complete, or current. Grouperry may make changes to the materials contained on its web site at any time without notice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">6. Modifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Grouperry may revise these terms of service for its web site at any time without notice. By using this web site, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">7. Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Grouperry operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
